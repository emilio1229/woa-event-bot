import "dotenv/config";

function readEnv(name: string): string {
  return process.env[name]?.trim() || "";
}

function readGuildIds(): string[] {
  const configuredGuilds = process.env.GUILD_IDS
    ?.split(",")
    .map(value => value.trim())
    .filter(Boolean);

  if (configuredGuilds && configuredGuilds.length > 0) {
    return configuredGuilds;
  }

  return ["1498579289166188604", "1428105944373526610"];
}

export const env = {
  token: readEnv("TOKEN"),
  clientId: readEnv("CLIENT_ID"),
  guildIds: readGuildIds(),
  defaultEventTimezone: process.env.DEFAULT_EVENT_TIMEZONE?.trim() || "UTC",
  astralChannelId: process.env.ASTRAL_CHANNEL_ID?.trim() || null
};

export function assertDiscordEnv() {
  if (!env.token) {
    throw new Error("Missing required environment variable: TOKEN");
  }

  if (!env.clientId) {
    throw new Error("Missing required environment variable: CLIENT_ID");
  }
}
