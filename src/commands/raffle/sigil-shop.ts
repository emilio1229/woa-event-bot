import { MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { raffleStore } from "../../raffleStore.js";
import { sigilStore } from "../../sigilStore.js";
import { buildShopComponents, buildShopEmbed } from "../../sigilUtils.js";
import type { CommandModule } from "../../utils/commandLoader.js";

const command: CommandModule = {
  data: new SlashCommandBuilder()
    .setName("sigil-shop")
    .setDescription("Redeem sigils for weighted raffle entries.")
    .setDMPermission(false),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({ content: "❌ The sigil shop can only be used inside a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    const guild = interaction.guild;
    const activeRaffles = raffleStore
      .all()
      .filter(raffle => raffle.guildId === guild.id && Date.now() < raffle.endsAt && !raffle.ended);
    const balance = sigilStore.getBalance(guild.id, interaction.user.id);

    await interaction.reply({
      embeds: [buildShopEmbed(activeRaffles, balance)],
      components: buildShopComponents(activeRaffles.length === 0),
      flags: MessageFlags.Ephemeral
    });
  }
};

export default command;
