import path from "node:path";
import { fileURLToPath } from "node:url";
import { AttachmentBuilder, EmbedBuilder, type Message } from "discord.js";
import type { BotClient } from "./index.js";
import { raffleStore } from "./raffleStore.js";
import { closeRaffleThread } from "./services/raffleThreadService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ASSET_PATH = path.join(__dirname, "..", "assets", "woa_winner_bg.png");
const endingRaffleIds = new Set<string>();

type MessageCapableChannel = {
  messages: {
    fetch: (messageId: string) => Promise<Message>;
  };
  send: (payload: unknown) => Promise<unknown>;
};

function isMessageCapableChannel(channel: unknown): channel is MessageCapableChannel {
  return typeof channel === "object" && channel !== null && "messages" in channel && "send" in channel;
}

export function startAutoEndLoop(client: BotClient): void {
  setInterval(async () => {
    try {
      const raffles = await raffleStore.all();

      for (const raffle of raffles) {
        if (Date.now() < raffle.endsAt) {
          continue;
        }

        if (endingRaffleIds.has(raffle.id)) {
          continue;
        }

        endingRaffleIds.add(raffle.id);

        try {
        console.log(`[autoEndManager] Ending raffle ${raffle.id} (guild=${raffle.guildId})`);

        const entries = raffle.entries ?? [];
        let winnerId = raffle.winnerId ?? null;

        if (!winnerId && entries.length > 0) {
          winnerId = entries[Math.floor(Math.random() * entries.length)];
          raffle.winnerId = winnerId;
          await raffleStore.save(raffle);
          console.log(`[autoEndManager] Chosen winner: ${winnerId}`);
        } else if (!winnerId) {
          console.log(`[autoEndManager] No entries for raffle ${raffle.id}`);
        }

        try {
          if (raffle.channelId && raffle.messageId) {
            const channel = await client.channels.fetch(raffle.channelId).catch(error => {
              console.error(`[autoEndManager] failed to fetch channel ${raffle.channelId}:`, error);
              return null;
            });

            if (isMessageCapableChannel(channel)) {
              const message = await channel.messages.fetch(raffle.messageId).catch(error => {
                console.warn(`[autoEndManager] could not fetch message ${raffle.messageId}:`, error);
                return null;
              });

              if (message) {
                await message.edit({ components: [] }).catch(error => {
                  console.error("[autoEndManager] failed to remove buttons:", error);
                });
              }
            }
          } else {
            console.warn(`[autoEndManager] raffle ${raffle.id} missing channelId/messageId`);
          }
        } catch (err) {
          console.error("autoEndManager button removal failed:", err);
        }

        let announcementSent = false;

        try {
          const destinationChannel = await client.channels.fetch(raffle.channelId).catch(error => {
            console.error(`[autoEndManager] failed to fetch channel for announcement ${raffle.channelId}:`, error);
            return null;
          });

          if (!isMessageCapableChannel(destinationChannel)) {
            throw new Error("Destination channel is not available for the raffle announcement.");
          } else if (winnerId) {
            const grandEmbed = new EmbedBuilder()
              .setColor(0xFF4500)
              .setTitle("✨ A Champion Has Been Chosen ✨")
              .setDescription("The sigil storm erupts in violent cosmic fury.")
              .addFields(
                { name: "👑 Winner", value: `<@${winnerId}>`, inline: false },
                { name: "📢 Ritual Role", value: raffle.tagRole ? `<@&${raffle.tagRole}>` : "None", inline: false },
                { name: "🎁 Prize", value: `**${raffle.prize}**`, inline: false },
                { name: "💠 Sigils Bound", value: `${entries.length}`, inline: true }
              )
              .setImage("attachment://woa_winner_bg.png")
              .setFooter({ text: "Wizards of Ark • Ascension Complete" })
              .setTimestamp();

            const attachment = new AttachmentBuilder(ASSET_PATH, { name: "woa_winner_bg.png" });
            await destinationChannel.send({
              embeds: [grandEmbed],
              files: [attachment],
              allowedMentions: {
                users: [winnerId],
                roles: raffle.tagRole ? [raffle.tagRole] : []
              }
            });
            announcementSent = true;
            console.log(`[autoEndManager] sent grand announcement for raffle ${raffle.id}`);
          } else {
            const noWinnerEmbed = new EmbedBuilder()
              .setColor(0x2F4F4F)
              .setTitle("Ritual Concluded — No Champion")
              .setDescription("The ritual faded into the void; no winner could be chosen.")
              .setFooter({ text: "Wizards of Ark" })
              .setTimestamp();

            await destinationChannel.send({ embeds: [noWinnerEmbed] });
            announcementSent = true;
            console.log(`[autoEndManager] sent no-winner announcement for raffle ${raffle.id}`);
          }
        } catch (err) {
          console.error("autoEndManager announcement (send) failed:", err);
        }

        if (announcementSent) {
          try {
            await closeRaffleThread(client, raffle);
            await raffleStore.end(raffle.id);
            console.log(`[autoEndManager] raffle ${raffle.id} removed from store`);
          } catch (err) {
            console.error("[autoEndManager] failed to remove raffle from store:", err);
          }
        } else {
          console.warn(`[autoEndManager] keeping raffle ${raffle.id} for announcement retry`);
        }
        } finally {
          endingRaffleIds.delete(raffle.id);
        }
      }
    } catch (err) {
      console.error("autoEndManager loop error:", err);
    }
  }, 5000);
}
