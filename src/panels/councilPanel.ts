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
  type Interaction
} from "discord.js";
import { env } from "../config/env.js";
import { raffleStore } from "../raffleStore.js";
import { sigilStore } from "../sigilStore.js";
import { buildActiveRaffleEmbed } from "../embedBuilder.js";
import { buildShopComponents, buildShopEmbed, buildBalanceEmbed } from "../sigilUtils.js";
import { bountyStore, bountyWeeklyImage } from "../utils/bountyStore.js";
import { parseTime } from "../utils/timeParser.js";
import { getTimezoneForLocale } from "../utils/localeTimezone.js";
import { discordDirectoryService } from "../services/discordDirectoryService.js";
import { attachEventMessageId, createEvent, getEventRsvpSummary, getUpcomingEvents } from "../services/eventService.js";
import { buildEventEmbed } from "../ui/eventEmbed.js";
import { buildEventRsvpButtons } from "../interactions/buttons/shared.js";
import { createRaffleThreadFromMessage } from "../services/raffleThreadService.js";

export const COUNCIL_PREFIX = "woa:council";

const STAT_CHOICES = ["Health", "Stamina", "Melee", "Weight", "Oxygen", "Food"];

type BountyKey = "d1" | "d2" | "d3" | "d4";

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
      { name: "💎 Economy", value: "Manage Sigils and view economy", inline: true },
      { name: "🎟️ Raffles", value: "Start and manage giveaways", inline: true },
      { name: "🏆 Events", value: "Create and manage events", inline: true },
      { name: "📜 Bounties", value: "Start and manage weekly hunts", inline: true },
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
  if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isUserSelectMenu() && !interaction.isRoleSelectMenu() && !interaction.isModalSubmit()) return false;
  if (!interaction.customId.startsWith(`${COUNCIL_PREFIX}:`)) return false;

  if (!isCouncilMember(interaction)) {
    if (interaction.isModalSubmit()) await interaction.reply({ content: "⛔ Only the High Council may use this control.", ephemeral: true });
    else await interaction.reply({ content: "⛔ Only the High Council may use this control.", ephemeral: true });
    return true;
  }

  if (interaction.isModalSubmit()) {
    await handleCouncilModal(interaction);
    return true;
  }

  if (interaction.isUserSelectMenu()) {
    if (interaction.customId === `${COUNCIL_PREFIX}:sigil:user`) {
      const userId = interaction.values[0];
      const modal = new ModalBuilder().setCustomId(`${COUNCIL_PREFIX}:sigil:modal:${userId}`).setTitle("Adjust Player Sigils");
      const amount = new TextInputBuilder().setCustomId("amount").setLabel("Sigil amount").setPlaceholder("25 or -25").setStyle(TextInputStyle.Short).setRequired(true);
      const reason = new TextInputBuilder().setCustomId("reason").setLabel("Reason").setPlaceholder("Event reward, correction, etc.").setStyle(TextInputStyle.Paragraph).setRequired(true);
      modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(amount), new ActionRowBuilder<TextInputBuilder>().addComponents(reason));
      await interaction.showModal(modal);
      return true;
    }
    return true;
  }

  if (interaction.isRoleSelectMenu()) {
    if (interaction.customId.startsWith(`${COUNCIL_PREFIX}:event:role:`)) {
      await finishEventFromRole(interaction, interaction.customId.slice(`${COUNCIL_PREFIX}:event:role:`.length), interaction.values[0]);
      return true;
    }
    if (interaction.customId.startsWith(`${COUNCIL_PREFIX}:raffle:role:`)) {
      await finishRaffleFromRole(interaction, interaction.customId.slice(`${COUNCIL_PREFIX}:raffle:role:`.length), interaction.values[0]);
      return true;
    }
    if (interaction.customId.startsWith(`${COUNCIL_PREFIX}:bounty:role:`)) {
      await showBountyStats(interaction, interaction.customId.slice(`${COUNCIL_PREFIX}:bounty:role:`.length), interaction.values[0]);
      return true;
    }
  }

  if (interaction.isStringSelectMenu() && interaction.customId.startsWith(`${COUNCIL_PREFIX}:bounty:stat:`)) {
    const [setupId, key] = interaction.customId.slice(`${COUNCIL_PREFIX}:bounty:stat:`.length).split(":") as [string, BountyKey];
    await updateBountyStat(interaction, setupId, key, interaction.values[0]);
    return true;
  }

  const section = interaction.customId.slice(`${COUNCIL_PREFIX}:`.length);
  if (section === "home") await interaction.update(buildCouncilPanel());
  else if (section === "economy") await showEconomy(interaction);
  else if (section === "raffles") await showRaffles(interaction);
  else if (section === "events") await showEvents(interaction);
  else if (section === "bounties") await showBounties(interaction);
  else if (section === "rewards") await showRewards(interaction);
  else if (section === "members") await showMembers(interaction);
  else if (section === "statistics") await showStatistics(interaction);
  else if (section === "configuration") await showConfiguration(interaction);
  else if (section === "economy:assign") await startSigilAssignment(interaction);
  else if (section === "raffles:start") await startRaffleModal(interaction);
  else if (section === "events:start") await startEventModal(interaction);
  else if (section === "bounties:start") await startBountyModal(interaction);
  else if (section === "raffles:end") await endSelectedRaffle(interaction);
  else await interaction.update({ embeds: [new EmbedBuilder().setTitle("🏛️ Council").setDescription("Unknown Council panel.")], components: [backRow()] });
  return true;
}

async function handleCouncilModal(interaction: any) {
  const id = interaction.customId;
  if (id.startsWith(`${COUNCIL_PREFIX}:sigil:modal:`)) {
    const userId = id.slice(`${COUNCIL_PREFIX}:sigil:modal:`.length);
    const amount = Number.parseInt(interaction.fields.getTextInputValue("amount").trim(), 10);
    const reason = interaction.fields.getTextInputValue("reason").trim();
    if (!Number.isInteger(amount) || amount === 0 || !reason) {
      await interaction.reply({ content: "❌ Enter a non-zero whole-number amount and a reason.", ephemeral: true });
      return;
    }
    try {
      const updated = await sigilStore.award(interaction.guild.id, userId, amount, reason, interaction.user.id);
      const target = await interaction.guild.members.fetch(userId).catch(() => null);
      const embed = buildBalanceEmbed(target?.user ?? { id: userId, username: userId, bot: false }, updated.balance, updated.transactions.slice(0, 5), amount > 0 ? "✨ Sigils Awarded" : "🜂 Sigils Removed", `${target ?? `<@${userId}>`} has been ${amount > 0 ? "granted" : "charged"} **${Math.abs(amount)}** sigils.`);
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: `❌ ${error instanceof Error ? error.message : "Unable to update the sigil ledger."}`, ephemeral: true });
    }
    return;
  }

  if (id === `${COUNCIL_PREFIX}:event:modal`) {
    const title = interaction.fields.getTextInputValue("title").trim();
    const time = interaction.fields.getTextInputValue("time").trim();
    const role = interaction.fields.getTextInputValue("role").trim();
    const timezone = interaction.fields.getTextInputValue("timezone").trim() || getTimezoneForLocale(interaction.locale ?? "en-US", interaction.user.id);
    const millis = parseTime(time, timezone);
    if (!millis || Number.isNaN(millis) || millis <= Date.now()) {
      await interaction.reply({ content: "❌ I could not understand that future event time.", ephemeral: true });
      return;
    }
    const event = await createEvent({ guildId: interaction.guild.id, channelId: interaction.channelId, title, hostId: interaction.user.id, creatorId: interaction.user.id, timezone, startAtIso: new Date(millis).toISOString(), startAtUnix: Math.floor(millis / 1000) });
    await interaction.reply({ embeds: [buildEventEmbed(event)], components: [buildEventRsvpButtons(event.id)], allowedMentions: { parse: [] } });
    const message = await interaction.fetchReply();
    await attachEventMessageId(event.id, message.id);
    if (role && /^\d{17,20}$/.test(role)) await message.edit({ content: `<@&${role}>`, allowedMentions: { roles: [role] } });
    return;
  }

  if (id === `${COUNCIL_PREFIX}:raffle:modal`) {
    const prize = interaction.fields.getTextInputValue("prize").trim();
    const duration = interaction.fields.getTextInputValue("duration").trim();
    const name = interaction.fields.getTextInputValue("name").trim() || "WoA Community Giveaway";
    const endsAt = parseTime(duration, getTimezoneForLocale(interaction.locale ?? "en-US", interaction.user.id));
    if (!endsAt || Number.isNaN(endsAt) || endsAt <= Date.now()) {
      await interaction.reply({ content: "❌ I could not understand that future giveaway end time.", ephemeral: true });
      return;
    }
    const setupId = `${interaction.user.id}:${Date.now()}`;
    const roleRow = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(new RoleSelectMenuBuilder().setCustomId(`${COUNCIL_PREFIX}:raffle:role:${setupId}`).setPlaceholder("Select the role to notify").setMinValues(1).setMaxValues(1));
    const pending = await interaction.reply({ content: "Choose the notification role for this community giveaway.", components: [roleRow], ephemeral: true, fetchReply: true });
    (pending as any).__woaRaffleSetup = { prize, endsAt, name, channelId: interaction.channelId };
    return;
  }

  if (id === `${COUNCIL_PREFIX}:bounty:modal`) {
    const dinoNames = {
      d1: interaction.fields.getTextInputValue("d1").trim(),
      d2: interaction.fields.getTextInputValue("d2").trim(),
      d3: interaction.fields.getTextInputValue("d3").trim(),
      d4: interaction.fields.getTextInputValue("d4").trim()
    };
    const bonus = interaction.fields.getTextInputValue("bonus").trim() || null;
    const setupId = `${interaction.user.id}:${Date.now()}`;
    const roleRow = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(new RoleSelectMenuBuilder().setCustomId(`${COUNCIL_PREFIX}:bounty:role:${setupId}`).setPlaceholder("Select the role to summon").setMinValues(1).setMaxValues(1));
    const setup = await interaction.reply({ content: "Choose the role to tag in the weekly bounty.", components: [roleRow], ephemeral: true, fetchReply: true });
    (setup as any).__woaBountySetup = { ...dinoNames, bonus };
    return;
  }
}

async function startSigilAssignment(interaction: ButtonInteraction) {
  const menu = new UserSelectMenuBuilder().setCustomId(`${COUNCIL_PREFIX}:sigil:user`).setPlaceholder("Select a player").setMinValues(1).setMaxValues(1);
  await interaction.reply({ content: "💎 Select the player whose Sigils you want to adjust.", components: [new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(menu)], ephemeral: true });
}

async function startEventModal(interaction: ButtonInteraction) {
  const modal = new ModalBuilder().setCustomId(`${COUNCIL_PREFIX}:event:modal`).setTitle("Create WoA Event");
  modal.addComponents(
    inputRow("title", "Event title", "e.g. Shoulder Pet Battle", TextInputStyle.Short),
    inputRow("time", "Start time", "e.g. Friday 7pm or tomorrow 6pm", TextInputStyle.Short),
    inputRow("timezone", "Timezone", env.defaultEventTimezone, TextInputStyle.Short, false),
    inputRow("role", "Role ID to notify", "Optional Discord role ID", TextInputStyle.Short, false)
  );
  await interaction.showModal(modal);
}

async function startRaffleModal(interaction: ButtonInteraction) {
  const modal = new ModalBuilder().setCustomId(`${COUNCIL_PREFIX}:raffle:modal`).setTitle("Create Community Giveaway");
  modal.addComponents(
    inputRow("prize", "Prize", "What is being given away?", TextInputStyle.Short),
    inputRow("duration", "End time", "e.g. 2h, tomorrow 7pm", TextInputStyle.Short),
    inputRow("name", "Giveaway name", "Optional", TextInputStyle.Short, false)
  );
  await interaction.showModal(modal);
}

async function startBountyModal(interaction: ButtonInteraction) {
  const modal = new ModalBuilder().setCustomId(`${COUNCIL_PREFIX}:bounty:modal`).setTitle("Start Weekly Bounty");
  modal.addComponents(
    inputRow("d1", "Dino 1", "Creature name", TextInputStyle.Short),
    inputRow("d2", "Dino 2", "Creature name", TextInputStyle.Short),
    inputRow("d3", "Dino 3", "Creature name", TextInputStyle.Short),
    inputRow("d4", "Dino 4", "Creature name", TextInputStyle.Short),
    inputRow("bonus", "Bonus", "Optional bonus bounty", TextInputStyle.Paragraph, false)
  );
  await interaction.showModal(modal);
}

async function finishEventFromRole(interaction: any, setupId: string, roleId: string) {
  await interaction.reply({ content: "⚠️ Event setup expired. Re-open **Start Event** from Council.", ephemeral: true });
}

async function finishRaffleFromRole(interaction: any, setupId: string, roleId: string) {
  await interaction.reply({ content: "⚠️ Giveaway setup expired. Re-open **Start Giveaway** from Council.", ephemeral: true });
}

async function showBountyStats(interaction: any, setupId: string, roleId: string) {
  const setupMessage = interaction.message;
  const setup = (setupMessage as any).__woaBountySetup;
  if (!setup) {
    await interaction.reply({ content: "⚠️ Bounty setup expired. Re-open **Start Bounty** from Council.", ephemeral: true });
    return;
  }
  const stats: Record<BountyKey, string> = { d1: "Melee", d2: "Melee", d3: "Melee", d4: "Melee" };
  const rows = (["d1", "d2", "d3", "d4"] as BountyKey[]).map(key => new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(new StringSelectMenuBuilder().setCustomId(`${COUNCIL_PREFIX}:bounty:stat:${setupId}:${key}`).setPlaceholder(`Select stat for ${setup[key]}`).addOptions(STAT_CHOICES.map(stat => ({ label: stat, value: stat })))));
  const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(button("🎲 Randomize Stats", `${COUNCIL_PREFIX}:bounty:random:${setupId}`), button("📜 Post Bounty", `${COUNCIL_PREFIX}:bounty:post:${setupId}`, ButtonStyle.Success));
  (setupMessage as any).__woaBountySetup = { ...setup, roleId, stats };
  await interaction.update({ content: `🜁 **Weekly Hunt Setup**\n\n**${setup.d1}** — Melee\n**${setup.d2}** — Melee\n**${setup.d3}** — Melee\n**${setup.d4}** — Melee${setup.bonus ? `\n\n⚡ Bonus: ${setup.bonus}` : ""}`, components: [...rows, buttons] });
}

async function updateBountyStat(interaction: any, setupId: string, key: BountyKey, value: string) {
  const setup = (interaction.message as any).__woaBountySetup;
  if (!setup) { await interaction.reply({ content: "⚠️ Bounty setup expired.", ephemeral: true }); return; }
  setup.stats[key] = value;
  const rows = (["d1", "d2", "d3", "d4"] as BountyKey[]).map(k => new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(new StringSelectMenuBuilder().setCustomId(`${COUNCIL_PREFIX}:bounty:stat:${setupId}:${k}`).setPlaceholder(`Select stat for ${setup[k]}`).addOptions(STAT_CHOICES.map(stat => ({ label: stat, value: stat })))))
  const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(button("🎲 Randomize Stats", `${COUNCIL_PREFIX}:bounty:random:${setupId}`), button("📜 Post Bounty", `${COUNCIL_PREFIX}:bounty:post:${setupId}`, ButtonStyle.Success));
  await interaction.update({ components: [...rows, buttons] });
}

async function finishRaffleCreation(interaction: any, prize: string, endsAt: number, name: string, tagRole: string) {
  const raffle = await raffleStore.create({ guildId: interaction.guild.id, channelId: interaction.channelId, name, prize, endsAt, tagRole, invocationText: "Ancient sigils awaken, humming softly in the astral dark.", ritualType: "soul-binding", entries: [], boundUsers: [] });
  const embed = new EmbedBuilder().setTitle("🔮 THE RITUAL BEGINS").setDescription(`A WoA community giveaway has begun.\n\n⟐ **Name:** ${name}\n⟐ **Notification:** <@&${tagRole}>\n🎁 **Offering:** ${prize}`).setColor(0x4B0082);
  const announcement = await interaction.channel.send({ embeds: [embed], allowedMentions: { roles: [tagRole] });
  const thread = await createRaffleThreadFromMessage(announcement, raffle);
  const destination = thread ?? interaction.channel;
  if (thread) await raffleStore.setThreadId(raffle.id, thread.id);
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button("🔮 Join Giveaway", "bindSoul"), button("⚫ Leave Giveaway", "unbindSoul", ButtonStyle.Secondary));
  const message = await destination.send({ embeds: [buildActiveRaffleEmbed(raffle)], components: [row], files: ["./assets/woa_ritual_bg.png"] });
  await raffleStore.setMessageId(raffle.id, message.id);
  await interaction.editReply({ content: thread ? `The giveaway has begun in <#${thread.id}>!` : "The giveaway has begun.", components: [] });
}

async function endSelectedRaffle(interaction: ButtonInteraction) {
  const active = await getActiveRaffles(interaction.guild!.id);
  if (!active.length) { await interaction.reply({ content: "There are no active community giveaways.", ephemeral: true }); return; }
  await interaction.reply({ content: "The existing giveaway end flow remains available from the current giveaway controls. No active giveaway mechanics were changed.", ephemeral: true });
}

async function showEconomy(interaction: ButtonInteraction) {
  const stats = await sigilStore.getGuildStats(interaction.guild!.id);
  const activeRaffles = await getActiveRaffles(interaction.guild!.id);
  const activeBounties = await bountyStore.getActive(interaction.guild!.id);
  const events = await getUpcomingEvents(interaction.guild!.id, 10);
  const embed = new EmbedBuilder().setTitle("💎 SIGIL ECONOMY").setDescription("Live economy overview for the High Council.").addFields(
    { name: "👥 Sigil Bearers", value: `${stats.totalUsers}`, inline: true },
    { name: "💠 In Circulation", value: `${stats.totalBalance}`, inline: true },
    { name: "✨ Total Awarded", value: `${stats.totalAwarded}`, inline: true },
    { name: "🜂 Total Removed", value: `${stats.totalRemoved}`, inline: true },
    { name: "🎫 Redeemed", value: `${stats.totalRedeemed}`, inline: true },
    { name: "📚 Ledger Entries", value: `${stats.totalTransactions}`, inline: true },
    { name: "🎟️ Active Giveaways", value: `${activeRaffles.length}`, inline: true },
    { name: "📜 Active Bounties", value: `${activeBounties.length}`, inline: true },
    { name: "🏆 Upcoming Events", value: `${events.length}`, inline: true }
  );
  await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("💎 Assign / Remove Sigils", `${COUNCIL_PREFIX}:economy:assign`), button("📊 Statistics", `${COUNCIL_PREFIX}:statistics`), button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showRaffles(interaction: ButtonInteraction) {
  const raffles = await getActiveRaffles(interaction.guild!.id);
  const embed = new EmbedBuilder().setTitle("🎟️ COMMUNITY GIVEAWAY CONTROL").setDescription(raffles.length ? raffles.map((raffle, index) => `**${index + 1}. ${raffle.name || "Unnamed Giveaway"}**\n🎁 ${raffle.prize}\n👥 ${raffle.entries.length} entries\n⏳ Ends <t:${Math.floor(raffle.endsAt / 1000)}:R>`).join("\n\n") : "No active community giveaways are currently running.").setFooter({ text: "The Wizards of Ark • Council Giveaways" });
  await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("✨ Start Giveaway", `${COUNCIL_PREFIX}:raffles:start`), button("🔄 Refresh", `${COUNCIL_PREFIX}:raffles`), button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showEvents(interaction: ButtonInteraction) {
  const events = await getUpcomingEvents(interaction.guild!.id, 10);
  const embed = new EmbedBuilder().setTitle("🏆 EVENT CONTROL").setDescription(events.length ? events.map((event, index) => { const summary = getEventRsvpSummary(event); return `**${index + 1}. ${event.title}**\n🗓️ <t:${event.startAtUnix}:F>\n👥 ${summary.going} going • ${summary.maybe} maybe • ${summary.no} unavailable\n👤 Host: <@${event.hostId}>`; }).join("\n\n").slice(0, 4000) : "No upcoming events are currently recorded.").setFooter({ text: "The Wizards of Ark • Council Events" });
  await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("✨ Start Event", `${COUNCIL_PREFIX}:events:start`), button("🔄 Refresh", `${COUNCIL_PREFIX}:events`), button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
}

async function showBounties(interaction: ButtonInteraction) {
  const bounties = await bountyStore.getActive(interaction.guild!.id);
  const embed = new EmbedBuilder().setTitle("📜 BOUNTY CONTROL").setDescription(bounties.length ? bounties.map((bounty, index) => `**${index + 1}. Weekly Hunt**\n${bounty.dinos.map((dino, i) => `• **${dino}** — ${bounty.stats[i] ?? "Any stat"} ▸ 40–50`).join("\n")}${bounty.bonus ? `\n⚡ Bonus: ${bounty.bonus}` : ""}\n🗓️ Posted <t:${Math.floor(bounty.createdAt / 1000)}:R>`).join("\n\n") : "No active bounties are currently posted.").setFooter({ text: "The Wizards of Ark • Council Bounties" });
  await interaction.update({ embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("✨ Start Bounty", `${COUNCIL_PREFIX}:bounties:start`), button("🔄 Refresh", `${COUNCIL_PREFIX}:bounties`), button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary))] });
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
  const members = guild.members.cache;
  const embed = new EmbedBuilder().setTitle("📊 REALM STATISTICS").setDescription("Current operational snapshot for the High Council.").addFields(
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
