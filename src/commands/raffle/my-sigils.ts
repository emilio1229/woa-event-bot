import { MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { sigilStore } from "../../sigilStore.js";
import { buildBalanceEmbed } from "../../sigilUtils.js";
import type { CommandModule } from "../../utils/commandLoader.js";

const command: CommandModule = {
  data: new SlashCommandBuilder()
    .setName("my-sigils")
    .setDescription("View your sigil balance and recent ledger activity.")
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({ content: "❌ Your sigil ledger can only be viewed inside a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    const userRecord = await sigilStore.getUser(interaction.guild.id, interaction.user.id);

    await interaction.reply({
      embeds: [
        buildBalanceEmbed(
          interaction.user,
          userRecord.balance,
          userRecord.transactions.slice(0, 10),
          "💠 My Sigils",
          "Your personal sigil ledger and recent ritual activity."
        )
      ],
      flags: MessageFlags.Ephemeral
    });
  }
};

export default command;
