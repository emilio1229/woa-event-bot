import { MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { buildRealmPanel } from "../panels/realmPanel.js";
import type { CommandModule } from "../utils/commandLoader.js";

const command: CommandModule = {
  data: new SlashCommandBuilder()
    .setName("realm")
    .setDescription("Open the Wizards of Ark Realm panel."),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({ ...buildRealmPanel(), flags: MessageFlags.Ephemeral });
  }
};

export default command;
