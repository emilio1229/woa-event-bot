import fs from "node:fs";
import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  type ChatInputCommandInteraction
} from "discord.js";
import { bountyStore, bountyWeeklyImage } from "../utils/bountyStore.js";
import type { CommandModule } from "../utils/commandLoader.js";

const STAT_CHOICES = [
  { label: "Health", value: "Health" },
  { label: "Stamina", value: "Stamina" },
  { label: "Melee", value: "Melee" },
  { label: "Weight", value: "Weight" },
  { label: "Oxygen", value: "Oxygen" },
  { label: "Food", value: "Food" }
] as const;

type DinoKey = "d1" | "d2" | "d3" | "d4";
type DinoStats = Record<DinoKey, string>;

console.log("Bounty image path:", bountyWeeklyImage);
console.log("File exists:", fs.existsSync(bountyWeeklyImage));

function randomStat(): string {
  return STAT_CHOICES[Math.floor(Math.random() * STAT_CHOICES.length)].value;
}

function buildPanelEmbed(dinos: Record<DinoKey, string>, stats: DinoStats, tagRoleId: string, bonus: string | null, heading: string) {
  return new EmbedBuilder()
    .setColor("#2b2d31")
    .setTitle("🜁 Bounty Setup Panel 🜁")
    .setDescription(
      `${heading}\nRange is automatically **40–50**.\n\n` +
        `**${dinos.d1}:** ${stats.d1}\n` +
        `**${dinos.d2}:** ${stats.d2}\n` +
        `**${dinos.d3}:** ${stats.d3}\n` +
        `**${dinos.d4}:** ${stats.d4}\n\n` +
        (bonus ? `⚡ Bonus Bounty: ${bonus}\n\n` : "") +
        `Tagging: <@&${tagRoleId}>`
    );
}

const command: CommandModule = {
  data: new SlashCommandBuilder()
    .setName("bounty")
    .setDescription("Start the weekly bounty posting wizard.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand.setName("start")
        .setDescription("Begin the weekly bounty posting wizard.")
        .addStringOption(option => option.setName("dino1").setDescription("Dino 1 name").setRequired(true))
        .addStringOption(option => option.setName("dino2").setDescription("Dino 2 name").setRequired(true))
        .addStringOption(option => option.setName("dino3").setDescription("Dino 3 name").setRequired(true))
        .addStringOption(option => option.setName("dino4").setDescription("Dino 4 name").setRequired(true))
        .addRoleOption(option => option.setName("tagrole").setDescription("Role to tag in the bounty post").setRequired(true))
        .addStringOption(option => option.setName("bonus").setDescription("Bonus bounty description").setRequired(false))
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.channel?.isTextBased()) {
      await interaction.reply({ content: "🛑 Bounty setup must be run from a server text channel.", flags: MessageFlags.Ephemeral });
      return;
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      await interaction.reply({
        content: "🛑 Only administrators may start the bounty wizard.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    const dinoNames: Record<DinoKey, string> = {
      d1: interaction.options.getString("dino1", true),
      d2: interaction.options.getString("dino2", true),
      d3: interaction.options.getString("dino3", true),
      d4: interaction.options.getString("dino4", true)
    };
    const bonus = interaction.options.getString("bonus") || null;
    const tagRole = interaction.options.getRole("tagrole", true);
    const stats: DinoStats = {
      d1: "Melee",
      d2: "Melee",
      d3: "Melee",
      d4: "Melee"
    };

    const statMenus = (["d1", "d2", "d3", "d4"] as const).map((key, index) =>
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(`stat_${key}`)
          .setPlaceholder(`Select stat for Dino ${index + 1}`)
          .addOptions(...STAT_CHOICES)
      )
    );

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId("randomize_stats").setLabel("Randomize All Stats").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("post_bounty").setLabel("Post Bounty").setStyle(ButtonStyle.Success)
    );

    await interaction.reply({
      embeds: [buildPanelEmbed(dinoNames, stats, tagRole.id, bonus, "Set stats for each dino or randomize them.")],
      components: [...statMenus, buttons]
    });

    const panelMessage = await interaction.fetchReply();
    const collector = panelMessage.createMessageComponentCollector({
      time: 600000,
      filter: component => component.user.id === interaction.user.id
    });

    collector.on("collect", async component => {
      if (component.customId === "randomize_stats" && component.isButton()) {
        stats.d1 = randomStat();
        stats.d2 = randomStat();
        stats.d3 = randomStat();
        stats.d4 = randomStat();

        await component.update({
          embeds: [buildPanelEmbed(dinoNames, stats, tagRole.id, bonus, "Stats randomized.")],
          components: [...statMenus, buttons]
        });
        return;
      }

      if (component.customId.startsWith("stat_") && component.isStringSelectMenu()) {
        const dinoKey = component.customId.split("_")[1] as DinoKey;
        stats[dinoKey] = component.values[0];

        await component.update({
          embeds: [buildPanelEmbed(dinoNames, stats, tagRole.id, bonus, "Stats updated.")],
          components: [...statMenus, buttons]
        });
        return;
      }

      if (component.customId === "post_bounty" && component.isButton()) {
        const bountyImage = new AttachmentBuilder(bountyWeeklyImage);
        const embed = new EmbedBuilder()
          .setColor("#2b2d31")
          .setImage("attachment://bounty.png")
          .setTitle("🜁 THE WEEKLY HUNT 🜁")
          .setDescription(
            `⚔️ **Targets of the Week**\n` +
              `• ${dinoNames.d1} — ${stats.d1} ▸ 40–50\n` +
              `• ${dinoNames.d2} — ${stats.d2} ▸ 40–50\n` +
              `• ${dinoNames.d3} — ${stats.d3} ▸ 40–50\n` +
              `• ${dinoNames.d4} — ${stats.d4} ▸ 40–50\n\n` +
              (bonus ? `⚡ **Bonus Bounty:** ${bonus}\n\n` : "") +
              `🜁 **Summoned Order:** <@&${tagRole.id}>\n\n` +
              "⚡ Present your offerings, Witchers."
          );

        await component.update({
          embeds: [embed],
          files: [bountyImage],
          components: []
        });

        const record = await bountyStore.create({
          guildId: interaction.guildId!,
          channelId: interaction.channelId,
          tagRoleId: tagRole.id,
          dinos: [dinoNames.d1, dinoNames.d2, dinoNames.d3, dinoNames.d4],
          stats: [stats.d1, stats.d2, stats.d3, stats.d4],
          bonus
        });
        await bountyStore.setMessageId(record.id, panelMessage.id);
        collector.stop();
      }
    });
  }
};

export default command;
