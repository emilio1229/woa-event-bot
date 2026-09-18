import { EmbedBuilder, type Client } from "discord.js";
import { env } from "./config/env.js";
import { sigilStore } from "./sigilStore.js";

function isSendableChannel(channel: unknown): channel is { send: (payload: unknown) => Promise<unknown> } {
  return typeof channel === "object" && channel !== null && "send" in channel && typeof channel.send === "function";
}

export function startAstralSelection(client: Client): void {
  const intervalHours = 6;
  const intervalMs = intervalHours * 60 * 60 * 1000;

  console.log(`[AstralSelection] Started — runs every ${intervalHours} hours.`);

  setInterval(async () => {
    try {
      if (!env.astralChannelId) {
        return;
      }

      for (const [guildId, guild] of client.guilds.cache) {
        const users = await sigilStore.getGuildUsers(guildId);
        const userIds = Object.keys(users);

        if (userIds.length === 0) {
          continue;
        }

        const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
        const amount = Math.floor(Math.random() * 3) + 1;
        await sigilStore.awardSigils(guildId, randomUserId, amount, "Astral Selection");

        const member = await guild.members.fetch(randomUserId).catch(() => null);

        if (!member) {
          continue;
        }

        const channel = guild.channels.cache.get(env.astralChannelId);

        if (!isSendableChannel(channel)) {
          continue;
        }

        const mention = `<@${member.id}>`;

        const embed = new EmbedBuilder()
          .setColor("#5599ff")
          .setTitle("Astral Selection")
          .setDescription(`✨ ${mention} has been chosen by the astral currents and received **${amount} sigils**.`);

        await channel.send({
          embeds: [embed],
          allowedMentions: { users: [member.id] }
        });

        console.log(`[AstralSelection] Awarded ${amount} sigils to ${randomUserId}`);
      }
    } catch (err) {
      console.error("[AstralSelection] Error:", err);
    }
  }, intervalMs);
}
