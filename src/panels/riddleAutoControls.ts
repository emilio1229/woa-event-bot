import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags, type Interaction } from "discord.js";
import { riddleAutoSettingsStore } from "../riddleAutoSettingsStore.js";
import { publishAutomaticRiddle } from "../services/automaticRiddleService.js";
import { isCouncilMember } from "./councilPanel.js";

const PREFIX = "woa:riddle:auto";
const btn = (label: string, id: string, style = ButtonStyle.Secondary) => new ButtonBuilder().setLabel(label).setCustomId(id).setStyle(style);
const row = (...buttons: ButtonBuilder[]) => new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

export async function showRiddleAutoControls(interaction: Interaction) {
  if (!interaction.isRepliable() || !interaction.guildId) return;
  const settings = await riddleAutoSettingsStore.get(interaction.guildId);
  const embed = new EmbedBuilder()
    .setColor(settings.enabled ? 0x2D8A57 : 0x666666)
    .setTitle("⚙️ AUTOMATIC RIDDLE CONTROL")
    .setDescription("Control the Arcane Scribe's scheduled riddles. Changes save to the database and take effect without editing Railway variables.")
    .addFields(
      { name: "Status", value: settings.enabled ? "🟢 Enabled" : "🔴 Disabled", inline: true },
      { name: "Posting channel", value: settings.channelId ? "<#" + settings.channelId + ">" : "Not set", inline: true },
      { name: "Schedule", value: "Every " + settings.intervalMinutes + " minutes", inline: true },
      { name: "Sigil reward", value: settings.rewardMin + "–" + settings.rewardMax + " Sigils", inline: true },
      { name: "Last automatic run", value: settings.lastRunAt ? "<t:" + Math.floor(settings.lastRunAt.getTime()/1000) + ":R>" : "Not run yet", inline: true }
    )
    .setFooter({ text: "Only authorized High Council members can change these settings." });
  const components = [
    row(btn(settings.enabled ? "⏸ Disable Auto Riddles" : "▶ Enable Auto Riddles", PREFIX + ":toggle", settings.enabled ? ButtonStyle.Danger : ButtonStyle.Success), btn("📍 Set Channel", PREFIX + ":channel")),
    row(btn("⏱ Schedule & Rewards", PREFIX + ":edit"), btn("🔄 Refresh", PREFIX + ":open")),
    row(btn("◀ Back to Riddles", "woa:council:riddles"))
  ];
  if (interaction.isMessageComponent()) await interaction.update({ embeds: [embed], components });
  else await interaction.reply({ embeds: [embed], components, flags: MessageFlags.Ephemeral });
}

export async function handleRiddleAutoControls(interaction: Interaction): Promise<boolean> {
  if (!(interaction.isButton() || interaction.isChannelSelectMenu() || interaction.isModalSubmit()) || !interaction.customId.startsWith(PREFIX + ":")) return false;
  if (!interaction.inGuild() || !interaction.guildId || !isCouncilMember(interaction)) {
    if (interaction.isRepliable()) await interaction.reply({ content: "⛔ Only the High Council may change automatic riddle settings.", flags: MessageFlags.Ephemeral });
    return true;
  }
  const guildId = interaction.guildId;
  if (interaction.isButton() && interaction.customId === PREFIX + ":open") { await showRiddleAutoControls(interaction); return true; }
  if (interaction.isButton() && interaction.customId === PREFIX + ":toggle") {
    const current = await riddleAutoSettingsStore.get(guildId);
    const next = !current.enabled;

    if (next && !current.channelId) {
      await interaction.reply({
        content: "📍 Set the automatic riddle posting channel first, then enable auto riddles.",
        flags: MessageFlags.Ephemeral
      });
      return true;
    }

    await riddleAutoSettingsStore.update(guildId, { enabled: next });

    if (next) {
      // Publish the first automatic riddle immediately instead of making admins
      // wait for the next interval. Mark the attempt first to avoid the minute
      // scheduler racing this button and publishing twice.
      await riddleAutoSettingsStore.markRun(guildId);
      const posted = await publishAutomaticRiddle(interaction.client, guildId);
      await showRiddleAutoControls(interaction);
      await interaction.followUp({
        content: posted
          ? "🧩 Auto riddles are enabled, and the first riddle has been posted."
          : "🟢 Auto riddles are enabled. The first riddle was not posted because a riddle may already be active or the channel could not be reached. Check the selected channel and bot permissions; the scheduler will try again at the next interval.",
        flags: MessageFlags.Ephemeral
      });
    } else {
      await showRiddleAutoControls(interaction);
    }
    return true;
  }
  if (interaction.isButton() && interaction.customId === PREFIX + ":channel") {
    const menu = new ChannelSelectMenuBuilder().setCustomId(PREFIX + ":channel:select").setPlaceholder("Choose the automatic riddle channel").setMinValues(1).setMaxValues(1).setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
    await interaction.update({ embeds: [new EmbedBuilder().setColor(0x4B0082).setTitle("📍 Automatic Riddle Channel").setDescription("Choose where scheduled riddles should be published.")], components: [new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(menu), row(btn("◀ Back", PREFIX + ":open"))] });
    return true;
  }
  if (interaction.isChannelSelectMenu() && interaction.customId === PREFIX + ":channel:select") {
    await riddleAutoSettingsStore.update(guildId, { channelId: interaction.values[0] });
    await showRiddleAutoControls(interaction);
    return true;
  }
  if (interaction.isButton() && interaction.customId === PREFIX + ":edit") {
    const settings = await riddleAutoSettingsStore.get(guildId);
    const modal = new ModalBuilder().setCustomId(PREFIX + ":modal").setTitle("Automatic Riddle Settings");
    const field = (id: string, label: string, value: number) => new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId(id).setLabel(label).setStyle(TextInputStyle.Short).setRequired(true).setValue(String(value)));
    modal.addComponents(field("interval", "Interval in minutes (15–10080)", settings.intervalMinutes), field("rewardMin", "Minimum Sigils (1–10000)", settings.rewardMin), field("rewardMax", "Maximum Sigils (1–10000)", settings.rewardMax));
    await interaction.showModal(modal);
    return true;
  }
  if (interaction.isModalSubmit() && interaction.customId === PREFIX + ":modal") {
    const interval = Number(interaction.fields.getTextInputValue("interval"));
    const rewardMin = Number(interaction.fields.getTextInputValue("rewardMin"));
    const rewardMax = Number(interaction.fields.getTextInputValue("rewardMax"));
    if (!Number.isInteger(interval) || interval < 15 || interval > 10080 || !Number.isInteger(rewardMin) || !Number.isInteger(rewardMax) || rewardMin < 1 || rewardMax > 10000 || rewardMin > rewardMax) {
      await interaction.reply({ content: "❌ Invalid settings. Interval must be 15–10080 minutes; rewards must be 1–10000 Sigils and minimum cannot exceed maximum.", flags: MessageFlags.Ephemeral });
      return true;
    }
    await riddleAutoSettingsStore.update(guildId, { intervalMinutes: interval, rewardMin, rewardMax });
    await interaction.reply({ content: "✅ Automatic riddle settings saved.", flags: MessageFlags.Ephemeral });
    return true;
  }
  return true;
}
