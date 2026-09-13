import { MessageFlags, PermissionsBitField, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { raffleStore } from "../../raffleStore.js";
import { sigilStore } from "../../sigilStore.js";
import { buildAdminPanelEmbed, requireAdmin } from "../../sigilUtils.js";
import type { CommandModule } from "../../utils/commandLoader.js";

const command: CommandModule = {
  data: new SlashCommandBuilder()
    .setName("sigil-admin-panel")
    .setDescription("View guild-wide sigil economy stats.")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({ content: "❌ This sigil panel can only be opened inside a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    const guild = interaction.guild;
    if (!(await requireAdmin(interaction))) {
      return;
    }

    const stats = await sigilStore.getGuildStats(guild.id);
    const activeRaffles = (await raffleStore.all())
      .filter(raffle => raffle.guildId === guild.id && Date.now() < raffle.endsAt && !raffle.ended);

    await interaction.reply({ embeds: [buildAdminPanelEmbed(stats, activeRaffles)] });
  }
};

export default command;
