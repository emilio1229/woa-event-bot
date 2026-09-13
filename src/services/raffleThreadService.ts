import { ChannelType, type Client, type Message } from "discord.js";
import { env } from "../config/env.js";
import type { Raffle } from "../types/legacy.js";
import { logError } from "../utils/logger.js";

/** Creates a thread on the raffle message for entry discussion, if enabled. Returns the thread ID, or undefined if skipped/failed. */
export async function createRaffleThread(raffleMessage: Message, raffle: Raffle): Promise<string | undefined> {
  if (!env.raffleThreadsEnabled) {
    return undefined;
  }

  try {
    const thread = await raffleMessage.startThread({
      name: raffle.name.slice(0, 100),
      autoArchiveDuration: env.raffleThreadAutoArchiveMinutes,
      reason: "Raffle entry thread"
    });

    return thread.id;
  } catch (error) {
    logError("Failed to create raffle thread.", error, { raffleId: raffle.id });
    return undefined;
  }
}

/** Locks and archives the raffle's linked thread once the raffle has ended. No-op if there is no thread. */
export async function closeRaffleThread(client: Client, raffle: Raffle): Promise<void> {
  if (!raffle.threadId) {
    return;
  }

  try {
    const channel = await client.channels.fetch(raffle.threadId).catch(() => null);

    if (!channel || channel.type !== ChannelType.PublicThread && channel.type !== ChannelType.PrivateThread) {
      return;
    }

    await channel.setLocked(true, "Raffle ended").catch(() => {});
    await channel.setArchived(true, "Raffle ended").catch(() => {});
  } catch (error) {
    logError("Failed to close raffle thread.", error, { raffleId: raffle.id, threadId: raffle.threadId });
  }
}
