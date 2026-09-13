import { EmbedBuilder, MessageFlags, PermissionsBitField, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { raffleStore } from "../raffleStore.js";
import type { CommandModule } from "../utils/commandLoader.js";

const command: CommandModule = {
  data: new SlashCommandBuilder()
    .setName("raffle-debug")
    .setDescription("Show internal raffle debug information"),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.guildId) {
      await interaction.reply({ content: "❌ Ritual debug can only run inside a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
      await interaction.reply({
        content: "❌ You lack the arcane authority to inspect rituals.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const guildId = interaction.guildId;
    const active = raffleStore.getActive(guildId);
    const all = raffleStore.all();

    let activeText = "• None";

    if (active) {
      activeText =
        `• ID: ${active.id}\n` +
        `• Ends At: ${new Date(active.endsAt).toLocaleString()}\n` +
        `• Ended Flag: ${active.ended}\n` +
        `• Entries: ${active.entries?.length ?? 0}`;
    }

    const idsText = all.length > 0 ? all.map(raffle => `• ${raffle.id} (ended: ${raffle.ended})`).join("\n") : "None";

    const embed = new EmbedBuilder()
      .setTitle("🔧 Raffle Debug Information")
      .setColor(0x5A00A0)
      .setDescription(
        `**Guild:** ${guildId}\n\n` +
          `**Active Raffle:**\n${activeText}\n\n` +
          `**Total Raffles Stored:** ${all.length}\n\n` +
          `**IDs:**\n${idsText}\n\n` +
          "⟐ Debug complete."
      );

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral
    });
  }
};

export default command;
