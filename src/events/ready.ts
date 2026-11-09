import { Events } from "discord.js";
import type { BotClient } from "../index.js";
import { startAstralSelection } from "../astralSelection.js";
import { startAutoEndLoop } from "../autoEndmanager.js";
import { logInfo } from "../utils/logger.js";
import { startAutomaticRiddleLoop } from "../services/automaticRiddleService.js";

export function registerReadyHandler(client: BotClient) {
  client.on(Events.ClientReady, () => {
    logInfo(`Logged in as ${client.user?.tag ?? "unknown user"}`);
    startAutoEndLoop(client);
    startAutomaticRiddleLoop(client);
    startAstralSelection(client);
  });
}
