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

type MessageCapableChannel = {
  messages: { fetch: (messageId: string) => Promise<Message> };
  send: (payload: unknown) => Promise<unknown>;
};

function isMessageCapableChannel(channel: unknown): channel is MessageCapableChannel {
  return typeof channel === "object" && channel !== null && "messages" in channel && "send" in channel;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}

function getParticipantNames(interaction: StringSelectMenuInteraction, userIds: string[]): string[] {
  return userIds.map(userId => {
    const member = interaction.guild?.members.cache.get(userId);
    return member?.displayName ?? interaction.client.users.cache.get(userId)?.globalName ?? interaction.client.users.cache.get(userId)?.username ?? `Wizard ${userId.slice(-4)}`;
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
  if (!raffle) {
    try { await interaction.editReply({ content: "Selected ritual not found.", components: [] }); } catch {}
    return;
  }
  const embed = new EmbedBuilder()
    .setTitle("🔮 Active Ritual Status")
    .addFields(
      { name: "Prize", value: raffle.prize || "Unknown", inline: true },
      { name: "Ends At", value: `<t:${Math.floor(raffle.endsAt / 1000)}:F>`, inline: true },
      { name: "Invocation", value: raffle.invocationText || "The sigils await...", inline: false },
      { name: "Bound Souls", value: `${(raffle.entries ?? []).length}`, inline: true }
    )
    .setColor(0x4B0082);
  try { await interaction.editReply({ content: "", embeds: [embed], components: [] }); } catch {}
}

async function handleEndSelection(interaction: StringSelectMenuInteraction): Promise<void> {
  try { await interaction.deferUpdate(); } catch {}
  const selectedId = interaction.values[0];
  const raffle = await raffleStore.getById(selectedId);
  if (!raffle) {
    try { await interaction.editReply({ content: "Selected ritual not found.", components: [] }); } catch {}
    return;
  }
  try {
    const entries = raffle.entries ?? [];
    const winnerId = entries.length > 0 ? entries[Math.floor(Math.random() * entries.length)] : null;
    await closeRaffleThread(interaction.client, raffle);
    if (winnerId) {
      const channel = await interaction.client.channels.fetch(raffle.channelId);
      if (isMessageCapableChannel(channel)) {
        const grandEmbed = new EmbedBuilder()
          .setColor(0xFF4500)
          .setTitle("✨ A Champion Has Been Chosen ✨")
          .setDescription("The sigils have chosen their champion.")
          .addFields(
            { name: "👑 Winner", value: `<@${winnerId}>`, inline: false },
            { name: "🎁 Prize", value: `**${raffle.prize}**`, inline: false },
            { name: "💠 Sigils Bound", value: `${entries.length}`, inline: true }
          )
          .setFooter({ text: "Wizards of Ark • Ascension Complete" })
          .setTimestamp();
        const attachment = new AttachmentBuilder("./assets/woa_winner_bg.png", { name: "woa_winner_bg.png" });
        await channel.send({ embeds: [grandEmbed], files: [attachment], allowedMentions: { users: [winnerId] } });
      }
    }
    await raffleStore.end(raffle.id);
    try { await interaction.editReply({ content: "🔮 The ritual has been ended.", components: [] }); } catch {}
  } catch (error) {
    console.error("select_end_raffle error:", error);
    try { await interaction.editReply({ content: "An error occurred while ending the ritual.", components: [] }); } catch {}
  }
}

async function handleSigilShopSelection(interaction: StringSelectMenuInteraction): Promise<void> {
  const raffleId = interaction.values[0];
  const raffle = await raffleStore.getById(raffleId);
  if (!raffle || raffle.ended || raffle.endsAt <= Date.now()) {
    await interaction.reply({ content: "❌ That giveaway is no longer active.", flags: MessageFlags.Ephemeral });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId(`sigil_redeem_modal:${raffle.id}`)
    .setTitle("Redeem Sigils for Entries");
  const entryCountInput = new TextInputBuilder()
    .setCustomId("sigil_entry_count")
    .setLabel("How many raffle entries?")
    .setPlaceholder("1")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);
  modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(entryCountInput));
  await interaction.showModal(modal);
}

export async function handleInteraction(interaction: Interaction): Promise<void> {
  try {
    if (interaction.isChatInputCommand()) {
      const client = interaction.client as BotClient;
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
      return;
    }

    if (interaction.isButton()) {
      const raffleId = await getRaffleIdFromButton(interaction);
      const raffle = raffleId ? await raffleStore.getById(raffleId) : null;
      if ((interaction.customId === "bindSoul" || interaction.customId.startsWith("bindSoul_")) && raffleId && raffle) {
        await handleBindSoul(interaction, raffleId);
        return;
      }
      if ((interaction.customId === "unbindSoul" || interaction.customId.startsWith("unbindSoul_")) && raffleId && raffle) {
        await handleUnbindSoul(interaction, raffleId);
        return;
      }
      if (interaction.customId === "bindSoul" || interaction.customId === "unbindSoul") {
        await interaction.reply({ content: "❌ This ritual is no longer active.", flags: MessageFlags.Ephemeral });
      }
      return;
    }

    if (interaction.isModalSubmit() && interaction.customId.startsWith("sigil_redeem_modal:")) {
      if (!interaction.inGuild() || !interaction.guild) {
        await interaction.reply({ content: "❌ Sigil redemption can only be used inside a server raffle channel.", flags: MessageFlags.Ephemeral });
        return;
      }
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
      const guild = interaction.guild;
      const raffleId = interaction.customId.slice("sigil_redeem_modal:".length);
      const entryCountRaw = interaction.fields.getTextInputValue("sigil_entry_count").trim();
      const entryCount = Number.parseInt(entryCountRaw, 10);
      const raffle = await raffleStore.getById(raffleId);
      if (!raffle || raffle.guildId !== guild.id || raffle.ended || Date.now() >= raffle.endsAt) {
        await interaction.editReply({ content: "❌ That giveaway is not active right now." });
        return;
      }
      if (!Number.isInteger(entryCount) || entryCount <= 0) {
        await interaction.editReply({ content: "❌ Enter a valid positive number of raffle entries." });
        return;
      }

      try {
        await withRaffleEntryLock(raffle.id, async () => {
          const originalEntries = [...(raffle.entries ?? [])];
          const originalBoundUsers = [...(raffle.boundUsers ?? [])];
          const redemption = await sigilStore.redeem(guild.id, interaction.user.id, entryCount, raffle.id, raffle.name);
          raffle.entries = [...originalEntries];
          raffle.boundUsers = [...originalBoundUsers];
          if (!raffle.boundUsers.includes(interaction.user.id)) raffle.boundUsers.push(interaction.user.id);
          for (let index = 0; index < entryCount; index += 1) raffle.entries.push(interaction.user.id);

          try {
            const channel = await interaction.client.channels.fetch(getRaffleMessageChannelId(raffle));
            if (!isMessageCapableChannel(channel) || !raffle.messageId) throw new Error("The ritual display could not be updated. Your sigils were not spent.");
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
            await sigilStore.rollbackTransaction(guild.id, interaction.user.id, redemption.transaction.id);
            throw new Error("The ritual display could not be updated. Your sigils were not spent.");
          }

          await raffleStore.save(raffle);
          await interaction.editReply({ embeds: [buildRedeemSuccessEmbed(raffle, entryCount, redemption.sigilCost, redemption.user.balance)] });
        });
      } catch (error) {
        await interaction.editReply({ content: `❌ ${getErrorMessage(error)}` });
      }
      return;
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "sigil_shop_select") {
        await handleSigilShopSelection(interaction);
        return;
      }
      if (interaction.customId === "select_status_raffle") {
        await handleStatusSelection(interaction);
        return;
      }
      if (interaction.customId === "select_end_raffle") {
        await handleEndSelection(interaction);
      }
      return;
    }

    if (interaction.isRoleSelectMenu()) {
      try { await interaction.deferUpdate(); } catch {}
    }
  } catch (error) {
    console.error("interaction handler error:", error);
  }
}
