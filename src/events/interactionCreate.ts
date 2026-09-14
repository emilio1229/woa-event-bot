import { Events, MessageFlags } from "discord.js";
import type { BotClient } from "../index.js";
import { dispatchEventButton, isEventRsvpButton } from "../interactions/buttons/index.js";
import { handleCouncilPanel } from "../panels/councilPanel.js";
import { handleRealmPanel } from "../panels/realmPanel.js";
import { handleBountyEndInteraction } from "../commands/bounty-end.js";
import { handleInteraction as handleLegacyInteraction } from "../interactionCreate.js";
import { logError } from "../utils/logger.js";

export function registerInteractionCreateHandler(client: BotClient) {
  client.on(Events.InteractionCreate, async interaction => {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
          return;
        }

        await command.execute(interaction);
        return;
      }

      // New WoA panel navigation is handled before the legacy interaction system.
      if (await handleRealmPanel(interaction)) return;
      if (await handleCouncilPanel(interaction)) return;
      if ((interaction.isButton() || interaction.isStringSelectMenu()) && await handleBountyEndInteraction(interaction)) return;

      if (interaction.isButton() && isEventRsvpButton(interaction.customId)) {
        await dispatchEventButton(interaction);
        return;
      }

      await handleLegacyInteraction(interaction);
    } catch (error) {
      logError("interaction handler error:", error, {
        interactionType: interaction.type,
        customId: interaction.isMessageComponent() || interaction.isModalSubmit() ? interaction.customId : null
      });

      if (!interaction.isRepliable() || interaction.replied || interaction.deferred) {
        return;
      }

      await interaction.reply({
        content: "❌ The arcane weave faltered while handling that interaction.",
        flags: MessageFlags.Ephemeral
      });
    }
  });
}
