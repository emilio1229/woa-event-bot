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
import { getUpcomingEvents, getEventById, getEventRsvpSummary, updateEventRsvp } from "../services/eventService.js";
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
  if (!events.length) {
    embed.setDescription(`${notice ? `${notice}\n\n` : ""}No upcoming gatherings are inscribed in the event ledger yet. Check back soon.`);
    await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary))] });
    return;
  }

  const visibleEvents = events.slice(0, 4);
  embed.setDescription(`${notice ? `${notice}\n\n` : ""}${visibleEvents.map((event, index) => {
    const summary = getEventRsvpSummary(event);
    const going = Object.keys(event.rsvps).filter(userId => event.rsvps[userId] === "going");
    const goingList = going.length ? going.map(userId => `<@${userId}>`).join(", ").slice(0, 900) : "No one yet";
    return `**${index + 1}. ${event.title}**\n🗓️ <t:${event.startAtUnix}:F>\n📖 ${event.description ?? "No description provided."}\n🟢 **Going (${summary.going})**\n${goingList}${event.notes ? `\n📝 ${event.notes}` : ""}`;
  }).join("\n\n")}${events.length > 4 ? "\n\n*Showing the next 4 upcoming gatherings.*" : ""}`.slice(0, 4000));

  const eventButtons = visibleEvents.map(event =>
    button(`🜂 Going: ${event.title}`.slice(0, 80), `${REALM_PREFIX}:event:going:${event.id}`, ButtonStyle.Success)
  );
  const components: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < eventButtons.length; i += 5) {
    components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(...eventButtons.slice(i, i + 5)));
  }
  components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary)));
  await interaction.update({ embeds: [embed], components });
}

async function markEventGoing(interaction: ButtonInteraction, eventId: string) {
  const event = await getEventById(eventId);
  if (!event || event.guildId !== interaction.guildId) {
    await showEvents(interaction, "❌ That gathering could not be found.");
    return;
  }
  const updated = await updateEventRsvp(eventId, interaction.user.id, "going");
  if (!updated) {
    await showEvents(interaction, "❌ That gathering is no longer active.");
    return;
  }
  await showEvents(interaction, "🜂 You are now marked **Going** for **" + updated.title + "**.");
}

async function showHome(interaction: ButtonInteraction) {
  const activeBounties = await bountyStore.getActive(interaction.guild!.id);
  const bountySummary = activeBounties.length
    ? activeBounties.slice(0, 3).map(bounty => `📜 **${bounty.dinos.join(", ")}** — ${bounty.stats.join(", ")} ▸ 40–50`).join("\n")
    : "No active bounties right now.";

  const embed = new EmbedBuilder()
    .setColor(0x4B0082)
    .setTitle("🌌 THE WIZARDS OF ARK REALM")
    .setDescription("*A living portal to the community — and now, the gateway to the Arcane Realm.*")
    .addFields(
      { name: "🔮 Arcane Realm", value: "Create your Wizard, cast spells, duel other Wizards, collect relics and climb the Trials.", inline: false },
      { name: "🎟️ Raffles", value: "Active community giveaways", inline: true },
      { name: "📜 Bounties", value: bountySummary, inline: true },
      { name: "🏆 Events", value: "Upcoming gatherings — mark yourself Going from the Events panel.", inline: true }
    )
    .setFooter({ text: "The Wizards of Ark • Realm Portal" });

  const components = [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      button("🌌 Arcane Realm", "woa:arcane:open"),
      button("🎟️ Raffles", `${REALM_PREFIX}:raffles`),
      button("📜 Bounties", `${REALM_PREFIX}:bounties`)
    ),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      button("🏆 Events", `${REALM_PREFIX}:events`), button("📚 Codex", `${REALM_PREFIX}:codex`)
    )
  ];

  await interaction.update({ embeds: [embed], components });
}

async function showUnknown(interaction: ButtonInteraction, section: string) { await interaction.update({ content: `❌ Unknown Realm section: ${section}`, embeds: [], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Home", `${REALM_PREFIX}:home`, ButtonStyle.Secondary))] }); }

function button(label: string, customId: string, style: ButtonStyle = ButtonStyle.Primary) { return new ButtonBuilder().setLabel(label).setCustomId(customId).setStyle(style); }

function realmCodexHome() { return { embeds: [new EmbedBuilder().setColor(0x6A0DAD).setTitle("📚 THE REALM CODEX").setDescription("A guide to everything inside the Wizards of Ark Realm. Choose a chamber below to learn what it does and what you can do there.")], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🔮 Arcane Realm", `${REALM_PREFIX}:codex:arcane`), button("🎟️ Raffles", `${REALM_PREFIX}:codex:raffles`), button("📜 Bounties", `${REALM_PREFIX}:codex:bounties`)), new ActionRowBuilder<ButtonBuilder>().addComponents(button("🏆 Events", `${REALM_PREFIX}:codex:events`), button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary))] }; }

function realmCodexSection(section: string) {
  const data: Record<string,{title:string;description:string}> = {
    arcane: { title: "🔮 CODEX • ARCANE REALM", description: "**What it is:** The Arcane Realm is WoA's turn-based Wizard game.\n\n**🧙 Wizard** — View your Wizard, class, level, XP, Sigils, equipment and special move.\n\n**🛡️ Armory** — Equip your armor, focus, spells, relics and cosmetics.\n\n**🔮 Grand Sigil Exchange** — Spend Sigils on spells, armor, focuses, relics and cosmetics.\n\n**⚔️ Trials** — Enter PvE battles against Arcane creatures or challenge another player who has created a Wizard.\n\n**🏆 Rankings** — See the highest-level Wizards.\n\n**📚 Codex** — Learn the classes, items, enemies, rules and how the Arcane game works.\n\nYour Arcane progression is separate from normal ARK progression." },
    raffles: { title: "🎟️ CODEX • RAFFLES", description: "**What it is:** Community giveaways opened by the High Council.\n\n**How to use it:** Open the Raffle Chamber from the Realm to see giveaways currently available to you. Open a giveaway to enter it.\n\n**💠 Sigils:** Sigils can be exchanged for raffle entries when the giveaway is active.\n\n**Important:** Each giveaway has its own prize and closing time. The Council announces the winner when the ritual concludes." },
    bounties: { title: "📜 CODEX • BOUNTIES", description: "**What it is:** The Weekly Hunt — a community challenge posted by the Council.\n\n**How to use it:** Read the current targets and required stat on the Bounty Board. Complete the hunt according to the posted ritual, then follow the turn-in instructions in the bounty announcement.\n\n**Tip:** Read the full bounty post before hunting so you do not miss level, taming, screenshot, cryopod or turn-in requirements." },
    events: { title: "🏆 CODEX • EVENTS", description: "**What it is:** The Realm's schedule for upcoming WoA gatherings.\n\n**How to use it:** Open Events to see upcoming gatherings, times, descriptions and current Going counts. Use the **Going** button on an event to RSVP.\n\n**Why RSVP:** It lets the community and Council know who plans to attend and helps event organizers prepare." }
  };
  const item=data[section];
  if(!item) return realmCodexHome();
  return { embeds: [new EmbedBuilder().setColor(0x6A0DAD).setTitle(item.title).setDescription(item.description)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("📚 Codex", `${REALM_PREFIX}:codex`), button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary))] };
}

export function buildRealmPanel() { const embed = new EmbedBuilder().setColor(0x4B0082).setTitle("🌌 THE WIZARDS OF ARK REALM").setDescription("*A living portal to the community — and now, the gateway to the Arcane Realm.*").addFields({ name: "🔮 Arcane Realm", value: "Create your Wizard, cast spells, duel other Wizards, collect relics and climb the Trials.", inline: false }, { name: "🎟️ Raffles", value: "Active community giveaways", inline: true }, { name: "📜 Bounties", value: "Weekly hunts and challenges", inline: true }, { name: "🏆 Events", value: "Upcoming gatherings", inline: true }).setFooter({ text: "The Wizards of Ark • Realm Portal" }); return { embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🌌 Arcane Realm", "woa:arcane:open"), button("🎟️ Raffles", `${REALM_PREFIX}:raffles`), button("📜 Bounties", `${REALM_PREFIX}:bounties`)), new ActionRowBuilder<ButtonBuilder>().addComponents(button("🏆 Events", `${REALM_PREFIX}:events`), button("📚 Codex", `${REALM_PREFIX}:codex`))] }; }

export async function handleRealmPanel(interaction: Interaction): Promise<boolean> {
  if (!interaction.isButton() && !interaction.isStringSelectMenu()) return false;
  const customId = interaction.customId;
  if (!customId.startsWith(REALM_PREFIX)) return false;
  const section = customId.slice(`${REALM_PREFIX}:`.length);
  if (section === "home") await showHome(interaction as ButtonInteraction);
  else if (section === "raffles") await showRaffles(interaction as ButtonInteraction);
  else if (section === "bounties") await showBounties(interaction as ButtonInteraction);
  else if (section === "events") await showEvents(interaction as ButtonInteraction);
  else if (section === "codex") await interaction.update(realmCodexHome());
  else if (section.startsWith("codex:")) await interaction.update(realmCodexSection(section.slice("codex:".length)));
  else if (section.startsWith("event:going:")) await markEventGoing(interaction as ButtonInteraction, section.slice("event:going:".length));
  else await showUnknown(interaction as ButtonInteraction, section);
  return true;
}

export function getRealmPanel() { return buildRealmPanel(); }
