import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type Interaction
} from "discord.js";
import { raffleStore } from "../raffleStore.js";
import { sigilStore } from "../sigilStore.js";

export const REALM_PREFIX = "woa:realm";

export function buildRealmPanel() {
  const embed = new EmbedBuilder()
    .setTitle("🔮 THE REALM OF WIZARDS")
    .setDescription("Welcome, Wizard.\n\nChoose a realm below to explore the WoA community. Your buttons are your spellbook — no command memorization required.")
    .addFields(
      { name: "💎 Sigils", value: "Balance, daily reward & history", inline: true },
      { name: "🎟️ Raffles", value: "View active raffles and entries", inline: true },
      { name: "📜 Bounties", value: "Discover active community bounties", inline: true },
      { name: "🏆 Events", value: "Upcoming events and RSVPs", inline: true },
      { name: "🎁 Rewards", value: "Explore rewards and prizes", inline: true },
      { name: "🏅 Achievements", value: "Track your WoA accomplishments", inline: true },
      { name: "📊 Leaderboard", value: "See the Realm rankings", inline: true },
      { name: "👤 Profile", value: "View your Wizard profile", inline: true }
    )
    .setFooter({ text: "The Wizards of Ark • The Realm" });

  const rows = [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      button("💎 Sigils", `${REALM_PREFIX}:sigils`),
      button("🎟️ Raffles", `${REALM_PREFIX}:raffles`),
      button("📜 Bounties", `${REALM_PREFIX}:bounties`),
      button("🏆 Events", `${REALM_PREFIX}:events`)
    ),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      button("🎁 Rewards", `${REALM_PREFIX}:rewards`),
      button("🏅 Achievements", `${REALM_PREFIX}:achievements`),
      button("📊 Leaderboard", `${REALM_PREFIX}:leaderboard`),
      button("👤 Profile", `${REALM_PREFIX}:profile`)
    )
  ];

  return { embeds: [embed], components: rows };
}

export async function handleRealmPanel(interaction: Interaction) {
  if (!interaction.isButton() || !interaction.customId.startsWith(`${REALM_PREFIX}:`)) return false;

  const section = interaction.customId.slice(`${REALM_PREFIX}:`.length);

  if (section === "home") {
    await interaction.update(buildRealmPanel());
    return true;
  }

  if (!interaction.inGuild() || !interaction.guild) {
    await interaction.reply({ content: "❌ This Realm panel can only be used inside the WoA server.", ephemeral: true });
    return true;
  }

  if (section === "sigils") {
    await showSigils(interaction);
    return true;
  }
  if (section === "sigils:daily") {
    await claimDaily(interaction);
    return true;
  }
  if (section === "sigils:history") {
    await showSigilHistory(interaction);
    return true;
  }
  if (section === "raffles") {
    await showRaffles(interaction);
    return true;
  }

  const names: Record<string, string> = {
    bounties: "📜 Bounties",
    events: "🏆 Events",
    rewards: "🎁 Rewards",
    achievements: "🏅 Achievements",
    leaderboard: "📊 Leaderboard",
    profile: "👤 Profile"
  };

  const embed = new EmbedBuilder()
    .setTitle(names[section] ?? "🔮 Realm")
    .setDescription(`The ${names[section] ?? "selected Realm"} panel is ready.\n\nExisting WoA functionality will be connected here next without exposing additional slash commands.`)
    .setFooter({ text: "The Wizards of Ark • Realm" });

  const back = new ActionRowBuilder<ButtonBuilder>().addComponents(
    button("◀ Back to Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [back] });
  return true;
}

async function showSigils(interaction: Interaction & { isButton(): true }) {
  if (!interaction.inGuild() || !interaction.guild) return;
  const user = await sigilStore.getUser(interaction.guild.id, interaction.user.id);
  const stats = await sigilStore.getGuildStats(interaction.guild.id);
  const transactions = user.transactions.slice(0, 5);
  const history = transactions.length === 0
    ? "No transactions yet."
    : transactions.map(tx => `${tx.amount > 0 ? "+" : ""}${tx.amount} — ${tx.reason}`).join("\n");

  const embed = new EmbedBuilder()
    .setTitle("💎 SIGIL CHAMBER")
    .setDescription(`Your current balance is **${user.balance} Sigils**.`)
    .addFields(
      { name: "✨ Recent Transactions", value: history.slice(0, 1024) },
      { name: "🏛️ Realm Economy", value: `${stats.totalUsers} Wizards • ${stats.totalBalance} Sigils in circulation` }
    )
    .setFooter({ text: "The Wizards of Ark • Sigil Chamber" });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    button("🎁 Daily +1", `${REALM_PREFIX}:sigils:daily`, ButtonStyle.Success),
    button("📜 Full History", `${REALM_PREFIX}:sigils:history`),
    button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary)
  );
  await interaction.update({ embeds: [embed], components: [row] });
}

async function claimDaily(interaction: Interaction & { isButton(): true }) {
  if (!interaction.inGuild() || !interaction.guild) return;
  const guildId = interaction.guild.id;
  const userId = interaction.user.id;
  const user = await sigilStore.getUser(guildId, userId);
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const lastDaily = user.lastDaily ?? 0;

  if (now - lastDaily < dayMs) {
    const remaining = dayMs - (now - lastDaily);
    const hours = Math.floor(remaining / 3_600_000);
    const minutes = Math.floor((remaining % 3_600_000) / 60_000);
    const seconds = Math.floor((remaining % 60_000) / 1_000);
    await interaction.reply({ content: `⏳ Your daily Sigil is not ready yet. Come back in **${hours}h ${minutes}m ${seconds}s**.`, ephemeral: true });
    return;
  }

  await sigilStore.award(guildId, userId, 1, "Daily reward");
  await sigilStore.setLastDaily(guildId, userId, now);
  await interaction.reply({ content: "✨ **Daily Sigil claimed!** You received **+1 Sigil**.", ephemeral: true });
}

async function showSigilHistory(interaction: Interaction & { isButton(): true }) {
  if (!interaction.inGuild() || !interaction.guild) return;
  const transactions = await sigilStore.getTransactions(interaction.guild.id, interaction.user.id, 10);
  const description = transactions.length === 0
    ? "No Sigil transactions yet."
    : transactions.map((tx, index) => `**${index + 1}.** ${tx.amount > 0 ? "+" : ""}${tx.amount} • ${tx.reason}\n<t:${Math.floor(new Date(tx.timestamp).getTime() / 1000)}:R>`).join("\n\n");

  const embed = new EmbedBuilder().setTitle("📜 SIGIL LEDGER").setDescription(description.slice(0, 4000)).setFooter({ text: "The Wizards of Ark • Your Sigil History" });
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    button("◀ Sigils", `${REALM_PREFIX}:sigils`, ButtonStyle.Secondary),
    button("🏠 Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary)
  );
  await interaction.update({ embeds: [embed], components: [row] });
}

async function showRaffles(interaction: Interaction & { isButton(): true }) {
  if (!interaction.inGuild() || !interaction.guild) return;
  const raffles = (await raffleStore.all()).filter(raffle => raffle.guildId === interaction.guild!.id && !raffle.ended && raffle.endsAt > Date.now());
  const embed = new EmbedBuilder().setTitle("🎟️ ACTIVE RITUAL RAFFLES").setFooter({ text: "The Wizards of Ark • Raffle Chamber" });

  if (raffles.length === 0) {
    embed.setDescription("There are no active raffles right now. Check back when the Council opens the next ritual.");
  } else {
    embed.setDescription(raffles.slice(0, 10).map((raffle, index) => `**${index + 1}. ${raffle.name || "Unnamed Raffle"}**\n🎁 ${raffle.prize}\n🎟️ ${raffle.entries.length} entries • Ends <t:${Math.floor(raffle.endsAt / 1000)}:R>`).join("\n\n"));
  }

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary));
  await interaction.update({ embeds: [embed], components: [row] });
}

function button(label: string, customId: string, style = ButtonStyle.Primary) {
  return new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
}
