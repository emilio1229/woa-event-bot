import { MessageFlags, PermissionsBitField, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { sigilStore } from "../../sigilStore.js";
import { buildBalanceEmbed, requireAdmin } from "../../sigilUtils.js";
import type { CommandModule } from "../../utils/commandLoader.js";

const command: CommandModule = {
  data: new SlashCommandBuilder()
    .setName("award-sigils")
    .setDescription("Award or remove sigils from a user.")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The sigil bearer to adjust.")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("amount")
        .setDescription("Positive to award, negative to remove.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("Why this sigil adjustment is being made.")
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
    const amount = interaction.options.getInteger("amount", true);
    const reason = interaction.options.getString("reason", true).trim();

    if (!reason) {
      await interaction.reply({ content: "❌ A reason is required for the sigil ledger.", flags: MessageFlags.Ephemeral });
      return;
    }

    try {
      const updatedUser = await sigilStore.award(interaction.guild.id, targetUser.id, amount, reason, interaction.user.id);
      const embed = buildBalanceEmbed(
        targetUser,
        updatedUser.balance,
        updatedUser.transactions.slice(0, 5),
        amount > 0 ? "✨ Sigils Awarded" : "🜂 Sigils Removed",
        `${targetUser} has been ${amount > 0 ? "granted" : "charged"} **${Math.abs(amount)}** sigils.`
      );

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: `❌ ${error instanceof Error ? error.message : "Unable to update the sigil ledger."}`, flags: MessageFlags.Ephemeral });
    }
  }
};

export default command;
