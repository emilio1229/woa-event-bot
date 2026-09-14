import { EmbedBuilder } from "discord.js";
import type { Raffle } from "./types/legacy.js";

export function buildActiveRaffleEmbed(raffle: Raffle, participantNames: string[] = []) {
  const uniqueNames = [...new Set(participantNames.filter(Boolean))];
  const participantList = uniqueNames.length > 0
    ? uniqueNames.slice(0, 20).map(name => `• ${name}`).join("\n") + (uniqueNames.length > 20 ? `\n• +${uniqueNames.length - 20} more` : "")
    : "No Wizards have joined yet.";

  return new EmbedBuilder()
    .setTitle(`🔮 ${raffle.name}`)
    .setColor(0x4B0082)
    .setDescription(
      [
        "A ritual has been cast. The circle hums with quiet power.",
        "",
        "**✨ Invocation**",
        `⟐ ${raffle.invocationText || "Ancient sigils awaken."}`,
        "",
        "**🎁 Prize**",
        `${raffle.prize}`,
        "",
        "**⏳ Ends At**",
        `<t:${Math.floor(raffle.endsAt / 1000)}:F>`
      ].join("\n")
    )
    .addFields(
      { name: `💠 Entries (${(raffle.entries ?? []).length})`, value: `${(raffle.entries ?? []).length}`, inline: true },
      { name: `🧙 Participants (${uniqueNames.length || (raffle.boundUsers ?? []).length})`, value: participantList, inline: false }
    )
    .setImage("attachment://woa_ritual_bg.png");
}

export function buildRaffleEmbed(raffle: Raffle, entryCount: number) {
  const embed = new EmbedBuilder()
    .setColor(0x8A2BE2)
    .setTitle("🔮 Ritual Raffle")
    .addFields(
      { name: "🎁 Offering", value: `**${raffle.prize}**`, inline: false },
      { name: "🪄 Arcane Invocation", value: raffle.invocationText || "The sigils await a chosen role…", inline: false }
    );

  if (!raffle.ended) {
    embed.addFields(
      { name: "⏳ Ritual Ends", value: `<t:${Math.floor(raffle.endsAt / 1000)}:F>` },
      { name: "💠 The Bound", value: `${entryCount} ${entryCount === 1 ? "sigil" : "sigils"}` },
      { name: "🧙‍♂️ Invoked Role", value: raffle.tagRole ? `<@&${raffle.tagRole}>` : "None", inline: false }
    );
    embed.setFooter({ text: "Offer your sigil to the ritual…" });
  }
  return embed;
}

export function buildRaffleEndedEmbed(raffle: Raffle, entryCount: number, winnerId: string | null = null) {
  if (winnerId) {
    return new EmbedBuilder()
      .setColor(0xFF4500)
      .setTitle("✨ A Champion Has Been Chosen ✨")
      .setDescription("The sigil storm erupts in arcane fury.")
      .addFields(
        { name: "👑 Winner", value: `<@${winnerId}>`, inline: false },
        { name: "📢 Ritual Role", value: raffle.tagRole ? `<@&${raffle.tagRole}>` : "None", inline: false },
        { name: "🎁 Prize", value: `**${raffle.prize}**`, inline: false },
        { name: "💠 The Bound", value: `${entryCount} ${entryCount === 1 ? "sigil" : "sigils"}`, inline: true }
      )
      .setFooter({ text: "The Wizards of Ark • Ascension Complete" })
      .setTimestamp();
  }
  return new EmbedBuilder()
    .setColor(0x2F4F4F)
    .setTitle("Ritual Concluded — No Champion")
    .setDescription("The ritual faded into the void; no winner could be chosen.")
    .addFields(
      { name: "🎁 Prize", value: `**${raffle.prize}**`, inline: false },
      { name: "💠 The Bound", value: `${entryCount} ${entryCount === 1 ? "sigil" : "sigils"}`, inline: true }
    )
    .setFooter({ text: "The Wizards of Ark" })
    .setTimestamp();
}
