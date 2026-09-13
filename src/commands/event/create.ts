import {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  type ChatInputCommandInteraction
} from "discord.js";

import { parseTime } from "../../utils/timeParser.js";
import { getTimezoneForLocale } from "../../utils/localeTimezone.js";
import type { CommandModule } from "../../utils/commandLoader.js";

const command: CommandModule = {
  data: new SlashCommandBuilder()
    .setName("event-start")
    .setDescription("Create a scheduled event with natural language time.")
    .addStringOption(option =>
      option.setName("title")
        .setDescription("Event title")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("time")
        .setDescription("When the event starts (e.g., 'friday 5pm', 'tomorrow 7pm')")
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.guild || !interaction.channel?.isTextBased()) {
      await interaction.reply({
        content: "❌ Events can only be created inside a server.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const title = interaction.options.getString("title", true);
    const timeInput = interaction.options.getString("time", true);

    // ------------------------------------------------------------
    // TIMEZONE DETECTION (locale only — Discord.js v14 safe)
    // ------------------------------------------------------------
    const locale = interaction.locale ?? "en-US";
    const timezone = getTimezoneForLocale(locale, interaction.user.id);

    // ------------------------------------------------------------
    // NATURAL LANGUAGE TIME PARSING
    // ------------------------------------------------------------
    const millis = parseTime(timeInput, timezone);

    if (!millis || Number.isNaN(millis)) {
      await interaction.reply({
        content: "❌ I could not understand that time format.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const unix = Math.floor(millis / 1000);

    const embed = new EmbedBuilder()
      .setTitle("📅 Event Scheduled")
      .setDescription(
        [
          `**Title:** ${title}`,
          `**Starts:** <t:${unix}:F>`,
          "",
          "The event has been successfully created."
        ].join("\n")
      )
      .setColor(0x4B0082);

    await interaction.reply({ embeds: [embed] });
  }
};

export default command;
