import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  EmbedBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  MessageFlags,
  PermissionFlagsBits,
  type ButtonInteraction,
  type ChannelSelectMenuInteraction,
  type Interaction,
  type ModalSubmitInteraction,
  type StringSelectMenuInteraction
} from "discord.js";
import { env } from "../config/env.js";
import { DateTime, IANAZone } from "luxon";
import { raffleStore } from "../raffleStore.js";
import { buildActiveRaffleEmbed } from "../embedBuilder.js";
import { bountyStore } from "../utils/bountyStore.js";
import { getUpcomingEvents, getEventById, getEventRsvpSummary, updateEventRsvp } from "../services/eventService.js";
import { buildEventEmbed } from "../ui/eventEmbed.js";
import { buildEventRsvpButtons } from "../interactions/buttons/shared.js";
import { parseTime } from "../utils/timeParser.js";
import { cancelCommunityEvent, createCommunityEvent, getCommunityEvent, listApprovedCommunityEvents, listMyCommunityEvents, rsvpCommunityEvent, updateCommunityEventSubmission } from "../services/communityEventService.js";

export const REALM_PREFIX = "woa:realm";

type CommunityEventDraft = { timezone: string; editId?: string };
const communityEventDrafts = new Map<string, CommunityEventDraft>();
const COMMUNITY_TIMEZONES = [
  ["Arizona / Phoenix", "America/Phoenix"], ["Pacific Time", "America/Los_Angeles"],
  ["Mountain Time", "America/Denver"], ["Central Time", "America/Chicago"],
  ["Eastern Time", "America/New_York"], ["Alaska", "America/Anchorage"],
  ["Hawaii", "Pacific/Honolulu"], ["Vancouver", "America/Vancouver"],
  ["Toronto", "America/Toronto"], ["Mexico City", "America/Mexico_City"],
  ["São Paulo", "America/Sao_Paulo"], ["UTC", "UTC"],
  ["United Kingdom", "Europe/London"], ["Central Europe", "Europe/Berlin"],
  ["Paris", "Europe/Paris"], ["Copenhagen", "Europe/Copenhagen"],
  ["South Africa", "Africa/Johannesburg"], ["Dubai", "Asia/Dubai"],
  ["India", "Asia/Kolkata"], ["Singapore", "Asia/Singapore"],
  ["Japan", "Asia/Tokyo"], ["South Korea", "Asia/Seoul"],
  ["Sydney", "Australia/Sydney"], ["Auckland", "Pacific/Auckland"]
] as const;

function communityDraftKey(guildId: string, userId: string) { return guildId + ":" + userId; }

function communityTimezonePicker(editId?: string) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(REALM_PREFIX + ":community:timezone" + (editId ? ":" + editId : ""))
    .setPlaceholder("Choose the timezone you are posting from")
    .setMinValues(1).setMaxValues(1)
    .addOptions(
      ...COMMUNITY_TIMEZONES.map(([label, value]) => ({ label, value, description: value })),
      { label: "Other IANA timezone…", value: "custom", description: "Enter a timezone such as America/Edmonton" }
    );
  return {
    embeds: [new EmbedBuilder().setColor(0x7B2CBF).setTitle("🌎 EVENT TIMEZONE")
      .setDescription("Choose the timezone you'll use when entering this event's date and time. Discord will show the saved event time in each viewer's local timezone.")],
    components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu),
      new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Events", REALM_PREFIX + ":events", ButtonStyle.Secondary))]
  };
}

function buildCustomCommunityTimezoneModal() {
  const modal = new ModalBuilder().setCustomId(REALM_PREFIX + ":community:timezone:custom").setTitle("Custom Event Timezone");
  const input = new TextInputBuilder().setCustomId("timezone").setLabel("IANA timezone").setPlaceholder("America/Edmonton").setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(80);
  modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
  return modal;
}

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
  const guildId = interaction.guild!.id;
  const [events, communityEvents] = await Promise.all([getUpcomingEvents(guildId, 10), listApprovedCommunityEvents(guildId, 10)]);
  const embed = new EmbedBuilder().setColor(0x7B2CBF).setTitle("🏆 UPCOMING GATHERINGS").setFooter({ text: "The Wizards of Ark • Event Hall" });
  const standard = events.slice(0, 3).map((event, index) =>
    "**" + (index + 1) + ". " + event.title + "**\n🗓️ <t:" + event.startAtUnix + ":F> • 🌎 " + event.timezone + "\n📖 " + (event.description || "No description provided.") + "\n🟢 Going: **" + getEventRsvpSummary(event).going + "**" + (event.notes ? "\n📝 " + event.notes : ""));
  const community = communityEvents.slice(0, 4).map((event, index) => {
    const going = Object.values(event.rsvps).filter(state => state === "going").length;
    const waitlist = Object.values(event.rsvps).filter(state => state === "waitlist").length;
    return "**🌿 Community " + (index + 1) + ". " + event.title + "**\n🗺️ " + event.mapLocation + " • " + event.category +
      "\n🗓️ <t:" + event.startAtUnix + ":F> • 🌎 " + event.timezone + "\n📖 " + event.description + "\n👥 Going: **" + going + (event.capacity ? "/" + event.capacity : "") + "** • Waitlist: " + waitlist;
  });
  embed.setDescription(["Browse WoA gatherings and player-hosted events. Community submissions are reviewed by the Council before appearing here.", notice, ...standard, ...community].filter(Boolean).join("\n\n").slice(0, 4000));
  const components: ActionRowBuilder<ButtonBuilder>[] = [];
  const eventButtons: ButtonBuilder[] = [];
  for (let i = 0; i < Math.min(events.length, 3); i += 1) {
    eventButtons.push(button(("🜂 Going: " + events[i].title).slice(0, 80), REALM_PREFIX + ":event:going:" + events[i].id, ButtonStyle.Success));
  }
  for (let i = 0; i < Math.min(communityEvents.length, 4); i += 1) {
    const event = communityEvents[i];
    const state = event.rsvps[interaction.user.id];
    const label = state ? (state === "waitlist" ? "Leave waitlist" : "Leave event") : "RSVP";
    eventButtons.push(button(("🌿 " + label + ": " + event.title).slice(0, 80), REALM_PREFIX + ":community:rsvp:" + event.id, state ? ButtonStyle.Secondary : ButtonStyle.Success));
  }
  for (let i = 0; i < eventButtons.length; i += 5) {
    components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(...eventButtons.slice(i, i + 5)));
  }
  components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(
    button("➕ Create Event", REALM_PREFIX + ":community:create"),
    button("📋 My Events", REALM_PREFIX + ":community:mine", ButtonStyle.Secondary),
    button("◀ Realm", REALM_PREFIX + ":home", ButtonStyle.Secondary)
  ));
  await interaction.update({ embeds: [embed], components });
}

async function showMyCommunityEvents(interaction: ButtonInteraction, notice?: string) {
  const events = await listMyCommunityEvents(interaction.guild!.id, interaction.user.id);
  const lines = events.map(event => {
    const status = event.status === "pending" ? "🕒 Awaiting Council review" : event.status === "changes_requested" ? "📝 Changes requested" + (event.reviewNote ? ": " + event.reviewNote : "") : event.status === "rejected" ? "❌ Rejected" + (event.reviewNote ? ": " + event.reviewNote : "") : "✅ Approved and listed in Realm Events";
    return "**" + event.title + "** — " + status + "\n🗓️ <t:" + event.startAtUnix + ":F> • 🌎 " + event.timezone + " • " + event.mapLocation;
  });
  const embed = new EmbedBuilder().setColor(0x7B2CBF).setTitle("📋 MY COMMUNITY EVENTS")
    .setDescription([notice, lines.length ? lines.join("\n\n") : "You have no community events yet. Use **Create Event** to submit one for Council review."].filter(Boolean).join("\n\n").slice(0, 4000));
  const components: ActionRowBuilder<ButtonBuilder>[] = [];
  for (const event of events.slice(0, 3)) {
    const actions: ButtonBuilder[] = [];
    if (event.status !== "rejected") actions.push(button("✏️ Edit / Resubmit", REALM_PREFIX + ":community:edit:" + event.id, ButtonStyle.Secondary), button("✖ Cancel", REALM_PREFIX + ":community:cancel:" + event.id, ButtonStyle.Danger));
    if (!actions.length) actions.push(button("◀ Events", REALM_PREFIX + ":events", ButtonStyle.Secondary));
    components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(...actions));
  }
  components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(button("➕ Create Event", REALM_PREFIX + ":community:create"), button("◀ Events", REALM_PREFIX + ":events", ButtonStyle.Secondary)));
  await interaction.update({ embeds: [embed], components });
}

function buildCommunityEventModal(timezone: string, existing?: Awaited<ReturnType<typeof getCommunityEvent>>) {
  const modal = new ModalBuilder().setCustomId(REALM_PREFIX + ":community:submit" + (existing ? ":" + existing.id : "")).setTitle(existing ? "Edit Community Event" : "Create Community Event");
  const field = (id: string, label: string, placeholder: string, style = TextInputStyle.Short, required = true, value?: string) => {
    const input = new TextInputBuilder().setCustomId(id).setLabel(label).setPlaceholder(placeholder).setStyle(style).setRequired(required).setMaxLength(style === TextInputStyle.Paragraph ? 1000 : 100);
    if (value) input.setValue(value.slice(0, style === TextInputStyle.Paragraph ? 1000 : 100));
    return new ActionRowBuilder<TextInputBuilder>().addComponents(input);
  };
  modal.addComponents(
    field("title", "Event title", "Aberration cave run", TextInputStyle.Short, true, existing?.title),
    field("category_location", "Category | Map / location", "Hunt | Astraeos - west cave", TextInputStyle.Short, true, existing ? existing.category + " | " + existing.mapLocation : undefined),
    field("start", ("Start date/time (" + timezone + ")").slice(0, 45), "Any time format works! e.g. 5pm, 5:30 PM, tomorrow 7pm, in 2 hours", TextInputStyle.Short, true, existing ? DateTime.fromISO(existing.startAtIso).setZone(timezone).toFormat("yyyy-MM-dd h:mm a") : undefined),
    field("description", "Description and rules", "What players should bring / know", TextInputStyle.Paragraph, true, existing?.description),
    field("capacity", "Player limit (0 = unlimited)", "0", TextInputStyle.Short, true, existing ? String(existing.capacity) : undefined)
  );
  return modal;
}

async function submitCommunityEvent(interaction: ModalSubmitInteraction) {
  if (!interaction.guildId) {
    await interaction.reply({ content: "❌ Community events can only be created inside a server.", flags: MessageFlags.Ephemeral });
    return;
  }
  const editId = interaction.customId.startsWith(REALM_PREFIX + ":community:submit:") ? interaction.customId.slice((REALM_PREFIX + ":community:submit:").length) : null;
  const title = interaction.fields.getTextInputValue("title").trim();
  const categoryLocation = interaction.fields.getTextInputValue("category_location").trim();
  const startRaw = interaction.fields.getTextInputValue("start").trim();
  const draftKey = communityDraftKey(interaction.guildId ?? "", interaction.user.id);
  const draft = communityEventDrafts.get(draftKey);
  const timezone = draft?.timezone ?? "";
  const startMillis = timezone ? parseTime(startRaw, timezone) : null;
  const description = interaction.fields.getTextInputValue("description").trim();
  const capacityRaw = interaction.fields.getTextInputValue("capacity").trim();
  const separator = categoryLocation.indexOf("|");
  const category = (separator >= 0 ? categoryLocation.slice(0, separator) : "Community").trim().slice(0, 60) || "Community";
  const mapLocation = (separator >= 0 ? categoryLocation.slice(separator + 1) : categoryLocation).trim().slice(0, 120);
  const startDate = startMillis === null ? new Date(Number.NaN) : new Date(startMillis);
  const capacity = Number.parseInt(capacityRaw, 10);
  if (!title || !mapLocation || !description || !Number.isFinite(startDate.getTime()) || startDate.getTime() <= Date.now() || !Number.isInteger(capacity) || capacity < 0) {
    await interaction.reply({ content: "❌ Check your event details. Choose your timezone first, then enter a future start time in a format you find natural—for example: Nov 1, 2026 at 7 PM; 11/1/26 7:00pm; 2026-11-01 19:00; tomorrow at 7pm; next Friday 5pm; or in 2 hours. Times use your selected timezone. Player limit must be 0 or higher.", flags: MessageFlags.Ephemeral });
    return;
  }
  const mine = await listMyCommunityEvents(interaction.guildId, interaction.user.id, 20);
  if (!editId && (mine.filter(event => event.status === "pending" || event.status === "changes_requested").length >= 3 || mine.filter(event => event.status === "approved").length >= 3)) {
    await interaction.reply({ content: "⛔ You may have up to 3 pending submissions and 3 approved upcoming events at a time.", flags: MessageFlags.Ephemeral });
    return;
  }
  const input = { title: title.slice(0, 100), category, mapLocation, description: description.slice(0, 1000), startAtIso: startDate.toISOString(), startAtUnix: Math.floor(startDate.getTime() / 1000), timezone, capacity };
  if (editId) {
    const updated = await updateCommunityEventSubmission(editId, interaction.guildId, interaction.user.id, input);
    if (!updated) { await interaction.reply({ content: "❌ You cannot edit that event, or it is no longer editable.", flags: MessageFlags.Ephemeral }); return; }
  } else {
    await createCommunityEvent({ guildId: interaction.guildId, creatorId: interaction.user.id, ...input });
  }
  communityEventDrafts.delete(draftKey);
  await interaction.reply({ content: "🕒 **Submitted to the High Council.** Your event will only appear in the shared Realm Events panel after approval. Check **My Events** for its status.", flags: MessageFlags.Ephemeral });
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
    .setColor(0x7B2CBF)
    .setAuthor({ name: "✦ THE WIZARDS OF ARK  /  REALM PORTAL" })
    .setTitle("🌌 THE WIZARDS OF ARK REALM")
    .setDescription("*Wizards, Warlocks & Witches — your portal to the living realms of WoA.*\n\n╭────────────── ✧ ──────────────╮\n**CHOOSE YOUR PATH**\n╰────────────── ✧ ──────────────╯")
    .addFields(
      { name: "🔮 Arcane Realm", value: "Create your Wizard, cast spells, duel other Wizards, collect relics and climb the Trials.", inline: false },
      { name: "🎟️ Raffles", value: "Active community giveaways", inline: true },
      { name: "📜 Bounties", value: bountySummary, inline: true },
      { name: "🏆 Events", value: "Upcoming gatherings — mark yourself Going from the Events panel.", inline: true }
    )
    .setFooter({ text: "WIZARDS, WARLOCKS & WITCHES  ✦  THE REALM AWAITS" });

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

function realmCodexHome() { return { embeds: [new EmbedBuilder().setColor(0x6A0DAD).setAuthor({ name: "✦ WIZARDS OF ARK  /  FIELD GUIDE" }).setTitle("📚 THE REALM CODEX").setDescription("*The field guide to the realms, written for those who dare to explore.*\n\nChoose a chamber below and uncover its secrets.").setFooter({ text: "CODEX OF THE REALM  ✦  KNOWLEDGE IS POWER" })], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🔮 Arcane Realm", `${REALM_PREFIX}:codex:arcane`), button("🎟️ Raffles", `${REALM_PREFIX}:codex:raffles`), button("📜 Bounties", `${REALM_PREFIX}:codex:bounties`)), new ActionRowBuilder<ButtonBuilder>().addComponents(button("🏆 Events", `${REALM_PREFIX}:codex:events`), button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary))] }; }

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

export async function buildRealmPanel(guildId?: string) {
  const activeBounties = guildId ? await bountyStore.getActive(guildId) : [];
  const bountySummary = activeBounties.length
    ? activeBounties.slice(0, 3).map(bounty =>
        `📜 **${bounty.dinos.join(", ")}** — ${bounty.stats.join(", ")} ▸ 40–50`
      ).join("\n")
    : "No active bounties right now.";

  const embed = new EmbedBuilder()
    .setColor(0x4B0082)
    .setTitle("🌌 THE WIZARDS OF ARK REALM")
    .setDescription("*A living portal to the community — and now, the gateway to the Arcane Realm.*")
    .addFields(
      { name: "🔮 Arcane Realm", value: "Create your Wizard, cast spells, duel other Wizards, collect relics and climb the Trials.", inline: false },
      { name: "🎟️ Raffles", value: "Active community giveaways", inline: true },
      { name: "📜 ACTIVE BOUNTY BOARD", value: bountySummary, inline: true },
      { name: "🏆 Events", value: "Upcoming gatherings", inline: true }
    )
    .setFooter({ text: "The Wizards of Ark • Realm Portal" });

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        button("🌌 Arcane Realm", "woa:arcane:open"),
        button("🎟️ Raffles", `${REALM_PREFIX}:raffles`),
        button("📜 Bounty Board", `${REALM_PREFIX}:bounties`)
      ),
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        button("🏆 Events", `${REALM_PREFIX}:events`),
        button("📚 Codex", `${REALM_PREFIX}:codex`)
      )
    ]
  };
}

export async function handleRealmPanel(interaction: Interaction): Promise<boolean> {
  if (interaction.isModalSubmit() && interaction.customId === REALM_PREFIX + ":community:timezone:custom") {
    if (!interaction.guildId) { await interaction.reply({ content: "❌ Choose an event timezone inside a server.", flags: MessageFlags.Ephemeral }); return true; }
    const key = communityDraftKey(interaction.guildId, interaction.user.id);
    const draft = communityEventDrafts.get(key);
    const timezone = interaction.fields.getTextInputValue("timezone").trim();
    if (!draft || !IANAZone.isValidZone(timezone)) {
      await interaction.reply({ content: "❌ That timezone is invalid or the setup expired. Use an IANA timezone such as America/Phoenix, Europe/London, or Asia/Tokyo, then start again.", flags: MessageFlags.Ephemeral });
      return true;
    }
    draft.timezone = timezone;
    await interaction.reply({ content: "🌎 Timezone selected: **" + timezone + "**. Continue to enter the event details.", flags: MessageFlags.Ephemeral, components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("Continue to event details", REALM_PREFIX + ":community:continue"))] });
    return true;
  }
  if (interaction.isModalSubmit() && interaction.customId.startsWith(REALM_PREFIX + ":community:submit")) { await submitCommunityEvent(interaction); return true; }
  if (!interaction.isButton() && !interaction.isStringSelectMenu()) return false;
  const customId = interaction.customId;
  if (!customId.startsWith(REALM_PREFIX)) return false;
  const section = customId.slice(`${REALM_PREFIX}:`.length);
  if (section === "home") await showHome(interaction as ButtonInteraction);
  else if (section === "raffles") await showRaffles(interaction as ButtonInteraction);
  else if (section === "bounties") await showBounties(interaction as ButtonInteraction);
  else if (section === "events") await showEvents(interaction as ButtonInteraction);
  else if (section === "community:create") await interaction.update(communityTimezonePicker());
  else if (section === "community:continue") {
    const key = communityDraftKey(interaction.guild!.id, interaction.user.id);
    const draft = communityEventDrafts.get(key);
    if (!draft?.timezone || !IANAZone.isValidZone(draft.timezone)) {
      await interaction.reply({ content: "❌ Your timezone selection expired. Start creating the event again.", flags: MessageFlags.Ephemeral });
    } else {
      const existing = draft.editId ? await getCommunityEvent(draft.editId) : undefined;
      await interaction.showModal(buildCommunityEventModal(draft.timezone, existing));
    }
  }
  else if (section.startsWith("community:timezone")) {
    if (!interaction.isStringSelectMenu()) return false;
    const editId = section.startsWith("community:timezone:") ? section.slice("community:timezone:".length) || undefined : undefined;
    const timezone = interaction.values[0];
    const key = communityDraftKey(interaction.guild!.id, interaction.user.id);
    if (timezone === "custom") {
      communityEventDrafts.set(key, { timezone: "", editId });
      await interaction.showModal(buildCustomCommunityTimezoneModal());
    } else {
      communityEventDrafts.set(key, { timezone, editId });
      const existing = editId ? await getCommunityEvent(editId) : undefined;
      if (editId && (!existing || existing.creatorId !== interaction.user.id || !["pending", "changes_requested", "approved"].includes(existing.status))) {
        communityEventDrafts.delete(key);
        await interaction.update({ content: "❌ That event cannot be edited.", embeds: [], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Events", REALM_PREFIX + ":events", ButtonStyle.Secondary))] });
      } else await interaction.showModal(buildCommunityEventModal(timezone, existing));
    }
  }
  else if (section === "community:mine") await showMyCommunityEvents(interaction as ButtonInteraction);
  else if (section.startsWith("community:edit:")) {
    const event = await getCommunityEvent(section.slice("community:edit:".length));
    if (!event || event.creatorId !== interaction.user.id || !["pending", "changes_requested", "approved"].includes(event.status)) await showMyCommunityEvents(interaction as ButtonInteraction, "❌ That event cannot be edited.");
    else await interaction.update(communityTimezonePicker(event.id));
  }
  else if (section.startsWith("community:cancel:")) {
    const event = await cancelCommunityEvent(section.slice("community:cancel:".length), interaction.guild!.id, interaction.user.id);
    await showMyCommunityEvents(interaction as ButtonInteraction, event ? "✖ Event cancelled." : "❌ That event could not be cancelled.");
  }
  else if (section.startsWith("community:rsvp:")) {
    const eventId = section.slice("community:rsvp:".length);
    const updated = await rsvpCommunityEvent(eventId, interaction.guild!.id, interaction.user.id);
    if (!updated) await showEvents(interaction as ButtonInteraction, "❌ That community event is no longer open for RSVP.");
    else {
      const state = updated.rsvps[interaction.user.id];
      await showEvents(interaction as ButtonInteraction, state === "waitlist" ? "🕒 You are on the waitlist for **" + updated.title + "**." : state === "going" ? "✅ You are registered for **" + updated.title + "**." : "You left **" + updated.title + "**.");
    }
  }
  else if (section === "codex") await interaction.update(realmCodexHome());
  else if (section.startsWith("codex:")) await interaction.update(realmCodexSection(section.slice("codex:".length)));
  else if (section.startsWith("event:going:")) await markEventGoing(interaction as ButtonInteraction, section.slice("event:going:".length));
  else await showUnknown(interaction as ButtonInteraction, section);
  return true;
}

export function getRealmPanel() { return buildRealmPanel(); }
