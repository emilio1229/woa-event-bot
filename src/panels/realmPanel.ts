import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type ButtonInteraction,
  type Interaction
} from "discord.js";
import { raffleStore } from "../raffleStore.js";
import { sigilStore } from "../sigilStore.js";
import { buildShopComponents, buildShopEmbed } from "../sigilUtils.js";
import { getEventRsvpSummary, getUpcomingEvents, updateEventRsvp } from "../services/eventService.js";

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

  const buttonInteraction = interaction as ButtonInteraction;
  const section = buttonInteraction.customId.slice(`${REALM_PREFIX}:`.length);
  if (section === "home") {
    await buttonInteraction.update(buildRealmPanel());
    return true;
  }

  if (!buttonInteraction.inGuild() || !buttonInteraction.guild) {
    await buttonInteraction.reply({ content: "❌ This Realm panel can only be used inside the WoA server.", ephemeral: true });
    return true;
  }

  if (section === "sigils") {
    await showSigils(buttonInteraction);
    return true;
  }
  if (section === "sigils:daily") {
    await claimDaily(buttonInteraction);
    return true;
  }
  if (section === "sigils:history") {
    await showSigilHistory(buttonInteraction);
    return true;
  }
  if (section === "raffles") {
    await showRaffles(buttonInteraction);
    return true;
  }
  if (section === "events") {
    await showEvents(buttonInteraction);
    return true;
  }
  if (section.startsWith("event:")) {
    await handleRealmEventRsvp(buttonInteraction, section.slice("event:".length));
    return true;
  }
  if (section === "rewards") {
    await showRewards(buttonInteraction);
    return true;
  }
  if (section === "leaderboard") {
    await showLeaderboard(buttonInteraction);
    return true;
  }
  if (section === "profile") {
    await showProfile(buttonInteraction);
    return true;
  }

  const names: Record<string, string> = {
    bounties: "📜 Bounties",
    achievements: "🏅 Achievements"
  };

  const embed = new EmbedBuilder()
    .setTitle(names[section] ?? "🔮 Realm")
    .setDescription(`The ${names[section] ?? "selected Realm"} panel is ready.\n\nExisting WoA functionality will be connected here next without exposing additional slash commands.`)
    .setFooter({ text: "The Wizards of Ark • Realm" });

  const back = new ActionRowBuilder<ButtonBuilder>().addComponents(
    button("◀ Back to Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary)
  );
  await buttonInteraction.update({ embeds: [embed], components: [back] });
  return true;
}

async function showSigils(interaction: ButtonInteraction) {
  if (!interaction.inGuild() || !interaction.guild) return;
  const user = await sigilStore.getUser(interaction.guild.id, interaction.user.id);
  const stats = await sigilStore.getGuildStats(interaction.guild.id);
  const transactions = user.transactions.slice(0, 5);
  const history = transactions.length === 0 ? "No transactions yet." : transactions.map(tx => `${tx.amount > 0 ? "+" : ""}${tx.amount} — ${tx.reason}`).join("\n");

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

async function claimDaily(interaction: ButtonInteraction) {
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

async function showSigilHistory(interaction: ButtonInteraction) {
  if (!interaction.inGuild() || !interaction.guild) return;
  const transactions = await sigilStore.getTransactions(interaction.guild.id, interaction.user.id, 10);
  const description = transactions.length === 0 ? "No Sigil transactions yet." : transactions.map((tx, index) => `**${index + 1}.** ${tx.amount > 0 ? "+" : ""}${tx.amount} • ${tx.reason}\n<t:${Math.floor(new Date(tx.timestamp).getTime() / 1000)}:R>`).join("\n\n");
  const embed = new EmbedBuilder().setTitle("📜 SIGIL LEDGER").setDescription(description.slice(0, 4000)).setFooter({ text: "The Wizards of Ark • Your Sigil History" });
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    button("◀ Sigils", `${REALM_PREFIX}:sigils`, ButtonStyle.Secondary),
    button("🏠 Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary)
  );
  await interaction.update({ embeds: [embed], components: [row] });
}

async function showRaffles(interaction: ButtonInteraction) {
  if (!interaction.inGuild() || !interaction.guild) return;
  const raffles = (await raffleStore.all()).filter(raffle => raffle.guildId === interaction.guild!.id && !raffle.ended && raffle.endsAt > Date.now());
  const embed = new EmbedBuilder().setTitle("🎟️ ACTIVE RITUAL RAFFLES").setFooter({ text: "The Wizards of Ark • Raffle Chamber" });
  const components: ActionRowBuilder<ButtonBuilder>[] = [];

  if (raffles.length === 0) {
    embed.setDescription("There are no active raffles right now. Check back when the Council opens the next ritual.");
  } else {
    embed.setDescription(raffles.slice(0, 10).map((raffle, index) => `**${index + 1}. ${raffle.name || "Unnamed Raffle"}**\n🎁 ${raffle.prize}\n🎟️ ${raffle.entries.length} entries • Ends <t:${Math.floor(raffle.endsAt / 1000)}:R>`).join("\n\n"));

    for (const raffle of raffles.slice(0, 5)) {
      const channelId = raffle.threadId ?? raffle.channelId;
      if (raffle.messageId) {
        components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel(`🎟️ Enter ${raffle.name || "Raffle"}`.slice(0, 80))
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/channels/${raffle.guildId}/${channelId}/${raffle.messageId}`)
        ));
      }
    }
  }

  components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary)));
  await interaction.update({ embeds: [embed], components });
}

async function showEvents(interaction: ButtonInteraction) {
  if (!interaction.inGuild() || !interaction.guild) return;
  const events = await getUpcomingEvents(interaction.guild.id, 10);
  const embed = new EmbedBuilder()
    .setTitle("🏆 UPCOMING GATHERINGS")
    .setFooter({ text: "The Wizards of Ark • Event Hall" });
  const components: ActionRowBuilder<ButtonBuilder>[] = [];

  if (events.length === 0) {
    embed.setDescription("No upcoming gatherings are inscribed in the event ledger yet. Check back soon.");
  } else {
    embed.setDescription(events.map((event, index) => {
      const summary = getEventRsvpSummary(event);
      const mine = event.rsvps[interaction.user.id];
      return `**${index + 1}. ${event.title}**\n🗓️ <t:${event.startAtUnix}:F>\n👥 ${summary.going} going • ${summary.maybe} maybe • ${summary.no} unavailable${mine ? `\n✨ Your RSVP: **${mine}**` : ""}${event.notes ? `\n📝 ${event.notes}` : ""}`;
    }).join("\n\n").slice(0, 4000));

    for (const event of events.slice(0, 5)) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      row.addComponents(button(`🜂 ${event.title}`.slice(0, 80), `${REALM_PREFIX}:event:${event.id}:going`, ButtonStyle.Success));
      if (event.messageId) {
        row.addComponents(
          new ButtonBuilder()
            .setLabel("Open Event")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/channels/${event.guildId}/${event.channelId}/${event.messageId}`)
        );
      }
      components.push(row);
    }
  }

  components.push(new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary)));
  await interaction.update({ embeds: [embed], components });
}

async function handleRealmEventRsvp(interaction: ButtonInteraction, eventId: string) {
  const event = await getUpcomingEvents(interaction.guild!.id, 50).then(events => events.find(candidate => candidate.id === eventId));
  if (!event) {
    await interaction.reply({ content: "❌ That gathering is no longer upcoming.", ephemeral: true });
    return;
  }

  const updated = await updateEventRsvp(eventId, interaction.user.id, "going");
  if (!updated) {
    await interaction.reply({ content: "❌ That gathering could not be updated.", ephemeral: true });
    return;
  }

  await interaction.reply({ content: `🜂 **RSVP recorded!** You are marked **going** to **${event.title}**.`, ephemeral: true });
}

async function showRewards(interaction: ButtonInteraction) {
  if (!interaction.inGuild() || !interaction.guild) return;
  const activeRaffles = (await raffleStore.all()).filter(raffle => raffle.guildId === interaction.guild!.id && Date.now() < raffle.endsAt && !raffle.ended);
  const balance = await sigilStore.getBalance(interaction.guild.id, interaction.user.id);
  await interaction.update({
    embeds: [buildShopEmbed(activeRaffles, balance)],
    components: [
      ...buildShopComponents(activeRaffles.length === 0),
      new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary))
    ]
  });
}

async function showLeaderboard(interaction: ButtonInteraction) {
  if (!interaction.inGuild() || !interaction.guild) return;
  const leaderboard = await sigilStore.getLeaderboard(interaction.guild.id, 10);
  const lines = await Promise.all(leaderboard.map(async (user, index) => {
    const member = await interaction.guild!.members.fetch(user.userId).catch(() => null);
    return `**${index + 1}.** ${member?.displayName ?? `<@${user.userId}>`} — **${user.balance} Sigils**`;
  }));
  const embed = new EmbedBuilder().setTitle("📊 SIGIL LEADERBOARD").setDescription(lines.length ? lines.join("\n") : "No Sigil accounts exist yet.").setFooter({ text: "The Wizards of Ark • Realm Rankings" });
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary));
  await interaction.update({ embeds: [embed], components: [row] });
}

async function showProfile(interaction: ButtonInteraction) {
  if (!interaction.inGuild() || !interaction.guild) return;
  const user = await sigilStore.getUser(interaction.guild.id, interaction.user.id);
  const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
  const dailyReady = !user.lastDaily || Date.now() - user.lastDaily >= 24 * 60 * 60 * 1000;
  const embed = new EmbedBuilder()
    .setTitle("👤 WIZARD PROFILE")
    .setDescription(`**${member?.displayName ?? interaction.user.username}**\n<@${interaction.user.id}>`)
    .addFields(
      { name: "💎 Sigils", value: `${user.balance}`, inline: true },
      { name: "📜 Transactions", value: `${user.transactions.length}`, inline: true },
      { name: "🎁 Daily Reward", value: dailyReady ? "Ready to claim" : "Already claimed today", inline: true }
    )
    .setFooter({ text: "The Wizards of Ark • Wizard Profile" });
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    button("💎 Sigils", `${REALM_PREFIX}:sigils`),
    button("📊 Leaderboard", `${REALM_PREFIX}:leaderboard`),
    button("◀ Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary)
  );
  await interaction.update({ embeds: [embed], components: [row] });
}

function button(label: string, customId: string, style = ButtonStyle.Primary) {
  return new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
}
