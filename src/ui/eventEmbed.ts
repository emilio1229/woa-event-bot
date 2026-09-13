import { EmbedBuilder } from "discord.js";
import type { EventRecord, RsvpState } from "../services/eventTypes.js";
import { getEventRsvpSummary } from "../services/eventService.js";
import { formatDiscordTimestamp } from "../utils/time.js";

const RSVP_LABELS: Record<RsvpState, string> = {
  going: "Going",
  maybe: "Maybe",
  no: "No"
};

export function buildEventEmbed(event: EventRecord): EmbedBuilder {
  const rsvpSummary = getEventRsvpSummary(event);

  return new EmbedBuilder()
    .setColor(0x5b2a86)
    .setTitle(`🔮 ${event.title}`)
    .setDescription("Times automatically appear in your local timezone.")
    .addFields(
      { name: "🧙 Host", value: `<@${event.hostId}>`, inline: true },
      {
        name: "🕰️ Start Time",
        value: formatDiscordTimestamp(event.startAtUnix, "F"),
        inline: true
      },
      {
        name: "⏳ Countdown",
        value: formatDiscordTimestamp(event.startAtUnix, "R"),
        inline: true
      },
      { name: "✨ Going", value: `${rsvpSummary.going}`, inline: true },
      {
        name: "📜 Notes",
        value: event.notes ?? "No additional runes were inscribed for this gathering.",
        inline: false
      }
    );
}

export function buildEventRsvpConfirmation(state: RsvpState): string {
  return `Your sigil is now marked as **${RSVP_LABELS[state]}** for this gathering.`;
}
