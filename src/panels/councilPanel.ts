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
  type UserSelectMenuInteraction
} from "discord.js";
import { env } from "../config/env.js";
import { raffleStore } from "../raffleStore.js";
import { sigilStore, SIGILS_PER_RAFFLE_ENTRY } from "../sigilStore.js";
import { buildActiveRaffleEmbed } from "../embedBuilder.js";
import { buildBalanceEmbed, buildShopComponents, buildShopEmbed } from "../sigilUtils.js";
import { bountyStore, bountyWeeklyImage } from "../utils/bountyStore.js";
import { parseTime } from "../utils/timeParser.js";
import { getTimezoneForLocale } from "../utils/localeTimezone.js";
import { attachEventMessageId, createEvent, getEventRsvpSummary, getUpcomingEvents } from "../services/eventService.js";
import { buildEventEmbed } from "../ui/eventEmbed.js";
import { buildEventRsvpButtons } from "../interactions/buttons/shared.js";
import { createRaffleThreadFromMessage } from "../services/raffleThreadService.js";

export const COUNCIL_PREFIX = "woa:council";
const BOUNTY_STATS = ["Health", "Stamina", "Oxygen", "Food", "Weight", "Melee", "Movement Speed"] as const;

const button = (label: string, customId: string, style = ButtonStyle.Secondary) => new ButtonBuilder().setLabel(label).setCustomId(customId).setStyle(style);
const inputRow = (id: string, label: string, placeholder: string, style: TextInputStyle = TextInputStyle.Short, required = true) => new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId(id).setLabel(label).setPlaceholder(placeholder).setStyle(style).setRequired(required));

interface BountyDraft { guildId: string; roleId: string; dinos: string[]; bonus?: string | null; stats: string[]; }
const bountyDrafts = new Map<string, BountyDraft>();

export function buildCouncilPanel() {
  const embed = new EmbedBuilder().setColor(0x6A0DAD).setTitle("🧙 THE HIGH COUNCIL").setDescription("Administrative spellbook for The Wizards of Ark.").addFields(
    { name: "💠 Economy", value: "Sigils, rewards & ledgers", inline: true },
    { name: "🎟️ Raffles", value: "Create, inspect & end giveaways", inline: true },
    { name: "🏆 Events", value: "Schedule community events", inline: true },
    { name: "📜 Bounties", value: "Forge the weekly hunt", inline: true },
    { name: "🎁 Rewards", value: "Manage Sigil Shop", inline: true },
    { name: "📊 Statistics", value: "Realm activity overview", inline: true },
    { name: "⚙️ Configuration", value: "Bot settings", inline: true }
  );
  return { embeds: [embed], components: [
    new ActionRowBuilder<ButtonBuilder>().addComponents(button("💠 Economy", `${COUNCIL_PREFIX}:economy`), button("🎟️ Raffles", `${COUNCIL_PREFIX}:raffles`), button("🏆 Events", `${COUNCIL_PREFIX}:events`), button("📜 Bounties", `${COUNCIL_PREFIX}:bounties`)),
    new ActionRowBuilder<ButtonBuilder>().addComponents(button("🎁 Rewards", `${COUNCIL_PREFIX}:rewards`), button("📊 Statistics", `${COUNCIL_PREFIX}:statistics`), button("⚙️ Configuration", `${COUNCIL_PREFIX}:configuration`))
  ] };
}

export async function handleCouncilPanel(interaction: Interaction): Promise<boolean> {
  if (!interaction.isButton() && !interaction.isUserSelectMenu() && !interaction.isRoleSelectMenu() && !interaction.isModalSubmit() && !interaction.isStringSelectMenu()) return false;
  const id = interaction.customId;
  if (!id.startsWith(`${COUNCIL_PREFIX}:`) && !["select_end_raffle", "select_status_raffle"].includes(id)) return false;
  if (interaction.isStringSelectMenu()) return false;
  if (!interaction.isButton()) return false;
  if (!interaction.inGuild() || !interaction.guild) { await interaction.reply({ content: "❌ This council panel only works in a server.", ephemeral: true }); return true; }
  const section = id.slice(`${COUNCIL_PREFIX}:`.length);
  if (section === "home") await interaction.update(buildCouncilPanel());
  else if (section === "economy") await showEconomy(interaction);
  else if (section === "raffles") await showRaffles(interaction);
  else if (section === "events") await showEvents(interaction);
  else if (section === "bounties") await showBounties(interaction);
  else if (section === "rewards") await showRewards(interaction);
  else if (section === "statistics") await showStatistics(interaction);
  else if (section === "configuration") await showConfiguration(interaction);
  else if (section === "start-raffle") await showStartRaffle(interaction);
  else if (section === "start-event") await showStartEvent(interaction);
  else if (section === "start-bounty") await showStartBounty(interaction);
  else if (section === "randomize-bounty") await randomizeAndPostBounty(interaction, interaction.user.id);
  else if (section === "back") await interaction.update(buildCouncilPanel());
  else if (section === "bounty-post") await postBounty(interaction, interaction.user.id);
  return true;
}

async function showEconomy(interaction: ButtonInteraction) {
  const stats = await sigilStore.getGuildStats(interaction.guild!.id);
  const raffles = await raffleStore.getActiveAll(interaction.guild!.id);
  await interaction.update({ embeds: [buildBalanceEmbed(interaction.user, stats.totalBalance, [], "💠 Council Economy", `**${stats.totalUsers}** Sigil bearers • **${stats.totalTransactions}** ledger entries`)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🎟️ Active Giveaways", `${COUNCIL_PREFIX}:raffles`), button("🎁 Sigil Shop", `${COUNCIL_PREFIX}:rewards`), button("◀ Council", `${COUNCIL_PREFIX}:home`))] });
  void raffles;
}

async function showRaffles(interaction: ButtonInteraction) {
  const raffles = await raffleStore.getActiveAll(interaction.guild!.id);
  const description = raffles.length ? raffles.map((r, i) => `**${i + 1}. ${r.name}** — ${r.prize}\nEnds <t:${Math.floor(r.endsAt / 1000)}:R> • **${r.entries.length} entries**`).join("\n\n") : "No active community giveaways.";
  const components = [new ActionRowBuilder<ButtonBuilder>().addComponents(button("➕ Start Giveaway", `${COUNCIL_PREFIX}:start-raffle`, ButtonStyle.Success), button("🛑 End Giveaway", `${COUNCIL_PREFIX}:end-raffle`, ButtonStyle.Danger), button("◀ Council", `${COUNCIL_PREFIX}:home`))];
  await interaction.update({ embeds: [new EmbedBuilder().setColor(0x6A0DAD).setTitle("🎟️ GIVEAWAY CHAMBER").setDescription(description)], components });
}

async function showEvents(interaction: ButtonInteraction) {
  const events = await getUpcomingEvents(interaction.guild!.id, 10);
  const description = events.length ? events.map(event => `**${event.title}**\n🗓️ <t:${event.startAtUnix}:F>\n📖 ${event.description}${event.notes ? `\n📝 ${event.notes}` : ""}\n🟢 Going: **${getEventRsvpSummary(event).going}**`).join("\n\n") : "No upcoming events.";
  await interaction.update({ embeds: [new EmbedBuilder().setColor(0x6A0DAD).setTitle("🏆 EVENT HALL").setDescription(description)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("➕ Create Event", `${COUNCIL_PREFIX}:start-event`, ButtonStyle.Success), button("◀ Council", `${COUNCIL_PREFIX}:home`))] });
}

async function showBounties(interaction: ButtonInteraction) {
  const active = await bountyStore.getActive(interaction.guild!.id);
  const text = active.length ? active.map(b => b.dinos.map((d, i) => `• **${d}** — ${b.stats[i] ?? "Any stat"} **40–50**`).join("\n")).join("\n\n") : "No active bounty.";
  await interaction.update({ embeds: [new EmbedBuilder().setColor(0x6A0DAD).setTitle("📜 BOUNTY FORGE").setDescription(text)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("➕ Start Bounty", `${COUNCIL_PREFIX}:start-bounty`, ButtonStyle.Success), button("◀ Council", `${COUNCIL_PREFIX}:home`))] });
}

async function showRewards(interaction: ButtonInteraction) {
  const activeRaffles = await raffleStore.getActiveAll(interaction.guild!.id);
  const balance = await sigilStore.getBalance(interaction.guild!.id, interaction.user.id);
  await interaction.update({ embeds: [buildShopEmbed(activeRaffles, balance)], components: [...buildShopComponents(activeRaffles), new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Council", `${COUNCIL_PREFIX}:home`))] });
}

async function showStatistics(interaction: ButtonInteraction) {
  const raffles = await raffleStore.getActiveAll(interaction.guild!.id);
  const bounties = await bountyStore.getActive(interaction.guild!.id);
  const events = await getUpcomingEvents(interaction.guild!.id, 50);
  await interaction.update({ embeds: [new EmbedBuilder().setColor(0x6A0DAD).setTitle("📊 REALM STATISTICS").addFields(
    { name: "🎟️ Active Giveaways", value: `${raffles.length}`, inline: true },
    { name: "📜 Active Bounties", value: `${bounties.length}`, inline: true },
    { name: "🏆 Upcoming Events", value: `${events.length}`, inline: true }
  )], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Council", `${COUNCIL_PREFIX}:home`))] });
}

async function showConfiguration(interaction: ButtonInteraction) {
  await interaction.update({ embeds: [new EmbedBuilder().setColor(0x6A0DAD).setTitle("⚙️ COUNCIL CONFIGURATION").setDescription(`Default event timezone: **${env.defaultEventTimezone}**\nGiveaway threads: **${env.raffleThreadsEnabled ? "Enabled" : "Disabled"}**\nThread archive: **${env.raffleThreadAutoArchiveMinutes} minutes**`)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Council", `${COUNCIL_PREFIX}:home`))] });
}

async function showStartRaffle(interaction: ButtonInteraction) { await interaction.showModal(buildRaffleModal()); }
async function showStartEvent(interaction: ButtonInteraction) { await interaction.showModal(buildEventModal(null)); }
async function showStartBounty(interaction: ButtonInteraction) { await interaction.showModal(buildBountyModal()); }

function buildRaffleModal() { const modal = new ModalBuilder().setCustomId(`${COUNCIL_PREFIX}:raffle:modal`).setTitle("Start WoA Giveaway"); modal.addComponents(inputRow("name", "Giveaway name", "Server Member Giveaway"), inputRow("prize", "Prize", "Super Variant Ferox"), inputRow("duration", "Duration", "2h / 1d / 30m"), inputRow("invocation", "Announcement", "The circle opens...", TextInputStyle.Paragraph)); return modal; }
function buildEventModal(roleId: string | null) { const modal = new ModalBuilder().setCustomId(`${COUNCIL_PREFIX}:event:modal:${roleId ?? "none"}`).setTitle("Create WoA Event"); modal.addComponents(inputRow("title", "Event title", "Shoulder Pet Battle"), inputRow("time", "Start time", "Friday 7pm or tomorrow 6pm"), inputRow("description", "Description", "What is happening and what players should know", TextInputStyle.Paragraph), inputRow("notes", "Notes (optional)", "Extra instructions", TextInputStyle.Paragraph, false)); return modal; }
function buildBountyModal() { const modal = new ModalBuilder().setCustomId(`${COUNCIL_PREFIX}:bounty:modal`).setTitle("Forge Weekly Hunt"); modal.addComponents(inputRow("dinos", "Creatures", "Carcha, Rex, Therizino, Yutyrannus", TextInputStyle.Paragraph), inputRow("bonus", "Bonus (optional)", "Extra reward", TextInputStyle.Paragraph, false)); return modal; }

async function postBounty(interaction: ButtonInteraction, userId: string) {
  const draft = bountyDrafts.get(userId); if (!draft) { await interaction.reply({ content: "❌ That bounty draft has expired.", ephemeral: true }); return; }
  if (!interaction.channel?.isSendable()) { await interaction.reply({ content: "❌ This channel cannot receive the bounty announcement.", ephemeral: true }); return; }
  const record = await bountyStore.create({ guildId: draft.guildId, channelId: interaction.channelId, tagRoleId: draft.roleId, dinos: draft.dinos, stats: draft.stats, bonus: draft.bonus ?? null, active: true });
  const targets = draft.dinos.map((dino, index) => `• **${dino}** — **${draft.stats[index] ?? "Random"} 40–50**`).join("\n");
  const attachment = new AttachmentBuilder(bountyWeeklyImage, { name: "bounty.png" });
  const ritual = ["**🜁 THE RITUAL OF THE HUNT**", "", "Every offering must satisfy the ancient rules of the Hunt:", "• Creature must spawn at the **server’s max wild level**", "• **Perfect taming effectiveness** is required", "• Final tame level must fall within the **perfect-tame range (202–224)**", "• Screenshot the stat page showing the final level", "• Cryopod the creature before submission", "• Open a **#🎫➖bounty-turn-in-ticket** and present your offering to an admin", "", "**⚔️ TARGETS OF THE WEEK**", targets, "", draft.bonus ? `⚡ **Bonus Bounty:** ${draft.bonus}` : "", "", `🜁 **Summoned Order:** <@&${draft.roleId}>`, "", "The stat target is **40–50** for every offering. Read the ritual carefully before you begin your hunt."].filter(Boolean).join("\n");
  const embed = new EmbedBuilder().setColor("#2b2d31").setImage("attachment://bounty.png").setTitle("🜁 THE WEEKLY HUNT 🜁").setDescription(ritual);
  const message = await interaction.channel.send({ embeds: [embed], files: [attachment], allowedMentions: { roles: [draft.roleId] } });
  await bountyStore.setMessageId(record.id, message.id);
  bountyDrafts.delete(userId);
  await interaction.update({ content: "✅ The Weekly Hunt has been inscribed and posted.", components: [], embeds: [] });
}

async function randomizeAndPostBounty(interaction: ButtonInteraction, userId: string) { const draft = bountyDrafts.get(userId); if (!draft) { await interaction.reply({ content: "❌ That bounty draft has expired.", ephemeral: true }); return; } draft.stats = draft.dinos.map(() => BOUNTY_STATS[Math.floor(Math.random() * BOUNTY_STATS.length)]); await postBounty(interaction, userId); }
