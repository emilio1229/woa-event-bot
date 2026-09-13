import { MessageFlags, PermissionsBitField, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { sigilStore } from "../../sigilStore.js";
import { buildLeaderboardEmbed, requireAdmin } from "../../sigilUtils.js";
import type { CommandModule } from "../../utils/commandLoader.js";

const command: CommandModule = {
  data: new SlashCommandBuilder()
    .setName("sigil-leaderboard")
    .setDescription("Show the top 10 sigil earners.")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({ content: "❌ This sigil rite can only be used inside a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    const guild = interaction.guild;
    if (!(await requireAdmin(interaction))) {
      return;
    }

    const leaderboard = await sigilStore.getLeaderboard(guild.id, 10);
    const lines = await Promise.all(
      leaderboard.map(async (entry, index) => {
        const member = await guild.members.fetch(entry.userId).catch(() => null);
        const name = member?.displayName ?? `<@${entry.userId}>`;
        return `**${index + 1}.** ${name} — **${entry.balance}** sigils`;
      })
    );

    await interaction.reply({ embeds: [buildLeaderboardEmbed(lines)] });
  }
};

export default command;
