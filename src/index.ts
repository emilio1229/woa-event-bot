import path from "node:path";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import { buildApiServer } from "./api/server.js";
import { assertRuntimeEnv, env } from "./config/env.js";
import { applyDatabaseSchema, closePostgresConnection, connectPostgres } from "./database/prisma.js";
import { registerDiscordSyncHandlers } from "./events/discordSync.js";
import { enforceStartupGuildAllowlist, registerGuildCreateAccessControl } from "./events/guildAccessControl.js";
import { registerInteractionCreateHandler } from "./events/interactionCreate.js";
import { registerReadyHandler } from "./events/ready.js";
import { reconcileDiscordToDatabase } from "./services/discordSyncService.js";
import { type CommandModule, loadCommandModules } from "./utils/commandLoader.js";
import { logError, logInfo } from "./utils/logger.js";

export type BotClient = Client & {
  commands: Collection<string, CommandModule>;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
assertRuntimeEnv();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
}) as BotClient;

client.commands = new Collection<string, CommandModule>();

const commandsPath = path.join(__dirname, "commands");
const commands = await loadCommandModules(commandsPath);
const api = buildApiServer();

let apiStarted = false;
let shuttingDown = false;

for (const command of commands) {
  client.commands.set(command.data.name, command);
  logInfo(`Loaded command: ${command.data.name}`);
}

registerDiscordSyncHandlers(client);
registerGuildCreateAccessControl(client);
registerReadyHandler(client);
registerInteractionCreateHandler(client);

async function startApiServer() {
  if (apiStarted) {
    return;
  }

  await api.listen({
    host: env.apiHost,
    port: env.apiPort
  });

  apiStarted = true;
  logInfo("Fastify API listening.", {
    host: env.apiHost,
    port: env.apiPort
  });
}

async function shutdown(signal?: string) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logInfo("Application shutdown started.", signal ? { signal } : undefined);

  if (apiStarted) {
    await api.close();
    apiStarted = false;
  }

  client.destroy();
  await closePostgresConnection();
}

process.once("SIGINT", () => {
  void shutdown("SIGINT").finally(() => {
    process.exit(0);
  });
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM").finally(() => {
    process.exit(0);
  });
});

try {
  applyDatabaseSchema();
  await connectPostgres();
  await client.login(env.token);
  await once(client, Events.ClientReady);
  await enforceStartupGuildAllowlist(client);
  await reconcileDiscordToDatabase(client);
  await startApiServer();
} catch (error) {
  logError("Application startup failed.", error);
  await shutdown();
  process.exit(1);
}
