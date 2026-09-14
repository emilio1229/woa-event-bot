import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
  type ButtonInteraction,
  type Interaction,
  type StringSelectMenuInteraction
} from "discord.js";
import { bountyStore } from "../utils/bountyStore.js";
import { buildEventEmbed } from "../ui/eventEmbed.js";
import { buildEventRsvpButtons } from "../interactions/buttons/shared.js";
import { endEvent, getEventById, getEventRsvpSummary, getUpcomingEvents } from "../services/eventService.js";

const PREFIX = "woa:council:management";

function backButton() {
  return new ButtonBuilder().setCustomId("woa:council:home").setLabel("◀ Back to Council").setStyle(ButtonStyle.Secondary);
}

function panelButtons(kind: "events" | "bounties") {
  const title = kind === "events" ? "🏆 Events" : "📜 Bounties";
  const endId = `${PREFIX}:${kind}:end`;
  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(endId).setLabel(`🛑 End ${title.slice(2, -1)}`).setStyle(ButtonStyle.Danger),
      backButton()
    )
  ];
}

export async function handleEventBountyManagement(interaction: Interaction): Promise<boolean> {
  if (!interaction.inGuild()) return false;
  if (!(interaction.isButton() || interaction.isStringSelectMenu())) return false;
  if (!interaction.customId.startsWith(`${PREFIX}:`)) return false;

  if (interaction.isButton()) {
    if (interaction.customId === `${PREFIX}:events`) {
      await showEvents(interaction);
      return true;
    }
    if (interaction.customId === `${PREFIX}:bounties`) {
      await showBounties(interaction);
      return true;
    }
    if (interaction.customId === `${PREFIX}:events:end`) {
      await showEventPicker(interaction);
      return true;
    }
    if (interaction.customId === `${PREFIX}:bounties:end`) {
      await showBountyPicker(interaction);
      return true;
    }
    if (interaction.customId === `${PREFIX}:events:back`) {
      await showEvents(interaction);
      return true;
    }
    if (interaction.customId === `${PREFIX}:bounties:back`) {
      await showBounties(interaction);
      return true;
    }
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === `${PREFIX}:events:end:select`) {
      await finishEvent(interaction, interaction.values[0]);
      return true;
    }
    if (interaction.customId === `${PREFIX}:bounties:end:select`) {
      await finishBounty(interaction, interaction.values[0]);
      return true;
    }
  }

  return false;
}

export async function showManagedEvents(interaction: ButtonInteraction) {
  await showEvents(interaction);
}

export async function showManagedBounties(interaction: ButtonInteraction) {
  await showBounties(interaction);
}

async function showEvents(interaction: ButtonInteraction) {
  const events = await getUpcomingEvents(interaction.guildId ?? "", 10);
  const description = events.length
    ? events.map(event => `🏆 **${event.title}** — <t:${event.startAtUnix}:F>\n${event.description}\nRSVP: ${getEventRsvpSummary(event).going}${event.notes ? `\n📝 ${event.notes}` : ""}`).join("\n\n")
    : "No upcoming events.";
  await interaction.update({
    embeds: [new EmbedBuilder().setTitle("🏆 Events").setDescription(description.slice(0, 4000))],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId("woa:council:events:start").setLabel("✨ Start Event").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`${PREFIX}:events:end`).setLabel("🛑 End Event").setStyle(ButtonStyle.Danger),
        backButton()
      )
    ]
  });
}

async function showBounties(interaction: ButtonInteraction) {
  const bounties = await bountyStore.getActive(interaction.guildId ?? "");
  const description = bounties.length
    ? bounties.map(bounty => `📜 **${bounty.dinos.join(", ")}** — ${bounty.stats.join(", ")} ▸ 40–50`).join("\n")
    : "No active bounties.";
  await interaction.update({
    embeds: [new EmbedBuilder().setTitle("📜 Bounties").setDescription(description)],
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId("woa:council:bounties:start").setLabel("✨ Start Bounty").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`${PREFIX}:bounties:end`).setLabel("🛑 End Bounty").setStyle(ButtonStyle.Danger),
        backButton()
      )
    ]
  });
}

async function showEventPicker(interaction: ButtonInteraction) {
  const events = await getUpcomingEvents(interaction.guildId ?? "", 25);
  if (!events.length) {
    await interaction.update({ embeds: [new EmbedBuilder().setTitle("🛑 End Event").setDescription("There are no active upcoming events to end.")], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(backButton())] });
    return;
  }
  const menu = new StringSelectMenuBuilder()
    .setCustomId(`${PREFIX}:events:end:select`)
    .setPlaceholder("Choose the event to end")
    .addOptions(events.map(event => ({ label: event.title.slice(0, 100), value: event.id, description: `Starts <t:${event.startAtUnix}:R>`.slice(0, 100) })));
  await interaction.update({ embeds: [new EmbedBuilder().setTitle("🛑 End Event").setDescription("Choose the active event you want to conclude. RSVPs will be preserved.")], components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu), new ActionRowBuilder<ButtonBuilder>().addComponents(backButton())] });
}

async function showBountyPicker(interaction: ButtonInteraction) {
  const bounties = (await bountyStore.getActive(interaction.guildId ?? "")).slice(0, 25);
  if (!bounties.length) {
    await interaction.update({ embeds: [new EmbedBuilder().setTitle("🛑 End Bounty").setDescription("There are no active bounties to end.")], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(backButton())] });
    return;
  }
  const menu = new StringSelectMenuBuilder()
    .setCustomId(`${PREFIX}:bounties:end:select`)
    .setPlaceholder("Choose the bounty to end")
    .addOptions(bounties.map(bounty => ({ label: bounty.dinos.join(", ").slice(0, 100), value: bounty.id, description: bounty.stats.join(", ").slice(0, 100) })));
  await interaction.update({ embeds: [new EmbedBuilder().setTitle("🛑 End Bounty").setDescription("Choose the active bounty you want to conclude.")], components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu), new ActionRowBuilder<ButtonBuilder>().addComponents(backButton())] });
}

async function finishEvent(interaction: StringSelectMenuInteraction, eventId: string) {
  const event = await getEventById(eventId);
  if (!event || event.guildId !== interaction.guildId) {
    await interaction.update({ embeds: [new EmbedBuilder().setTitle("🛑 End Event").setDescription("❌ That event could not be found.")], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(backButton())] });
    return;
  }
  const ended = await endEvent(eventId);
  if (!ended) {
    await interaction.update({ embeds: [new EmbedBuilder().setTitle("🛑 End Event").setDescription("❌ The event could not be ended.")], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(backButton())] });
    return;
  }
  if (event.messageId) {
    const channel = await interaction.client.channels.fetch(event.channelId).catch(() => null);
    const message = channel && "messages" in channel ? await channel.messages.fetch(event.messageId).catch(() => null) : null;
    if (message) {
      await message.edit({ embeds: [buildEventEmbed(ended).setTitle(`🔮 ${ended.title} — ENDED`)], components: [] }).catch(() => null);
    }
  }
  await interaction.update({ embeds: [new EmbedBuilder().setTitle("✅ Event Ended").setDescription(`**${event.title}** has been concluded.\n\n👥 Existing RSVPs were preserved in the event record.`)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(backButton())] });
}

async function finishBounty(interaction: StringSelectMenuInteraction, bountyId: string) {
  const bounty = await bountyStore.getById(bountyId);
  if (!bounty || bounty.guildId !== interaction.guildId || !bounty.active) {
    await interaction.update({ embeds: [new EmbedBuilder().setTitle("🛑 End Bounty").setDescription("❌ That bounty is no longer active.")], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(backButton())] });
    return;
  }
  const ended = await bountyStore.deactivate(bountyId);
  if (!ended) {
    await interaction.update({ embeds: [new EmbedBuilder().setTitle("🛑 End Bounty").setDescription("❌ The bounty could not be ended.")], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(backButton())] });
    return;
  }
  if (bounty.messageId) {
    const channel = await interaction.client.channels.fetch(bounty.channelId).catch(() => null);
    const message = channel && "messages" in channel ? await channel.messages.fetch(bounty.messageId).catch(() => null) : null;
    if (message) {
      await message.edit({ content: "🛑 **THE WEEKLY HUNT HAS ENDED**", components: [] }).catch(() => null);
    }
  }
  await interaction.update({ embeds: [new EmbedBuilder().setTitle("✅ Bounty Ended").setDescription(`**${bounty.dinos.join(", ")}** has been concluded.`)], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(backButton())] });
}
