import { EmbedBuilder, MessageFlags, type ButtonInteraction, type Message } from "discord.js";
import { buildActiveRaffleEmbed } from "../embedBuilder.js";
import { withRaffleEntryLock } from "../raffleEntryLock.js";
import { raffleStore } from "../raffleStore.js";

function isMessageCapableChannel(channel: unknown): channel is {
  send: (payload: unknown) => Promise<unknown>;
  messages: { fetch: (messageId: string) => Promise<Message> };
} {
  return typeof channel === "object" && channel !== null && "send" in channel && "messages" in channel;
}

function removeSingleEntry(entries: string[], userId: string): void {
  const index = entries.indexOf(userId);

  if (index !== -1) {
    entries.splice(index, 1);
  }
}

function countEntriesForUser(entries: string[], userId: string): number {
  return entries.filter(id => id === userId).length;
}

export async function handleUnbindSoul(interaction: ButtonInteraction, raffleId: string): Promise<void> {
  await withRaffleEntryLock(raffleId, async () => {
    const raffle = raffleStore.getById(raffleId);

    if (!raffle) {
      await interaction.reply({
        content: "❌ This ritual has already ended.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const userId = interaction.user.id;
    raffle.boundUsers ??= [];
    raffle.entries ??= [];

    if (!raffle.boundUsers.includes(userId)) {
      await interaction.reply({
        content: "⚫ You are not part of this ritual.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const originalEntries = [...raffle.entries];
    const originalBoundUsers = [...raffle.boundUsers];

    raffle.boundUsers = raffle.boundUsers.filter(id => id !== userId);
    removeSingleEntry(raffle.entries, userId);

    try {
      const channel = await interaction.client.channels.fetch(raffle.channelId);

      if (!isMessageCapableChannel(channel) || !raffle.messageId) {
        throw new Error("The ritual could not be updated.");
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

      await interaction.reply({
        content: "❌ The ritual could not be updated. You remain within the circle.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    raffleStore.save(raffle);

    const glow = ["⚫🌑", "⚫🕯️", "⚫🌫️", "⚫🜂"];
    const glowSymbol = glow[Math.floor(Math.random() * glow.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${glowSymbol} Ritual Left`)
      .setDescription(
        [
          "You step away from the ritual circle.",
          "The energies dim as your presence fades.",
          "",
          `🜂 **Your Remaining Entries:** ${countEntriesForUser(raffle.entries, userId)}`,
          `💠 **Total Participants:** ${raffle.entries.length}`,
          "",
          "⟐ The ritual shifts with your departure."
        ].join("\n")
      )
      .setColor(0x2E003E)
      .setFooter({ text: "The ritual calms…" });

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral
    });
  });
}
