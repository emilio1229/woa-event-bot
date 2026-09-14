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
    .setDescription("Welcome, Council.\n\nThis is the WoA staff command center. Select a system to manage it. Access is controlled by Council roles and Discord permissions.")
    .addFields(
      { name: "💎 Economy", value: "Sigils, rewards & economy controls", inline: true },
      { name: "🎟️ Raffles", value: "Create, manage & end raffles", inline: true },
      { name: "🏆 Events", value: "Create and manage events", inline: true },
      { name: "📜 Bounties", value: "Create and manage bounties", inline: true },
      { name: "🎁 Rewards", value: "Manage available rewards", inline: true },
      { name: "👥 Members", value: "Member and activity tools", inline: true },
      { name: "📊 Statistics", value: "Realm and economy statistics", inline: true },
      { name: "⚙️ Configuration", value: "Bot and Realm configuration", inline: true }
    )
    .setFooter({ text: "The Wizards of Ark • High Council" });
  const rows = [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      button("💎 Economy", `${COUNCIL_PREFIX}:economy`), button("🎟️ Raffles", `${COUNCIL_PREFIX}:raffles`), button("🏆 Events", `${COUNCIL_PREFIX}:events`), button("📜 Bounties", `${COUNCIL_PREFIX}:bounties`)
    ),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      button("🎁 Rewards", `${COUNCIL_PREFIX}:rewards`), button("👥 Members", `${COUNCIL_PREFIX}:members`), button("📊 Statistics", `${COUNCIL_PREFIX}:statistics`), button("⚙️ Configuration", `${COUNCIL_PREFIX}:configuration`)
    )
  ];
  return { embeds: [embed], components: rows };
}

export async function handleCouncilPanel(interaction: Interaction) {
  if (!interaction.isButton() || !interaction.customId.startsWith(`${COUNCIL_PREFIX}:`)) return false;
  const buttonInteraction = interaction as ButtonInteraction;
  if (!isCouncilMember(buttonInteraction)) {
    await buttonInteraction.reply({ content: "⛔ Only the High Council may use this panel.", ephemeral: true });
    return true;
  }
  const section = buttonInteraction.customId.slice(`${COUNCIL_PREFIX}:`.length);
  if (section === "home") {
    await buttonInteraction.update(buildCouncilPanel());
    return true;
  }
  if (section === "economy" || section === "statistics") {
    await showEconomy(buttonInteraction);
    return true;
  }
  if (section === "raffles") {
    await showRaffles(buttonInteraction);
    return true;
  }
  if (section === "rewards") {
    await showRewards(buttonInteraction);
    return true;
  }

  const names: Record<string, string> = {
    events: "🏆 Events", bounties: "📜 Bounties", members: "👥 Members", configuration: "⚙️ Configuration"
  };
  const embed = new EmbedBuilder()
    .setTitle(names[section] ?? "🏛️ Council")
    .setDescription(`The ${names[section] ?? "selected Council"} panel is ready.\n\nExisting WoA functionality will be connected here as the restructure continues.`)
    .setFooter({ text: "The Wizards of Ark • High Council" });
  await buttonInteraction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Back to Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
  return true;
}

async function showEconomy(interaction: ButtonInteraction) {
  if (!interaction.inGuild() || !interaction.guild) return;
  const stats = await sigilStore.getGuildStats(interaction.guild.id);
  const activeRaffles = (await raffleStore.all()).filter(raffle => raffle.guildId === interaction.guild!.id && !raffle.ended && raffle.endsAt > Date.now());
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
      { name: "🎟️ Active Raffles", value: `${activeRaffles.length}`, inline: true }
    )
    .setFooter({ text: "The Wizards of Ark • Council Economy" });
  await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🎟️ Raffles", `${COUNCIL_PREFIX}:raffles`), button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showRaffles(interaction: ButtonInteraction) {
  if (!interaction.inGuild() || !interaction.guild) return;
  const raffles = (await raffleStore.all()).filter(raffle => raffle.guildId === interaction.guild!.id && !raffle.ended && raffle.endsAt > Date.now());
  const embed = new EmbedBuilder().setTitle("🎟️ RAFFLE CONTROL").setFooter({ text: "The Wizards of Ark • Council Raffles" });
  embed.setDescription(raffles.length ? raffles.slice(0, 10).map((raffle, index) => `**${index + 1}. ${raffle.name || "Unnamed Raffle"}**\n🎁 ${raffle.prize}\n🎟️ ${raffle.entries.length} entries\n⏳ Ends <t:${Math.floor(raffle.endsAt / 1000)}:R>`).join("\n\n") : "No active raffles are currently running.");
  await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("💎 Economy", `${COUNCIL_PREFIX}:economy`), button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showRewards(interaction: ButtonInteraction) {
  if (!interaction.inGuild() || !interaction.guild) return;
  const activeRaffles = (await raffleStore.all()).filter(raffle => raffle.guildId === interaction.guild!.id && Date.now() < raffle.endsAt && !raffle.ended);
  const balance = await sigilStore.getBalance(interaction.guild.id, interaction.user.id);
  await interaction.update({
    embeds: [buildShopEmbed(activeRaffles, balance)],
    components: [...buildShopComponents(activeRaffles.length === 0), new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))]
  });
}
