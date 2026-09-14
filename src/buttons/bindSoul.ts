import { EmbedBuilder, MessageFlags, type ButtonInteraction, type Message } from "discord.js";
import { buildActiveRaffleEmbed } from "../embedBuilder.js";
import { withRaffleEntryLock } from "../raffleEntryLock.js";
import { raffleStore } from "../raffleStore.js";
import { getRaffleMessageChannelId } from "../services/raffleThreadService.js";

function isDiscordErrorWithCode(error: unknown, code: number): error is { code: number } {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === code;
}

type MessageCapableChannel = {
  send: (payload: unknown) => Promise<unknown>;
  messages: { fetch: (messageId: string) => Promise<Message> };
};

function isMessageCapableChannel(channel: unknown): channel is MessageCapableChannel {
  return typeof channel === "object" && channel !== null && "send" in channel && "messages" in channel;
}

function countEntriesForUser(entries: string[], userId: string): number {
  return entries.filter(id => id === userId).length;
}

function getParticipantNames(interaction: ButtonInteraction, userIds: string[]): string[] {
  return userIds.map(userId => {
    const member = interaction.guild?.members.cache.get(userId);
    return member?.displayName ?? interaction.client.users.cache.get(userId)?.globalName ?? interaction.client.users.cache.get(userId)?.username ?? `Wizard ${userId.slice(-4)}`;
  });
}

export async function handleBindSoul(interaction: ButtonInteraction, raffleId: string): Promise<void> {
  await withRaffleEntryLock(raffleId, async () => {
    const raffle = await raffleStore.getById(raffleId);

    if (!raffle || raffle.ended || raffle.endsAt <= Date.now()) {
      try {
        await interaction.reply({ content: "❌ This ritual has already ended.", flags: MessageFlags.Ephemeral });
        return;
      } catch (error) {
        if (isDiscordErrorWithCode(error, 10062) && isMessageCapableChannel(interaction.channel)) {
          await interaction.channel.send("🔮 This ritual has already ended.");
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
        await interaction.reply({ content: "🔮 You have already joined this ritual.", flags: MessageFlags.Ephemeral });
        return;
      } catch (error) {
        if (isDiscordErrorWithCode(error, 10062) && isMessageCapableChannel(interaction.channel)) {
          await interaction.channel.send("🔮 A participant is already bound to this ritual.");
          return;
        }
        throw error;
      }
    }

    let canReply = true;
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    } catch (error) {
      if (isDiscordErrorWithCode(error, 10062)) canReply = false;
      else throw error;
    }

    const originalEntries = [...raffle.entries];
    const originalBoundUsers = [...raffle.boundUsers];
    raffle.boundUsers.push(userId);
    raffle.entries.push(userId);

    try {
      const channel = await interaction.client.channels.fetch(getRaffleMessageChannelId(raffle));
      if (!isMessageCapableChannel(channel) || !raffle.messageId) throw new Error("The ritual display could not be updated. You were not joined.");
      const message = await channel.messages.fetch(raffle.messageId);
      await message.edit({
        embeds: [buildActiveRaffleEmbed(raffle, getParticipantNames(interaction, raffle.boundUsers))],
        components: message.components,
        files: ["./assets/woa_ritual_bg.png"],
        allowedMentions: { parse: [] }
      });
    } catch {
      raffle.entries = originalEntries;
      raffle.boundUsers = originalBoundUsers;
      if (canReply) await interaction.editReply({ content: "❌ The ritual could not be updated. You were not joined." });
      else if (isMessageCapableChannel(interaction.channel)) await interaction.channel.send("❌ The ritual could not be updated. The participant was not joined.");
      return;
    }

    await raffleStore.save(raffle);

    const glow = ["🔮✨", "🔮💫", "🔮🌌", "🔮⚡"];
    const glowSymbol = glow[Math.floor(Math.random() * glow.length)];
    const embed = new EmbedBuilder()
      .setTitle(`${glowSymbol} Ritual Joined`)
      .setDescription([
        "You step into the ritual circle.",
        "Arcane energies acknowledge your presence.",
        "",
        `💠 **Your Total Entries:** ${countEntriesForUser(raffle.entries, userId)}`,
        `💠 **Total Participants:** ${raffle.boundUsers.length}`,
        "",
        "⟐ The ritual deepens with your arrival."
      ].join("\n"))
      .setColor(0x5A00A0)
      .setFooter({ text: "The ritual intensifies…" });

    try {
      if (canReply) await interaction.editReply({ embeds: [embed] });
      else if (isMessageCapableChannel(interaction.channel)) await interaction.channel.send("🔮 Your essence has been bound to the ritual.");
    } catch (error) {
      if (isDiscordErrorWithCode(error, 10062) && isMessageCapableChannel(interaction.channel)) await interaction.channel.send("🔮 Your essence has been bound to the ritual.");
      else throw error;
    }
  });
}
