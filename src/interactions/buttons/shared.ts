import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  type ButtonInteraction
} from "discord.js";
import { getEventById, updateEventRsvp, removeEventRsvp } from "../../services/eventService.js";
import { buildEventEmbed } from "../../ui/eventEmbed.js";

const RSVP_BUTTON_PREFIX = "event:rsvp";

export function buildEventRsvpButtons(eventId: string) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${RSVP_BUTTON_PREFIX}:going:${eventId}`)
      .setLabel("🜂 RSVP / Going")
      .setStyle(ButtonStyle.Success)
  );
}

export function isEventRsvpButton(customId: string): boolean {
  return customId.startsWith(`${RSVP_BUTTON_PREFIX}:`);
}

export function parseEventRsvpButton(customId: string): { eventId: string; privateControl: boolean } | null {
  const parts = customId.split(":");
  const state = parts[2];
  const eventId = parts[3];
  if ((state !== "going" && state !== "private") || !eventId) return null;
  return { eventId, privateControl: state === "private" };
}

function personalRsvpButton(eventId: string, channelId: string, messageId: string, going: boolean) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${RSVP_BUTTON_PREFIX}:private:${eventId}:${channelId}:${messageId}`)
      .setLabel(going ? "✓ You're Going — Leave Event" : "🜂 Join Event")
      .setStyle(going ? ButtonStyle.Secondary : ButtonStyle.Success)
  );
}

async function refreshPublicEventMessage(interaction: ButtonInteraction, event: NonNullable<Awaited<ReturnType<typeof getEventById>>>, channelId: string, messageId: string) {
  const channel = await interaction.client.channels.fetch(channelId).catch(() => null);
  if (!channel || !("messages" in channel)) return;
  const message = await channel.messages.fetch(messageId).catch(() => null);
  if (message) {
    const notificationValue = message.embeds[0]?.fields.find(field => field.name === "🔔 Notification")?.value;
    const notificationRoleId = notificationValue?.match(/^<@&(\d+)>$/)?.[1] ?? null;
    await message.edit({
      embeds: [buildEventEmbed(event, notificationRoleId)],
      components: [buildEventRsvpButtons(event.id)]
    }).catch(() => null);
  }
}

export async function handleEventRsvpButton(interaction: ButtonInteraction): Promise<void> {
  const parsed = parseEventRsvpButton(interaction.customId);
  if (!parsed) {
    await interaction.reply({ content: "❌ That event sigil could not be read.", flags: MessageFlags.Ephemeral });
    return;
  }

  if (parsed.privateControl) await interaction.deferUpdate();
  else await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const event = await getEventById(parsed.eventId);
  const parts = interaction.customId.split(":");
  const channelId = parsed.privateControl ? parts[4] : interaction.channelId;
  const messageId = parsed.privateControl ? parts[5] : interaction.message.id;
  if (!event || interaction.guildId !== event.guildId || !channelId || !messageId) {
    await interaction.editReply({ content: "❌ This gathering is no longer inscribed in the ledger.", components: [] });
    return;
  }

  const wasGoing = event.rsvps[interaction.user.id] === "going";
  const updatedEvent = parsed.privateControl && wasGoing
    ? await removeEventRsvp(parsed.eventId, interaction.user.id)
    : await updateEventRsvp(parsed.eventId, interaction.user.id, "going");
  if (!updatedEvent) {
    await interaction.editReply({ content: "❌ This gathering is no longer open for RSVP.", components: [] });
    return;
  }

  const isGoing = updatedEvent.rsvps[interaction.user.id] === "going";
  await refreshPublicEventMessage(interaction, updatedEvent, channelId, messageId);
  const content = isGoing
    ? `🜂 You're marked **Going** for **${updatedEvent.title}**. Only you can see the control below.`
    : `You have left **${updatedEvent.title}**. You can rejoin whenever you're ready.`;
  const components = [personalRsvpButton(updatedEvent.id, channelId, messageId, isGoing)];
  await interaction.editReply({ content, components });
}

export function getEventFromButtonMessage(customId: string) {
  const parsed = parseEventRsvpButton(customId);
  return parsed ? getEventById(parsed.eventId) : undefined;
}
