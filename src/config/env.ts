import "dotenv/config";

function readEnv(name: string): string {
  return process.env[name]?.trim() || "";
}

function readCommaSeparatedList(name: string): string[] {
  const configured = process.env[name]
    ?.split(",")
    .map(value => value.trim())
    .filter(Boolean);

  return configured ?? [];
}

const ALLOWED_THREAD_AUTO_ARCHIVE_MINUTES = [60, 1440, 4320, 10080];

function readRaffleThreadAutoArchiveMinutes(): 60 | 1440 | 4320 | 10080 {
  const configured = Number.parseInt(process.env.RAFFLE_THREAD_AUTO_ARCHIVE_MINUTES?.trim() || "", 10);

  return ALLOWED_THREAD_AUTO_ARCHIVE_MINUTES.includes(configured)
    ? configured as 60 | 1440 | 4320 | 10080
    : 1440;
}

export const env = {
  token: readEnv("TOKEN"),
  clientId: readEnv("CLIENT_ID"),
  guildIds: readCommaSeparatedList("GUILD_IDS"),
  allowedGuildIds: readCommaSeparatedList("ALLOWED_GUILD_IDS"),
  databaseUrl: readEnv("DATABASE_URL"),
  apiKey: readEnv("API_KEY"),
  apiHost: process.env.API_HOST?.trim() || "0.0.0.0",
  apiPort: Number.parseInt(process.env.PORT?.trim() || process.env.API_PORT?.trim() || "3000", 10),
  councilRoleIds: readCommaSeparatedList("COUNCIL_ROLE_IDS"),
  defaultEventTimezone: process.env.DEFAULT_EVENT_TIMEZONE?.trim() || "UTC",
  astralChannelId: process.env.ASTRAL_CHANNEL_ID?.trim() || null,
  raffleThreadsEnabled: (process.env.RAFFLE_THREADS_ENABLED?.trim() || "true") !== "false",
  raffleThreadAutoArchiveMinutes: readRaffleThreadAutoArchiveMinutes()
};

export function assertDiscordEnv() {
  if (!env.token) {
    throw new Error("Missing required environment variable: TOKEN");
  }

  if (!env.clientId) {
    throw new Error("Missing required environment variable: CLIENT_ID");
  }
}

export function assertRuntimeEnv() {
  assertDiscordEnv();
  assertDatabaseEnv();

  if (!Number.isInteger(env.apiPort) || env.apiPort <= 0) {
    throw new Error("PORT or API_PORT must be a positive integer.");
  }

  if (!env.apiKey) {
    throw new Error("Missing required environment variable: API_KEY");
  }
}

export function assertDatabaseEnv() {
  if (!env.databaseUrl) {
    throw new Error("Missing required environment variable: DATABASE_URL");
  }
}

export function assertDeployEnv() {
  assertDiscordEnv();

  if (env.guildIds.length === 0) {
    throw new Error("Missing required environment variable: GUILD_IDS");
  }
}
