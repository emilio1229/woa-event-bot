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
    const channel = interaction.channel;
    if (!channel || !channel.isSendable()) {
      await interaction.reply({ content: "❌ This control must be used in a channel where the bot can send messages.", ephemeral: true });
      return;
    }
    const title = interaction.fields.getTextInputValue("title").trim();
    const time = interaction.fields.getTextInputValue("time").trim();
    const timezone = interaction.fields.getTextInputValue("timezone").trim() || env.defaultEventTimezone;
    const roleId = interaction.fields.getTextInputValue("role").trim();
    const millis = parseTime(time, timezone);
    if (!title || millis === null || Number.isNaN(millis) || millis <= Date.now()) {
      await interaction.reply({ content: "❌ Please provide a title and a valid future event time.", ephemeral: true });
      return;
    }
    const event = await createEvent({ guildId: guild.id, channelId: channel.id, title, hostId: interaction.user.id, creatorId: interaction.user.id, timezone, startAtIso: new Date(millis).toISOString(), startAtUnix: Math.floor(millis / 1000) });
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
    const raffle = await raffleStore.create({ guildId: guild.id, channelId: channel.id, name, prize, endsAt, tagRole: roleId, invocationText: "Ancient sigils awaken, humming softly in the astral dark.", ritualType: "soul-binding", entries: [], boundUsers: [] });
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
    const record = await bountyStore.create({ guildId: guild.id, channelId: channel.id, tagRoleId: roleId, dinos, stats: ["Melee", "Melee", "Melee", "Melee"], bonus });
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
    inputRow("role", "Role ID", "Discord role ID to notify", TextInputStyle.Short),
    inputRow("bonus", "Bonus", "Optional bonus", TextInputStyle.Short, false)
  );
  await interaction.showModal(modal);
}

function inputRow(id: string, label: string, placeholder: string, style: TextInputStyle, required = true) {
  return new ActionRowBuilder<TextInputBuilder>().addComponents(
    new TextInputBuilder().setCustomId(id).setLabel(label).setPlaceholder(placeholder).setStyle(style).setRequired(required)
  );
}

async function showEconomy(interaction: ButtonInteraction) {
  const users = await discordDirectoryService.listMembers(interaction.guildId ?? "", 1000);
  const active = users.filter(user => user.joinedAt).length;
  await interaction.update({ embeds: [new EmbedBuilder().setTitle("💎 Economy").setDescription(`Active member records: **${active}**\n\nUse the control below to assign or remove Sigils.`)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("💎 Assign / Remove Sigils", `${COUNCIL_PREFIX}:economy:assign`)), backButtonRow()] });
}

async function showRaffles(interaction: ButtonInteraction) {
  const raffle = await raffleStore.getActive(interaction.guildId ?? "");
  const description = raffle ? `🎟️ **${raffle.name}** — ${raffle.prize}` : "No active community giveaways.";
  await interaction.update({ embeds: [new EmbedBuilder().setTitle("🎟️ Raffles").setDescription(description)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("✨ Start Giveaway", `${COUNCIL_PREFIX}:raffles:start`)), backButtonRow()] });
}

async function showEvents(interaction: ButtonInteraction) {
  const events = await getUpcomingEvents(interaction.guildId ?? "", 10);
  const description = events.length ? events.map(event => `🏆 **${event.title}** — <t:${event.startAtUnix}:F>\nRSVP: ${getEventRsvpSummary(event).going} going`).join("\n\n") : "No upcoming events.";
  await interaction.update({ embeds: [new EmbedBuilder().setTitle("🏆 Events").setDescription(description)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("✨ Start Event", `${COUNCIL_PREFIX}:events:start`)), backButtonRow()] });
}

async function showBounties(interaction: ButtonInteraction) {
  const bounties = await bountyStore.getActive(interaction.guildId ?? "");
  const description = bounties.length ? bounties.map(bounty => `📜 **${bounty.dinos.join(", ")}** — <@&${bounty.tagRoleId}>`).join("\n") : "No active bounties.";
  await interaction.update({ embeds: [new EmbedBuilder().setTitle("📜 Bounties").setDescription(description)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button("✨ Start Bounty", `${COUNCIL_PREFIX}:bounties:start`)), backButtonRow()] });
}

async function showRewards(interaction: ButtonInteraction) {
  const raffle = await raffleStore.getActive(interaction.guildId ?? "");
  const raffles = raffle ? [raffle] : [];
  const user = await sigilStore.getUser(interaction.guildId ?? "", interaction.user.id);
  const components = buildShopComponents();
  components[0].addComponents(backButton());
  await interaction.update({ embeds: [buildShopEmbed(raffles, user.balance)], components });
}

async function showMembers(interaction: ButtonInteraction) {
  const members = await discordDirectoryService.listMembers(interaction.guildId ?? "", 1000);
  const council = env.councilRoleIds.length ? members.filter(member => member.roleIds.some(roleId => env.councilRoleIds.includes(roleId))) : [];
  const description = council.length ? council.slice(0, 25).map(member => `🏛️ <@${member.userId}>`).join("\n") : "No Council members found in the configured roles.";
  await interaction.update({ embeds: [new EmbedBuilder().setTitle("👥 Members").setDescription(description)], components: [backButtonRow()] });
}

async function showStatistics(interaction: ButtonInteraction) {
  const users = await discordDirectoryService.listMembers(interaction.guildId ?? "", 1000);
  const activeRaffle = await raffleStore.getActive(interaction.guildId ?? "");
  const activeRaffles = activeRaffle ? 1 : 0;
  const activeBounties = (await bountyStore.getActive(interaction.guildId ?? "")).length;
  const events = await getUpcomingEvents(interaction.guildId ?? "", 1000);
  await interaction.update({ embeds: [new EmbedBuilder().setTitle("📊 Statistics").addFields({ name: "Members", value: `${users.length}`, inline: true }, { name: "Active giveaways", value: `${activeRaffles}`, inline: true }, { name: "Active bounties", value: `${activeBounties}`, inline: true }, { name: "Upcoming events", value: `${events.length}`, inline: true })], components: [backButtonRow()] });
}

async function showConfiguration(interaction: ButtonInteraction) {
  await interaction.update({ embeds: [new EmbedBuilder().setTitle("⚙️ Configuration").setDescription(`Default event timezone: **${env.defaultEventTimezone}**\nGiveaway threads: **${env.raffleThreadsEnabled ? "enabled" : "disabled"}**\nThread archive: **${env.raffleThreadAutoArchiveMinutes} minutes**`)], components: [backButtonRow()] });
}

function backButton() {
  return button("◀ Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary);
}

function backButtonRow() {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(backButton());
}

function backRow() {
  return backButtonRow();
}

function button(label: string, customId: string, style = ButtonStyle.Primary) {
  return new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
}