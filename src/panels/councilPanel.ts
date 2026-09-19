import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  EmbedBuilder,
  MessageFlags,
  ModalBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
  type ButtonInteraction,
  type ChannelSelectMenuInteraction,
  type Interaction,
  type ModalSubmitInteraction,
  type RoleSelectMenuInteraction,
  type StringSelectMenuInteraction,
  type UserSelectMenuInteraction
} from "discord.js";
import { env } from "../config/env.js";
import { raffleStore } from "../raffleStore.js";
import { sigilStore, SIGILS_PER_RAFFLE_ENTRY } from "../sigilStore.js";
import { buildActiveRaffleEmbed } from "../embedBuilder.js";
import { buildBalanceEmbed, buildShopComponents } from "../sigilUtils.js";
import { bountyStore, bountyWeeklyImage } from "../utils/bountyStore.js";
import { parseTime } from "../utils/timeParser.js";
import { getAdminTimezone, setAdminTimezone, COMMON_TIMEZONES, isValidIanaTimezone } from "../services/adminTimezoneService.js";
import { discordDirectoryService } from "../services/discordDirectoryService.js";
import { attachEventMessageId, createEvent, getEventRsvpSummary, getUpcomingEvents } from "../services/eventService.js";
import { buildEventEmbed } from "../ui/eventEmbed.js";
import { buildEventRsvpButtons } from "../interactions/buttons/shared.js";
import { createRaffleThreadFromMessage, closeRaffleThread, getRaffleMessageChannelId } from "../services/raffleThreadService.js";
import { cleanBotMessages } from "../services/channelCleanupService.js";

export const COUNCIL_PREFIX = "woa:council";
const BOUNTY_STATS = ["Health", "Stamina", "Oxygen", "Food", "Weight", "Melee"] as const;
type BountyDraft = { guildId: string; channelId: string; roleId: string; dinos: string[]; bonus: string | null; stats: string[] };
type PostingDraft = { kind: "event" | "raffle" | "bounty"; channelId: string; roleId: string | null };
const bountyDrafts = new Map<string, BountyDraft>();
const postingDrafts = new Map<string, PostingDraft>();

type CouncilUpdate = Exclude<NonNullable<Parameters<ButtonInteraction["update"]>[0]>, string>;

async function updateCouncilPanel(interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction, payload: CouncilUpdate) {
  if (interaction.isModalSubmit()) {
    if (interaction.isFromMessage()) {
      await interaction.deferUpdate();
      try {
        await interaction.editReply(payload as Parameters<typeof interaction.editReply>[0]);
      } catch (error) {
        if (!(error instanceof Error) || !/Unknown Message/i.test(error.message)) throw error;
        if (!interaction.replied && !interaction.deferred) {
          const content = "content" in payload ? payload.content ?? undefined : undefined;
          await interaction.reply({ content, flags: MessageFlags.Ephemeral });
        }
      }
      return;
    }
    if (!interaction.replied && !interaction.deferred) {
      const content = "content" in payload ? payload.content ?? undefined : undefined;
      await interaction.reply({ content, flags: MessageFlags.Ephemeral });
    }
    return;
  }
  await interaction.update(payload);
}

export function isCouncilMember(interaction: Interaction) {
  if (!interaction.inGuild() || !interaction.member) return false;
  const member = interaction.member;
  if (member.permissions instanceof PermissionsBitField && member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  if (env.councilRoleIds.length === 0 || !("roles" in member)) return false;
  const roleIds = Array.isArray(member.roles) ? member.roles : member.roles.cache.keys();
  return Array.from(roleIds).some(roleId => env.councilRoleIds.includes(roleId));
}

export function buildCouncilPanel() {
  const embed = new EmbedBuilder().setTitle("🏛️ THE HIGH COUNCIL").setDescription("Welcome, Council.\n\nThe command center of The Wizards of Ark. Manage the Realm without memorizing commands.").addFields(
    { name: "💎 Economy", value: "Assign/remove Sigils", inline: true }, { name: "🎟️ Raffles", value: "Start or end community giveaways", inline: true },
    { name: "🏆 Events", value: "Create scheduled gatherings", inline: true }, { name: "📜 Bounties", value: "Create the weekly Hunt", inline: true },
    { name: "🎁 Rewards", value: "View the Sigil shop", inline: true }, { name: "📊 Statistics", value: "Realm activity", inline: true },
    { name: "⚙️ Configuration", value: "Runtime settings", inline: true }, { name: "🧹 Channel Cleanup", value: "Remove only bot-owned Discord messages", inline: true }
  ).setFooter({ text: "The Wizards of Ark • High Council" });
  return { embeds: [embed], components: [
    new ActionRowBuilder<ButtonBuilder>().addComponents(button("💎 Economy", `${COUNCIL_PREFIX}:economy`), button("🎟️ Raffles", `${COUNCIL_PREFIX}:raffles`), button("🏆 Events", `${COUNCIL_PREFIX}:events`), button("📜 Bounties", `${COUNCIL_PREFIX}:bounties`)),
    new ActionRowBuilder<ButtonBuilder>().addComponents(button("🎁 Rewards", `${COUNCIL_PREFIX}:rewards`), button("📊 Statistics", `${COUNCIL_PREFIX}:statistics`), button("⚙️ Configuration", `${COUNCIL_PREFIX}:configuration`), button("🧹 Channel Cleanup", `${COUNCIL_PREFIX}:cleanup`))
  ] };
}

export async function handleCouncilPanel(interaction: Interaction) {
  const supported = interaction.isButton() || interaction.isUserSelectMenu() || interaction.isRoleSelectMenu() || interaction.isStringSelectMenu() || interaction.isChannelSelectMenu() || interaction.isModalSubmit();
  if (!supported || !interaction.customId.startsWith(`${COUNCIL_PREFIX}:`)) return false;
  if (!isCouncilMember(interaction)) { await interaction.reply({ content: "⛔ Only the High Council may use this control.", flags: MessageFlags.Ephemeral }); return true; }
  if (interaction.isModalSubmit()) { await handleCouncilModal(interaction); return true; }
  if (interaction.isUserSelectMenu()) { if (interaction.customId === `${COUNCIL_PREFIX}:sigil:user`) await openSigilAdjustment(interaction); return true; }
  if (interaction.isRoleSelectMenu()) { await handleCouncilRoleSelect(interaction); return true; }
  if (interaction.isChannelSelectMenu()) { await handleCouncilChannelSelect(interaction); return true; }
  if (interaction.isStringSelectMenu()) { await handleCouncilStringSelect(interaction); return true; }
  const section = interaction.customId.slice(`${COUNCIL_PREFIX}:`.length);
  if (section === "home") await interaction.update(buildCouncilPanel());
  else if (section === "economy") await showEconomy(interaction);
  else if (section === "economy:assign") await startSigilAssignment(interaction);
  else if (section === "raffles") await showRaffles(interaction);
  else if (section === "raffles:start") await startRaffleModal(interaction);
  else if (section === "raffles:end") await startRaffleEndPicker(interaction);
  else if (section === "events") await showEvents(interaction);
  else if (section === "events:start") await startEventModal(interaction);
  else if (section === "event:no-role") await handleEventNoRole(interaction);
  else if (section === "events:no-role") await handleEventNoRole(interaction);
  else if (section === "bounties") await showBounties(interaction);
  else if (section === "bounties:start") await startBountyModal(interaction);
  else if (section === "rewards") await showRewards(interaction);
  else if (section === "statistics") await showStatistics(interaction);
  else if (section === "configuration") await showConfiguration(interaction);
  else if (section === "configuration:timezone") await startTimezonePicker(interaction);
  else if (section === "configuration:timezone:custom") await startCustomTimezoneModal(interaction);
  else if (section === "cleanup") await showCleanup(interaction);
  else if (section.startsWith("cleanup:bot:")) await runCleanup(interaction, section.slice("cleanup:bot:".length));
  else if (section === "bounty:post") await postBounty(interaction, interaction.user.id);
  else if (section === "bounty:randomize") await randomizeAndPostBounty(interaction, interaction.user.id);
  else await interaction.update({ embeds: [new EmbedBuilder().setTitle("🏛️ Council").setDescription("Unknown Council panel.")], components: [backRow()] });
  return true;
}

function postingChannelMenu(kind: PostingDraft["kind"]) {
  return new ChannelSelectMenuBuilder().setCustomId(`${COUNCIL_PREFIX}:post:channel:${kind}`).setPlaceholder(`Choose where to post the ${kind}`).setMinValues(1).setMaxValues(1).setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.PrivateThread);
}

async function handleCouncilChannelSelect(interaction: ChannelSelectMenuInteraction) {
  if (interaction.customId === `${COUNCIL_PREFIX}:cleanup:channel`) {
    const channelId = interaction.values[0];
    await interaction.update({ embeds: [new EmbedBuilder().setColor(0x4B0082).setTitle("🧹 CHANNEL CLEANUP").setDescription(`Selected channel: <#${channelId}>\n\nThis cleanup can **only delete messages authored by WoA-Event-BOT**.\n\n🔒 **Nothing in the database is deleted or changed.**`)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🧹 Clean Bot Messages", `${COUNCIL_PREFIX}:cleanup:bot:${channelId}`, ButtonStyle.Danger), button("◀ Choose Another", `${COUNCIL_PREFIX}:cleanup`, ButtonStyle.Secondary), button("✖ Cancel", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
    return;
  }
  const match = interaction.customId.match(new RegExp(`^${COUNCIL_PREFIX.replace(":", "\\:")}:post:channel:(event|raffle|bounty)(?::no-role)?$`));
  if (!match) return;
  const kind = match[1] as PostingDraft["kind"]; const noRole = interaction.customId.endsWith(":no-role"); const channelId = interaction.values[0];
  const channel = await interaction.client.channels.fetch(channelId).catch(() => null);
  if (!channel || !channel.isSendable()) { await interaction.update({ content: "❌ That channel cannot receive messages from the bot. Please choose another channel.", embeds: [], components: [backButtonRow()] }); return; }
  postingDrafts.set(interaction.user.id, { kind, channelId, roleId: null });
  if (noRole) { if (kind === "event") await interaction.showModal(buildEventModal(interaction.user.id)); return; }
  if (kind === "event") {
    const roleMenu = new RoleSelectMenuBuilder().setCustomId(`${COUNCIL_PREFIX}:event:role`).setPlaceholder("Choose the role to notify");
    const skip = button("No role to tag", `${COUNCIL_PREFIX}:event:no-role`, ButtonStyle.Secondary);
    await interaction.update({ content: `📍 **Event channel selected:** <#${channelId}>\n\n🔔 Choose the Discord role to notify, or skip the role tag.`, embeds: [], components: [new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleMenu), new ActionRowBuilder<ButtonBuilder>().addComponents(skip, backButton())] }); return;
  }
  const roleMenu = new RoleSelectMenuBuilder().setCustomId(`${COUNCIL_PREFIX}:${kind}:role`).setPlaceholder(`Choose the role to notify for this ${kind}`).setMinValues(1).setMaxValues(1);
  await interaction.update({ content: `📍 **${kind[0].toUpperCase() + kind.slice(1)} channel selected:** <#${channelId}>\n\n🔔 Choose the Discord role to notify.`, embeds: [], components: [new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleMenu), new ActionRowBuilder<ButtonBuilder>().addComponents(backButton())] });
}

async function showCleanup(interaction: ButtonInteraction) {
  const channelMenu = new ChannelSelectMenuBuilder().setCustomId(`${COUNCIL_PREFIX}:cleanup:channel`).setPlaceholder("Choose the channel to clean").setMinValues(1).setMaxValues(1).setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.PublicThread, ChannelType.PrivateThread);
  await interaction.update({ embeds: [new EmbedBuilder().setColor(0x4B0082).setTitle("🧹 CHANNEL CLEANUP").setDescription("Choose a channel to clean.\n\n**Only messages authored by WoA-Event-BOT can be deleted.**\n\n🔒 Sigils, raffle entries, events, bounties, winners, users, and all other database records are never touched.")], components: [new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(channelMenu), new ActionRowBuilder<ButtonBuilder>().addComponents(button("✖ Cancel", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function runCleanup(interaction: ButtonInteraction, channelId: string) {
  await interaction.deferUpdate();
  try {
    const result = await cleanBotMessages(interaction.client, channelId);
    await interaction.editReply({ embeds: [new EmbedBuilder().setColor(0x4B0082).setTitle("🧹 CLEANUP COMPLETE").setDescription(`Channel: <#${channelId}>\n\n**Messages scanned:** ${result.scanned}\n**Bot messages deleted:** ${result.deleted}\n**Messages that could not be deleted:** ${result.failed}\n\n🔒 No database records were changed.`)], components: [backButtonRow()] });
  } catch (error) {
    await interaction.editReply({ content: `❌ Cleanup failed: ${error instanceof Error ? error.message : "Unknown error"}`, embeds: [], components: [backButtonRow()] });
  }
}

async function handleCouncilRoleSelect(interaction: RoleSelectMenuInteraction) {
  const roleId = interaction.values[0] ?? null;
  if (interaction.customId === `${COUNCIL_PREFIX}:event:role`) {
    const draft = postingDrafts.get(interaction.user.id); if (!draft || draft.kind !== "event") { await interaction.update({ content: "❌ That event setup expired. Start the event again.", embeds: [], components: [backButtonRow()] }); return; } draft.roleId = roleId; await interaction.showModal(buildEventModal(interaction.user.id)); return;
  }
  if (interaction.customId === `${COUNCIL_PREFIX}:raffle:role`) {
    const draft = postingDrafts.get(interaction.user.id); if (!draft || draft.kind !== "raffle") { await interaction.update({ content: "❌ That giveaway setup expired. Start it again.", embeds: [], components: [backButtonRow()] }); return; } draft.roleId = roleId; await interaction.showModal(buildRaffleModal(interaction.user.id)); return;
  }
  if (interaction.customId === `${COUNCIL_PREFIX}:bounty:role`) {
    const draft = postingDrafts.get(interaction.user.id); if (!draft || draft.kind !== "bounty") { await interaction.update({ content: "❌ That bounty setup expired. Start the bounty again.", embeds: [], components: [backButtonRow()] }); return; } draft.roleId = roleId; await interaction.showModal(buildBountyModal(interaction.user.id));
  }
}

async function handleCouncilStringSelect(interaction: StringSelectMenuInteraction) {
  if (interaction.customId === `${COUNCIL_PREFIX}:raffle:end:select`) { await endRaffleForCouncil(interaction, interaction.values[0]); return; }
  if (interaction.customId === `${COUNCIL_PREFIX}:configuration:timezone:select`) {
    const timezone = interaction.values[0];
    try {
      await setAdminTimezone(interaction.guildId ?? "", interaction.user.id, timezone);
      await showConfiguration(interaction, `✅ Your timezone is now **${timezone}**. All future times you enter will use this timezone.`);
    } catch (error) {
      await updateCouncilPanel(interaction, { embeds: [new EmbedBuilder().setTitle("⚙️ Configuration").setDescription(`❌ ${error instanceof Error ? error.message : "Unable to save your timezone."}`)], components: [backButtonRow()] });
    }
    return;
  }
  if (interaction.customId.startsWith(`${COUNCIL_PREFIX}:bounty:stat:`)) {
    const index = Number(interaction.customId.split(":").at(-1)); const draft = bountyDrafts.get(interaction.user.id);
    if (!draft || !Number.isInteger(index) || index < 0 || index > 3) { await interaction.update({ embeds: [new EmbedBuilder().setTitle("📜 Bounty").setDescription("❌ That bounty draft has expired. Start the bounty again.")], components: [backButtonRow()] }); return; }
    draft.stats[index] = interaction.values[0]; await showBountyStatPicker(interaction, interaction.user.id);
  }
}

async function handleCouncilModal(interaction: ModalSubmitInteraction) {
  const id = interaction.customId; const guild = interaction.guild; if (!guild) return;
  if (id === `${COUNCIL_PREFIX}:configuration:timezone:custom:${interaction.user.id}`) {
    const timezone = interaction.fields.getTextInputValue("timezone").trim();
    if (!timezone || !isValidIanaTimezone(timezone)) {
      await updateCouncilPanel(interaction, { embeds: [new EmbedBuilder().setTitle("🌎 My Timezone").setDescription("❌ That timezone is not valid. Use an IANA timezone such as **America/Phoenix**, **Europe/London**, or **Africa/Johannesburg**.")], components: [backButtonRow()] });
      return;
    }
    try {
      await setAdminTimezone(guild.id, interaction.user.id, timezone);
      await showConfiguration(interaction, `✅ Your timezone is now **${timezone}**. All future times you enter will use this timezone.`);
    } catch (error) {
      await updateCouncilPanel(interaction, { embeds: [new EmbedBuilder().setTitle("🌎 My Timezone").setDescription(`❌ ${error instanceof Error ? error.message : "Unable to save your timezone."}`)], components: [backButtonRow()] });
    }
    return;
  }
  if (id.startsWith(`${COUNCIL_PREFIX}:sigil:modal:`)) {
    const userId = id.slice(`${COUNCIL_PREFIX}:sigil:modal:`.length); const amount = Number.parseInt(interaction.fields.getTextInputValue("amount").trim(), 10); const reason = interaction.fields.getTextInputValue("reason").trim();
    if (!Number.isInteger(amount) || amount === 0 || !reason) { await updateCouncilPanel(interaction, { embeds: [new EmbedBuilder().setTitle("💎 Economy").setDescription("❌ Enter a non-zero whole-number amount and a reason.")], components: [backButtonRow()] }); return; }
    try {
      const updated = await sigilStore.award(guild.id, userId, amount, reason, interaction.user.id); const target = await guild.members.fetch(userId).catch(() => null);
      const embed = buildBalanceEmbed(target?.user ?? interaction.user, updated.balance, updated.transactions.slice(0, 5), amount > 0 ? "✨ Sigils Awarded" : "🜂 Sigils Removed", `${target ? target.toString() : `<@${userId}>`} has been ${amount > 0 ? "granted" : "charged"} **${Math.abs(amount)}** sigils.`);
      await updateCouncilPanel(interaction, { embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("💎 Adjust Another", `${COUNCIL_PREFIX}:economy:assign`), backButton())] });
    } catch (error) { await updateCouncilPanel(interaction, { embeds: [new EmbedBuilder().setTitle("💎 Economy").setDescription(`❌ ${error instanceof Error ? error.message : "Unable to update the sigil ledger."}`)], components: [backButtonRow()] }); }
    return;
  }
  if (id.startsWith(`${COUNCIL_PREFIX}:event:modal:`)) {
    const userId = id.slice(`${COUNCIL_PREFIX}:event:modal:`.length); const draft = postingDrafts.get(userId);
    if (!draft || draft.kind !== "event") { await updateCouncilPanel(interaction, { embeds: [new EmbedBuilder().setTitle("🏆 Events").setDescription("❌ That event setup expired. Start the event again.")], components: [backButtonRow()] }); return; }
    const channel = await interaction.client.channels.fetch(draft.channelId).catch(() => null);
    if (!channel || !channel.isSendable()) { await updateCouncilPanel(interaction, { embeds: [new EmbedBuilder().setTitle("🏆 Events").setDescription("❌ The selected posting channel is unavailable or the bot cannot send there.")], components: [backButtonRow()] }); return; }
    const title = interaction.fields.getTextInputValue("title").trim(); const time = interaction.fields.getTextInputValue("time").trim(); const description = interaction.fields.getTextInputValue("description").trim(); const notes = interaction.fields.getTextInputValue("notes").trim() || null;
    const timezone = await getAdminTimezone(guild.id, interaction.user.id);
    if (!timezone) { await updateCouncilPanel(interaction, { embeds: [new EmbedBuilder().setTitle("🌎 My Timezone").setDescription("⚠️ Your timezone is not set. Choose it once below before creating scheduled events.")], components: timezonePickerComponents() }); return; }
    const millis = parseTime(time, timezone);
    if (!title || !description || millis === null || Number.isNaN(millis) || millis <= Date.now()) { await updateCouncilPanel(interaction, { embeds: [new EmbedBuilder().setTitle("🏆 Events").setDescription("❌ Please provide a title, description, and valid future event time.")], components: [backButtonRow()] }); return; }
    // IMPORTANT: the selected posting channel lives in the draft. The modal interaction's
    // channel is the Council panel channel and must never be used for the public announcement.
    const eventChannelId = draft.channelId;
    const event = await createEvent({ guildId: guild.id, channelId: eventChannelId, title, description, notes, hostId: interaction.user.id, creatorId: interaction.user.id, timezone, startAtIso: new Date(millis).toISOString(), startAtUnix: Math.floor(millis / 1000) });

    // The public event message always gets the single supported RSVP action: Going.
    const announcement = await channel.send({
      content: draft.roleId && /^\d{17,20}$/.test(draft.roleId) ? `<@&${draft.roleId}>` : undefined,
      embeds: [buildEventEmbed(event)],
      components: [buildEventRsvpButtons(event.id)],
      allowedMentions: draft.roleId && /^\d{17,20}$/.test(draft.roleId)
        ? { roles: [draft.roleId] }
        : { parse: [] }
    });

    await attachEventMessageId(event.id, announcement.id);
    postingDrafts.delete(userId);
    await showEvents(interaction, `✨ **Event created:** ${event.title} in <#${eventChannelId}>`);
    return;
  }
  if (id.startsWith(`${COUNCIL_PREFIX}:raffle:modal:`)) {
    const userId = id.slice(`${COUNCIL_PREFIX}:raffle:modal:`.length); const draft = postingDrafts.get(userId);
    if (!draft || draft.kind !== "raffle" || !draft.roleId) { await updateCouncilPanel(interaction, { embeds: [new EmbedBuilder().setTitle("🎟️ Raffles").setDescription("❌ That giveaway setup expired or has no notification role. Start it again.")], components: [backButtonRow()] }); return; }
    const channel = await interaction.client.channels.fetch(draft.channelId).catch(() => null);
    if (!channel || !channel.isSendable()) { await updateCouncilPanel(interaction, { embeds: [new EmbedBuilder().setTitle("🎟️ Raffles").setDescription("❌ The selected posting channel is unavailable or the bot cannot send there.")], components: [backButtonRow()] }); return; }
    const prize = interaction.fields.getTextInputValue("prize").trim(); const duration = interaction.fields.getTextInputValue("duration").trim(); const name = interaction.fields.getTextInputValue("name").trim() || "WoA Community Giveaway";
    const timezone = await getAdminTimezone(guild.id, interaction.user.id);
    if (!timezone) { await updateCouncilPanel(interaction, { embeds: [new EmbedBuilder().setTitle("🌎 My Timezone").setDescription("⚠️ Your timezone is not set. Choose it once below before creating scheduled giveaways.")], components: timezonePickerComponents() }); return; }
    const endsAt = parseTime(duration, timezone);
    if (!prize || endsAt === null || Number.isNaN(endsAt) || endsAt <= Date.now()) { await updateCouncilPanel(interaction, { embeds: [new EmbedBuilder().setTitle("🎟️ Raffles").setDescription("❌ Provide a prize and a valid future end time.")], components: [backButtonRow()] }); return; }
    const raffle = await raffleStore.create({ guildId: guild.id, channelId: draft.channelId, name, prize, endsAt, tagRole: draft.roleId, invocationText: "Ancient sigils awaken, humming softly in the astral dark.", ritualType: "soul-binding", entries: [], boundUsers: [] });
    const announcement = await channel.send({ embeds: [new EmbedBuilder().setTitle("🔮 THE RITUAL BEGINS").setDescription(`A WoA community giveaway has begun.\n\n⟐ **Name:** ${name}\n⟐ **Notification:** <@&${draft.roleId}>\n🎁 **Offering:** ${prize}`).setColor(0x4B0082)], allowedMentions: { roles: [draft.roleId] } });
    const thread = await createRaffleThreadFromMessage(announcement, raffle); const destination = thread ?? channel; if (thread) await raffleStore.setThreadId(raffle.id, thread.id);
    const message = await destination.send({ embeds: [buildActiveRaffleEmbed(raffle)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🔮 Join Giveaway", "bindSoul"), button("⚫ Leave Giveaway", "unbindSoul", ButtonStyle.Secondary))], files: ["./assets/woa_ritual_bg.png"] });
    await raffleStore.setMessageId(raffle.id, message.id); postingDrafts.delete(userId); await showRaffles(interaction); return;
  }
  if (id.startsWith(`${COUNCIL_PREFIX}:bounty:modal:`)) {
    const userId = id.slice(`${COUNCIL_PREFIX}:bounty:modal:`.length); const draft = postingDrafts.get(userId);
    if (!draft || draft.kind !== "bounty" || !draft.roleId) { await updateCouncilPanel(interaction, { embeds: [new EmbedBuilder().setTitle("📜 Bounties").setDescription("❌ That bounty setup expired or has no notification role. Start it again.")], components: [backButtonRow()] }); return; }
    const dinos = interaction.fields.getTextInputValue("dinos").split(",").map(value => value.trim()).filter(Boolean); const bonus = interaction.fields.getTextInputValue("bonus").trim() || null;
    if (dinos.length !== 4 || dinos.some(dino => dino.length < 1)) { await updateCouncilPanel(interaction, { embeds: [new EmbedBuilder().setTitle("📜 Bounties").setDescription("❌ Enter exactly four dino names separated by commas.")], components: [backButtonRow()] }); return; }
    bountyDrafts.set(userId, { guildId: guild.id, channelId: draft.channelId, roleId: draft.roleId, dinos, bonus, stats: ["Melee", "Melee", "Melee", "Melee"] }); postingDrafts.delete(userId); await showBountyStatPicker(interaction, userId);
  }
}

function buildEventModal(userId: string) { const modal = new ModalBuilder().setCustomId(`${COUNCIL_PREFIX}:event:modal:${userId}`).setTitle("Create WoA Event"); modal.addComponents(inputRow("title", "Event title", "e.g. Shoulder Pet Battle", TextInputStyle.Short), inputRow("time", "Start time", "e.g. Friday 7pm or tomorrow 6pm", TextInputStyle.Short), inputRow("description", "Description", "What is happening? Include the important details.", TextInputStyle.Paragraph), inputRow("notes", "Notes", "Optional extra notes for players", TextInputStyle.Paragraph, false)); return modal; }
function buildRaffleModal(userId: string) { const modal = new ModalBuilder().setCustomId(`${COUNCIL_PREFIX}:raffle:modal:${userId}`).setTitle("Create Community Giveaway"); modal.addComponents(inputRow("prize", "Prize", "What is being given away?", TextInputStyle.Short), inputRow("duration", "End time", "e.g. 2h or tomorrow 7pm", TextInputStyle.Short), inputRow("name", "Giveaway name", "Optional", TextInputStyle.Short, false)); return modal; }
function buildBountyModal(userId: string) { const modal = new ModalBuilder().setCustomId(`${COUNCIL_PREFIX}:bounty:modal:${userId}`).setTitle("Start Weekly Bounty"); modal.addComponents(inputRow("dinos", "Four dinos", "Dino 1, Dino 2, Dino 3, Dino 4", TextInputStyle.Paragraph), inputRow("bonus", "Bonus", "Optional bonus", TextInputStyle.Short, false)); return modal; }
function buildCustomTimezoneModal(userId: string) { const modal = new ModalBuilder().setCustomId(`${COUNCIL_PREFIX}:configuration:timezone:custom:${userId}`).setTitle("Set My Timezone"); modal.addComponents(inputRow("timezone", "IANA timezone", "e.g. America/Phoenix", TextInputStyle.Short)); return modal; }

function timezonePickerComponents() {
  const menu = new StringSelectMenuBuilder().setCustomId(`${COUNCIL_PREFIX}:configuration:timezone:select`).setPlaceholder("Select your timezone").setMinValues(1).setMaxValues(1).addOptions(COMMON_TIMEZONES.map(([label, value]) => ({ label, value })));
  return [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu),
    new ActionRowBuilder<ButtonBuilder>().addComponents(button("✏️ Other Timezone", `${COUNCIL_PREFIX}:configuration:timezone:custom`), backButton())
  ];
}

async function startTimezonePicker(interaction: ButtonInteraction) {
  const current = await getAdminTimezone(interaction.guildId ?? "", interaction.user.id);
  const currentText = current ? `\n\nCurrent timezone: **${current}**` : "\n\nNo timezone is saved yet.";
  await interaction.update({ embeds: [new EmbedBuilder().setTitle("🌎 MY TIMEZONE").setDescription(`Choose the timezone you use when entering event and giveaway times.${currentText}\n\nOnce saved, you will enter normal local times and the bot will handle UTC conversion automatically.`)], components: timezonePickerComponents() });
}

async function startCustomTimezoneModal(interaction: ButtonInteraction) {
  await interaction.showModal(buildCustomTimezoneModal(interaction.user.id));
}

async function showBountyStatPicker(interaction: ModalSubmitInteraction | StringSelectMenuInteraction, userId: string) {
  const draft = bountyDrafts.get(userId); if (!draft) return; const rows: ActionRowBuilder<StringSelectMenuBuilder>[] = [];
  for (let index = 0; index < 4; index += 1) { const menu = new StringSelectMenuBuilder().setCustomId(`${COUNCIL_PREFIX}:bounty:stat:${index}`).setPlaceholder(`${draft.dinos[index]} — choose target stat`).setMinValues(1).setMaxValues(1).addOptions(BOUNTY_STATS.map(stat => ({ label: stat, value: stat, default: draft.stats[index] === stat }))); rows.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)); }
  const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(button("🎲 Randomize All & Post", `${COUNCIL_PREFIX}:bounty:randomize`, ButtonStyle.Secondary), button("📜 Post Bounty", `${COUNCIL_PREFIX}:bounty:post`, ButtonStyle.Success));
  await updateCouncilPanel(interaction, { content: "🜁 **The Hunt must be inscribed.** Choose the stat for each creature below. The locked stat range is **40–50**. You may also randomize all four targets.", components: [...rows, buttons], embeds: [] });
}

async function postBounty(interaction: ButtonInteraction, userId: string) {
  const draft = bountyDrafts.get(userId); if (!draft) { await interaction.update({ content: "❌ That bounty draft has expired. Start the bounty again.", embeds: [], components: [backButtonRow()] }); return; }
  const channel = await interaction.client.channels.fetch(draft.channelId).catch(() => null);
  if (!channel || !channel.isSendable()) { await interaction.update({ content: "❌ The selected bounty channel cannot receive messages.", embeds: [], components: [backButtonRow()] }); return; }
  const record = await bountyStore.create({ guildId: draft.guildId, channelId: draft.channelId, tagRoleId: draft.roleId, dinos: draft.dinos, stats: draft.stats, bonus: draft.bonus });
  const attachment = new AttachmentBuilder(bountyWeeklyImage, { name: "bounty.png" }); const targets = draft.dinos.map((dino, index) => `• **${dino}** — **${draft.stats[index]}** ▸ 40–50`).join("\n");
  const ritual = ["**🜁 THE RITUAL OF THE HUNT**", "", "Every offering must satisfy the ancient rules of the Hunt:", "• Creature must spawn at the **server’s max wild level**", "• **Perfect taming effectiveness** is required", "• Final tame level must fall within the **perfect-tame range (202–224)**", "• Screenshot the stat page showing the final level", "• Cryopod the creature before submission", "• Open a **#🎫➖bounty-turn-in-ticket** and present your offering to an admin", "", "**⚔️ TARGETS OF THE WEEK**", targets, "", draft.bonus ? `⚡ **Bonus Bounty:** ${draft.bonus}` : "", "", `🜁 **Summoned Order:** <@&${draft.roleId}>`, "", "The stat target is **40–50** for every offering. Read the ritual carefully before you begin your hunt."].filter(Boolean).join("\n");
  const embed = new EmbedBuilder().setColor("#2b2d31").setImage("attachment://bounty.png").setTitle("🜁 THE WEEKLY HUNT 🜁").setDescription(ritual);
  const message = await channel.send({ embeds: [embed], files: [attachment], allowedMentions: { roles: [draft.roleId] } }); await bountyStore.setMessageId(record.id, message.id); bountyDrafts.delete(userId);
  await interaction.update({ content: `✅ The Weekly Hunt has been inscribed and posted in <#${draft.channelId}>.`, components: [backButtonRow()], embeds: [] });
}
async function randomizeAndPostBounty(interaction: ButtonInteraction, userId: string) { const draft = bountyDrafts.get(userId); if (!draft) { await interaction.update({ content: "❌ That bounty draft has expired. Start the bounty again.", embeds: [], components: [backButtonRow()] }); return; } draft.stats = draft.dinos.map(() => BOUNTY_STATS[Math.floor(Math.random() * BOUNTY_STATS.length)]); await postBounty(interaction, userId); }
async function startSigilAssignment(interaction: ButtonInteraction) { const menu = new UserSelectMenuBuilder().setCustomId(`${COUNCIL_PREFIX}:sigil:user`).setPlaceholder("Select a player").setMinValues(1).setMaxValues(1); await interaction.update({ content: "💎 Select the player whose Sigils you want to adjust.", embeds: [], components: [new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(menu), new ActionRowBuilder<ButtonBuilder>().addComponents(backButton())] }); }
async function openSigilAdjustment(interaction: UserSelectMenuInteraction) { const userId = interaction.values[0]; const modal = new ModalBuilder().setCustomId(`${COUNCIL_PREFIX}:sigil:modal:${userId}`).setTitle("Adjust Player Sigils"); modal.addComponents(inputRow("amount", "Sigil amount", "25 to award, -25 to remove", TextInputStyle.Short), inputRow("reason", "Reason", "Event reward, correction, etc.", TextInputStyle.Paragraph)); await interaction.showModal(modal); }
async function startEventModal(interaction: ButtonInteraction) {
  const timezone = await getAdminTimezone(interaction.guildId ?? "", interaction.user.id);
  if (!timezone) {
    await interaction.update({ embeds: [new EmbedBuilder().setTitle("🌎 MY TIMEZONE").setDescription("Before creating scheduled events, choose the timezone you use for entering times. You only need to do this once.")], components: timezonePickerComponents() });
    return;
  }
  const menu = postingChannelMenu("event"); await interaction.update({ content: "📍 Choose the channel where the event announcement should be posted.", embeds: [], components: [new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(menu), new ActionRowBuilder<ButtonBuilder>().addComponents(backButton())] });
}
async function handleEventNoRole(interaction: ButtonInteraction) { const draft = postingDrafts.get(interaction.user.id); if (!draft || draft.kind !== "event") { await interaction.update({ content: "❌ That event setup expired. Start the event again.", embeds: [], components: [backButtonRow()] }); return; } draft.roleId = null; await interaction.showModal(buildEventModal(interaction.user.id)); }
async function startRaffleModal(interaction: ButtonInteraction) {
  const timezone = await getAdminTimezone(interaction.guildId ?? "", interaction.user.id);
  if (!timezone) {
    await interaction.update({ embeds: [new EmbedBuilder().setTitle("🌎 MY TIMEZONE").setDescription("Before creating scheduled giveaways, choose the timezone you use for entering times. You only need to do this once.")], components: timezonePickerComponents() });
    return;
  }
  const menu = postingChannelMenu("raffle"); await interaction.update({ content: "📍 Choose the channel where the giveaway should be posted.", embeds: [], components: [new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(menu), new ActionRowBuilder<ButtonBuilder>().addComponents(backButton())] });
}
async function startRaffleEndPicker(interaction: ButtonInteraction) { const raffles = (await raffleStore.all()).filter(raffle => raffle.guildId === interaction.guildId && !raffle.ended && raffle.endsAt > Date.now()).slice(0, 25); if (!raffles.length) { await interaction.update({ content: "❌ There are no active giveaways to end." }); return; } const menu = new StringSelectMenuBuilder().setCustomId(`${COUNCIL_PREFIX}:raffle:end:select`).setPlaceholder("Choose the active giveaway to end"); menu.addOptions(raffles.map(raffle => ({ label: (raffle.name || "WoA Community Giveaway").slice(0, 100), value: raffle.id, description: `Prize: ${raffle.prize}`.slice(0, 100) }))); await interaction.update({ content: "🔮 **End a Giveaway**\nChoose the active ritual you want to conclude. The winner will be chosen from the entries.", embeds: [], components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu), new ActionRowBuilder<ButtonBuilder>().addComponents(backButton())] }); }
async function endRaffleForCouncil(interaction: StringSelectMenuInteraction, raffleId: string) {
  const raffle = await raffleStore.getById(raffleId); if (!raffle || raffle.guildId !== interaction.guildId || raffle.ended || raffle.endsAt <= Date.now()) { await interaction.update({ content: "❌ That giveaway is no longer active.", components: [backButtonRow()], embeds: [] }); return; }
  const entries = raffle.entries ?? []; const winnerId = raffle.winnerId ?? (entries.length ? entries[Math.floor(Math.random() * entries.length)] : null); if (winnerId) { raffle.winnerId = winnerId; await raffleStore.save(raffle); }
  try {
    const announcementChannel = await interaction.client.channels.fetch(raffle.channelId); if (!announcementChannel || !("send" in announcementChannel) || typeof announcementChannel.send !== "function") throw new Error("Raffle announcement channel is unavailable.");
    const grandEmbed = new EmbedBuilder().setColor(0xFF4500).setTitle("✨ A Champion Has Been Chosen ✨").setDescription(winnerId ? "The sigils have chosen their champion." : "The ritual concludes with no champion.").addFields({ name: "👑 Winner", value: winnerId ? `<@${winnerId}>` : "No entries", inline: false }, { name: "🎁 Prize", value: `**${raffle.prize}**`, inline: false }, { name: "💠 Entries", value: `${entries.length}`, inline: true }).setFooter({ text: "Wizards of Ark • Ascension Complete" }).setTimestamp();
    const attachment = new AttachmentBuilder("./assets/woa_winner_bg.png", { name: "woa_winner_bg.png" }); await announcementChannel.send({ embeds: [grandEmbed], files: [attachment], allowedMentions: { users: winnerId ? [winnerId] : [] } });
    await closeRaffleThread(interaction.client, raffle); const messageChannel = await interaction.client.channels.fetch(getRaffleMessageChannelId(raffle)).catch(() => null); if (messageChannel && "messages" in messageChannel && raffle.messageId) { const message = await messageChannel.messages.fetch(raffle.messageId).catch(() => null); if (message) await message.edit({ components: [] }).catch(() => undefined); }
    await raffleStore.end(raffle.id); await interaction.update({ content: winnerId ? `🔮 Giveaway ended. Winner: <@${winnerId}>` : "🔮 Giveaway ended with no entries.", components: [backButtonRow()], embeds: [] });
  } catch (error) { console.error("Council raffle end failed:", error); await interaction.update({ content: "❌ The giveaway could not be safely concluded. It remains active for a retry.", components: [backButtonRow()], embeds: [] }); }
}
async function startBountyModal(interaction: ButtonInteraction) { const menu = postingChannelMenu("bounty"); await interaction.update({ content: "📍 Choose the channel where the Weekly Hunt should be posted.", embeds: [], components: [new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(menu), new ActionRowBuilder<ButtonBuilder>().addComponents(backButton())] }); }
function inputRow(id: string, label: string, placeholder: string, style: TextInputStyle, required = true) { return new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId(id).setLabel(label).setPlaceholder(placeholder).setStyle(style).setRequired(required)); }
async function showEconomy(interaction: ButtonInteraction) { const users = await discordDirectoryService.listMembers(interaction.guildId ?? ""); const active = users.filter(user => user.joinedAt).length; await interaction.update({ embeds: [new EmbedBuilder().setTitle("💎 Economy").setDescription(`Active member records: **${active}**\n\nUse the control below to assign or remove Sigils.`)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("💎 Assign / Remove Sigils", `${COUNCIL_PREFIX}:economy:assign`)), backButtonRow()] }); }
async function showRaffles(interaction: ButtonInteraction | ModalSubmitInteraction) { const raffles = (await raffleStore.all()).filter(raffle => raffle.guildId === interaction.guildId && !raffle.ended && raffle.endsAt > Date.now()); const description = raffles.length ? raffles.slice(0, 10).map(raffle => `🎟️ **${raffle.name}** — ${raffle.prize}\nEnds <t:${Math.floor(raffle.endsAt / 1000)}:R> • **${raffle.entries.length} entries**`).join("\n\n") : "No active community giveaways."; await updateCouncilPanel(interaction, { embeds: [new EmbedBuilder().setTitle("🎟️ Raffles").setDescription(description)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("✨ Start Giveaway", `${COUNCIL_PREFIX}:raffles:start`), button("🛑 End Giveaway", `${COUNCIL_PREFIX}:raffles:end`, ButtonStyle.Danger)), backButtonRow()] }); }
async function showEvents(interaction: ButtonInteraction | ModalSubmitInteraction, notice?: string) { const events = await getUpcomingEvents(interaction.guildId ?? "", 10); const description = events.length ? `${notice ? `${notice}\n\n` : ""}${events.map(event => `🏆 **${event.title}** — <t:${event.startAtUnix}:F>\n${event.description}\nRSVP: ${getEventRsvpSummary(event).going}${event.notes ? `\n📝 ${event.notes}` : ""}`).join("\n\n")}` : `${notice ? `${notice}\n\n` : ""}No upcoming events.`; await updateCouncilPanel(interaction, { embeds: [new EmbedBuilder().setTitle("🏆 Events").setDescription(description.slice(0, 4000))], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("✨ Start Event", `${COUNCIL_PREFIX}:events:start`)), backButtonRow()] }); }
async function showBounties(interaction: ButtonInteraction) { const bounties = await bountyStore.getActive(interaction.guildId ?? ""); const description = bounties.length ? bounties.map(bounty => `📜 **${bounty.dinos.join(", ")}** — ${bounty.stats.join(", ")} ▸ 40–50`).join("\n") : "No active bounties."; await interaction.update({ embeds: [new EmbedBuilder().setTitle("📜 Bounties").setDescription(description)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("✨ Start Bounty", `${COUNCIL_PREFIX}:bounties:start`)), backButtonRow()] }); }
async function showRewards(interaction: ButtonInteraction) { const activeRaffles = (await raffleStore.all()).filter(raffle => interaction.guildId === raffle.guildId && Date.now() < raffle.endsAt && !raffle.ended); const user = await sigilStore.getUser(interaction.guildId ?? "", interaction.user.id); const components = buildShopComponents(activeRaffles); components.push(backButtonRow() as never); const activeText = activeRaffles.length ? activeRaffles.slice(0, 10).map(raffle => `🎟️ **${raffle.name}** — ${raffle.prize} • Ends <t:${Math.floor(raffle.endsAt / 1000)}:R>`).join("\n") : "No active community giveaway is available for redemption right now."; const embed = new EmbedBuilder().setTitle("🛍️ Sigil Shop").setDescription(["Trade your Sigils for community giveaway entries.", `Exchange rate: **${SIGILS_PER_RAFFLE_ENTRY} sigils = 1 raffle entry**.`, `Current balance: **${user.balance} sigils**.`].join("\n")).addFields({ name: "🎟️ Active Giveaways", value: activeText, inline: false }).setTimestamp(); await interaction.update({ embeds: [embed], components }); }
async function showStatistics(interaction: ButtonInteraction) { const users = await discordDirectoryService.listMembers(interaction.guildId ?? ""); const activeRaffles = (await raffleStore.all()).filter(raffle => raffle.guildId === interaction.guildId && !raffle.ended && raffle.endsAt > Date.now()).length; const activeBounties = (await bountyStore.getActive(interaction.guildId ?? "")).length; const events = await getUpcomingEvents(interaction.guildId ?? "", 1000); await interaction.update({ embeds: [new EmbedBuilder().setTitle("📊 Statistics").addFields({ name: "Members", value: `${users.length}`, inline: true }, { name: "Active giveaways", value: `${activeRaffles}`, inline: true }, { name: "Active bounties", value: `${activeBounties}`, inline: true }, { name: "Upcoming events", value: `${events.length}`, inline: true })], components: [backButtonRow()] }); }
async function showConfiguration(interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction, notice?: string) {
  const timezone = await getAdminTimezone(interaction.guildId ?? "", interaction.user.id);
  const timezoneText = timezone ? `**${timezone}**` : "⚠️ **Not set**";
  const description = [notice ?? null, `🌎 **My timezone:** ${timezoneText}`, "", "Set your timezone once. After that, every event or giveaway time you enter is interpreted in your own local timezone and converted automatically for Discord.", "", `Giveaway threads: **${env.raffleThreadsEnabled ? "enabled" : "disabled"}**`, `Thread archive: **${env.raffleThreadAutoArchiveMinutes} minutes**`].filter(Boolean).join("\n");
  await updateCouncilPanel(interaction, { embeds: [new EmbedBuilder().setTitle("⚙️ Configuration").setDescription(description)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🌎 My Timezone", `${COUNCIL_PREFIX}:configuration:timezone`)), backButtonRow()] });
}
function backButton() { return button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary); }
function backButtonRow() { return new ActionRowBuilder<ButtonBuilder>().addComponents(backButton()); }
function backRow() { return backButtonRow(); }
function button(label: string, customId: string, style = ButtonStyle.Primary) { return new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style); }
