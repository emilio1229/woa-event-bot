import { type Client, type Message } from "discord.js";

export interface CleanupResult {
  scanned: number;
  deleted: number;
  failed: number;
}

const PAGE_SIZE = 100;
const MAX_PAGES = 50;

function hasMessageManager(channel: unknown): channel is { messages: { fetch: (options: { limit: number; before?: string }) => Promise<Map<string, Message>> } } {
  return typeof channel === "object" && channel !== null && "messages" in channel;
}

/**
 * Removes only messages authored by this bot from one Discord channel.
 * This service never reads or mutates Prisma, Sigils, raffles, events, bounties, or users.
 */
export async function cleanBotMessages(client: Client, channelId: string): Promise<CleanupResult> {
  const channel = await client.channels.fetch(channelId);
  if (!channel || !hasMessageManager(channel)) {
    throw new Error("That channel cannot be cleaned by the bot.");
  }

  const botId = client.user?.id;
  if (!botId) throw new Error("The bot identity is not ready yet.");

  let before: string | undefined;
  let scanned = 0;
  let deleted = 0;
  let failed = 0;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const messages = await channel.messages.fetch({ limit: PAGE_SIZE, ...(before ? { before } : {}) });
    if (messages.size === 0) break;

    scanned += messages.size;
    const ordered = [...messages.values()].sort((a, b) => b.createdTimestamp - a.createdTimestamp);

    for (const message of ordered) {
      if (message.author.id !== botId) continue;
      try {
        await message.delete("WoA High Council channel cleanup");
        deleted += 1;
      } catch {
        failed += 1;
      }
    }

    const oldest = ordered.at(-1);
    if (!oldest || messages.size < PAGE_SIZE) break;
    before = oldest.id;
  }

  return { scanned, deleted, failed };
}
