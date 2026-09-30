import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  type ButtonInteraction,
  type ChannelSelectMenuInteraction,
  type Interaction,
  type StringSelectMenuInteraction
} from "discord.js";
import { env } from "../config/env.js";
import { raffleStore } from "../raffleStore.js";
import { buildActiveRaffleEmbed } from "../embedBuilder.js";
import { bountyStore } from "../utils/bountyStore.js";
import { getUpcomingEvents, getEventRsvpSummary } from "../services/eventService.js";
import { buildEventEmbed } from "../ui/eventEmbed.js";
import { buildEventRsvpButtons } from "../interactions/buttons/shared.js";

export const REALM_PREFIX = "woa:realm";

async function getVisibleRaffles(interaction: ButtonInteraction) {
  const raffles = (await raffleStore.all()).filter(raffle => raffle.guildId === interaction.guild!.id && !raffle.ended && raffle.endsAt > Date.now());
  const member = await interaction.guild!.members.fetch(interaction.user.id).catch(() => null);
  return raffles.filter(raffle => !raffle.tagRole || member?.roles.cache.has(raffle.tagRole));
}

async function showRaffles(interaction: ButtonInteraction) {
  const raffles = await getVisibleRaffles(interaction);
  const embed = new EmbedBuilder().setTitle("🎟️ ACTIVE COMMUNITY GIVEAWAYS").setFooter({ text: "The Wizards of Ark • Raffle Chamber" });
  const components: ActionRowBuilder<ButtonBuilder>[] = [];
  if (!raffles.length) embed.setDescription("There are no active community giveaways available to you right now. Check back when the Council opens the next one.");
  else {
    embed.setDescription(raffles.slice(0, 10).map((raffle, index) => `**${index + 1}. ${raffle.name || "Unnamed Giveaway"}**\n🎁 ${raffle.prize}\n👥 ${raffle.entries.length} entries • Ends <t:${Math.floor(raffle.endsAt / 1000)}:R>`).join("\n\n"));
    for (const raffle of raffles.slice(0, 5)) if (raffle.messageId) components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setLabel(`🎟️ Open ${raffle.name || "Giveaway"}`.slice(0, 80)).setStyle(ButtonStyle.Link).setURL(`https://discord.com/channels/${raffle.guildId}/${raffle.channelId}/${raffle.messageId}`)));
  }
  components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary)));
  await interaction.update({ embeds: [embed], components });
}

async function showBounties(interaction: ButtonInteraction) {
  const bounties = await bountyStore.getActive(interaction.guild!.id);
  const embed = new EmbedBuilder().setTitle("📜 THE BOUNTY BOARD").setFooter({ text: "The Wizards of Ark • Weekly Hunt" });
  if (!bounties.length) embed.setDescription("No active bounties are posted right now. The Council will inscribe the next hunt soon.");
  else embed.setDescription(bounties.slice(0, 5).map((bounty, index) => `**${index + 1}. Weekly Hunt**\n${bounty.dinos.map((dino, i) => `• **${dino}** — ${bounty.stats[i] ?? "Any stat"} ▸ 40–50`).join("\n")}${bounty.bonus ? `\n⚡ **Bonus:** ${bounty.bonus}` : ""}\n🗓️ Posted <t:${Math.floor(bounty.createdAt / 1000)}:R>`).join("\n\n"));
  await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showEvents(interaction: ButtonInteraction, notice?: string) {
  const events = await getUpcomingEvents(interaction.guild!.id, 10);
  const embed = new EmbedBuilder().setTitle("🏆 UPCOMING GATHERINGS").setFooter({ text: "The Wizards of Ark • Event Hall" });
  if (!events.length) embed.setDescription(`${notice ? `${notice}\n\n` : ""}No upcoming gatherings are inscribed in the event ledger yet. Check back soon.`);
  else embed.setDescription(`${notice ? `${notice}\n\n` : ""}${events.map((event, index) => { const summary = getEventRsvpSummary(event); const going = Object.keys(event.rsvps).filter(userId => event.rsvps[userId] === "going"); const goingList = going.length ? going.map(userId => `<@${userId}>`).join(", ").slice(0, 900) : "No one yet"; return `**${index + 1}. ${event.title}**\n🗓️ <t:${event.startAtUnix}:F>\n📖 ${event.description ?? "No description provided."}\n🟢 **Going (${summary.going})**\n${goingList}${event.notes ? `\n📝 ${event.notes}` : ""}`; }).join("\n\n")}`.slice(0, 4000));
  await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showHome(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder().setTitle("🗺️ THE REALM").setDescription("Explore the Wizards of Ark community, raffles, events, and bounties.").addFields({ name: "🎟️ Raffles", value: "Active community giveaways", inline: true }, { name: "📜 Bounties", value: "Weekly hunts and challenges", inline: true }, { name: "🏆 Events", value: "Upcoming gatherings", inline: true }).setFooter({ text: "The Wizards of Ark • Realm Portal" });
  const components = [
    new ActionRowBuilder<ButtonBuilder>().addComponents(button("🎟️ Raffles", `${REALM_PREFIX}:raffles`), button("📜 Bounties", `${REALM_PREFIX}:bounties`), button("🏆 Events", `${REALM_PREFIX}:events`))
  ];
  await interaction.update({ embeds: [embed], components });
}

async function showUnknown(interaction: ButtonInteraction, section: string) { await interaction.update({ content: `❌ Unknown Realm section: ${section}`, embeds: [], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Home", `${REALM_PREFIX}:home`, ButtonStyle.Secondary))] }); }

function button(label: string, customId: string, style: ButtonStyle = ButtonStyle.Primary) { return new ButtonBuilder().setLabel(label).setCustomId(customId).setStyle(style); }

function buildRealmPanel() {
  const embed = new EmbedBuilder().setTitle("🗺️ THE REALM").setDescription("Explore the Wizards of Ark community, raffles, events, and bounties.").addFields({ name: "🎟️ Raffles", value: "Active community giveaways", inline: true }, { name: "📜 Bounties", value: "Weekly hunts and challenges", inline: true }, { name: "🏆 Events", value: "Upcoming gatherings", inline: true }).setFooter({ text: "The Wizards of Ark • Realm Portal" });
  return {
    embeds: [embed], components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(button("🎟️ Raffles", `${REALM_PREFIX}:raffles`), button("📜 Bounties", `${REALM_PREFIX}:bounties`), button("🏆 Events", `${REALM_PREFIX}:events`))
    ]
  };
}

export async function handleRealmPanel(interaction: Interaction) {
  if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;
  const customId = interaction.customId;
  if (!customId.startsWith(REALM_PREFIX)) return;
  const section = customId.slice(`${REALM_PREFIX}:`.length);
  if (section === "home") await showHome(interaction as ButtonInteraction);
  else if (section === "raffles") await showRaffles(interaction as ButtonInteraction);
  else if (section === "bounties") await showBounties(interaction as ButtonInteraction);
  else if (section === "events") await showEvents(interaction as ButtonInteraction);
  else await showUnknown(interaction as ButtonInteraction, section);
}

export function getRealmPanel() { return buildRealmPanel(); }
