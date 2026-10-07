import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, type Interaction, type ModalSubmitInteraction } from "discord.js";
import { riddleStore } from "../riddleStore.js";
import { sigilStore } from "../sigilStore.js";

export const RIDDLE_PREFIX = "woa:riddle";
const drafts = new Map<string, { guildId: string; channelId: string }>();
const button = (label: string, id: string, style = ButtonStyle.Primary) => new ButtonBuilder().setLabel(label).setCustomId(id).setStyle(style);
const row = (...b: ButtonBuilder[]) => new ActionRowBuilder<ButtonBuilder>().addComponents(b);
const back = () => button("◀ Council", "woa:council:home", ButtonStyle.Secondary);
const input = (id: string, label: string, placeholder: string, style: TextInputStyle, required = true) => new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId(id).setLabel(label).setPlaceholder(placeholder).setStyle(style).setRequired(required));

function formatGuess(answer: string) {
  const clean = answer.trim().replace(/\s+/g, " ");
  return clean.length > 55 ? clean.slice(0, 52) + "..." : clean;
}

async function buildLiveRiddleEmbed(riddleId: string) {
  const riddle = await riddleStore.getById(riddleId);
  if (!riddle) return undefined;
  const [guesses, stats] = await Promise.all([
    riddleStore.getRecentGuesses(riddleId, 6),
    riddleStore.getStats(riddleId)
  ]);
  const embed = new EmbedBuilder()
    .setColor(0x4B0082)
    .setTitle("🧩 THE ARCANE RIDDLE")
    .setDescription(riddle.question)
    .addFields(
      { name: "💠 Reward", value: riddle.reward + " Sigils", inline: true },
      { name: "📊 Hunt", value: stats.attempts + " guesses • " + stats.participants + " wizards", inline: true },
      { name: "📜 Recent Guesses", value: guesses.length ? guesses.map(g => "🧙 <@" + g.userId + "> — *" + formatGuess(g.answer) + "* ❌").join("\n") : "No guesses yet. The hunt is yours to begin." }
    )
    .setFooter({ text: "The first correct answer claims the reward." });
  return embed;
}

function solvedEmbed(riddle: Awaited<ReturnType<typeof riddleStore.getById>>, winnerId: string, attempts: number, participants: number, solveSeconds: number, guesses: Awaited<ReturnType<typeof riddleStore.getRecentGuesses>>) {
  if (!riddle) return undefined;
  const duration = solveSeconds < 60 ? solveSeconds + "s" : Math.floor(solveSeconds / 60) + "m " + (solveSeconds % 60) + "s";
  const finalGuesses = guesses.length
    ? guesses.map(g => "🧙 <@" + g.userId + "> — *" + formatGuess(g.answer) + "* " + (g.correct ? "✅" : "❌")).join("\n")
    : "No guesses recorded.";
  return new EmbedBuilder()
    .setColor(0xFFD700)
    .setTitle("✨ THE RIDDLE HAS BEEN BROKEN ✨")
    .setDescription(riddle.question)
    .addFields(
      { name: "🔮 Answer", value: "**" + riddle.answer + "**", inline: true },
      { name: "👑 Riddlebreaker", value: "<@" + winnerId + ">", inline: true },
      { name: "💠 Reward", value: riddle.reward + " Sigils", inline: true },
      { name: "📊 Hunt Results", value: attempts + " guesses • " + participants + " wizards • solved in " + duration },
      { name: "📜 Final Guesses", value: finalGuesses }
    )
    .setFooter({ text: "The arcane seal has closed." });
}

export function buildRiddlePanel() {
  return { embeds: [new EmbedBuilder().setColor(0x4B0082).setTitle("🧩 THE ARCANE RIDDLE").setDescription("Inscribe a riddle. The first wizard to solve it claims the Sigil reward.")], components: [row(button("✨ Create Riddle", RIDDLE_PREFIX + ":start")), row(back())] };
}

export async function handleRiddlePanel(interaction: Interaction): Promise<boolean> {
  if (!interaction.isButton() && !interaction.isChannelSelectMenu() && !interaction.isModalSubmit()) return false;
  if (!interaction.customId.startsWith(RIDDLE_PREFIX + ":")) return false;
  if (interaction.isButton() && interaction.customId === RIDDLE_PREFIX + ":start") {
    const menu = new ChannelSelectMenuBuilder().setCustomId(RIDDLE_PREFIX + ":channel").setPlaceholder("Choose the riddle channel").setMinValues(1).setMaxValues(1).setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);
    await interaction.update({ embeds: [new EmbedBuilder().setTitle("🧩 Riddle Channel").setDescription("Choose where to post the riddle.")], components: [new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(menu), row(back())] });
    return true;
  }
  if (interaction.isChannelSelectMenu() && interaction.customId === RIDDLE_PREFIX + ":channel") {
    drafts.set(interaction.user.id, { guildId: interaction.guildId ?? "", channelId: interaction.values[0] });
    const modal = new ModalBuilder().setCustomId(RIDDLE_PREFIX + ":modal:" + interaction.user.id).setTitle("Inscribe Arcane Riddle");
    modal.addComponents(input("question","Riddle","Write the riddle",TextInputStyle.Paragraph), input("answer","Answer","Correct answer",TextInputStyle.Short), input("reward","Sigil reward","Example: 10",TextInputStyle.Short), input("hint","Optional hint","Leave blank if none",TextInputStyle.Paragraph,false));
    await interaction.showModal(modal); return true;
  }
  if (interaction.isModalSubmit() && interaction.customId.startsWith(RIDDLE_PREFIX + ":modal:")) {
    const draft = drafts.get(interaction.user.id);
    if (!draft) { await interaction.reply({ content: "❌ That riddle draft expired.", ephemeral: true }); return true; }
    const question = interaction.fields.getTextInputValue("question").trim();
    const answer = interaction.fields.getTextInputValue("answer").trim();
    const reward = Number.parseInt(interaction.fields.getTextInputValue("reward").trim(),10);
    const hint = interaction.fields.getTextInputValue("hint").trim();
    if (!question || !answer || !Number.isInteger(reward) || reward < 1 || reward > 10000) { await interaction.reply({ content: "❌ Enter a riddle, answer, and reward from 1–10,000.", ephemeral: true }); return true; }
    if (await riddleStore.getActive(draft.guildId)) { await interaction.reply({ content: "❌ There is already an active riddle.", ephemeral: true }); return true; }
    const channel = await interaction.client.channels.fetch(draft.channelId).catch(() => null);
    if (!channel || !channel.isSendable()) { await interaction.reply({ content: "❌ That channel cannot receive messages.", ephemeral: true }); return true; }
    const riddle = await riddleStore.create({ guildId: draft.guildId, channelId: draft.channelId, question, answer, hint: hint || undefined, reward });
    const embed = await buildLiveRiddleEmbed(riddle.id);
    const buttons = [button("🗝️ Submit Answer", RIDDLE_PREFIX + ":answer:" + riddle.id)];
    if (hint) buttons.push(button("💡 Reveal Hint", RIDDLE_PREFIX + ":hint:" + riddle.id, ButtonStyle.Secondary));
    const message = await channel.send({ embeds:[embed!], components:[row(...buttons)] });
    await riddleStore.setMessageId(riddle.id, message.id);
    drafts.delete(interaction.user.id);
    await interaction.reply({ content: "✅ The riddle has been inscribed in <#" + draft.channelId + ">.", ephemeral: true }); return true;
  }
  return false;
}

export async function handleRiddleInteraction(interaction: Interaction): Promise<boolean> {
  if (!interaction.isButton() || !interaction.customId.startsWith(RIDDLE_PREFIX + ":")) return false;
  const parts = interaction.customId.split(":"); const action = parts[2]; const id = parts[3];
  if (action === "history" && id) {
    const guesses = await riddleStore.getAllGuesses(id);
    if (!guesses.length) { await interaction.reply({ content: "📜 No guesses were recorded for this riddle.", ephemeral: true }); return true; }
    const lines = guesses.map((g, i) => (i + 1) + ". <@" + g.userId + "> — " + formatGuess(g.answer) + " " + (g.correct ? "✅" : "❌"));
    let content = "📜 **Full Guess History**\n\n" + lines.join("\n");
    if (content.length > 1900) content = content.slice(0, 1897) + "...";
    await interaction.reply({ content, ephemeral: true });
    return true;
  }
  const riddle = id ? await riddleStore.getById(id) : undefined;
  if (action === "hint") { await interaction.reply({ content: riddle?.active && riddle.hint ? "💡 Arcane Hint: " + riddle.hint : "🕯️ The hint has faded.", ephemeral: true }); return true; }
  if (action === "answer" && riddle?.active) {
    const modal = new ModalBuilder().setCustomId(RIDDLE_PREFIX + ":answerModal:" + riddle.id).setTitle("Answer the Arcane Riddle");
    modal.addComponents(input("answer","Your answer","Speak your answer",TextInputStyle.Short));
    await interaction.showModal(modal); return true;
  }
  await interaction.reply({ content: "🕯️ That riddle is no longer active.", ephemeral: true }); return true;
}

export async function handleRiddleAnswerModal(interaction: ModalSubmitInteraction): Promise<boolean> {
  if (!interaction.customId.startsWith(RIDDLE_PREFIX + ":answerModal:")) return false;
  const id = interaction.customId.slice((RIDDLE_PREFIX + ":answerModal:").length);
  const riddle = await riddleStore.getById(id);
  if (!riddle?.active) { await interaction.reply({ content:"🕯️ Another wizard has already claimed this riddle.", ephemeral:true }); return true; }

  const result = await riddleStore.submitAnswer(id, interaction.fields.getTextInputValue("answer"), interaction.user.id);
  if (result === "wrong") {
    const updated = await buildLiveRiddleEmbed(id);
    if (updated && riddle.messageId) {
      const channel = await interaction.client.channels.fetch(riddle.channelId).catch(() => null);
      if (channel && "messages" in channel) {
        const message = await channel.messages.fetch(riddle.messageId).catch(() => null);
        if (message) await message.edit({ embeds:[updated] }).catch(() => undefined);
      }
    }
    await interaction.reply({ content:"❌ The sigils reject that answer. The riddle remains sealed.", ephemeral:true }); return true;
  }

  if (result !== "correct" || !interaction.guildId) { await interaction.reply({ content:"🕯️ Another wizard has already claimed this riddle.", ephemeral:true }); return true; }

  const user = await sigilStore.awardSigils(interaction.guildId, interaction.user.id, riddle.reward, "Solved Arcane Riddle: " + riddle.id);
  const [stats, guesses] = await Promise.all([riddleStore.getStats(id), riddleStore.getRecentGuesses(id, 6)]);
  const solveSeconds = Math.max(0, Math.floor((Date.now() - riddle.createdAt.getTime()) / 1000));
  const embed = solvedEmbed(riddle, interaction.user.id, stats.attempts, stats.participants, solveSeconds, guesses);

  if (riddle.messageId) {
    const channel = await interaction.client.channels.fetch(riddle.channelId).catch(() => null);
    if (channel && "messages" in channel) {
      const message = await channel.messages.fetch(riddle.messageId).catch(() => null);
      if (message) await message.edit({ embeds:[embed!], components:[row(button("📜 View Full Guess History", RIDDLE_PREFIX + ":history:" + riddle.id, ButtonStyle.Secondary))] }).catch(() => undefined);
    }
  }
  await interaction.reply({ content:"✨ The sigils recognize you, Riddlebreaker. You earned " + riddle.reward + " Sigils. Your balance is now " + user.balance + ".", ephemeral:true }); return true;
}
