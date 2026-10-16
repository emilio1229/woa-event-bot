import type { TextChannel, MessageActionRowComponentBuilder } from "discord.js";
import type { BotClient } from "../index.js";
import { env } from "../config/env.js";
import { riddleStore } from "../riddleStore.js";
import { riddleAutoSettingsStore } from "../riddleAutoSettingsStore.js";
import { generateArcaneRiddle } from "./riddleAiService.js";
import { logError, logInfo } from "../utils/logger.js";

let started = false;

function normalizeRiddleText(value: string): string {
  return value.toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

function answerLeaksInto(text: string, answer: string): boolean {
  const normalizedText = " " + normalizeRiddleText(text) + " ";
  const normalizedAnswer = normalizeRiddleText(answer);
  if (!normalizedAnswer) return true;

  // Reject the complete answer phrase without treating common words inside
  // a title as leaks; otherwise legitimate lore riddles get discarded.
  return normalizedText.includes(" " + normalizedAnswer + " ");
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

export async function publishAutomaticRiddle(client: BotClient, guildId: string): Promise<boolean> {
  const settings = await riddleAutoSettingsStore.get(guildId);
  const channelId = settings.channelId;
  if (!settings.enabled || !channelId) return false;

  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel || !channel.isTextBased() || !channel.isSendable() || !("guildId" in channel) || !channel.guildId) {
    logError("Automatic riddle channel is invalid or not a guild text channel.", new Error("Invalid automatic riddle channel"));
    return false;
  }

  if (channel.guildId !== guildId) {
    logError("Automatic riddle channel belongs to a different guild.", new Error("Riddle channel guild mismatch"));
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
  const rewardRange = Math.max(0, settings.rewardMax - settings.rewardMin);
  const reward = settings.rewardMin + Math.floor(Math.random() * (rewardRange + 1));

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

    // A rare, in-world administrator cameo: a little lore, a little chaos, never a permanent panel entry.
    if (Math.random() < 0.28) {
      const whispers = [
        "*EmilioTheGreat appears in a violet flash, points dramatically at the riddle, whispers “I have absolutely no idea,” then vanishes.*",
        "*Rin has written “READ CAREFULLY” in the margin. Underneath, in smaller writing: “Yes, this means you.”*",
        "*Doxo's lantern flickers. A tiny sign appears: “The light is on. The wizard is buffering.”*",
        "*Heathen has left a warning in the dust: “Do not touch the cursed artifact.” The dust is shaped like a handprint.*",
        "*Wizard's voice booms through the hall: “I have mastered every spell!” A distant crash follows. “That one was experimental.”*",
        "*Brendon's quill writes “This was definitely part of the plan.” It then sets the plan on fire.*",
        "*Panda's shadow crosses the rune circle carrying a tiny clipboard. The shadow marks everyone as “probably suspicious.”*",
        "*A Realm Master storms in, declares the situation under control, trips over a harmless rune, and leaves with great dignity.*",
        "*A glowing memo appears: “Official Council ruling: if the artifact screams, stop poking it.” Someone has already poked it three times.*",
        "*The High Council's emergency meeting concludes with a unanimous decision to blame the nearest dinosaur.*",
        "*A mysterious voice announces, “The Realm is safe!” Immediately, somewhere, a cupboard explodes into glitter.*",
        "*A wizard-shaped silhouette mutters, “I could solve this instantly.” The silhouette opens the wrong door and politely closes it again.*",
        "*A note signed “Definitely Not the Voidling” reads: “I did not eat the council's emergency snacks.” Tiny bite marks cover the page.*",
        "*A stern message from the Council reads: “No experimental spells before breakfast.” The scorch marks suggest this policy arrived too late.*",
        "*Somewhere beyond the veil, a familiar steals an administrator's hat. The administrator pretends this was a planned ceremony.*"
      ];
      embed.addFields({ name: "🜂 Unscheduled Council Nonsense", value: whispers[Math.floor(Math.random() * whispers.length)] });
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
  if (started) return;
  started = true;

  // Poll persisted per-server settings so Council changes take effect without a restart.
  const run = async () => {
    try {
      const guilds = await riddleAutoSettingsStore.enabledGuilds();
      for (const settings of guilds) {
        if (!await riddleAutoSettingsStore.due(settings.guildId)) continue;
        try {
          await publishAutomaticRiddle(client, settings.guildId);
        } finally {
          await riddleAutoSettingsStore.markRun(settings.guildId);
        }
      }
    } catch (error) {
      logError("Automatic riddle loop failed:", error);
    }
  };

  void run();
  setInterval(() => void run(), 60_000);
  logInfo("Automatic riddle loop enabled; polling persisted server settings every minute.");
}
