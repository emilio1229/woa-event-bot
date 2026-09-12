import { Events } from "discord.js";
import type { BotClient } from "../index.js";
import { env } from "../config/env.js";
import { startAstralSelection } from "../astralSelection.js";
import { startAutoEndLoop } from "../autoEndmanager.js";
import { logInfo } from "../utils/logger.js";

export function registerReadyHandler(client: BotClient) {
  client.on(Events.ClientReady, () => {
    logInfo(`Logged in as ${client.user?.tag ?? "unknown user"}`);
    startAutoEndLoop(client);

    if (env.astralChannelId) {
      startAstralSelection(client);
    }
  });
}
