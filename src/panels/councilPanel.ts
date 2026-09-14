import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  type ButtonInteraction,
  type Interaction
} from "discord.js";
import { env } from "../config/env.js";
import { raffleStore } from "../raffleStore.js";
import { sigilStore } from "../sigilStore.js";
import { buildShopComponents, buildShopEmbed } from "../sigilUtils.js";
import { bountyStore } from "../utils/bountyStore.js";
import { getEventRsvpSummary, getUpcomingEvents } from "../services/eventService.js";
import { discordDirectoryService } from "../services/discordDirectoryService.js";

export const COUNCIL_PREFIX = "woa:council";

export function isCouncilMember(interaction: Interaction) {
  if (!interaction.inGuild() || !interaction.member) return false;
  const member = interaction.member;
  const permissions = member.permissions;
  if (permissions instanceof PermissionsBitField && permissions.has(PermissionFlagsBits.Administrator)) return true;
  if (env.councilRoleIds.length === 0 || !("roles" in member)) return false;
  const roleIds = Array.isArray(member.roles) ? member.roles : member.roles.cache.keys();
  return Array.from(roleIds).some(roleId => env.councilRoleIds.includes(roleId));
}

export function buildCouncilPanel() {
  const embed = new EmbedBuilder()
    .setTitle("🏛️ THE HIGH COUNCIL")
    .setDescription("Welcome, Council.\n\nThis is the WoA staff command center. Every system is organized behind this panel so staff do not need a command list.")
    .addFields(
      { name: "💎 Economy", value: "Sigils and economy overview", inline: true },
      { name: "🎟️ Raffles", value: "Active community giveaways", inline: true },
      { name: "🏆 Events", value: "Upcoming events and RSVPs", inline: true },
      { name: "📜 Bounties", value: "Active weekly hunts", inline: true },
      { name: "🎁 Rewards", value: "Reward shop and prizes", inline: true },
      { name: "👥 Members", value: "Council and member directory", inline: true },
      { name: "📊 Statistics", value: "Realm activity and counts", inline: true },
      { name: "⚙️ Configuration", value: "Runtime configuration status", inline: true }
    )
    .setFooter({ text: "The Wizards of Ark • High Council" });

  return {
    embeds: [embed],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        button("💎 Economy", `${COUNCIL_PREFIX}:economy`),
        button("🎟️ Raffles", `${COUNCIL_PREFIX}:raffles`),
        button("🏆 Events", `${COUNCIL_PREFIX}:events`),
        button("📜 Bounties", `${COUNCIL_PREFIX}:bounties`)
      ),
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        button("🎁 Rewards", `${COUNCIL_PREFIX}:rewards`),
        button("👥 Members", `${COUNCIL_PREFIX}:members`),
        button("📊 Statistics", `${COUNCIL_PREFIX}:statistics`),
        button("⚙️ Configuration", `${COUNCIL_PREFIX}:configuration`)
      )
    ]
  };
}

export async function handleCouncilPanel(interaction: Interaction) {
  if (!interaction.isButton() || !interaction.customId.startsWith(`${COUNCIL_PREFIX}:`)) return false;
  const buttonInteraction = interaction as ButtonInteraction;
  if (!isCouncilMember(buttonInteraction)) {
    await buttonInteraction.reply({ content: "⛔ Only the High Council may use this panel.", ephemeral: true });
    return true;
  }

  const section = buttonInteraction.customId.slice(`${COUNCIL_PREFIX}:`.length);
  if (section === "home") await buttonInteraction.update(buildCouncilPanel());
  else if (section === "economy") await showEconomy(buttonInteraction);
  else if (section === "raffles") await showRaffles(buttonInteraction);
  else if (section === "events") await showEvents(buttonInteraction);
  else if (section === "bounties") await showBounties(buttonInteraction);
  else if (section === "rewards") await showRewards(buttonInteraction);
  else if (section === "members") await showMembers(buttonInteraction);
  else if (section === "statistics") await showStatistics(buttonInteraction);
  else if (section === "configuration") await showConfiguration(buttonInteraction);
  else await buttonInteraction.update({ embeds: [new EmbedBuilder().setTitle("🏛️ Council").setDescription("Unknown Council panel.")], components: [backRow()] });
  return true;
}

async function showEconomy(interaction: ButtonInteraction) {
  const stats = await sigilStore.getGuildStats(interaction.guild!.id);
  const activeRaffles = await getActiveRaffles(interaction.guild!.id);
  const activeBounties = await bountyStore.getActive(interaction.guild!.id);
  const events = await getUpcomingEvents(interaction.guild!.id, 10);
  const embed = new EmbedBuilder()
    .setTitle("💎 SIGIL ECONOMY")
    .setDescription("Live economy overview for the High Council.")
    .addFields(
      { name: "👥 Sigil Bearers", value: `${stats.totalUsers}`, inline: true },
      { name: "💠 In Circulation", value: `${stats.totalBalance}`, inline: true },
      { name: "✨ Total Awarded", value: `${stats.totalAwarded}`, inline: true },
      { name: "🜂 Total Removed", value: `${stats.totalRemoved}`, inline: true },
      { name: "🎫 Redeemed", value: `${stats.totalRedeemed}`, inline: true },
      { name: "📚 Ledger Entries", value: `${stats.totalTransactions}`, inline: true },
      { name: "🎟️ Active Giveaways", value: `${activeRaffles.length}`, inline: true },
      { name: "📜 Active Bounties", value: `${activeBounties.length}`, inline: true },
      { name: "🏆 Upcoming Events", value: `${events.length}`, inline: true }
    )
    .setFooter({ text: "The Wizards of Ark • Council Economy" });
  await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🎟️ Giveaways", `${COUNCIL_PREFIX}:raffles`), button("📊 Statistics", `${COUNCIL_PREFIX}:statistics`), button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showRaffles(interaction: ButtonInteraction) {
  const raffles = await getActiveRaffles(interaction.guild!.id);
  const embed = new EmbedBuilder().setTitle("🎟️ COMMUNITY GIVEAWAY CONTROL").setFooter({ text: "The Wizards of Ark • Council Giveaways" });
  embed.setDescription(raffles.length ? raffles.map((raffle, index) => `**${index + 1}. ${raffle.name || "Unnamed Giveaway"}**\n🎁 ${raffle.prize}\n👥 ${raffle.entries.length} entries\n⏳ Ends <t:${Math.floor(raffle.endsAt / 1000)}:R>`).join("\n\n") : "No active community giveaways are currently running.");
  await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("💎 Economy", `${COUNCIL_PREFIX}:economy`), button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showEvents(interaction: ButtonInteraction) {
  const events = await getUpcomingEvents(interaction.guild!.id, 10);
  const embed = new EmbedBuilder().setTitle("🏆 EVENT CONTROL").setFooter({ text: "The Wizards of Ark • Council Events" });
  if (events.length === 0) {
    embed.setDescription("No upcoming events are currently recorded.");
  } else {
    embed.setDescription(events.map((event, index) => {
      const summary = getEventRsvpSummary(event);
      return `**${index + 1}. ${event.title}**\n🗓️ <t:${event.startAtUnix}:F>\n👥 ${summary.going} going • ${summary.maybe} maybe • ${summary.no} unavailable\n👤 Host: <@${event.hostId}>`;
    }).join("\n\n").slice(0, 4000));
  }
  await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🔄 Refresh", `${COUNCIL_PREFIX}:events`), button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showBounties(interaction: ButtonInteraction) {
  const bounties = await bountyStore.getActive(interaction.guild!.id);
  const embed = new EmbedBuilder().setTitle("📜 BOUNTY CONTROL").setFooter({ text: "The Wizards of Ark • Council Bounties" });
  embed.setDescription(bounties.length ? bounties.map((bounty, index) => {
    const targets = bounty.dinos.map((dino, i) => `• **${dino}** — ${bounty.stats[i] ?? "Any stat"} ▸ 40–50`).join("\n");
    return `**${index + 1}. Weekly Hunt**\n${targets}${bounty.bonus ? `\n⚡ Bonus: ${bounty.bonus}` : ""}\n🗓️ Posted <t:${Math.floor(bounty.createdAt / 1000)}:R>`;
  }).join("\n\n") : "No active bounties are currently posted.");
  await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🔄 Refresh", `${COUNCIL_PREFIX}:bounties`), button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showRewards(interaction: ButtonInteraction) {
  const activeRaffles = await getActiveRaffles(interaction.guild!.id);
  const balance = await sigilStore.getBalance(interaction.guild!.id, interaction.user.id);
  await interaction.update({ embeds: [buildShopEmbed(activeRaffles, balance)], components: [...buildShopComponents(activeRaffles.length === 0), backRow()] });
}

async function showMembers(interaction: ButtonInteraction) {
  const guild = interaction.guild!;
  const councilMembers = await discordDirectoryService.listCouncilMembers(guild.id);
  const regularMembers = guild.members.cache.filter(member => !member.user.bot).size;
  const bots = guild.members.cache.filter(member => member.user.bot).size;
  const councilText = councilMembers.length ? councilMembers.slice(0, 25).map(member => `• **${member.displayName}** — <@${member.discordUserId}>`).join("\n") : "No Council members are configured.";
  const embed = new EmbedBuilder()
    .setTitle("👥 MEMBER HALL")
    .setDescription(`**Cached Members:** ${regularMembers}\n**Cached Bots:** ${bots}\n**Configured Council:** ${councilMembers.length}\n\n### High Council\n${councilText}`)
    .setFooter({ text: "The Wizards of Ark • Member Directory" });
  await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🔄 Refresh", `${COUNCIL_PREFIX}:members`), button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showStatistics(interaction: ButtonInteraction) {
  const guild = interaction.guild!;
  const sigils = await sigilStore.getGuildStats(guild.id);
  const raffles = await getActiveRaffles(guild.id);
  const bounties = await bountyStore.getActive(guild.id);
  const events = await getUpcomingEvents(guild.id, 50);
  const members = guild.members.cache;
  const embed = new EmbedBuilder()
    .setTitle("📊 REALM STATISTICS")
    .setDescription("Current operational snapshot for the High Council.")
    .addFields(
      { name: "👥 Server Members", value: `${guild.memberCount}`, inline: true },
      { name: "🤖 Bots", value: `${members.filter(member => member.user.bot).size}`, inline: true },
      { name: "💎 Sigil Bearers", value: `${sigils.totalUsers}`, inline: true },
      { name: "💠 Sigils in Circulation", value: `${sigils.totalBalance}`, inline: true },
      { name: "✨ Sigils Awarded", value: `${sigils.totalAwarded}`, inline: true },
      { name: "🜂 Sigils Removed", value: `${sigils.totalRemoved}`, inline: true },
      { name: "📚 Transactions", value: `${sigils.totalTransactions}`, inline: true },
      { name: "🎟️ Active Giveaways", value: `${raffles.length}`, inline: true },
      { name: "📜 Active Bounties", value: `${bounties.length}`, inline: true },
      { name: "🏆 Upcoming Events", value: `${events.length}`, inline: true }
    )
    .setFooter({ text: "The Wizards of Ark • Realm Statistics" });
  await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🔄 Refresh", `${COUNCIL_PREFIX}:statistics`), button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showConfiguration(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder()
    .setTitle("⚙️ REALM CONFIGURATION")
    .setDescription("Runtime configuration currently loaded by the bot. Secrets are intentionally never displayed.")
    .addFields(
      { name: "🏛️ Council Roles", value: env.councilRoleIds.length ? env.councilRoleIds.map(id => `<@&${id}>`).join(" ") : "None configured", inline: false },
      { name: "🌎 Default Event Timezone", value: env.defaultEventTimezone, inline: true },
      { name: "🧵 Giveaway Threads", value: env.raffleThreadsEnabled ? "Enabled" : "Disabled", inline: true },
      { name: "📦 Thread Archive", value: `${env.raffleThreadAutoArchiveMinutes} minutes`, inline: true },
      { name: "🌌 Astral Channel", value: env.astralChannelId ? `<#${env.astralChannelId}>` : "Not configured", inline: true },
      { name: "🌐 API", value: `${env.apiHost}:${env.apiPort}`, inline: true },
      { name: "🏰 Allowed Guilds", value: `${env.allowedGuildIds.length}`, inline: true }
    )
    .setFooter({ text: "The Wizards of Ark • Configuration" });
  await interaction.update({ embeds: [embed], components: [backRow()] });
}

async function getActiveRaffles(guildId: string) {
  return (await raffleStore.all()).filter(raffle => raffle.guildId === guildId && !raffle.ended && raffle.endsAt > Date.now());
}

function backRow() {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary));
}

function button(label: string, customId: string, style = ButtonStyle.Primary) {
  return new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
}
