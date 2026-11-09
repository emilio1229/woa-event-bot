import { MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { buildRealmPanelWithAstralSelection } from "../panels/astralSelectionPanel.js";
import type { CommandModule } from "../utils/commandLoader.js";

const command: CommandModule = {
  data: new SlashCommandBuilder()
    .setName("realm")
    .setDescription("Open the Wizards of Ark Realm panel."),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({
      ...(await buildRealmPanelWithAstralSelection(interaction.guildId ?? undefined, interaction.user.id)),
      flags: MessageFlags.Ephemeral
    });
  }
};

export default command;
