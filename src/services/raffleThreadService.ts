import { ChannelType, type Client, type GuildTextBasedChannel, type ThreadChannel } from "discord.js";
import { env } from "../config/env.js";
import type { Raffle } from "../types/legacy.js";
import { logError } from "../utils/logger.js";

/**
 * Creates a standalone public thread (not anchored to a message) so the raffle's
 * entry message lives only inside the thread, while the thread itself stays
 * visible in the channel's thread list to everyone without requiring a reply.
 */
export async function createStandaloneRaffleThread(
  channel: GuildTextBasedChannel,
  raffle: Raffle
): Promise<ThreadChannel | undefined> {
  if (!env.raffleThreadsEnabled || !("threads" in channel)) {
    return undefined;
  }

  try {
    return await channel.threads.create({
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
