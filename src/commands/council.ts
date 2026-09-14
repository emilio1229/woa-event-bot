import { SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { buildCouncilPanel, isCouncilMember } from "../panels/councilPanel.js";
import type { CommandModule } from "../utils/commandLoader.js";

const command: CommandModule = {
  data: new SlashCommandBuilder()
    .setName("council")
    .setDescription("Open the High Council control panel."),
  async execute(interaction: ChatInputCommandInteraction) {
    if (!isCouncilMember(interaction)) {
      await interaction.reply({ content: "⛔ Only the High Council may use this command.", ephemeral: true });
      return;
    }

    await interaction.reply({ ...buildCouncilPanel(), ephemeral: true });
  }
};

export default command;
