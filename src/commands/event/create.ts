import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";

import { parseTime } from "../../utils/timeParser.js";
import { getTimezoneForLocale } from "../../utils/localeTimezone.js";
import { createEvent, attachEventMessageId } from "../../services/eventService.js";
import { buildEventRsvpButtons } from "../../interactions/buttons/shared.js";
import { buildEventEmbed } from "../../ui/eventEmbed.js";
import type { CommandModule } from "../../utils/commandLoader.js";

const command: CommandModule = {
  data: new SlashCommandBuilder()
    .setName("event-start")
    .setDescription("Create a scheduled event with natural language time.")
    .addStringOption(option => option.setName("title").setDescription("Event title").setRequired(true))
    .addStringOption(option => option.setName("time").setDescription("When the event starts (e.g., 'friday 5pm', 'tomorrow 7pm')").setRequired(true))
    .addStringOption(option => option.setName("description").setDescription("What the event is about").setRequired(true))
    .addStringOption(option => option.setName("notes").setDescription("Optional extra notes or instructions").setRequired(false))
    .addRoleOption(option => option.setName("tagrole").setDescription("Optional role to notify about this event").setRequired(false)),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.guild || !interaction.channel?.isTextBased()) {
      await interaction.reply({ content: "❌ Events can only be created inside a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    const title = interaction.options.getString("title", true);
    const timeInput = interaction.options.getString("time", true);
    const description = interaction.options.getString("description", true);
    const notes = interaction.options.getString("notes")?.trim() || null;
    const tagRole = interaction.options.getRole("tagrole");

    if (tagRole && !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ content: "❌ You need Manage Server permission to notify a role.", flags: MessageFlags.Ephemeral });
      return;
    }

    const locale = interaction.locale ?? "en-US";
    const timezone = getTimezoneForLocale(locale, interaction.user.id);
    const millis = parseTime(timeInput, timezone);

    if (!millis || Number.isNaN(millis)) {
      await interaction.reply({ content: "❌ I could not understand that time format.", flags: MessageFlags.Ephemeral });
      return;
    }

    const event = await createEvent({
      guildId: interaction.guild.id,
      channelId: interaction.channelId,
      title,
      description,
      notes,
      hostId: interaction.user.id,
      creatorId: interaction.user.id,
      timezone,
      startAtIso: new Date(millis).toISOString(),
      startAtUnix: Math.floor(millis / 1000)
    });

    await interaction.reply({
      content: tagRole ? `<@&${tagRole.id}>` : undefined,
      embeds: [buildEventEmbed(event)],
      components: [buildEventRsvpButtons(event.id)],
      allowedMentions: tagRole ? { roles: [tagRole.id] } : { parse: [] }
    });

    const message = await interaction.fetchReply();
    await attachEventMessageId(event.id, message.id);
  }
};

export default command;
