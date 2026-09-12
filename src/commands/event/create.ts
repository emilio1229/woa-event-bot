import { MessageFlags, SlashCommandBuilder, type ChatInputCommandInteraction } from "discord.js";
import { createEvent, attachEventMessageId, deleteEvent } from "../../services/eventService.js";
import { buildEventRsvpButtons } from "../../interactions/buttons/index.js";
import { buildEventEmbed } from "../../ui/eventEmbed.js";
import { isFutureUnixTimestamp, parseEventStart } from "../../utils/time.js";
import type { CommandModule } from "../../utils/commandLoader.js";

const command: CommandModule = {
  data: new SlashCommandBuilder()
    .setName("event")
    .setDescription("Create and manage arcane gatherings.")
    .addSubcommand(subcommand =>
      subcommand
        .setName("create")
        .setDescription("Inscribe a new event into the guild ledger.")
        .addStringOption(option =>
          option
            .setName("title")
            .setDescription("Name of the gathering.")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("date")
            .setDescription("Event date in YYYY-MM-DD format.")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("time")
            .setDescription("Event time, for example 19:30 or 7:30 PM.")
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName("timezone")
            .setDescription("IANA timezone like America/New_York. Defaults to UTC.")
            .setRequired(false)
        )
        .addStringOption(option =>
          option
            .setName("notes")
            .setDescription("Optional notes or preparation instructions.")
            .setRequired(false)
            .setMaxLength(1000)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.guildId || !interaction.channel?.isTextBased()) {
      await interaction.reply({
        content: "❌ Event creation must be cast from a server text channel.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const title = interaction.options.getString("title", true).trim();
    const date = interaction.options.getString("date", true);
    const time = interaction.options.getString("time", true);
    const timezoneInput = interaction.options.getString("timezone");
    const notes = interaction.options.getString("notes");

    const parsedStart = parseEventStart(date, time, timezoneInput);

    if (!parsedStart) {
      await interaction.reply({
        content: "❌ I could not parse that date, time, or timezone. Use YYYY-MM-DD and a valid IANA timezone such as America/New_York.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    if (!isFutureUnixTimestamp(parsedStart.startAtUnix)) {
      await interaction.reply({
        content: "❌ That event start time is already in the past.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const event = createEvent({
      guildId: interaction.guildId,
      channelId: interaction.channelId,
      title,
      notes,
      hostId: interaction.user.id,
      creatorId: interaction.user.id,
      timezone: parsedStart.timezone,
      startAtIso: parsedStart.startAtIso,
      startAtUnix: parsedStart.startAtUnix
    });

    try {
      const eventMessage = await interaction.channel.send({
        embeds: [buildEventEmbed(event)],
        components: [buildEventRsvpButtons(event.id)]
      });

      attachEventMessageId(event.id, eventMessage.id);

      await interaction.reply({
        content: `✨ Event created: ${title}\nStarts ${`<t:${event.startAtUnix}:F>`} (${`<t:${event.startAtUnix}:R>`}).`,
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      deleteEvent(event.id);

      await interaction.reply({
        content: "❌ The event could not be posted to this channel, so the summoning was rolled back.",
        flags: MessageFlags.Ephemeral
      });
    }
  }
};

export default command;
