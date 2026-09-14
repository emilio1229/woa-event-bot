import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  type Interaction
} from "discord.js";
import { env } from "../config/env.js";

export const COUNCIL_PREFIX = "woa:council";

export function isCouncilMember(interaction: Interaction) {
  if (!interaction.inGuild() || !interaction.member) return false;

  const member = interaction.member;
  const permissions = member.permissions;
  if (
    permissions instanceof PermissionsBitField &&
    permissions.has(PermissionFlagsBits.Administrator)
  ) {
    return true;
  }

  if (env.councilRoleIds.length === 0) return false;
  if (!("roles" in member)) return false;

  const roleIds = Array.isArray(member.roles) ? member.roles : member.roles.cache.keys();
  return Array.from(roleIds).some(roleId => env.councilRoleIds.includes(roleId));
}

export function buildCouncilPanel() {
  const embed = new EmbedBuilder()
    .setTitle("🏛️ THE HIGH COUNCIL")
    .setDescription(
      "Welcome, Council.\n\nThis is the WoA staff command center. Select a system to manage it. Access is controlled by Council roles and Discord permissions."
    )
    .addFields(
      { name: "💎 Economy", value: "Sigils, rewards & economy controls", inline: true },
      { name: "🎟️ Raffles", value: "Create, manage & end raffles", inline: true },
      { name: "🏆 Events", value: "Create and manage events", inline: true },
      { name: "📜 Bounties", value: "Create and manage bounties", inline: true },
      { name: "🎁 Rewards", value: "Manage available rewards", inline: true },
      { name: "👥 Members", value: "Member and activity tools", inline: true },
      { name: "📊 Statistics", value: "Realm and economy statistics", inline: true },
      { name: "⚙️ Configuration", value: "Bot and Realm configuration", inline: true }
    )
    .setFooter({ text: "The Wizards of Ark • High Council" });

  const rows = [
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
  ];

  return { embeds: [embed], components: rows };
}

export async function handleCouncilPanel(interaction: Interaction) {
  if (!interaction.isButton() || !interaction.customId.startsWith(`${COUNCIL_PREFIX}:`)) return false;

  if (!isCouncilMember(interaction)) {
    await interaction.reply({ content: "⛔ Only the High Council may use this panel.", ephemeral: true });
    return true;
  }

  const section = interaction.customId.slice(`${COUNCIL_PREFIX}:`.length);
  if (section === "home") {
    await interaction.update(buildCouncilPanel());
    return true;
  }

  const names: Record<string, string> = {
    economy: "💎 Economy",
    raffles: "🎟️ Raffles",
    events: "🏆 Events",
    bounties: "📜 Bounties",
    rewards: "🎁 Rewards",
    members: "👥 Members",
    statistics: "📊 Statistics",
    configuration: "⚙️ Configuration"
  };

  const embed = new EmbedBuilder()
    .setTitle(names[section] ?? "🏛️ Council")
    .setDescription(
      `The ${names[section] ?? "selected Council"} panel is ready.\n\nExisting WoA functionality will be connected here as the restructure continues.`
    )
    .setFooter({ text: "The Wizards of Ark • High Council" });

  const back = new ActionRowBuilder<ButtonBuilder>().addComponents(
    button("◀ Back to Council", `${COUNCIL_PREFIX}:home`, ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [back] });
  return true;
}

function button(label: string, customId: string, style = ButtonStyle.Primary) {
  return new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
}
