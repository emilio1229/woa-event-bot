import type { TextChannel } from "discord.js";
import type { BotClient } from "../index.js";
import { env } from "../config/env.js";
import { riddleStore } from "../riddleStore.js";
import { generateArcaneRiddle } from "./riddleAiService.js";
import { logError, logInfo } from "../utils/logger.js";

let started = false;

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

  const draft = await generateArcaneRiddle();
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

    const row = new ActionRowBuilder().addComponents(
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
