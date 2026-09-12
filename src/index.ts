import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client, Collection, GatewayIntentBits } from "discord.js";
import { assertDiscordEnv, env } from "./config/env.js";
import { registerInteractionCreateHandler } from "./events/interactionCreate.js";
import { registerReadyHandler } from "./events/ready.js";
import { type CommandModule, loadCommandModules } from "./utils/commandLoader.js";
import { logInfo } from "./utils/logger.js";

export type BotClient = Client & {
  commands: Collection<string, CommandModule>;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
assertDiscordEnv();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
}) as BotClient;

client.commands = new Collection<string, CommandModule>();

const commandsPath = path.join(__dirname, "commands");
const commands = await loadCommandModules(commandsPath);

for (const command of commands) {
  client.commands.set(command.data.name, command);
  logInfo(`Loaded command: ${command.data.name}`);
}

registerReadyHandler(client);
registerInteractionCreateHandler(client);

await client.login(env.token);
