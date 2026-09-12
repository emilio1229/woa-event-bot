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
    .setDescription(
      [
        "The veil parts and the circle gathers beneath the arcane sky.",
        "Every timestamp below is bound to UTC in storage, then revealed through Discord's chronomancy so each wizard sees the start in their own local time."
      ].join("\n\n")
    )
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
      {
        name: "✨ RSVP Ledger",
        value: [
          `Going: **${rsvpSummary.going}**`,
          `Maybe: **${rsvpSummary.maybe}**`,
          `No: **${rsvpSummary.no}**`
        ].join("\n"),
        inline: true
      },
      {
        name: "📜 Notes",
        value: event.notes ?? "No additional runes were inscribed for this gathering.",
        inline: false
      }
    )
    .setFooter({
      text: `Event ${event.id.slice(0, 8)} • Stored in UTC • Input timezone: ${event.timezone}`
    })
    .setTimestamp(new Date(event.createdAtIso));
}

export function buildEventRsvpConfirmation(state: RsvpState): string {
  return `Your sigil is now marked as **${RSVP_LABELS[state]}** for this gathering.`;
}
