import { EmbedBuilder, MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { sigilStore } from "../../sigilStore.js";
import type { CommandModule } from "../../utils/commandLoader.js";

const DAY_MS = 24 * 60 * 60 * 1000;

const command: CommandModule = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim your daily sigil reward (+1 sigil)."),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({ content: "❌ Daily sigils can only be claimed inside a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const userData = sigilStore.getUser(guildId, userId);
    userData.lastDaily ??= 0;

    const now = Date.now();
    const elapsed = now - userData.lastDaily;

    if (elapsed < DAY_MS) {
      const remaining = DAY_MS - elapsed;
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      const cooldownEmbed = new EmbedBuilder()
        .setColor("#ff5555")
        .setTitle("Daily reward not ready yet")
        .setDescription(`You can claim again in **${hours}h ${minutes}m ${seconds}s**.`);

      await interaction.reply({ embeds: [cooldownEmbed], flags: MessageFlags.Ephemeral });
      return;
    }

    sigilStore.award(guildId, userId, 1, "Daily reward");
    userData.lastDaily = now;
    sigilStore.persist();

    const successEmbed = new EmbedBuilder()
      .setColor("#55ff55")
      .setTitle("Daily reward claimed")
      .setDescription("You received **+1 sigil**. Come back tomorrow for another reward.");

    await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });
  }
};

export default command;
