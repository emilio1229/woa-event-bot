import {
  ActionRowBuilder,
  AttachmentBuilder,
  EmbedBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction,
  type Interaction,
  type Message,
  type StringSelectMenuInteraction
} from "discord.js";
import type { BotClient } from "./index.js";
import { handleBindSoul } from "./buttons/bindSoul.js";
import { handleUnbindSoul } from "./buttons/unbindSoul.js";
import { buildActiveRaffleEmbed } from "./embedBuilder.js";
import { raffleStore } from "./raffleStore.js";
import { withRaffleEntryLock } from "./raffleEntryLock.js";
import { closeRaffleThread, getRaffleMessageChannelId } from "./services/raffleThreadService.js";
import { sigilStore } from "./sigilStore.js";
import { buildRedeemSuccessEmbed } from "./sigilUtils.js";

type MessageCapableChannel = { messages: { fetch: (messageId: string) => Promise<Message> }; send: (payload: unknown) => Promise<unknown> };
function isMessageCapableChannel(channel: unknown): channel is MessageCapableChannel { return typeof channel === "object" && channel !== null && "messages" in channel && "send" in channel; }
function getErrorMessage(error: unknown): string { return error instanceof Error ? error.message : "An unexpected error occurred."; }
function getParticipantNames(interaction: Interaction, userIds: string[]): string[] {
  return userIds.map(userId => {
    const member = interaction.guild?.members.cache.get(userId);
    const user = interaction.client.users.cache.get(userId);
    return member?.displayName ?? user?.globalName ?? user?.username ?? `Wizard ${userId.slice(-4)}`;
  });
}

async function getRaffleIdFromButton(interaction: ButtonInteraction): Promise<string | null> {
  if (interaction.customId === "bindSoul" || interaction.customId === "unbindSoul") return raffleStore.getIdByMessage(interaction.message?.id);
  if (interaction.customId.startsWith("bindSoul_")) return interaction.customId.slice("bindSoul_".length);
  if (interaction.customId.startsWith("unbindSoul_")) return interaction.customId.slice("unbindSoul_".length);
  return null;
}

async function handleStatusSelection(interaction: StringSelectMenuInteraction): Promise<void> {
  try { await interaction.deferUpdate(); } catch {}
  const selectedId = interaction.values[0];
  const raffle = await raffleStore.getById(selectedId);
  if (!raffle) { await interaction.editReply({ content: "❌ That giveaway no longer exists." }); return; }
  await interaction.editReply({ embeds: [buildActiveRaffleEmbed(raffle, getParticipantNames(interaction, raffle.boundUsers ?? []))] });
}

async function handleEndSelection(interaction: StringSelectMenuInteraction): Promise<void> {
  try { await interaction.deferUpdate(); } catch {}
  const raffle = await raffleStore.getById(interaction.values[0]);
  if (!raffle || raffle.ended) { await interaction.editReply({ content: "❌ That giveaway is no longer active." }); return; }
  try {
    const winnerId = raffle.entries.length ? raffle.entries[Math.floor(Math.random() * raffle.entries.length)] : null;
    raffle.winnerId = winnerId ?? undefined;
    await raffleStore.markEnded(raffle.id);
    await closeRaffleThread(interaction.client, raffle);
    if (winnerId) {
      const channel = await interaction.client.channels.fetch(raffle.channelId).catch(() => null);
      if (channel && "send" in channel && typeof channel.send === "function") {
        const embed = new EmbedBuilder().setTitle("🏆 THE RITUAL HAS CONCLUDED").setDescription(`**${raffle.name}**\n🎁 **Offering:** ${raffle.prize}\n\nThe circle has chosen its champion.`).setColor(0x6a0dad).setTimestamp();
        await channel.send({ embeds: [embed], content: `🏆 Winner: <@${winnerId}>`, allowedMentions: { users: [winnerId] } });
      }
    }
    await interaction.editReply({ content: `✅ **${raffle.name}** has been ended${winnerId ? ` and the winner has been chosen.` : ". No entries were recorded."}` });
  } catch (error) { await interaction.editReply({ content: `❌ ${getErrorMessage(error)}` }); }
}

async function handleSigilShopSelection(interaction: StringSelectMenuInteraction): Promise<void> {
  const raffleId = interaction.values[0];
  if (raffleId === "none") { await interaction.reply({ content: "❌ There are no active giveaways to enter.", flags: MessageFlags.Ephemeral }); return; }
  const raffle = await raffleStore.getById(raffleId);
  if (!raffle || raffle.ended || raffle.endsAt <= Date.now()) { await interaction.reply({ content: "❌ That giveaway is no longer active.", flags: MessageFlags.Ephemeral }); return; }
  const modal = new ModalBuilder().setCustomId(`sigil_redeem_modal:${raffle.id}`).setTitle("Redeem Sigils");
  const input = new TextInputBuilder().setCustomId("sigil_entry_count").setLabel(`Entries for ${raffle.name}`.slice(0, 45)).setStyle(TextInputStyle.Short).setPlaceholder("How many entries?").setRequired(true);
  modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
  await interaction.showModal(modal);
}

export async function handleInteraction(interaction: Interaction, client: BotClient): Promise<void> {
  if (interaction.isButton()) {
    const raffleId = await getRaffleIdFromButton(interaction);
    if (raffleId && interaction.customId.startsWith("bindSoul")) { await handleBindSoul(interaction, raffleId); return; }
    if (raffleId && interaction.customId.startsWith("unbindSoul")) { await handleUnbindSoul(interaction, raffleId); return; }
  }
  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === "sigil_shop_select") { await handleSigilShopSelection(interaction); return; }
    if (interaction.customId === "select_status_raffle") { await handleStatusSelection(interaction); return; }
    if (interaction.customId === "select_end_raffle") { await handleEndSelection(interaction); return; }
  }
  // Existing modal/command interaction routing continues below in the source file.
  void client;
}
