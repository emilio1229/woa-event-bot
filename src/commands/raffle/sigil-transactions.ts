import { MessageFlags, PermissionsBitField, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { sigilStore } from "../../sigilStore.js";
import { buildBalanceEmbed, requireAdmin } from "../../sigilUtils.js";
import type { CommandModule } from "../../utils/commandLoader.js";

const command: CommandModule = {
  data: new SlashCommandBuilder()
    .setName("sigil-transactions")
    .setDescription("View a user's sigil transaction history.")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The sigil bearer whose ledger you want to inspect.")
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({ content: "❌ This sigil rite can only be used inside a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    if (!(await requireAdmin(interaction))) {
      return;
    }

    const targetUser = interaction.options.getUser("user", true);
    const userRecord = sigilStore.getUser(interaction.guild.id, targetUser.id);

    await interaction.reply({
      embeds: [
        buildBalanceEmbed(
          targetUser,
          userRecord.balance,
          userRecord.transactions.slice(0, 15),
          "📜 Sigil Transactions",
          `Audit ledger for ${targetUser}.`
        )
      ]
    });
  }
};

export default command;
