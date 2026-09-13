import { ActionRowBuilder, EmbedBuilder, MessageFlags, SlashCommandBuilder, StringSelectMenuBuilder, type ChatInputCommandInteraction } from "discord.js";
import { raffleStore } from "../../raffleStore.js";
import type { CommandModule } from "../../utils/commandLoader.js";

const command: CommandModule = {
  data: new SlashCommandBuilder()
    .setName("raffle-status")
    .setDescription("Show the current ritual raffle status."),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({ content: "❌ Ritual status can only be viewed inside a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    const guild = interaction.guild;
    const allRaffles = raffleStore.all().filter(raffle => raffle.guildId === guild.id && Date.now() < raffle.endsAt);

    if (allRaffles.length === 0) {
      await interaction.reply({ content: "❌ There are no active rituals at the moment.", flags: MessageFlags.Ephemeral });
      return;
    }

    if (allRaffles.length === 1) {
      const raffle = allRaffles[0];
      const embed = new EmbedBuilder()
        .setTitle("🔮 Active Ritual Status")
        .addFields(
          { name: "Prize", value: raffle.prize || "Unknown", inline: true },
          { name: "Ends At", value: `<t:${Math.floor(raffle.endsAt / 1000)}:F>`, inline: true },
          { name: "Invocation", value: raffle.invocationText || "The sigils await...", inline: false },
          { name: "💠 Bound Sigils", value: `${raffle.entries.length}`, inline: true }
        )
        .setColor(0x4B0082);

      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("select_status_raffle")
      .setPlaceholder("Select a ritual to view status");

    for (const raffle of allRaffles) {
      selectMenu.addOptions({
        label: raffle.name || `Raffle ${raffle.id}`,
        value: raffle.id,
        description: `Prize: ${raffle.prize}`
      });
    }

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    await interaction.reply({
      content: "Choose a ritual to view:",
      components: [row],
      flags: MessageFlags.Ephemeral
    });
  }
};

export default command;
