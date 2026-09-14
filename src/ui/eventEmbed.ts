import { EmbedBuilder } from "discord.js";
import type { EventRecord } from "../services/eventTypes.js";
import { getEventRsvpSummary } from "../services/eventService.js";
import { formatDiscordTimestamp } from "../utils/time.js";

export function buildEventEmbed(event: EventRecord): EmbedBuilder {
  const rsvpSummary = getEventRsvpSummary(event);
  const going = Object.keys(event.rsvps).filter(userId => event.rsvps[userId] === "going");
  const goingList = going.length > 0
    ? going.map(userId => `<@${userId}>`).join("\n").slice(0, 1024)
    : "No Wizards have marked Going yet.";

  return new EmbedBuilder()
    .setColor(0x5b2a86)
    .setTitle(`🔮 ${event.title}`)
    .setDescription(event.description || "A gathering has been inscribed in the event ledger.")
    .addFields(
      { name: "🧙 Host", value: `<@${event.hostId}>`, inline: true },
      { name: "🕰️ Start Time", value: formatDiscordTimestamp(event.startAtUnix, "F"), inline: true },
      { name: "⏳ Countdown", value: formatDiscordTimestamp(event.startAtUnix, "R"), inline: true },
      { name: `🟢 Going (${rsvpSummary.going})`, value: goingList, inline: false },
      { name: "📜 Notes", value: event.notes ?? "No additional runes were inscribed for this gathering.", inline: false }
    );
}

export function buildEventRsvpConfirmation(): string {
  return "🜂 Your sigil is now marked as **Going** for this gathering.";
}
