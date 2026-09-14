import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
  type ButtonInteraction,
  type Interaction,
  type ModalSubmitInteraction,
  type UserSelectMenuInteraction
} from "discord.js";
import { env } from "../config/env.js";
import { raffleStore } from "../raffleStore.js";
import { sigilStore } from "../sigilStore.js";
import { buildActiveRaffleEmbed } from "../embedBuilder.js";
import { buildBalanceEmbed, buildShopComponents, buildShopEmbed } from "../sigilUtils.js";
import { bountyStore, bountyWeeklyImage } from "../utils/bountyStore.js";
import { parseTime } from "../utils/timeParser.js";
import { getTimezoneForLocale } from "../utils/localeTimezone.js";
import { discordDirectoryService } from "../services/discordDirectoryService.js";
import { attachEventMessageId, createEvent, getEventRsvpSummary, getUpcomingEvents } from "../services/eventService.js";
import { buildEventEmbed } from "../ui/eventEmbed.js";
import { buildEventRsvpButtons } from "../interactions/buttons/shared.js";
import { createRaffleThreadFromMessage } from "../services/raffleThreadService.js";

export const COUNCIL_PREFIX = "woa:council";

export function isCouncilMember(interaction: Interaction) {
  if (!interaction.inGuild() || !interaction.member) return false;
  const member = interaction.member;
  if (member.permissions instanceof PermissionsBitField && member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  if (env.councilRoleIds.length === 0 || !("roles" in member)) return false;
  const roleIds = Array.isArray(member.roles) ? member.roles : member.roles.cache.keys();
  return Array.from(roleIds).some(roleId => env.councilRoleIds.includes(roleId));
}

export function buildCouncilPanel() {
  const embed = new EmbedBuilder()
    .setTitle("🏛️ THE HIGH COUNCIL")
    .setDescription("Welcome, Council.\n\nThis is the WoA staff command center. Manage the Realm from one place.")
    .addFields(
      { name: "💎 Economy", value: "Assign/remove Sigils", inline: true },
      { name: "🎟️ Raffles", value: "Start community giveaways", inline: true },
      { name: "🏆 Events", value: "Create scheduled events", inline: true },
      { name: "📜 Bounties", value: "Start weekly hunts", inline: true },
      { name: "🎁 Rewards", value: "View the reward shop", inline: true },
      { name: "👥 Members", value: "Council/member directory", inline: true },
      { name: "📊 Statistics", value: "Realm activity", inline: true },
      { name: "⚙️ Configuration", value: "Runtime settings", inline: true }
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
  const supported = interaction.isButton() || interaction.isUserSelectMenu() || interaction.isModalSubmit();
  if (!supported || !interaction.customId.startsWith(`${COUNCIL_PREFIX}:`)) return false;

  if (!isCouncilMember(interaction)) {
    await interaction.reply({ content: "⛔ Only the High Council may use this control.", ephemeral: true });
    return true;
  }

  if (interaction.isModalSubmit()) {
    await handleCouncilModal(interaction);
    return true;
  }

  if (interaction.isUserSelectMenu()) {
    if (interaction.customId === `${COUNCIL_PREFIX}:sigil:user`) await openSigilAdjustment(interaction);
    return true;
  }

  const section = interaction.customId.slice(`${COUNCIL_PREFIX}:`.length);
  if (section === "home") await interaction.update(buildCouncilPanel());
  else if (section === "economy") await showEconomy(interaction);
  else if (section === "economy:assign") await startSigilAssignment(interaction);
  else if (section === "raffles") await showRaffles(interaction);
  else if (section === "raffles:start") await startRaffleModal(interaction);
  else if (section === "events") await showEvents(interaction);
  else if (section === "events:start") await startEventModal(interaction);
  else if (section === "bounties") await showBounties(interaction);
  else if (section === "bounties:start") await startBountyModal(interaction);
  else if (section === "rewards") await showRewards(interaction);
  else if (section === "members") await showMembers(interaction);
  else if (section === "statistics") await showStatistics(interaction);
  else if (section === "configuration") await showConfiguration(interaction);
  else await interaction.update({ embeds: [new EmbedBuilder().setTitle("🏛️ Council").setDescription("Unknown Council panel.")], components: [backRow()] });
  return true;
}

async function handleCouncilModal(interaction: ModalSubmitInteraction) {
  const id = interaction.customId;
  const guild = interaction.guild;
  if (!guild) return;

  if (id.startsWith(`${COUNCIL_PREFIX}:sigil:modal:`)) {
    const userId = id.slice(`${COUNCIL_PREFIX}:sigil:modal:`.length);
    const amount = Number.parseInt(interaction.fields.getTextInputValue("amount").trim(), 10);
    const reason = interaction.fields.getTextInputValue("reason").trim();
    if (!Number.isInteger(amount) || amount === 0 || !reason) {
      await interaction.reply({ content: "❌ Enter a non-zero whole-number amount and a reason.", ephemeral: true });
      return;
    }
    try {
      const updated = await sigilStore.award(guild.id, userId, amount, reason, interaction.user.id);
      const target = await guild.members.fetch(userId).catch(() => null);
      const embed = buildBalanceEmbed(
        target?.user ?? interaction.user,
        updated.balance,
        updated.transactions.slice(0, 5),
        amount > 0 ? "✨ Sigils Awarded" : "🜂 Sigils Removed",
        `${target ? target.toString() : `<@${userId}>`} has been ${amount > 0 ? "granted" : "charged"} **${Math.abs(amount)}** sigils.`
      );
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: `❌ ${error instanceof Error ? error.message : "Unable to update the sigil ledger."}`, ephemeral: true });
    }
    return;
  }

  if (id === `${COUNCIL_PREFIX}:event:modal`) {
    const title = interaction.fields.getTextInputValue("title").trim();
    const time = interaction.fields.getTextInputValue("time").trim();
    const timezone = interaction.fields.getTextInputValue("timezone").trim() || env.defaultEventTimezone;
    const roleId = interaction.fields.getTextInputValue("role").trim();
    const millis = parseTime(time, timezone);
    if (!title || millis === null || Number.isNaN(millis) || millis <= Date.now()) {
      await interaction.reply({ content: "❌ Please provide a title and a valid future event time.", ephemeral: true });
      return;
    }
    const event = await createEvent({ guildId: guild.id, channelId: interaction.channelId, title, hostId: interaction.user.id, creatorId: interaction.user.id, timezone, startAtIso: new Date(millis).toISOString(), startAtUnix: Math.floor(millis / 1000) });
    await interaction.reply({ embeds: [buildEventEmbed(event)], components: [buildEventRsvpButtons(event.id)], allowedMentions: { parse: [] } });
    const message = await interaction.fetchReply();
    await attachEventMessageId(event.id, message.id);
    if (/^\d{17,20}$/.test(roleId)) await message.edit({ content: `<@&${roleId}>`, allowedMentions: { roles: [roleId] } });
    return;
  }

  const channel = interaction.channel;
  if (!channel || !channel.isSendable()) {
    await interaction.reply({ content: "❌ This control must be used in a channel where the bot can send messages.", ephemeral: true });
    return;
  }

  if (id === `${COUNCIL_PREFIX}:raffle:modal`) {
    const prize = interaction.fields.getTextInputValue("prize").trim();
    const duration = interaction.fields.getTextInputValue("duration").trim();
    const name = interaction.fields.getTextInputValue("name").trim() || "WoA Community Giveaway";
    const roleId = interaction.fields.getTextInputValue("role").trim();
    const endsAt = parseTime(duration, getTimezoneForLocale(interaction.locale ?? "en-US", interaction.user.id));
    if (!prize || endsAt === null || Number.isNaN(endsAt) || endsAt <= Date.now() || !/^\d{17,20}$/.test(roleId)) {
      await interaction.reply({ content: "❌ Provide a prize, valid future end time, and Discord role ID.", ephemeral: true });
      return;
    }
    const raffle = await raffleStore.create({ guildId: guild.id, channelId: interaction.channelId, name, prize, endsAt, tagRole: roleId, invocationText: "Ancient sigils awaken, humming softly in the astral dark.", ritualType: "soul-binding", entries: [], boundUsers: [] });
    const announcement = await channel.send({ embeds: [new EmbedBuilder().setTitle("🔮 THE RITUAL BEGINS").setDescription(`A WoA community giveaway has begun.\n\n⟐ **Name:** ${name}\n⟐ **Notification:** <@&${roleId}>\n🎁 **Offering:** ${prize}`).setColor(0x4B0082)], allowedMentions: { roles: [roleId] } });
    const thread = await createRaffleThreadFromMessage(announcement, raffle);
    const destination = thread ?? channel;
    if (thread) await raffleStore.setThreadId(raffle.id, thread.id);
    const message = await destination.send({ embeds: [buildActiveRaffleEmbed(raffle)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🔮 Join Giveaway", "bindSoul"), button("⚫ Leave Giveaway", "unbindSoul", ButtonStyle.Secondary))], files: ["./assets/woa_ritual_bg.png"] });
    await raffleStore.setMessageId(raffle.id, message.id);
    await interaction.reply({ content: thread ? `✅ Giveaway started in <#${thread.id}>.` : "✅ Giveaway started.", ephemeral: true });
    return;
  }

  if (id === `${COUNCIL_PREFIX}:bounty:modal`) {
    const dinos = interaction.fields.getTextInputValue("dinos").split(",").map(value => value.trim()).filter(Boolean);
    const roleId = interaction.fields.getTextInputValue("role").trim();
    const bonus = interaction.fields.getTextInputValue("bonus").trim() || null;
    if (dinos.length !== 4 || dinos.some(dino => dino.length < 1) || !/^\d{17,20}$/.test(roleId)) {
      await interaction.reply({ content: "❌ Enter exactly four dino names separated by commas and a valid Discord role ID.", ephemeral: true });
      return;
    }
    const record = await bountyStore.create({ guildId: guild.id, channelId: interaction.channelId, tagRoleId: roleId, dinos, stats: ["Melee", "Melee", "Melee", "Melee"], bonus });
    const attachment = new AttachmentBuilder(bountyWeeklyImage, { name: "bounty.png" });
    const embed = new EmbedBuilder().setColor("#2b2d31").setImage("attachment://bounty.png").setTitle("🜁 THE WEEKLY HUNT 🜁").setDescription(`⚔️ **Targets of the Week**\n• ${dinos[0]} — Melee ▸ 40–50\n• ${dinos[1]} — Melee ▸ 40–50\n• ${dinos[2]} — Melee ▸ 40–50\n• ${dinos[3]} — Melee ▸ 40–50\n\n${bonus ? `⚡ **Bonus Bounty:** ${bonus}\n\n` : ""}🜁 **Summoned Order:** <@&${roleId}>\n\n⚡ Present your offerings, Witchers.`);
    const message = await channel.send({ embeds: [embed], files: [attachment], allowedMentions: { roles: [roleId] } });
    await bountyStore.setMessageId(record.id, message.id);
    await interaction.reply({ content: "✅ Weekly bounty posted.", ephemeral: true });
  }
}

async function startSigilAssignment(interaction: ButtonInteraction) {
  const menu = new UserSelectMenuBuilder().setCustomId(`${COUNCIL_PREFIX}:sigil:user`).setPlaceholder("Select a player").setMinValues(1).setMaxValues(1);
  await interaction.reply({ content: "💎 Select the player whose Sigils you want to adjust.", components: [new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(menu)], ephemeral: true });
}

async function openSigilAdjustment(interaction: UserSelectMenuInteraction) {
  const userId = interaction.values[0];
  const modal = new ModalBuilder().setCustomId(`${COUNCIL_PREFIX}:sigil:modal:${userId}`).setTitle("Adjust Player Sigils");
  modal.addComponents(
    inputRow("amount", "Sigil amount", "25 to award, -25 to remove", TextInputStyle.Short),
    inputRow("reason", "Reason", "Event reward, correction, etc.", TextInputStyle.Paragraph)
  );
  await interaction.showModal(modal);
}

async function startEventModal(interaction: ButtonInteraction) {
  const modal = new ModalBuilder().setCustomId(`${COUNCIL_PREFIX}:event:modal`).setTitle("Create WoA Event");
  modal.addComponents(
    inputRow("title", "Event title", "e.g. Shoulder Pet Battle", TextInputStyle.Short),
    inputRow("time", "Start time", "e.g. Friday 7pm or tomorrow 6pm", TextInputStyle.Short),
    inputRow("timezone", "Timezone", env.defaultEventTimezone, TextInputStyle.Short, false),
    inputRow("role", "Role ID", "Optional Discord role ID", TextInputStyle.Short, false)
  );
  await interaction.showModal(modal);
}

async function startRaffleModal(interaction: ButtonInteraction) {
  const modal = new ModalBuilder().setCustomId(`${COUNCIL_PREFIX}:raffle:modal`).setTitle("Create Community Giveaway");
  modal.addComponents(
    inputRow("prize", "Prize", "What is being given away?", TextInputStyle.Short),
    inputRow("duration", "End time", "e.g. 2h or tomorrow 7pm", TextInputStyle.Short),
    inputRow("name", "Giveaway name", "Optional", TextInputStyle.Short, false),
    inputRow("role", "Role ID", "Discord role ID to notify", TextInputStyle.Short)
  );
  await interaction.showModal(modal);
}

async function startBountyModal(interaction: ButtonInteraction) {
  const modal = new ModalBuilder().setCustomId(`${COUNCIL_PREFIX}:bounty:modal`).setTitle("Start Weekly Bounty");
  modal.addComponents(
    inputRow("dinos", "Four dinos", "Dino 1, Dino 2, Dino 3, Dino 4", TextInputStyle.Paragraph),
    inputRow("role", "Role ID", "Discord role ID to tag", TextInputStyle.Short),
    inputRow("bonus", "Bonus bounty", "Optional", TextInputStyle.Paragraph, false)
  );
  await interaction.showModal(modal);
}

async function showEconomy(interaction: ButtonInteraction) {
  const stats = await sigilStore.getGuildStats(interaction.guild!.id);
  const raffles = await getActiveRaffles(interaction.guild!.id);
  const bounties = await bountyStore.getActive(interaction.guild!.id);
  const events = await getUpcomingEvents(interaction.guild!.id, 10);
  const embed = new EmbedBuilder().setTitle("💎 SIGIL ECONOMY").setDescription("Live economy overview for the High Council.").addFields(
    { name: "👥 Sigil Bearers", value: `${stats.totalUsers}`, inline: true },
    { name: "💠 In Circulation", value: `${stats.totalBalance}`, inline: true },
    { name: "✨ Total Awarded", value: `${stats.totalAwarded}`, inline: true },
    { name: "🜂 Total Removed", value: `${stats.totalRemoved}`, inline: true },
    { name: "🎫 Redeemed", value: `${stats.totalRedeemed}`, inline: true },
    { name: "📚 Ledger Entries", value: `${stats.totalTransactions}`, inline: true },
    { name: "🎟️ Active Giveaways", value: `${raffles.length}`, inline: true },
    { name: "📜 Active Bounties", value: `${bounties.length}`, inline: true },
    { name: "🏆 Upcoming Events", value: `${events.length}`, inline: true }
  );
  await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("💎 Assign / Remove Sigils", `${COUNCIL_PREFIX}:economy:assign`), button("📊 Statistics", `${COUNCIL_PREFIX}:statistics`), button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showRaffles(interaction: ButtonInteraction) {
  const raffles = await getActiveRaffles(interaction.guild!.id);
  const description = raffles.length ? raffles.map((raffle, index) => `**${index + 1}. ${raffle.name || "Unnamed Giveaway"}**\n🎁 ${raffle.prize}\n👥 ${raffle.entries.length} entries\n⏳ Ends <t:${Math.floor(raffle.endsAt / 1000)}:R>`).join("\n\n") : "No active community giveaways are currently running.";
  await interaction.update({ embeds: [new EmbedBuilder().setTitle("🎟️ COMMUNITY GIVEAWAY CONTROL").setDescription(description).setFooter({ text: "The Wizards of Ark • Council Giveaways" })], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("✨ Start Giveaway", `${COUNCIL_PREFIX}:raffles:start`), button("🔄 Refresh", `${COUNCIL_PREFIX}:raffles`), button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showEvents(interaction: ButtonInteraction) {
  const events = await getUpcomingEvents(interaction.guild!.id, 10);
  const description = events.length ? events.map((event, index) => { const summary = getEventRsvpSummary(event); return `**${index + 1}. ${event.title}**\n🗓️ <t:${event.startAtUnix}:F>\n👥 ${summary.going} going • ${summary.maybe} maybe • ${summary.no} unavailable\n👤 Host: <@${event.hostId}>`; }).join("\n\n").slice(0, 4000) : "No upcoming events are currently recorded.";
  await interaction.update({ embeds: [new EmbedBuilder().setTitle("🏆 EVENT CONTROL").setDescription(description).setFooter({ text: "The Wizards of Ark • Council Events" })], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("✨ Start Event", `${COUNCIL_PREFIX}:events:start`), button("🔄 Refresh", `${COUNCIL_PREFIX}:events`), button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showBounties(interaction: ButtonInteraction) {
  const bounties = await bountyStore.getActive(interaction.guild!.id);
  const description = bounties.length ? bounties.map((bounty, index) => `**${index + 1}. Weekly Hunt**\n${bounty.dinos.map((dino, i) => `• **${dino}** — ${bounty.stats[i] ?? "Any stat"} ▸ 40–50`).join("\n")}${bounty.bonus ? `\n⚡ Bonus: ${bounty.bonus}` : ""}\n🗓️ Posted <t:${Math.floor(bounty.createdAt / 1000)}:R>`).join("\n\n") : "No active bounties are currently posted.";
  await interaction.update({ embeds: [new EmbedBuilder().setTitle("📜 BOUNTY CONTROL").setDescription(description).setFooter({ text: "The Wizards of Ark • Council Bounties" })], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("✨ Start Bounty", `${COUNCIL_PREFIX}:bounties:start`), button("🔄 Refresh", `${COUNCIL_PREFIX}:bounties`), button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showRewards(interaction: ButtonInteraction) {
  const activeRaffles = await getActiveRaffles(interaction.guild!.id);
  const balance = await sigilStore.getBalance(interaction.guild!.id, interaction.user.id);
  await interaction.update({ embeds: [buildShopEmbed(activeRaffles, balance)], components: [...buildShopComponents(activeRaffles.length === 0), backRow()] });
}

async function showMembers(interaction: ButtonInteraction) {
  const guild = interaction.guild!;
  const members = await discordDirectoryService.listMembers(guild.id);
  const councilMembers = members.filter(member => env.councilRoleIds.some(roleId => member.roleIds.includes(roleId)));
  const regularMembers = guild.members.cache.filter(member => !member.user.bot).size;
  const bots = guild.members.cache.filter(member => member.user.bot).size;
  const councilText = councilMembers.length ? councilMembers.slice(0, 25).map(member => `• **${member.displayName}** — <@${member.discordUserId}>`).join("\n") : "No Council members are configured.";
  const embed = new EmbedBuilder().setTitle("👥 MEMBER HALL").setDescription(`**Cached Members:** ${regularMembers}\n**Cached Bots:** ${bots}\n**Configured Council:** ${councilMembers.length}\n\n### High Council\n${councilText}`).setFooter({ text: "The Wizards of Ark • Member Directory" });
  await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🔄 Refresh", `${COUNCIL_PREFIX}:members`), button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showStatistics(interaction: ButtonInteraction) {
  const guild = interaction.guild!;
  const sigils = await sigilStore.getGuildStats(guild.id);
  const raffles = await getActiveRaffles(guild.id);
  const bounties = await bountyStore.getActive(guild.id);
  const events = await getUpcomingEvents(guild.id, 50);
  const bots = guild.members.cache.filter(member => member.user.bot).size;
  const embed = new EmbedBuilder().setTitle("📊 REALM STATISTICS").setDescription("Current operational snapshot for the High Council.").addFields(
    { name: "👥 Server Members", value: `${guild.memberCount}`, inline: true },
    { name: "🤖 Bots", value: `${bots}`, inline: true },
    { name: "💎 Sigil Bearers", value: `${sigils.totalUsers}`, inline: true },
    { name: "💠 Sigils in Circulation", value: `${sigils.totalBalance}`, inline: true },
    { name: "✨ Sigils Awarded", value: `${sigils.totalAwarded}`, inline: true },
    { name: "🜂 Sigils Removed", value: `${sigils.totalRemoved}`, inline: true },
    { name: "📚 Transactions", value: `${sigils.totalTransactions}`, inline: true },
    { name: "🎟️ Active Giveaways", value: `${raffles.length}`, inline: true },
    { name: "📜 Active Bounties", value: `${bounties.length}`, inline: true },
    { name: "🏆 Upcoming Events", value: `${events.length}`, inline: true }
  );
  await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("🔄 Refresh", `${COUNCIL_PREFIX}:statistics`), button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showConfiguration(interaction: ButtonInteraction) {
  const embed = new EmbedBuilder().setTitle("⚙️ REALM CONFIGURATION").setDescription("Runtime configuration currently loaded by the bot. Secrets are intentionally never displayed.").addFields(
    { name: "🏛️ Council Roles", value: env.councilRoleIds.length ? env.councilRoleIds.map(id => `<@&${id}>`).join(" ") : "None configured", inline: false },
    { name: "🌎 Default Event Timezone", value: env.defaultEventTimezone, inline: true },
    { name: "🧵 Giveaway Threads", value: env.raffleThreadsEnabled ? "Enabled" : "Disabled", inline: true },
    { name: "📦 Thread Archive", value: `${env.raffleThreadAutoArchiveMinutes} minutes`, inline: true },
    { name: "🌌 Astral Channel", value: env.astralChannelId ? `<#${env.astralChannelId}>` : "Not configured", inline: true },
    { name: "🌐 API", value: `${env.apiHost}:${env.apiPort}`, inline: true },
    { name: "🏰 Allowed Guilds", value: `${env.allowedGuildIds.length}`, inline: true }
  );
  await interaction.update({ embeds: [embed], components: [backRow()] });
}

function inputRow(id: string, label: string, placeholder: string, style: TextInputStyle, required = true) {
  return new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId(id).setLabel(label).setPlaceholder(placeholder).setStyle(style).setRequired(required));
}

function getActiveRaffles(guildId: string) {
  return raffleStore.all().then(raffles => raffles.filter(raffle => raffle.guildId === guildId && !raffle.ended && raffle.endsAt > Date.now()));
}

function backRow() {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary));
}

function button(label: string, customId: string, style = ButtonStyle.Primary) {
  return new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
}
