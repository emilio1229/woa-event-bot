import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  RoleSelectMenuBuilder,
  SlashCommandBuilder,
  type ChatInputCommandInteraction
} from "discord.js";

import { buildActiveRaffleEmbed } from "../../embedBuilder.js";
import { raffleStore } from "../../raffleStore.js";
import { createRaffleThreadFromMessage } from "../../services/raffleThreadService.js";
import { getAdminTimezone } from "../../services/adminTimezoneService.js";
import { parseTime } from "../../utils/timeParser.js";

import type { CommandModule } from "../../utils/commandLoader.js";

const ARCANE_NAMES = [
  "Veil of Whispered Sigils",
  "Circle of Astral Binding",
  "Rite of Shattered Stars",
  "The Umbral Convergence",
  "The Luminous Weave",
  "The Eldritch Pulse",
  "The Crystal Lattice",
  "The Stormforged Rite",
  "The Void-Touched Ritual",
  "The Sigilbound Ceremony"
];

const ARCANE_ROLE_PHRASES = [
  "Sigils Align With",
  "Essence Called Forth",
  "The Circle Attunes To",
  "The Astral Veil Recognizes",
  "Leylines Bend Toward",
  "The Ritual Resonates With",
  "The Glyphs Whisper Of",
  "The Weave Acknowledges",
  "The Ether Binds To",
  "The Convergence Focuses Upon"
];

const command: CommandModule = {
  data: new SlashCommandBuilder()
    .setName("raffle-start")
    .setDescription("Begin a new arcane ritual raffle.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
      option.setName("prize")
        .setDescription("The offering for the ritual.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("duration")
        .setDescription("Duration (10m, 2h, tomorrow 5pm, etc.)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("name")
        .setDescription("Name of the ritual raffle (optional)")
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.guild || !interaction.channel?.isTextBased()) {
      await interaction.reply({
        content: "❌ Ritual raffles can only be started from a server text channel.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({
        content: "❌ Only members with Manage Server may begin a ritual raffle.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const guild = interaction.guild;
    const channel = interaction.channel;

    const prize = interaction.options.getString("prize", true);
    const durationInput = interaction.options.getString("duration", true);

    const timezone = await getAdminTimezone(guild.id, interaction.user.id);
    if (!timezone) {
      await interaction.reply({
        content: "⚠️ Your timezone is not set yet. Open **/council → Configuration → 🌎 My Timezone** and select it once before creating scheduled giveaways.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const endsAt = parseTime(durationInput, timezone);

    if (!endsAt || Number.isNaN(endsAt)) {
      await interaction.reply({
        content: "❌ I could not understand that time format.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const durationMs = endsAt - Date.now();

    if (durationMs <= 0) {
      await interaction.reply({
        content: "❌ That time is already in the past.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const providedName = interaction.options.getString("name");
    const name = providedName || ARCANE_NAMES[Math.floor(Math.random() * ARCANE_NAMES.length)];

    const roleRow = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
      new RoleSelectMenuBuilder()
        .setCustomId("tagRole")
        .setPlaceholder("Select a role to invoke in the ritual")
        .setMinValues(1)
        .setMaxValues(1)
    );

    await interaction.reply({
      content: "Choose the role whose essence will be Chosen.:",
      components: [roleRow]
    });

    const menuMessage = await interaction.fetchReply();
    const collector = menuMessage.createMessageComponentCollector({
      filter: component => component.customId === "tagRole" && component.user.id === interaction.user.id,
      time: 60000
    });

    collector.on("collect", async roleSelection => {
      if (!roleSelection.isRoleSelectMenu()) return;

      await roleSelection.deferUpdate().catch(() => {});

      const tagRole = roleSelection.values[0];
      const chosenRolePhrase = ARCANE_ROLE_PHRASES[Math.floor(Math.random() * ARCANE_ROLE_PHRASES.length)];
      const invocationText = "Ancient sigils awaken, humming softly in the astral dark.";

      const raffle = await raffleStore.create({
        guildId: guild.id,
        channelId: interaction.channelId,
        name,
        prize,
        endsAt,
        tagRole,
        invocationText,
        ritualType: "soul-binding",
        entries: [],
        boundUsers: []
      });

      const announcementEmbed = new EmbedBuilder()
        .setTitle("🔮 THE RITUAL BEGINS")
        .setDescription(
          [
            "The circle stirs as arcane energies gather.",
            "A ritual has been cast — the astral veil thins.",
            "",
            `⟐ **Ritual Name:** ${name}`,
            `⟐ **${chosenRolePhrase}:** <@&${tagRole}>`,
            `🎁 **Offering:** ${prize}`
          ].join("\n")
        )
        .setColor(0x4B0082);

      const announcementMessage = await channel.send({
        embeds: [announcementEmbed],
        allowedMentions: { roles: [tagRole] }
      });

      const thread = await createRaffleThreadFromMessage(announcementMessage, raffle);
      const destination = thread ?? channel;

      if (thread) {
        await raffleStore.setThreadId(raffle.id, thread.id);
      }

      const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("bindSoul")
          .setLabel("🔮 Join Ritual")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("unbindSoul")
          .setLabel("⚫ Leave Ritual")
          .setStyle(ButtonStyle.Secondary)
      );

      const raffleMessage = await destination.send({
        embeds: [buildActiveRaffleEmbed(raffle)],
        components: [buttonRow],
        files: ["./assets/woa_ritual_bg.png"]
      });

      await raffleStore.setMessageId(raffle.id, raffleMessage.id);

      await menuMessage.edit({
        content: thread ? `The ritual has begun in <#${thread.id}>!` : "The ritual has begun.",
        components: []
      });
    });

    collector.on("end", async collected => {
      if (collected.size === 0) {
        await menuMessage.edit({
          content: "❌ Ritual cancelled — no role was selected.",
          components: []
        });
      }
    });
  }
};

export default command;
