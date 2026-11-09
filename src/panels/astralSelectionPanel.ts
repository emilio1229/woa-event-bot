import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags, type ButtonInteraction, type Interaction } from "discord.js";
import { buildRealmPanel } from "./realmPanel.js";
import {
  countUnreadAstralSelectionNotifications,
  getAstralSelectionNotifications,
  markAstralSelectionNotificationsRead
} from "../services/astralSelectionNotificationService.js";

const ASTRAL_PANEL_ID = "woa:realm:astral";

export async function buildRealmPanelWithAstralSelection(guildId?: string, userId?: string) {
  const panel: any = await buildRealmPanel(guildId);
  if (!guildId || !userId) return panel;

  const unread = await countUnreadAstralSelectionNotifications(guildId, userId);
  panel.embeds[0].addFields({
    name: "🌠 Astral Selection",
    value: unread > 0
      ? `A new selection awaits you. **${unread} unread** astral notification${unread === 1 ? "" : "s"}.`
      : "Your astral history is ready whenever you wish to revisit it.",
    inline: false
  });
  panel.components.unshift(new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(ASTRAL_PANEL_ID)
      .setLabel(unread > 0 ? `🌠 Astral Selection • ${unread} New` : "🌠 Astral Selection")
      .setStyle(unread > 0 ? ButtonStyle.Success : ButtonStyle.Secondary)
  ));
  return panel;
}

async function showAstralSelection(interaction: ButtonInteraction) {
  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.reply({ content: "Astral Selection history is only available inside a WoA server.", flags: MessageFlags.Ephemeral });
    return;
  }

  const notifications = await getAstralSelectionNotifications(guildId, interaction.user.id, 10);
  if (notifications.length) {
    await markAstralSelectionNotificationsRead(guildId, interaction.user.id, notifications.map(item => item.id));
  }

  const embed = new EmbedBuilder()
    .setColor(0x5599FF)
    .setAuthor({ name: "✦ WIZARDS OF ARK  /  PERSONAL NOTIFICATIONS" })
    .setTitle("🌠 ASTRAL SELECTION")
    .setDescription(
      notifications.length
        ? "The astral currents have recorded these moments for you. Your newest selections appear first.\n\n" +
          notifications.map((item, index) =>
            `**${index === 0 ? "Latest Selection" : "Selection " + (index + 1)}**\n✨ You received **${item.amount} Sigil${item.amount === 1 ? "" : "s"}**\n🕰️ <t:${Math.floor(item.awardedAt.getTime() / 1000)}:F> • <t:${Math.floor(item.awardedAt.getTime() / 1000)}:R>`
          ).join("\n\n")
        : "No Astral Selections have been recorded for you yet. When the astral currents choose you, your reward will be preserved here."
    )
    .setFooter({ text: "Your selection history is private to you • The Realm remembers" });

  await interaction.update({
    embeds: [embed],
    components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(ASTRAL_PANEL_ID + ":back").setLabel("◀ Back to Realm").setStyle(ButtonStyle.Secondary)
    )]
  });
}

export async function handleAstralSelectionPanel(interaction: Interaction): Promise<boolean> {
  if (!interaction.isButton()) return false;
  if (interaction.customId === ASTRAL_PANEL_ID) {
    await showAstralSelection(interaction);
    return true;
  }
  if (interaction.customId === ASTRAL_PANEL_ID + ":back") {
    const panel = await buildRealmPanelWithAstralSelection(interaction.guildId ?? undefined, interaction.user.id);
    await interaction.update(panel);
    return true;
  }
  return false;
}
