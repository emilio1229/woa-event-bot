import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { ChatInputCommandInteraction } from "discord.js";

export interface CommandModule {
  data: {
    name: string;
    toJSON: () => unknown;
  };
  execute: (interaction: ChatInputCommandInteraction) => Promise<unknown> | unknown;
}

const PUBLIC_COMMANDS = new Set(["realm", "council"]);

export function getCommandFiles(directory: string): string[] {
  let results: string[] = [];

  for (const entry of fs.readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      results = results.concat(getCommandFiles(fullPath));
      continue;
    }

    if ((entry.endsWith(".js") || entry.endsWith(".ts")) && !entry.endsWith(".d.ts")) {
      results.push(fullPath);
    }
  }

  return results;
}

export async function loadCommandModules(commandsPath: string): Promise<CommandModule[]> {
  const commandFiles = getCommandFiles(commandsPath);
  const commands: CommandModule[] = [];

  for (const filePath of commandFiles) {
    const imported = (await import(pathToFileURL(filePath).href)) as { default?: CommandModule };
    const command = imported.default;

    if (!command?.data?.name || typeof command.execute !== "function") {
      console.error(`❌ Invalid command file: ${path.relative(commandsPath, filePath)}`);
      continue;
    }

    // The new WoA UI intentionally exposes only /realm and /council.
    // Existing command modules remain available internally while they are migrated
    // behind the new panel system.
    if (!PUBLIC_COMMANDS.has(command.data.name)) {
      continue;
    }

    commands.push(command);
  }

  return commands;
}
