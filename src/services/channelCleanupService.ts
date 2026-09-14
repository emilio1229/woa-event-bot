import { type Client, type Message } from "discord.js";

export interface CleanupResult {
  scanned: number;
  deleted: number;
  failed: number;
}

const PAGE_SIZE = 100;

type MessageFetchChannel = {
  messages: {
    fetch(options: { limit: number; before?: string }): Promise<Map<string, Message>>;
  };
};

function hasMessageManager(channel: unknown): channel is MessageFetchChannel {
  return typeof channel === "object" && channel !== null && "messages" in channel;
}

/**
 * Removes every message authored by this bot from the selected Discord channel.
 * It walks the channel's complete message history with no artificial page limit.
 * This service never reads or mutates Prisma, Sigils, raffles, events, bounties, or users.
 *
 * Discord ephemeral interaction responses are not channel messages and therefore
 * cannot be fetched or deleted through the channel message API. Discord manages
 * their visibility/lifetime separately.
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

  while (true) {
    // Keep the method bound to the Discord.js message manager.
    const messages = await channel.messages.fetch({
      limit: PAGE_SIZE,
      ...(before ? { before } : {})
    });

    if (messages.size === 0) break;

    scanned += messages.size;
    const ordered = [...messages.values()].sort((a, b) => b.createdTimestamp - a.createdTimestamp);

    for (const message of ordered) {
      if (message.author.id !== botId) continue;

      try {
        // Individual deletes work for old messages too; bulk delete is limited
        // to recent messages and would leave older bot messages behind.
        await message.delete();
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
