import { EmbedBuilder, MessageFlags, type ButtonInteraction, type Message } from "discord.js";
import { buildActiveRaffleEmbed } from "../embedBuilder.js";
import { withRaffleEntryLock } from "../raffleEntryLock.js";
import { raffleStore } from "../raffleStore.js";

function isDiscordErrorWithCode(error: unknown, code: number): error is { code: number } {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === code;
}

type MessageCapableChannel = {
  send: (payload: unknown) => Promise<unknown>;
  messages: {
    fetch: (messageId: string) => Promise<Message>;
  };
};

function isMessageCapableChannel(channel: unknown): channel is MessageCapableChannel {
  return typeof channel === "object" && channel !== null && "send" in channel && "messages" in channel;
}

function countEntriesForUser(entries: string[], userId: string): number {
  return entries.filter(id => id === userId).length;
}

export async function handleBindSoul(interaction: ButtonInteraction, raffleId: string): Promise<void> {
  await withRaffleEntryLock(raffleId, async () => {
    const raffle = raffleStore.getById(raffleId);

    if (!raffle || raffle.ended) {
      try {
        await interaction.reply({
          content: "❌ This ritual has already ended.",
          flags: MessageFlags.Ephemeral
        });
        return;
      } catch (error) {
        if (isDiscordErrorWithCode(error, 10062) && isMessageCapableChannel(interaction.channel)) {
          await interaction.channel.send(`<@${interaction.user.id}> ❌ This ritual has already ended.`);
          return;
        }

        throw error;
      }
    }

    const userId = interaction.user.id;
    raffle.boundUsers ??= [];
    raffle.entries ??= [];

    if (raffle.boundUsers.includes(userId)) {
      try {
        await interaction.reply({
          content: "🔮 You have already joined this ritual.",
          flags: MessageFlags.Ephemeral
        });
        return;
      } catch (error) {
        if (isDiscordErrorWithCode(error, 10062) && isMessageCapableChannel(interaction.channel)) {
          console.log("[bindSoul] Interaction expired for double-join message");
          await interaction.channel.send(`<@${interaction.user.id}> 🔮 You have already joined this ritual.`);
          return;
        }

        throw error;
      }
    }

    let canReply = true;

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    } catch (error) {
      if (isDiscordErrorWithCode(error, 10062)) {
        console.log("[bindSoul] Interaction expired during deferReply");
        canReply = false;
      } else {
        throw error;
      }
    }

    const originalEntries = [...raffle.entries];
    const originalBoundUsers = [...raffle.boundUsers];

    raffle.boundUsers.push(userId);
    raffle.entries.push(userId);

    try {
      const channel = await interaction.client.channels.fetch(raffle.channelId);

      if (!isMessageCapableChannel(channel) || !raffle.messageId) {
        throw new Error("The ritual display could not be updated. You were not joined.");
      }

      const message = await channel.messages.fetch(raffle.messageId);
      await message.edit({
        embeds: [buildActiveRaffleEmbed(raffle)],
        components: message.components,
        files: ["./assets/woa_ritual_bg.png"]
      });
    } catch {
      raffle.entries = originalEntries;
      raffle.boundUsers = originalBoundUsers;

      if (canReply) {
        await interaction.editReply({
          content: "❌ The ritual could not be updated. You were not joined."
        });
      } else if (isMessageCapableChannel(interaction.channel)) {
        await interaction.channel.send(`<@${interaction.user.id}> ❌ The ritual could not be updated. You were not joined.`);
      }

      return;
    }

    raffleStore.save(raffle);

    const glow = ["🔮✨", "🔮💫", "🔮🌌", "🔮⚡"];
    const glowSymbol = glow[Math.floor(Math.random() * glow.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${glowSymbol} Ritual Joined`)
      .setDescription(
        [
          "You step into the ritual circle.",
          "Arcane energies acknowledge your presence.",
          "",
          `💠 **Your Total Entries:** ${countEntriesForUser(raffle.entries, userId)}`,
          `💠 **Total Participants:** ${raffle.entries.length}`,
          "",
          "⟐ The ritual deepens with your arrival."
        ].join("\n")
      )
      .setColor(0x5A00A0)
      .setFooter({ text: "The ritual intensifies…" });

    try {
      if (canReply) {
        await interaction.editReply({ embeds: [embed] });
      } else if (isMessageCapableChannel(interaction.channel)) {
        await interaction.channel.send(`<@${interaction.user.id}> 🔮 Your essence has been bound to the ritual.`);
      }
    } catch (error) {
      if (isDiscordErrorWithCode(error, 10062) && isMessageCapableChannel(interaction.channel)) {
        console.log("[bindSoul] Interaction expired during editReply");
        await interaction.channel.send(`<@${interaction.user.id}> 🔮 Your essence has been bound to the ritual.`);
        return;
      }

      throw error;
    }
  });
}
