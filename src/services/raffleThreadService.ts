import { ChannelType, type Client, type Message, type ThreadChannel } from "discord.js";
import { env } from "../config/env.js";
import type { Raffle } from "../types/legacy.js";
import { logError } from "../utils/logger.js";

/**
 * Starts a thread anchored to the given announcement message so Discord reliably shows
 * a visible thread indicator under the parent channel (standalone threads with no anchor
 * message do not consistently surface in the channel UI without someone posting first).
 * The raffle's actual entry embed and buttons are sent inside the returned thread, not the
 * parent channel.
 */
export async function createRaffleThreadFromMessage(
  anchorMessage: Message,
  raffle: Raffle
): Promise<ThreadChannel | undefined> {
  if (!env.raffleThreadsEnabled) {
    return undefined;
  }

  try {
    return await anchorMessage.startThread({
      name: raffle.name.slice(0, 100),
      autoArchiveDuration: env.raffleThreadAutoArchiveMinutes,
      reason: "Raffle entry thread"
    });
  } catch (error) {
    logError("Failed to create raffle thread.", error, { raffleId: raffle.id });
    return undefined;
  }
}

/** Returns the channel ID currently hosting the raffle's entry message (the thread, if any). */
export function getRaffleMessageChannelId(raffle: Raffle): string {
  return raffle.threadId ?? raffle.channelId;
}

/** Locks and archives the raffle's linked thread once the raffle has ended. No-op if there is no thread. */
export async function closeRaffleThread(client: Client, raffle: Raffle): Promise<void> {
  if (!raffle.threadId) {
    return;
  }

  try {
    const channel = await client.channels.fetch(raffle.threadId).catch(() => null);

    if (!channel || (channel.type !== ChannelType.PublicThread && channel.type !== ChannelType.PrivateThread)) {
      return;
    }

    await channel.setLocked(true, "Raffle ended").catch(() => {});
    await channel.setArchived(true, "Raffle ended").catch(() => {});
  } catch (error) {
    logError("Failed to close raffle thread.", error, { raffleId: raffle.id, threadId: raffle.threadId });
  }
}
