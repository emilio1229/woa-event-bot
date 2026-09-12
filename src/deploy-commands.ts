import path from "node:path";
import { fileURLToPath } from "node:url";
import { REST, Routes } from "discord.js";
import { assertDeployEnv, env } from "./config/env.js";
import { loadCommandModules } from "./utils/commandLoader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsPath = path.join(__dirname, "commands");
assertDeployEnv();
const commandModules = await loadCommandModules(commandsPath);
const commands = commandModules.map(command => command.data.toJSON());

const rest = new REST({ version: "10" }).setToken(env.token);

async function deploy() {
  try {
    console.log("🧹 Clearing GLOBAL commands…");

    await rest.put(Routes.applicationCommands(env.clientId), { body: [] });
    console.log("✔ Global commands cleared.");

    console.log("🔮 Deploying slash commands to configured guilds…");

    for (const guildId of env.guildIds) {
      await rest.put(Routes.applicationGuildCommands(env.clientId, guildId), {
        body: commands
      });
    }

    console.log(`✨ Slash commands deployed instantly to ${env.guildIds.length} guild(s).`);
  } catch (error) {
    console.error("❌ Deployment error:", error);
  }
}

await deploy();
