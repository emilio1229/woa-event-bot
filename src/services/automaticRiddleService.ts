import type { TextChannel, MessageActionRowComponentBuilder } from "discord.js";
import type { BotClient } from "../index.js";
import { env } from "../config/env.js";
import { riddleStore } from "../riddleStore.js";
import { generateArcaneRiddle } from "./riddleAiService.js";
import { logError, logInfo } from "../utils/logger.js";

let started = false;

function normalizeRiddleText(value: string): string {
  return value.toLocaleLowerCase().normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

function answerLeaksInto(text: string, answer: string): boolean {
  const normalizedText = normalizeRiddleText(text);
  const normalizedAnswer = normalizeRiddleText(answer);
  if (!normalizedAnswer) return true;
  if (normalizedText.includes(normalizedAnswer)) return true;

  // Reject recognizable answer components too, so a clue cannot simply name
  // the creature/item while omitting only the second word of its answer.
  const answerWords = answer.toLocaleLowerCase().replace(/[^a-z0-9\\s]/g, " ").split(/\\s+/).filter(word => word.length >= 5);
  return answerWords.some(word => normalizedText.includes(normalizeRiddleText(word)));
}

function safeHints(raw: string | undefined, answer: string): string {
  let hints: string[] = [];
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      hints = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      hints = [];
    }
  }

  const guarded = hints.map((hint, index) => answerLeaksInto(hint, answer)
    ? [
        "Separate the images in the riddle; one is evidence and another is misdirection.",
        "Look for the contradiction between what the subject appears to be and what it allows someone to do.",
        "The setting narrows the possibilities, but does not identify the answer by itself.",
        "Return to the least literal line; its meaning matters more than its nouns."
      ][Math.min(index, 3)]
    : hint);

  return JSON.stringify(guarded.length ? guarded : [
    "Separate the images in the riddle; one is evidence and another is misdirection.",
    "Look for the contradiction between appearance and purpose.",
    "The setting narrows the possibilities, but does not identify the answer by itself."
  ]);
}

export async function publishAutomaticRiddle(client: BotClient): Promise<boolean> {
  const channelId = env.riddleAutoChannelId;
  if (!channelId) return false;

  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel || !channel.isTextBased() || !channel.isSendable() || !("guildId" in channel) || !channel.guildId) {
    logError("Automatic riddle channel is invalid or not a guild text channel.", new Error("Invalid automatic riddle channel"));
    return false;
  }

  const active = await riddleStore.getActive(channel.guildId);
  if (active) return false;

  let draft = await generateArcaneRiddle();
  // Fail closed: never publish a riddle that names its answer or one of its
  // distinctive answer words. Try fresh seeds before skipping this scheduler run.
  let attempts = 0;
  while (answerLeaksInto(draft.question, draft.answer) && attempts < 5) {
    attempts += 1;
    draft = await generateArcaneRiddle();
  }
  if (answerLeaksInto(draft.question, draft.answer)) {
    logError("Automatic riddle rejected because its answer leaked into the question.", new Error("Riddle answer leak guard"));
    return false;
  }
  draft = { ...draft, hint: safeHints(draft.hint, draft.answer) };
  const rewardRange = Math.max(0, env.riddleAutoRewardMax - env.riddleAutoRewardMin);
  const reward = env.riddleAutoRewardMin + Math.floor(Math.random() * (rewardRange + 1));

  const riddle = await riddleStore.create({
    guildId: channel.guildId,
    channelId,
    question: draft.question,
    answer: draft.answer,
    hint: draft.hint,
    reward
  });

  try {
    const hints = draft.hint ? (() => {
      try {
        const parsed = JSON.parse(draft.hint!);
        return Array.isArray(parsed) ? parsed : [draft.hint!];
      } catch {
        return [draft.hint!];
      }
    })() : [];

    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import("discord.js");
    const embed = new EmbedBuilder()
      .setColor(0x4B0082)
      .setTitle("🧩 THE ARCANE RIDDLE")
      .setDescription(riddle.question)
      .addFields(
        { name: "💠 Reward", value: reward + " Sigils", inline: true },
        { name: "📊 Hunt", value: "0 guesses • 0 wizards", inline: true },
        { name: "📜 Recent Guesses", value: "No guesses yet. The hunt is yours to begin." }
      )
      .setFooter({ text: "The first correct answer claims the reward." });

    // A rare, in-world administrator cameo: never a permanent panel entry.
    if (Math.random() < 0.22) {
      const whispers = [
        "*A violet spark gathers into EmilioTheGreat's sigil, then vanishes before it can be read.*",
        "*Rin's handwriting appears in the margin: “Do not trust the first meaning.”*",
        "*Doxo's lantern flickers once. Somewhere beyond the veil, a page turns.*",
        "*Heathen leaves a single mark in the dust: a warning, not an answer.*",
        "*Wizard's voice drifts through the hall: “Patience is part of the spell.”*",
        "*Brendon's quill scratches across an unseen page, then falls silent.*",
        "*Panda's shadow crosses the rune circle. No explanation follows.*"
      ];
      embed.addFields({ name: "🜂 A Passing Presence", value: whispers[Math.floor(Math.random() * whispers.length)] });
    }

    const answerButton = new ButtonBuilder()
      .setLabel("🗝️ Submit Answer")
      .setCustomId("woa:riddle:answer:" + riddle.id)
      .setStyle(ButtonStyle.Primary);
    const hintButton = hints.length
      ? new ButtonBuilder()
        .setLabel("💡 Seek a Hint")
        .setCustomId("woa:riddle:hint:" + riddle.id)
        .setStyle(ButtonStyle.Secondary)
      : null;

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      answerButton,
      ...(hintButton ? [hintButton] : [])
    );

    const message = await channel.send({
      embeds: [embed],
      components: [row]
    });
    await riddleStore.setMessageId(riddle.id, message.id);
    logInfo("Automatic arcane riddle posted.", { guildId: channel.guildId, channelId, riddleId: riddle.id });
    return true;
  } catch (error) {
    await riddleStore.end(riddle.id);
    logError("Automatic riddle publish failed:", error);
    return false;
  }
}

export function startAutomaticRiddleLoop(client: BotClient): void {
  if (started || !env.riddleAutoEnabled || !env.riddleAutoChannelId) return;
  started = true;

  const intervalMs = env.riddleAutoIntervalMinutes * 60_000;
  const run = async () => {
    try {
      await publishAutomaticRiddle(client);
    } catch (error) {
      logError("Automatic riddle loop failed:", error);
    }
  };

  void run();
  setInterval(() => void run(), intervalMs);
  logInfo("Automatic riddle loop enabled.", {
    channelId: env.riddleAutoChannelId,
    intervalMinutes: env.riddleAutoIntervalMinutes
  });
}
