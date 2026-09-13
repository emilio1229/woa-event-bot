import { Events, type Guild } from "discord.js";
import type { BotClient } from "../index.js";
import { env } from "../config/env.js";
import { logInfo } from "../utils/logger.js";

function isGuildAllowed(guildId: string): boolean {
  return env.allowedGuildIds.length === 0 || env.allowedGuildIds.includes(guildId);
}

async function enforceGuildAllowlist(guild: Guild): Promise<void> {
  if (isGuildAllowed(guild.id)) {
    return;
  }

  logInfo("Leaving unauthorized guild.", { guildId: guild.id, guildName: guild.name });
  await guild.leave().catch(() => {});
}

/** No-op when ALLOWED_GUILD_IDS is unset, so the bot behaves as before by default. */
export async function enforceStartupGuildAllowlist(client: BotClient): Promise<void> {
  if (env.allowedGuildIds.length === 0) {
    return;
  }

  for (const guild of client.guilds.cache.values()) {
    await enforceGuildAllowlist(guild);
  }
}

/** Leaves guilds the bot is invited into later, if they are not on the allowlist. */
export function registerGuildCreateAccessControl(client: BotClient) {
  if (env.allowedGuildIds.length === 0) {
    return;
  }

  client.on(Events.GuildCreate, guild => {
    void enforceGuildAllowlist(guild);
  });
}
