import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type StringSelectMenuInteraction
} from "discord.js";
import { bountyStore, type BountyRecord } from "../utils/bountyStore.js";
import type { CommandModule } from "../utils/commandLoader.js";

const END_PREFIX = "woa:bounty-end";
const pending = new Map<string, string[]>();

const command: CommandModule = {
  data: new SlashCommandBuilder()
    .setName("bounty-end")
    .setDescription("End one or more active WoA bounties.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.inGuild() || !interaction.guild) {
      await interaction.reply({ content: "❌ Bounties can only be managed inside a server.", flags: MessageFlags.Ephemeral });
      return;
    }

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ content: "❌ Only members with Manage Server may end bounties.", flags: MessageFlags.Ephemeral });
      return;
    }

    const bounties = await bountyStore.getActive(interaction.guild.id);
    if (bounties.length === 0) {
      await interaction.reply({ content: "📜 There are no active bounties to end.", flags: MessageFlags.Ephemeral });
      return;
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId(`${END_PREFIX}:select:${interaction.user.id}`)
      .setPlaceholder("Select bounty/bounties to end")
      .setMinValues(1)
      .setMaxValues(Math.min(bounties.length, 25));

    for (const bounty of bounties.slice(0, 25)) {
      const label = bounty.dinos.join(", ").slice(0, 100) || "Weekly Hunt";
      const description = `${bounty.stats.join(", ")} • posted ${new Date(bounty.createdAt).toLocaleDateString()}`.slice(0, 100);
      menu.addOptions({ label, value: bounty.id, description });
    }

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
    await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(0x4B0082)
        .setTitle("🛑 END BOUNTY")
        .setDescription("Select the bounty or bounties you want to end.\n\n**Only the selected bounties will be deactivated.**")],
      components: [row],
      flags: MessageFlags.Ephemeral
    });
  }
};

export async function handleBountyEndInteraction(interaction: StringSelectMenuInteraction | ButtonInteraction): Promise<boolean> {
  if (!interaction.customId.startsWith(`${END_PREFIX}:`)) return false;
  if (!interaction.inGuild() || !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    await interaction.reply({ content: "❌ You do not have permission to end bounties.", flags: MessageFlags.Ephemeral });
    return true;
  }

  if (interaction.isStringSelectMenu() && interaction.customId.startsWith(`${END_PREFIX}:select:`)) {
    const userId = interaction.customId.split(":").at(-1);
    if (userId !== interaction.user.id) {
      await interaction.reply({ content: "❌ This bounty picker belongs to another Council member.", flags: MessageFlags.Ephemeral });
      return true;
    }

    pending.set(interaction.user.id, interaction.values);
    const selected = interaction.values;
    const bounties = await bountyStore.getActive(interaction.guildId ?? "");
    const names = selected.map(id => {
      const bounty = bounties.find(item => item.id === id);
      return bounty ? `• ${bounty.dinos.join(", ")}` : null;
    }).filter(Boolean).join("\n");

    await interaction.update({
      embeds: [new EmbedBuilder()
        .setColor(0x4B0082)
        .setTitle("⚠️ CONFIRM END BOUNTY")
        .setDescription(`You selected **${selected.length}** bounty/bounties:\n${names || "• Selected bounty"}\n\nThis will remove them from the **active bounty board**. Their stored records are not deleted.`)],
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(`${END_PREFIX}:confirm:${interaction.user.id}`).setLabel("🛑 End Selected").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`${END_PREFIX}:cancel:${interaction.user.id}`).setLabel("Cancel").setStyle(ButtonStyle.Secondary)
      )]
    });
    return true;
  }

  if (interaction.isButton()) {
    const userId = interaction.customId.split(":").at(-1);
    if (userId !== interaction.user.id) {
      await interaction.reply({ content: "❌ This bounty control belongs to another Council member.", flags: MessageFlags.Ephemeral });
      return true;
    }

    if (interaction.customId.startsWith(`${END_PREFIX}:cancel:`)) {
      pending.delete(interaction.user.id);
      await interaction.update({ content: "❎ Bounty ending cancelled.", embeds: [], components: [] });
      return true;
    }

    const selected = pending.get(interaction.user.id) ?? [];
    if (selected.length === 0) {
      await interaction.update({ content: "❌ No bounties are selected. Run `/bounty-end` again.", embeds: [], components: [] });
      return true;
    }

    let ended = 0;
    for (const id of selected) {
      if (await bountyStore.deactivate(id)) ended += 1;
    }
    pending.delete(interaction.user.id);

    await interaction.update({
      embeds: [new EmbedBuilder()
        .setColor(0x4B0082)
        .setTitle("🛑 BOUNTIES ENDED")
        .setDescription(`Successfully ended **${ended}** bounty/bounties.\n\nThey will no longer appear on the active bounty board. **No bounty records were deleted.**`)],
      components: []
    });
    return true;
  }

  return true;
}

export default command;
