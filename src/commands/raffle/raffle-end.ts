import {
  AttachmentBuilder,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  type ChatInputCommandInteraction,
  type Message
} from "discord.js";
import { raffleStore } from "../../raffleStore.js";
import type { Raffle } from "../../types/legacy.js";
import type { CommandModule } from "../../utils/commandLoader.js";

type MessageCapableChannel = {
  messages: { fetch: (messageId: string) => Promise<Message> };
  send: (payload: unknown) => Promise<unknown>;
};

function isMessageCapableChannel(channel: unknown): channel is MessageCapableChannel {
  return typeof channel === "object" && channel !== null && "messages" in channel && "send" in channel;
}

const command: CommandModule = {
  data: new SlashCommandBuilder()
    .setName("raffle-end")
    .setDescription("Force-end the current ritual raffle."),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({ content: "❌ Rituals can only be ended from inside a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    const guild = interaction.guild;
    const allRaffles = raffleStore.all().filter(raffle => raffle.guildId === guild.id && Date.now() < raffle.endsAt);

    if (allRaffles.length === 0) {
      await interaction.reply({ content: "❌ There are no active rituals to end.", flags: MessageFlags.Ephemeral });
      return;
    }

    if (allRaffles.length === 1) {
      await executeRaffleEnd(interaction, allRaffles[0]);
      return;
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("select_end_raffle")
      .setPlaceholder("Select a ritual to end");

    for (const raffle of allRaffles) {
      selectMenu.addOptions({
        label: raffle.name || `Raffle ${raffle.id}`,
        value: raffle.id,
        description: `Prize: ${raffle.prize}`
      });
    }

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    await interaction.reply({
      content: "Choose a ritual to end:",
      components: [row],
      flags: MessageFlags.Ephemeral
    });
  }
};

async function executeRaffleEnd(interaction: ChatInputCommandInteraction, raffle: Raffle): Promise<void> {
  raffleStore.markEnded(raffle.id);
  raffle.ended = true;

  let winnerId: string | null = null;

  if (raffle.entries.length > 0) {
    const randomIndex = Math.floor(Math.random() * raffle.entries.length);
    winnerId = raffle.entries[randomIndex];
  }

  const glow = ["🔮✨", "🔮💫", "🔮🌌", "🔮⚡"];
  const embed = new EmbedBuilder()
    .setTitle(`${glow[Math.floor(Math.random() * glow.length)]} Ritual Concluded`)
    .setDescription(
      winnerId
        ? `The arcane forces have chosen <@${winnerId}>.\n\n**Prize:** ${raffle.prize}`
        : "💀 The ritual found **no souls** to bind.\n\nNo winner was chosen."
    )
    .addFields(
      { name: "Prize", value: raffle.prize || "Unknown", inline: true },
      { name: "Invocation", value: raffle.invocationText || "The sigils await...", inline: false },
      { name: "Bound Souls", value: `${raffle.entries.length}`, inline: true }
    )
    .setColor(0x4B0082);

  try {
    const channel = await interaction.client.channels.fetch(raffle.channelId);

    if (isMessageCapableChannel(channel) && raffle.messageId) {
      const message = await channel.messages.fetch(raffle.messageId).catch(() => null);

      if (message) {
        await message.edit({ components: [] });
      }

      if (winnerId) {
        const grandEmbed = new EmbedBuilder()
          .setColor(0xFF4500)
          .setTitle("✨ A Champion Has Been Chosen ✨")
          .setDescription("The sigil storm erupts in violent cosmic fury.")
          .addFields(
            { name: "👑 Winner", value: `<@${winnerId}>`, inline: false },
            { name: "📢 Ritual Role", value: raffle.tagRole ? `<@&${raffle.tagRole}>` : "None", inline: false },
            { name: "🎁 Prize", value: `**${raffle.prize}**`, inline: false },
            { name: "💠 Sigils Bound", value: `${raffle.entries.length}`, inline: true }
          )
          .setImage("attachment://woa_winner_bg.png")
          .setFooter({ text: "Wizards of Ark • Ascension Complete" })
          .setTimestamp();

        const attachment = new AttachmentBuilder("./assets/woa_winner_bg.png", { name: "woa_winner_bg.png" });

        await channel.send({
          embeds: [grandEmbed],
          files: [attachment],
          allowedMentions: {
            users: [winnerId],
            roles: raffle.tagRole ? [raffle.tagRole] : []
          }
        });
      }
    }
  } catch (error) {
    console.error("Manual end failed:", error);
  }

  await interaction.reply({
    content: "🔮 The ritual has been ended.",
    embeds: [embed],
    flags: MessageFlags.Ephemeral
  });
}

export default command;
