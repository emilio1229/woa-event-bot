import type { Guild } from "discord.js";
import type { Raffle } from "../types/legacy.js";

/**
 * A raffle with a notification role is restricted to members of that role.
 * Raffles without a tag role remain open to everyone (legacy compatibility).
 */
export async function isUserEligibleForRaffle(guild: Guild, raffle: Raffle, userId: string): Promise<boolean> {
  if (!raffle.tagRole) return true;

  const member = await guild.members.fetch(userId).catch(() => null);
  return member?.roles.cache.has(raffle.tagRole) ?? false;
}
