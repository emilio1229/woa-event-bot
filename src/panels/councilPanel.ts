import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
  type ButtonInteraction,
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
import { getTimezoneForLocale } from "../utils/localeTimezone.js";
import { discordDirectoryService } from "../services/discordDirectoryService.js";
import { attachEventMessageId, createEvent, getEventRsvpSummary, getUpcomingEvents } from "../services/eventService.js";
import { buildEventEmbed } from "../ui/eventEmbed.js";
import { buildEventRsvpButtons } from "../interactions/buttons/shared.js";
import { createRaffleThreadFromMessage, closeRaffleThread, getRaffleMessageChannelId } from "../services/raffleThreadService.js";

export const COUNCIL_PREFIX = "woa:council";
const BOUNTY_STATS = ["Health", "Stamina", "Oxygen", "Food", "Weight", "Melee"] as const;
type BountyDraft = { guildId: string; channelId: string; roleId: string; dinos: string[]; bonus: string | null; stats: string[] };
const bountyDrafts = new Map<string, BountyDraft>();

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
    { name: "⚙️ Configuration", value: "Runtime settings", inline: true }
  ).setFooter({ text: "The Wizards of Ark • High Council" });
  return { embeds: [embed], components: [
    new ActionRowBuilder<ButtonBuilder>().addComponents(button("💎 Economy", `${COUNCIL_PREFIX}:economy`), button("🎟️ Raffles", `${COUNCIL_PREFIX}:raffles`), button("🏆 Events", `${COUNCIL_PREFIX}:events`), button("📜 Bounties", `${COUNCIL_PREFIX}:bounties`)),
    new ActionRowBuilder<ButtonBuilder>().addComponents(button("🎁 Rewards", `${COUNCIL_PREFIX}:rewards`), button("📊 Statistics", `${COUNCIL_PREFIX}:statistics`), button("⚙️ Configuration", `${COUNCIL_PREFIX}:configuration`))
  ] };
}

export async function handleCouncilPanel(interaction: Interaction) {
  const supported = interaction.isButton() || interaction.isUserSelectMenu() || interaction.isRoleSelectMenu() || interaction.isStringSelectMenu() || interaction.isModalSubmit();
  if (!supported || !interaction.customId.startsWith(`${COUNCIL_PREFIX}:`)) return false;
  if (!isCouncilMember(interaction)) { await interaction.reply({ content: "⛔ Only the High Council may use this control.", ephemeral: true }); return true; }
  if (interaction.isModalSubmit()) { await handleCouncilModal(interaction); return true; }
  if (interaction.isUserSelectMenu()) { if (interaction.customId === `${COUNCIL_PREFIX}:sigil:user`) await openSigilAdjustment(interaction); return true; }
  if (interaction.isRoleSelectMenu()) { await handleCouncilRoleSelect(interaction); return true; }
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
  else if (section === "events:no-role") await startEventModal(interaction, null);
  else if (section === "bounties") await showBounties(interaction);
  else if (section === "bounties:start") await startBountyModal(interaction);
  else if (section === "rewards") await showRewards(interaction);
  else if (section === "statistics") await showStatistics(interaction);
  else if (section === "configuration") await showConfiguration(interaction);
  else if (section === "bounty:post") await postBounty(interaction, interaction.user.id);
  else if (section === "bounty:randomize") await randomizeAndPostBounty(interaction, interaction.user.id);
  else await interaction.update({ embeds: [new EmbedBuilder().setTitle("🏛️ Council").setDescription("Unknown Council panel.")], components: [backRow()] });
  return true;
}

async function handleCouncilRoleSelect(interaction: RoleSelectMenuInteraction) {
  const roleId = interaction.values[0] ?? null;
  if (interaction.customId === `${COUNCIL_PREFIX}:raffle:role`) return void await interaction.showModal(buildRaffleModal(roleId));
  if (interaction.customId === `${COUNCIL_PREFIX}:bounty:role`) return void await interaction.showModal(buildBountyModal(roleId));
  if (interaction.customId === `${COUNCIL_PREFIX}:event:role`) return void await interaction.showModal(buildEventModal(roleId));
}

async function handleCouncilStringSelect(interaction: StringSelectMenuInteraction) {
  if (interaction.customId === `${COUNCIL_PREFIX}:raffle:end:select`) { await endRaffleForCouncil(interaction, interaction.values[0]); return; }
  if (interaction.customId.startsWith(`${COUNCIL_PREFIX}:bounty:stat:`)) {
    const index = Number(interaction.customId.split(":").at(-1)); const draft = bountyDrafts.get(interaction.user.id);
    if (!draft || !Number.isInteger(index) || index < 0 || index > 3) { await interaction.reply({ content: "❌ That bounty draft has expired. Start the bounty again.", ephemeral: true }); return; }
    draft.stats[index] = interaction.values[0]; await interaction.deferUpdate();
  }
}

async function handleCouncilModal(interaction: ModalSubmitInteraction) {
  const id = interaction.customId; const guild = interaction.guild; if (!guild) return;
  if (id.startsWith(`${COUNCIL_PREFIX}:sigil:modal:`)) {
    const userId = id.slice(`${COUNCIL_PREFIX}:sigil:modal:`.length); const amount = Number.parseInt(interaction.fields.getTextInputValue("amount").trim(), 10); const reason = interaction.fields.getTextInputValue("reason").trim();
    if (!Number.isInteger(amount) || amount === 0 || !reason) { await interaction.reply({ content: "❌ Enter a non-zero whole-number amount and a reason.", ephemeral: true }); return; }
    try { const updated = await sigilStore.award(guild.id, userId, amount, reason, interaction.user.id); const target = await guild.members.fetch(userId).catch(() => null); const embed = buildBalanceEmbed(target?.user ?? interaction.user, updated.balance, updated.transactions.slice(0, 5), amount > 0 ? "✨ Sigils Awarded" : "🜂 Sigils Removed", `${target ? target.toString() : `<@${userId}>`} has been ${amount > 0 ? "granted" : "charged"} **${Math.abs(amount)}** sigils.`); await interaction.reply({ embeds: [embed] }); }
    catch (error) { await interaction.reply({ content: `❌ ${error instanceof Error ? error.message : "Unable to update the sigil ledger."}`, ephemeral: true }); }
    return;
  }
  if (id.startsWith(`${COUNCIL_PREFIX}:event:modal:`)) {
    const channel = interaction.channel; if (!channel || !channel.isSendable()) { await interaction.reply({ content: "❌ This control must be used in a channel where the bot can send messages.", ephemeral: true }); return; }
    const title = interaction.fields.getTextInputValue("title").trim(); const time = interaction.fields.getTextInputValue("time").trim(); const description = interaction.fields.getTextInputValue("description").trim(); const notes = interaction.fields.getTextInputValue("notes").trim() || null;
    const roleId = id.split(":").at(-1) === "none" ? null : id.split(":").at(-1) || null; const timezone = getTimezoneForLocale(interaction.locale ?? "en-US", interaction.user.id); const millis = parseTime(time, timezone);
    if (!title || !description || millis === null || Number.isNaN(millis) || millis <= Date.now()) { await interaction.reply({ content: "❌ Please provide a title, description, and valid future event time.", ephemeral: true }); return; }
    const event = await createEvent({ guildId: guild.id, channelId: channel.id, title, description, notes, hostId: interaction.user.id, creatorId: interaction.user.id, timezone, startAtIso: new Date(millis).toISOString(), startAtUnix: Math.floor(millis / 1000) });
    await interaction.reply({ embeds: [buildEventEmbed(event)], components: [buildEventRsvpButtons(event.id)], allowedMentions: { parse: [] } });
    const message = await interaction.fetchReply(); await attachEventMessageId(event.id, message.id); if (roleId && /^\d{17,20}$/.test(roleId)) await message.edit({ content: `<@&${roleId}>`, allowedMentions: { roles: [roleId] } }); return;
  }
  const channel = interaction.channel; if (!channel || !channel.isSendable()) { await interaction.reply({ content: "❌ This control must be used in a channel where the bot can send messages.", ephemeral: true }); return; }
  if (id.startsWith(`${COUNCIL_PREFIX}:raffle:modal:`)) {
    const prize = interaction.fields.getTextInputValue("prize").trim(); const duration = interaction.fields.getTextInputValue("duration").trim(); const name = interaction.fields.getTextInputValue("name").trim() || "WoA Community Giveaway"; const roleId = id.split(":").at(-1) ?? ""; const endsAt = parseTime(duration, getTimezoneForLocale(interaction.locale ?? "en-US", interaction.user.id));
    if (!prize || endsAt === null || Number.isNaN(endsAt) || endsAt <= Date.now() || !/^\d{17,20}$/.test(roleId)) { await interaction.reply({ content: "❌ Provide a prize and a valid future end time.", ephemeral: true }); return; }
    const raffle = await raffleStore.create({ guildId: guild.id, channelId: channel.id, name, prize, endsAt, tagRole: roleId, invocationText: "Ancient sigils awaken, humming softly in the astral dark.", ritualType: "soul-binding", entries: [], boundUsers: [] });
    const announcement = await channel.send({ embeds: [new EmbedBuilder().setTitle("🔮 THE RITUAL BEGINS").setDescription(`A WoA community giveaway has begun.\n\n⟐ **Name:** ${name}\n⟐ **Notification:** <@&${roleId}>\n🎁 **Offering:** ${prize}`).setColor(0x4B0082)], allowedMentions: { roles: [roleId] } });
    const thread = await createRaffleThreadFromMessage(announcement, raffle); const destination = thread ?? channel; if (thread) await raffleStore.setThreadId(raffle.id, thread.id);
    const message = await destination.send({ embeds: [buildActiveRaffleEmbed(raffle)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🔮 Join Giveaway", "bindSoul"), button("⚫ Leave Giveaway", "unbindSoul", ButtonStyle.Secondary))], files: ["./assets/woa_ritual_bg.png"] });
    await raffleStore.setMessageId(raffle.id, message.id); await interaction.reply({ content: thread ? `✅ Giveaway started in <#${thread.id}>.` : "✅ Giveaway started.", ephemeral: true }); return;
  }
  if (id.startsWith(`${COUNCIL_PREFIX}:bounty:modal:`)) {
    const dinos = interaction.fields.getTextInputValue("dinos").split(",").map(value => value.trim()).filter(Boolean); const roleId = id.split(":").at(-1) ?? ""; const bonus = interaction.fields.getTextInputValue("bonus").trim() || null;
    if (dinos.length !== 4 || dinos.some(dino => dino.length < 1) || !/^\d{17,20}$/.test(roleId)) { await interaction.reply({ content: "❌ Enter exactly four dino names separated by commas and select a valid Discord role.", ephemeral: true }); return; }
    bountyDrafts.set(interaction.user.id, { guildId: guild.id, channelId: channel.id, roleId, dinos, bonus, stats: ["Melee", "Melee", "Melee", "Melee"] }); await showBountyStatPicker(interaction, interaction.user.id);
  }
}

function buildEventModal(roleId: string | null) { const modal = new ModalBuilder().setCustomId(`${COUNCIL_PREFIX}:event:modal:${roleId ?? "none"}`).setTitle("Create WoA Event"); modal.addComponents(inputRow("title", "Event title", "e.g. Shoulder Pet Battle", TextInputStyle.Short), inputRow("time", "Start time", "e.g. Friday 7pm or tomorrow 6pm", TextInputStyle.Short), inputRow("description", "Description", "What is happening? Include the important details.", TextInputStyle.Paragraph), inputRow("notes", "Notes", "Optional extra notes for players", TextInputStyle.Paragraph, false)); return modal; }
function buildRaffleModal(roleId: string) { const modal = new ModalBuilder().setCustomId(`${COUNCIL_PREFIX}:raffle:modal:${roleId}`).setTitle("Create Community Giveaway"); modal.addComponents(inputRow("prize", "Prize", "What is being given away?", TextInputStyle.Short), inputRow("duration", "End time", "e.g. 2h or tomorrow 7pm", TextInputStyle.Short), inputRow("name", "Giveaway name", "Optional", TextInputStyle.Short, false)); return modal; }
function buildBountyModal(roleId: string) { const modal = new ModalBuilder().setCustomId(`${COUNCIL_PREFIX}:bounty:modal:${roleId}`).setTitle("Start Weekly Bounty"); modal.addComponents(inputRow("dinos", "Four dinos", "Dino 1, Dino 2, Dino 3, Dino 4", TextInputStyle.Paragraph), inputRow("bonus", "Bonus", "Optional bonus", TextInputStyle.Short, false)); return modal; }

async function showBountyStatPicker(interaction: ModalSubmitInteraction, userId: string) {
  const draft = bountyDrafts.get(userId); if (!draft) return; const rows: ActionRowBuilder<StringSelectMenuBuilder>[] = [];
  for (let index = 0; index < 4; index += 1) { const menu = new StringSelectMenuBuilder().setCustomId(`${COUNCIL_PREFIX}:bounty:stat:${index}`).setPlaceholder(`${draft.dinos[index]} — choose target stat`).setMinValues(1).setMaxValues(1).addOptions(BOUNTY_STATS.map(stat => ({ label: stat, value: stat, default: draft.stats[index] === stat }))); rows.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)); }
  const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(button("🎲 Randomize All & Post", `${COUNCIL_PREFIX}:bounty:randomize`, ButtonStyle.Secondary), button("📜 Post Bounty", `${COUNCIL_PREFIX}:bounty:post`, ButtonStyle.Success));
  await interaction.reply({ content: "🜁 **The Hunt must be inscribed.** Choose the stat for each creature below. The locked stat range is **40–50**. You may also randomize all four targets.", components: [...rows, buttons], ephemeral: true });
}

async function postBounty(interaction: ButtonInteraction, userId: string) {
  const draft = bountyDrafts.get(userId); if (!draft) { await interaction.reply({ content: "❌ That bounty draft has expired. Start the bounty again.", ephemeral: true }); return; }
  if (!interaction.channel?.isSendable()) { await interaction.reply({ content: "❌ This channel cannot receive the bounty announcement.", ephemeral: true }); return; }
  const record = await bountyStore.create({ guildId: draft.guildId, channelId: draft.channelId, tagRoleId: draft.roleId, dinos: draft.dinos, stats: draft.stats, bonus: draft.bonus });
  const attachment = new AttachmentBuilder(bountyWeeklyImage, { name: "bounty.png" }); const targets = draft.dinos.map((dino, index) => `• **${dino}** — **${draft.stats[index]}** ▸ 40–50`).join("\n");
  const ritual = ["**🜁 THE RITUAL OF THE HUNT**", "", "Every offering must satisfy the ancient rules of the Hunt:", "• Creature must spawn at the **server’s max wild level**", "• **Perfect taming effectiveness** is required", "• Final tame level must fall within the **perfect-tame range (202–224)**", "• Screenshot the stat page showing the final level", "• Cryopod the creature before submission", "• Open a **#🎫➖bounty-turn-in-ticket** and present your offering to an admin", "", "**⚔️ TARGETS OF THE WEEK**", targets, "", draft.bonus ? `⚡ **Bonus Bounty:** ${draft.bonus}` : "", "", `🜁 **Summoned Order:** <@&${draft.roleId}>`, "", "The stat target is **40–50** for every offering. Read the ritual carefully before you begin your hunt."].filter(Boolean).join("\n");
  const embed = new EmbedBuilder().setColor("#2b2d31").setImage("attachment://bounty.png").setTitle("🜁 THE WEEKLY HUNT 🜁").setDescription(ritual);
  const message = await interaction.channel.send({ embeds: [embed], files: [attachment], allowedMentions: { roles: [draft.roleId] } }); await bountyStore.setMessageId(record.id, message.id); bountyDrafts.delete(userId);
  await interaction.update({ content: "✅ The Weekly Hunt has been inscribed and posted.", components: [], embeds: [] });
}
async function randomizeAndPostBounty(interaction: ButtonInteraction, userId: string) { const draft = bountyDrafts.get(userId); if (!draft) { await interaction.reply({ content: "❌ That bounty draft has expired. Start the bounty again.", ephemeral: true }); return; } draft.stats = draft.dinos.map(() => BOUNTY_STATS[Math.floor(Math.random() * BOUNTY_STATS.length)]); await postBounty(interaction, userId); }
async function startSigilAssignment(interaction: ButtonInteraction) { const menu = new UserSelectMenuBuilder().setCustomId(`${COUNCIL_PREFIX}:sigil:user`).setPlaceholder("Select a player").setMinValues(1).setMaxValues(1); await interaction.reply({ content: "💎 Select the player whose Sigils you want to adjust.", components: [new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(menu)], ephemeral: true }); }
async function openSigilAdjustment(interaction: UserSelectMenuInteraction) { const userId = interaction.values[0]; const modal = new ModalBuilder().setCustomId(`${COUNCIL_PREFIX}:sigil:modal:${userId}`).setTitle("Adjust Player Sigils"); modal.addComponents(inputRow("amount", "Sigil amount", "25 to award, -25 to remove", TextInputStyle.Short), inputRow("reason", "Reason", "Event reward, correction, etc.", TextInputStyle.Paragraph)); await interaction.showModal(modal); }
async function startEventModal(interaction: ButtonInteraction, roleId: string | null | undefined = undefined) { if (roleId !== undefined) { await interaction.showModal(buildEventModal(roleId)); return; } const roleMenu = new RoleSelectMenuBuilder().setCustomId(`${COUNCIL_PREFIX}:event:role`).setPlaceholder("Choose the role to notify"); const skip = button("No role to tag", `${COUNCIL_PREFIX}:events:no-role`, ButtonStyle.Secondary); await interaction.reply({ content: "🔔 Choose the Discord role to notify. You can also skip the role tag.", components: [new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleMenu), new ActionRowBuilder<ButtonBuilder>().addComponents(skip)], ephemeral: true }); }
async function startRaffleModal(interaction: ButtonInteraction) { const roleMenu = new RoleSelectMenuBuilder().setCustomId(`${COUNCIL_PREFIX}:raffle:role`).setPlaceholder("Choose the Discord role to notify for this giveaway.").setMinValues(1).setMaxValues(1); await interaction.reply({ content: "🔔 Choose the Discord role to notify for this giveaway.", components: [new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleMenu)], ephemeral: true }); }
async function startRaffleEndPicker(interaction: ButtonInteraction) { const raffles = (await raffleStore.all()).filter(raffle => raffle.guildId === interaction.guildId && !raffle.ended && raffle.endsAt > Date.now()).slice(0, 25); if (!raffles.length) { await interaction.reply({ content: "❌ There are no active giveaways to end.", ephemeral: true }); return; } const menu = new StringSelectMenuBuilder().setCustomId(`${COUNCIL_PREFIX}:raffle:end:select`).setPlaceholder("Choose the active giveaway to end"); menu.addOptions(raffles.map(raffle => ({ label: (raffle.name || "WoA Community Giveaway").slice(0, 100), value: raffle.id, description: `Prize: ${raffle.prize}`.slice(0, 100) }))); await interaction.reply({ content: "🔮 **End a Giveaway**\nChoose the active ritual you want to conclude. The winner will be chosen from the entries.", components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)], ephemeral: true }); }
async function endRaffleForCouncil(interaction: StringSelectMenuInteraction, raffleId: string) {
  const raffle = await raffleStore.getById(raffleId); if (!raffle || raffle.guildId !== interaction.guildId || raffle.ended || raffle.endsAt <= Date.now()) { await interaction.update({ content: "❌ That giveaway is no longer active.", components: [] }); return; }
  const entries = raffle.entries ?? []; const winnerId = raffle.winnerId ?? (entries.length ? entries[Math.floor(Math.random() * entries.length)] : null); if (winnerId) { raffle.winnerId = winnerId; await raffleStore.save(raffle); }
  try {
    const announcementChannel = await interaction.client.channels.fetch(raffle.channelId); if (!announcementChannel || !("send" in announcementChannel) || typeof announcementChannel.send !== "function") throw new Error("Raffle announcement channel is unavailable.");
    const grandEmbed = new EmbedBuilder().setColor(0xFF4500).setTitle("✨ A Champion Has Been Chosen ✨").setDescription(winnerId ? "The sigils have chosen their champion." : "The ritual concludes with no champion.").addFields({ name: "👑 Winner", value: winnerId ? `<@${winnerId}>` : "No entries", inline: false }, { name: "🎁 Prize", value: `**${raffle.prize}**`, inline: false }, { name: "💠 Entries", value: `${entries.length}`, inline: true }).setFooter({ text: "Wizards of Ark • Ascension Complete" }).setTimestamp();
    const attachment = new AttachmentBuilder("./assets/woa_winner_bg.png", { name: "woa_winner_bg.png" }); await announcementChannel.send({ embeds: [grandEmbed], files: [attachment], allowedMentions: { users: winnerId ? [winnerId] : [] } });
    await closeRaffleThread(interaction.client, raffle); const messageChannel = await interaction.client.channels.fetch(getRaffleMessageChannelId(raffle)).catch(() => null); if (messageChannel && "messages" in messageChannel && raffle.messageId) { const message = await messageChannel.messages.fetch(raffle.messageId).catch(() => null); if (message) await message.edit({ components: [] }).catch(() => undefined); }
    await raffleStore.end(raffle.id); await interaction.update({ content: winnerId ? `🔮 Giveaway ended. Winner: <@${winnerId}>` : "🔮 Giveaway ended with no entries.", components: [] });
  } catch (error) { console.error("Council raffle end failed:", error); await interaction.update({ content: "❌ The giveaway could not be safely concluded. It remains active for a retry.", components: [] }); }
}
async function startBountyModal(interaction: ButtonInteraction) { const roleMenu = new RoleSelectMenuBuilder().setCustomId(`${COUNCIL_PREFIX}:bounty:role`).setPlaceholder("Choose the role to notify for this Hunt").setMinValues(1).setMaxValues(1); await interaction.reply({ content: "🔔 Choose the Discord role to notify for this bounty.", components: [new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(roleMenu)], ephemeral: true }); }
function inputRow(id: string, label: string, placeholder: string, style: TextInputStyle, required = true) { return new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId(id).setLabel(label).setPlaceholder(placeholder).setStyle(style).setRequired(required)); }
async function showEconomy(interaction: ButtonInteraction) { const users = await discordDirectoryService.listMembers(interaction.guildId ?? ""); const active = users.filter(user => user.joinedAt).length; await interaction.update({ embeds: [new EmbedBuilder().setTitle("💎 Economy").setDescription(`Active member records: **${active}**\n\nUse the control below to assign or remove Sigils.`)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("💎 Assign / Remove Sigils", `${COUNCIL_PREFIX}:economy:assign`)), backButtonRow()] }); }
async function showRaffles(interaction: ButtonInteraction) { const raffles = (await raffleStore.all()).filter(raffle => raffle.guildId === interaction.guildId && !raffle.ended && raffle.endsAt > Date.now()); const description = raffles.length ? raffles.slice(0, 10).map(raffle => `🎟️ **${raffle.name}** — ${raffle.prize}\nEnds <t:${Math.floor(raffle.endsAt / 1000)}:R> • **${raffle.entries.length} entries**`).join("\n\n") : "No active community giveaways."; await interaction.update({ embeds: [new EmbedBuilder().setTitle("🎟️ Raffles").setDescription(description)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("✨ Start Giveaway", `${COUNCIL_PREFIX}:raffles:start`), button("🛑 End Giveaway", `${COUNCIL_PREFIX}:raffles:end`, ButtonStyle.Danger)), backButtonRow()] }); }
async function showEvents(interaction: ButtonInteraction) { const events = await getUpcomingEvents(interaction.guildId ?? "", 10); const description = events.length ? events.map(event => `🏆 **${event.title}** — <t:${event.startAtUnix}:F>\n${event.description}\nRSVP: ${getEventRsvpSummary(event).going} going${event.notes ? `\n📝 ${event.notes}` : ""}`).join("\n\n") : "No upcoming events."; await interaction.update({ embeds: [new EmbedBuilder().setTitle("🏆 Events").setDescription(description.slice(0, 4000))], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("✨ Start Event", `${COUNCIL_PREFIX}:events:start`)), backButtonRow()] }); }
async function showBounties(interaction: ButtonInteraction) { const bounties = await bountyStore.getActive(interaction.guildId ?? ""); const description = bounties.length ? bounties.map(bounty => `📜 **${bounty.dinos.join(", ")}** — ${bounty.stats.join(", ")} ▸ 40–50`).join("\n") : "No active bounties."; await interaction.update({ embeds: [new EmbedBuilder().setTitle("📜 Bounties").setDescription(description)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("✨ Start Bounty", `${COUNCIL_PREFIX}:bounties:start`)), backButtonRow()] }); }
async function showRewards(interaction: ButtonInteraction) { const activeRaffles = (await raffleStore.all()).filter(raffle => raffle.guildId === interaction.guildId && Date.now() < raffle.endsAt && !raffle.ended); const user = await sigilStore.getUser(interaction.guildId ?? "", interaction.user.id); const components = buildShopComponents(activeRaffles); components.push(backButtonRow() as never); const activeText = activeRaffles.length ? activeRaffles.slice(0, 10).map(raffle => `🎟️ **${raffle.name}** — ${raffle.prize} • Ends <t:${Math.floor(raffle.endsAt / 1000)}:R>`).join("\n") : "No active community giveaway is available for redemption right now."; const embed = new EmbedBuilder().setTitle("🛍️ Sigil Shop").setDescription(["Trade your Sigils for community giveaway entries.", `Exchange rate: **${SIGILS_PER_RAFFLE_ENTRY} sigils = 1 raffle entry**.`, `Current balance: **${user.balance} sigils**.`].join("\n")).addFields({ name: "🎟️ Active Giveaways", value: activeText, inline: false }).setTimestamp(); await interaction.update({ embeds: [embed], components }); }
async function showStatistics(interaction: ButtonInteraction) { const users = await discordDirectoryService.listMembers(interaction.guildId ?? ""); const activeRaffles = (await raffleStore.all()).filter(raffle => raffle.guildId === interaction.guildId && !raffle.ended && raffle.endsAt > Date.now()).length; const activeBounties = (await bountyStore.getActive(interaction.guildId ?? "")).length; const events = await getUpcomingEvents(interaction.guildId ?? "", 1000); await interaction.update({ embeds: [new EmbedBuilder().setTitle("📊 Statistics").addFields({ name: "Members", value: `${users.length}`, inline: true }, { name: "Active giveaways", value: `${activeRaffles}`, inline: true }, { name: "Active bounties", value: `${activeBounties}`, inline: true }, { name: "Upcoming events", value: `${events.length}`, inline: true })], components: [backButtonRow()] }); }
async function showConfiguration(interaction: ButtonInteraction) { await interaction.update({ embeds: [new EmbedBuilder().setTitle("⚙️ Configuration").setDescription(`Default event timezone: **${env.defaultEventTimezone}**\nGiveaway threads: **${env.raffleThreadsEnabled ? "enabled" : "disabled"}**\nThread archive: **${env.raffleThreadAutoArchiveMinutes} minutes**`)], components: [backButtonRow()] }); }
function backButton() { return button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary); }
function backButtonRow() { return new ActionRowBuilder<ButtonBuilder>().addComponents(backButton()); }
function backRow() { return backButtonRow(); }
function button(label: string, customId: string, style = ButtonStyle.Primary) { return new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style); }
