import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type ChatInputCommandInteraction,
  type Interaction
} from "discord.js";

export const REALM_PREFIX = "woa:realm";

export function buildRealmPanel() {
  const embed = new EmbedBuilder()
    .setTitle("🔮 THE REALM OF WIZARDS")
    .setDescription(
      "Welcome, Wizard.\n\nChoose a realm below to explore the WoA community. Your buttons are your spellbook — no command memorization required."
    )
    .addFields(
      { name: "💎 Sigils", value: "Balance, earning, history & spending", inline: true },
      { name: "🎟️ Raffles", value: "View and enter active raffles", inline: true },
      { name: "📜 Bounties", value: "Discover active community bounties", inline: true },
      { name: "🏆 Events", value: "Upcoming events and RSVPs", inline: true },
      { name: "🎁 Rewards", value: "Explore rewards and prizes", inline: true },
      { name: "🏅 Achievements", value: "Track your WoA accomplishments", inline: true },
      { name: "📊 Leaderboard", value: "See the Realm rankings", inline: true },
      { name: "👤 Profile", value: "View your Wizard profile", inline: true }
    )
    .setFooter({ text: "The Wizards of Ark • The Realm" });

  const rows = [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      button("💎 Sigils", `${REALM_PREFIX}:sigils`),
      button("🎟️ Raffles", `${REALM_PREFIX}:raffles`),
      button("📜 Bounties", `${REALM_PREFIX}:bounties`),
      button("🏆 Events", `${REALM_PREFIX}:events`)
    ),
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      button("🎁 Rewards", `${REALM_PREFIX}:rewards`),
      button("🏅 Achievements", `${REALM_PREFIX}:achievements`),
      button("📊 Leaderboard", `${REALM_PREFIX}:leaderboard`),
      button("👤 Profile", `${REALM_PREFIX}:profile`)
    )
  ];

  return { embeds: [embed], components: rows };
}

export async function handleRealmPanel(interaction: Interaction) {
  if (!interaction.isButton() || !interaction.customId.startsWith(`${REALM_PREFIX}:`)) return false;

  const section = interaction.customId.slice(`${REALM_PREFIX}:`.length);
  const names: Record<string, string> = {
    sigils: "💎 Sigils",
    raffles: "🎟️ Raffles",
    bounties: "📜 Bounties",
    events: "🏆 Events",
    rewards: "🎁 Rewards",
    achievements: "🏅 Achievements",
    leaderboard: "📊 Leaderboard",
    profile: "👤 Profile"
  };

  if (section === "home") {
    await interaction.update(buildRealmPanel());
    return true;
  }

  const embed = new EmbedBuilder()
    .setTitle(names[section] ?? "🔮 Realm")
    .setDescription(
      `The ${names[section] ?? "selected Realm"} panel is ready.\n\nThis is the new WoA panel system. Existing functionality will be connected here without exposing additional slash commands.`
    )
    .setFooter({ text: "The Wizards of Ark • Realm" });

  const back = new ActionRowBuilder<ButtonBuilder>().addComponents(
    button("◀ Back to Realm", `${REALM_PREFIX}:home`, ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [back] });
  return true;
}

function button(label: string, customId: string, style = ButtonStyle.Primary) {
  return new ButtonBuilder().setCustomId(customId).setLabel(label).setStyle(style);
}
