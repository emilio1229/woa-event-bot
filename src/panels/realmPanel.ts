import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  type ButtonInteraction,
  type Interaction
} from "discord.js";
import { raffleStore } from "../raffleStore.js";
import { sigilStore } from "../sigilStore.js";
import { buildShopComponents, buildShopEmbed } from "../sigilUtils.js";
import { bountyStore } from "../utils/bountyStore.js";
import { getUserAchievements } from "../services/achievementService.js";
import { getEventRsvpSummary, getUpcomingEvents, updateEventRsvp } from "../services/eventService.js";

export const REALM_PREFIX = "woa:realm";

export function buildRealmPanel() {
  const embed = new EmbedBuilder().setTitle("🔮 THE REALM OF WIZARDS").setDescription("✨ **Welcome, Wanderer.**\n\nYou have crossed the veil and entered the **Realm of Wizards**, where Sigils are earned, bounties are inscribed, gatherings are summoned, and forgotten magic still stirs beneath the surface.\n\n🔮 **Choose your path below and let the Realm reveal what awaits.**").addFields(
    { name: "💎 Sigils", value: "Consult your sigils, daily blessing & ledger", inline: true },
    { name: "🎟️ Raffles", value: "Discover the rituals currently calling for Wizards", inline: true },
    { name: "📜 Bounties", value: "Seek out the hunts inscribed by the Council", inline: true },
    { name: "🏆 Events", value: "Answer the call of upcoming gatherings", inline: true },
    { name: "🎁 Rewards", value: "Explore what the Realm has placed within reach", inline: true },
    { name: "🏅 Achievements", value: "Record the feats you have carved into WoA", inline: true },
    { name: "📊 Leaderboard", value: "See which Wizards lead the Realm", inline: true },
    { name: "👤 Profile", value: "View your personal arcane record", inline: true }
  ).setFooter({ text: "The Wizards of Ark • The Realm" });
  return { embeds: [embed], components: [
    new ActionRowBuilder<ButtonBuilder>().addComponents(button("💎 Sigils", `${REALM_PREFIX}:sigils`), button("🎟️ Raffles", `${REALM_PREFIX}:raffles`), button("📜 Bounties", `${REALM_PREFIX}:bounties`), button("🏆 Events", `${REALM_PREFIX}:events`)),
    new ActionRowBuilder<ButtonBuilder>().addComponents(button("🎁 Rewards", `${REALM_PREFIX}:rewards`), button("🏅 Achievements", `${REALM_PREFIX}:achievements`), button("📊 Leaderboard", `${REALM_PREFIX}:leaderboard`), button("👤 Profile", `${REALM_PREFIX}:profile`))
  ] };
}

export async function handleRealmPanel(interaction: Interaction) {
  if (!interaction.isButton() || !interaction.customId.startsWith(`${REALM_PREFIX}:`)) return false;
  const buttonInteraction = interaction as ButtonInteraction;
  const section = buttonInteraction.customId.slice(`${REALM_PREFIX}:`.length);
  if (section === "home") { await buttonInteraction.update(buildRealmPanel()); return true; }
  if (!buttonInteraction.inGuild() || !buttonInteraction.guild) { await buttonInteraction.update({ content: "❌ This Realm panel can only be used inside the WoA server.", embeds: [], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🏠 Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary))] }); return true; }
  if (section === "sigils") await showSigils(buttonInteraction);
  else if (section === "sigils:daily") await claimDaily(buttonInteraction);
  else if (section === "sigils:history") await showSigilHistory(buttonInteraction);
  else if (section === "raffles") await showRaffles(buttonInteraction);
  else if (section === "bounties") await showBounties(buttonInteraction);
  else if (section === "events") await showEvents(buttonInteraction);
  else if (section.startsWith("event:")) await handleRealmEventRsvp(buttonInteraction, section.slice("event:".length));
  else if (section === "rewards") await showRewards(buttonInteraction);
  else if (section === "achievements") await showAchievements(buttonInteraction);
  else if (section === "leaderboard") await showLeaderboard(buttonInteraction);
  else if (section === "profile") await showProfile(buttonInteraction);
  else await showUnknown(buttonInteraction, section);
  return true;
}

async function showSigils(interaction: ButtonInteraction, notice?: string) {
  const user = await sigilStore.getUser(interaction.guild!.id, interaction.user.id);
  const stats = await sigilStore.getGuildStats(interaction.guild!.id);
  const history = user.transactions.slice(0, 5).length === 0 ? "No transactions yet." : user.transactions.slice(0, 5).map(tx => `${tx.amount > 0 ? "+" : ""}${tx.amount} — ${tx.reason}`).join("\n");
  const embed = new EmbedBuilder().setTitle("💎 SIGIL CHAMBER").setDescription(`${notice ? `${notice}\n\n` : ""}Your current balance is **${user.balance} Sigils**.`).addFields({ name: "✨ Recent Transactions", value: history.slice(0, 1024) }, { name: "🏛️ Realm Economy", value: `${stats.totalUsers} Wizards • ${stats.totalBalance} Sigils in circulation` }).setFooter({ text: "The Wizards of Ark • Sigil Chamber" });
  await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🎁 Daily +1", `${REALM_PREFIX}:sigils:daily`, ButtonStyle.Success), button("📜 Full History", `${REALM_PREFIX}:sigils:history`), button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function claimDaily(interaction: ButtonInteraction) {
  const guildId = interaction.guild!.id, userId = interaction.user.id, user = await sigilStore.getUser(guildId, userId), now = Date.now(), dayMs = 86400000, lastDaily = user.lastDaily ?? 0;
  if (now - lastDaily < dayMs) { const remaining = dayMs - (now - lastDaily); await showSigils(interaction, `⏳ **Daily Sigil not ready yet.** Come back in **${Math.floor(remaining / 3600000)}h ${Math.floor((remaining % 3600000) / 60000)}m ${Math.floor((remaining % 60000) / 1000)}s**.`); return; }
  await sigilStore.award(guildId, userId, 1, "Daily reward"); await sigilStore.setLastDaily(guildId, userId, now); await showSigils(interaction, "✨ **Daily Sigil claimed!** You received **+1 Sigil**.");
}

async function showSigilHistory(interaction: ButtonInteraction) {
  const transactions = await sigilStore.getTransactions(interaction.guild!.id, interaction.user.id, 10);
  const description = transactions.length === 0 ? "No Sigil transactions yet." : transactions.map((tx, index) => `**${index + 1}.** ${tx.amount > 0 ? "+" : ""}${tx.amount} • ${tx.reason}\n<t:${Math.floor(new Date(tx.timestamp).getTime() / 1000)}:R>`).join("\n\n");
  await interaction.update({ embeds: [new EmbedBuilder().setTitle("📜 SIGIL LEDGER").setDescription(description.slice(0, 4000)).setFooter({ text: "The Wizards of Ark • Your Sigil History" })], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Sigils", `${REALM_PREFIX}:sigils`, ButtonStyle.Secondary), button("🏠 Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showRaffles(interaction: ButtonInteraction) {
  const raffles = (await raffleStore.all()).filter(raffle => raffle.guildId === interaction.guild!.id && !raffle.ended && raffle.endsAt > Date.now());
  const embed = new EmbedBuilder().setTitle("🎟️ ACTIVE COMMUNITY GIVEAWAYS").setFooter({ text: "The Wizards of Ark • Raffle Chamber" });
  const components: ActionRowBuilder<ButtonBuilder>[] = [];
  if (!raffles.length) embed.setDescription("There are no active community giveaways right now. Check back when the Council opens the next one.");
  else {
    embed.setDescription(raffles.slice(0, 10).map((raffle, index) => `**${index + 1}. ${raffle.name || "Unnamed Giveaway"}**\n🎁 ${raffle.prize}\n👥 ${raffle.entries.length} entries • Ends <t:${Math.floor(raffle.endsAt / 1000)}:R>`).join("\n\n"));
    for (const raffle of raffles.slice(0, 5)) if (raffle.messageId) components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setLabel(`🎟️ Open ${raffle.name || "Giveaway"}`.slice(0, 80)).setStyle(ButtonStyle.Link).setURL(`https://discord.com/channels/${raffle.guildId}/${raffle.threadId ?? raffle.channelId}/${raffle.messageId}`)));
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

async function handleRealmEventRsvp(interaction: ButtonInteraction, eventButtonData: string) {
  const [eventId, state] = eventButtonData.split(":");
  if (!eventId || state !== "going") { await interaction.update({ content: "❌ That event RSVP could not be read.", embeds: [], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🏆 Events", `${REALM_PREFIX}:events`), button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary))] }); return; }
  const event = await getUpcomingEvents(interaction.guild!.id, 50).then(events => events.find(candidate => candidate.id === eventId));
  if (!event) { await interaction.update({ content: "❌ That gathering is no longer upcoming.", embeds: [], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🏆 Events", `${REALM_PREFIX}:events`), button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary))] }); return; }
  const updated = await updateEventRsvp(eventId, interaction.user.id, "going");
  if (!updated) { await interaction.update({ content: "❌ That gathering could not be updated.", embeds: [], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🏆 Events", `${REALM_PREFIX}:events`), button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary))] }); return; }
  await showEvents(interaction, `🜂 **RSVP recorded!** You are marked **Going** to **${event.title}**.`);
}

async function showRewards(interaction: ButtonInteraction) {
  const activeRaffles = (await raffleStore.all()).filter(raffle => raffle.guildId === interaction.guild!.id && Date.now() < raffle.endsAt && !raffle.ended);
  const balance = await sigilStore.getBalance(interaction.guild!.id, interaction.user.id);
  const components = buildShopComponents(activeRaffles);
  const activeText = activeRaffles.length ? activeRaffles.slice(0, 10).map(raffle => `🎟️ **${raffle.name}** — ${raffle.prize} • Ends <t:${Math.floor(raffle.endsAt / 1000)}:R>`).join("\n") : "No active community giveaway is available for redemption right now.";
  await interaction.update({ embeds: [buildShopEmbed(activeRaffles, balance).addFields({ name: "🧭 Choose Your Giveaway", value: activeText })], components: [...components, new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showAchievements(interaction: ButtonInteraction) {
  const achievements = await getUserAchievements(interaction.guild!.id, interaction.user.id), unlocked = achievements.filter(achievement => achievement.unlocked).length;
  const description = achievements.map(achievement => `${achievement.unlocked ? "🏅" : "🔒"} **${achievement.icon} ${achievement.name}** — ${achievement.description}${achievement.progress ? `\nProgress: **${achievement.progress}**` : ""}`).join("\n\n");
  await interaction.update({ embeds: [new EmbedBuilder().setTitle("🏅 ACHIEVEMENT HALL").setDescription(`Unlocked: **${unlocked}/${achievements.length}**\n\n${description}`.slice(0, 4000)).setFooter({ text: "The Wizards of Ark • Achievements" })], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("👤 Profile", `${REALM_PREFIX}:profile`), button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showLeaderboard(interaction: ButtonInteraction) {
  const leaderboard = await sigilStore.getLeaderboard(interaction.guild!.id, 10);
  const lines = await Promise.all(leaderboard.map(async (user, index) => { const member = await interaction.guild!.members.fetch(user.userId).catch(() => null); return `**${index + 1}.** ${member?.displayName ?? `<@${user.userId}>`} — **${user.balance} Sigils**`; }));
  await interaction.update({ embeds: [new EmbedBuilder().setTitle("📊 SIGIL LEADERBOARD").setDescription(lines.length ? lines.join("\n") : "No Sigil accounts exist yet.").setFooter({ text: "The Wizards of Ark • Realm Rankings" })], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showProfile(interaction: ButtonInteraction) {
  const user = await sigilStore.getUser(interaction.guild!.id, interaction.user.id), member = await interaction.guild!.members.fetch(interaction.user.id).catch(() => null), dailyReady = !user.lastDaily || Date.now() - user.lastDaily >= 86400000, achievements = await getUserAchievements(interaction.guild!.id, interaction.user.id);
  const embed = new EmbedBuilder().setTitle("👤 WIZARD PROFILE").setDescription(`**${member?.displayName ?? interaction.user.username}**\n<@${interaction.user.id}>`).addFields({ name: "💎 Sigils", value: `${user.balance}`, inline: true }, { name: "📜 Transactions", value: `${user.transactions.length}`, inline: true }, { name: "🏅 Achievements", value: `${achievements.filter(a => a.unlocked).length}/${achievements.length}`, inline: true }, { name: "🎁 Daily Reward", value: dailyReady ? "Ready to claim" : "Already claimed today", inline: true }).setFooter({ text: "The Wizards of Ark • Wizard Profile" });
  await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("💎 Sigils", `${REALM_PREFIX}:sigils`), button("🏅 Achievements", `${REALM_PREFIX}:achievements`), button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showUnknown(interaction: ButtonInteraction, section: string) { await interaction.update({ content: `❌ Unknown Realm section: ${section}`, embeds: [], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🏠 Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary))] }); }

function button(label: string, customId: string, style: ButtonStyle = ButtonStyle.Primary) { return new ButtonBuilder().setLabel(label).setCustomId(customId).setStyle(style); }
