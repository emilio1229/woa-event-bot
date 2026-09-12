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

export function getCommandFiles(directory: string): string[] {
  let results: string[] = [];

  for (const entry of fs.readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      results = results.concat(getCommandFiles(fullPath));
      continue;
    }

    if (entry.endsWith(".js")) {
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

    commands.push(command);
  }

  return commands;
}
