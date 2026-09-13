import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  type ButtonInteraction
} from "discord.js";
import type { RsvpState } from "../../services/eventTypes.js";
import { getEventById, updateEventRsvp } from "../../services/eventService.js";
import { buildEventEmbed, buildEventRsvpConfirmation } from "../../ui/eventEmbed.js";

const RSVP_BUTTON_PREFIX = "event:rsvp";

export function buildEventRsvpButtons(eventId: string) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${RSVP_BUTTON_PREFIX}:going:${eventId}`)
      .setLabel("🜂 Going")
      .setStyle(ButtonStyle.Success)
  );
}

export function isEventRsvpButton(customId: string): boolean {
  return customId.startsWith(`${RSVP_BUTTON_PREFIX}:`);
}

export function parseEventRsvpButton(customId: string): { eventId: string; state: RsvpState } | null {
  const [, , state, eventId] = customId.split(":");

  if (!eventId || (state !== "going" && state !== "maybe" && state !== "no")) {
    return null;
  }

  return { eventId, state };
}

export async function handleEventRsvpButton(
  interaction: ButtonInteraction,
  state: RsvpState
): Promise<void> {
  const parsed = parseEventRsvpButton(interaction.customId);

  if (!parsed) {
    await interaction.reply({
      content: "❌ That event sigil could not be read.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const event = getEventById(parsed.eventId);

  if (
    !event ||
    interaction.guildId !== event.guildId ||
    interaction.message.id !== event.messageId
  ) {
    await interaction.reply({
      content: "❌ This gathering is no longer inscribed in the ledger.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const updatedEvent = updateEventRsvp(parsed.eventId, interaction.user.id, state);
  if (!updatedEvent) {
    await interaction.reply({
      content: "❌ This gathering is no longer inscribed in the ledger.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  await interaction.update({
    embeds: [buildEventEmbed(updatedEvent)],
    components: [buildEventRsvpButtons(updatedEvent.id)]
  });

  await interaction.followUp({
    content: buildEventRsvpConfirmation(state),
    flags: MessageFlags.Ephemeral
  });
}

export function getEventFromButtonMessage(customId: string) {
  const parsed = parseEventRsvpButton(customId);
  return parsed ? getEventById(parsed.eventId) : undefined;
}
