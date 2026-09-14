import {
  ActionRowBuilder,
  EmbedBuilder,
  MessageFlags,
  PermissionsBitField,
  StringSelectMenuBuilder,
  type ChatInputCommandInteraction,
  type User
} from "discord.js";
import { SIGILS_PER_RAFFLE_ENTRY } from "./sigilStore.js";
import type { Raffle, SigilGuildStats, SigilTransaction } from "./types/legacy.js";

const COLORS = { purple: 0x6A0DAD, gold: 0xD4AF37, green: 0x2ECC71, ember: 0xC0392B } as const;

export function isAdmin(interaction: ChatInputCommandInteraction): boolean { return interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator) ?? false; }
export async function requireAdmin(interaction: ChatInputCommandInteraction): Promise<boolean> {
  if (isAdmin(interaction)) return true;
  await interaction.reply({ content: "❌ Only server administrators may wield this sigil rite.", flags: MessageFlags.Ephemeral });
  return false;
}
export function formatSigilAmount(amount: number): string { return `${amount > 0 ? "+" : ""}${amount}`; }
export function formatTransaction(tx: SigilTransaction): string {
  return [`• <t:${Math.floor(new Date(tx.timestamp).getTime() / 1000)}:f>`, ` ${formatSigilAmount(tx.amount)} sigils`, ` — ${tx.reason}`, ` *(Balance: ${tx.balanceAfter})*`].join("");
}
export function buildBalanceEmbed(user: Pick<User, "tag" | "toString">, balance: number, transactions: SigilTransaction[], title: string, subtitle: string) {
  const recent = transactions.length > 0 ? transactions.map(formatTransaction).join("\n") : "No movements echo through your sigil ledger.";
  return new EmbedBuilder().setColor(COLORS.purple).setTitle(title).setDescription(subtitle).addFields(
    { name: "💠 Sigil Balance", value: `You currently hold **${balance} sigils**.`, inline: false },
    { name: `📜 Ledger Echoes (last ${Math.min(transactions.length || 1, transactions.length > 10 ? 15 : 10)})`, value: recent, inline: false },
    { name: "🜂 Ledger Summary", value: [`• **Earned:** ${transactions.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0)}`, `• **Spent / Removed:** ${transactions.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0)}`, `• **Current Balance:** ${balance}`].join("\n"), inline: false }
  ).setFooter({ text: `Sigil bearer: ${user.tag}` }).setTimestamp();
}
export function buildLeaderboardEmbed(entries: string[]) { return new EmbedBuilder().setColor(COLORS.gold).setTitle("🏆 Sigil Leaderboard").setDescription(entries.length > 0 ? entries.join("\n") : "No sigils have been awarded in this realm yet.").setFooter({ text: "Top 10 sigil earners in this guild" }).setTimestamp(); }
export function buildAdminPanelEmbed(stats: SigilGuildStats, activeRaffles: Raffle[]) {
  return new EmbedBuilder().setColor(COLORS.green).setTitle("🧿 Sigil Admin Panel").setDescription("Mystic economy overview for administrators.").addFields(
    { name: "👥 Sigil Bearers", value: `${stats.totalUsers}`, inline: true }, { name: "💠 Sigils in Circulation", value: `${stats.totalBalance}`, inline: true },
    { name: "🎟️ Exchange Rate", value: `${SIGILS_PER_RAFFLE_ENTRY} sigils = 1 raffle entry`, inline: true }, { name: "✨ Total Awarded", value: `${stats.totalAwarded}`, inline: true },
    { name: "🜂 Total Removed", value: `${stats.totalRemoved}`, inline: true }, { name: "🎫 Redeemed into Entries", value: `${stats.totalRedeemed}`, inline: true },
    { name: "📚 Ledger Entries", value: `${stats.totalTransactions}`, inline: true }, { name: "🔮 Active Raffles", value: `${activeRaffles.length}`, inline: true },
    { name: "🗂️ Open Rituals", value: activeRaffles.length > 0 ? activeRaffles.slice(0, 10).map(raffle => `• ${raffle.name} — ends <t:${Math.floor(raffle.endsAt / 1000)}:R>`).join("\n") : "No active raffles right now.", inline: false }
  ).setTimestamp();
}
export function buildShopEmbed(activeRaffles: Raffle[], balance: number) {
  return new EmbedBuilder().setColor(COLORS.gold).setTitle("🔮 THE SIGIL EMPORIUM").setDescription(["Offer your hard-earned Sigils to the Realm and claim your place among its active rituals.", `Exchange Rate: **${SIGILS_PER_RAFFLE_ENTRY} Sigils → 1 Ritual Entry**`, `Your Balance: **${balance} Sigils**`, "", "*Choose a ritual below and seal your entry. May the arcane favor you.*"].join("\n")).addFields({
    name: "✨ RITUALS AWAITING WIZARDS", value: activeRaffles.length > 0 ? activeRaffles.slice(0, 25).map(raffle => `• **${raffle.name}** — ${raffle.prize}\n  Ends <t:${Math.floor(raffle.endsAt / 1000)}:R>`).join("\n") : "The ritual circle is quiet... for now.", inline: false
  }).setFooter({ text: "Choose an active ritual below — no raffle ID needed." }).setTimestamp();
}
export function buildShopComponents(activeRaffles: Raffle[] = []): ActionRowBuilder<StringSelectMenuBuilder>[] {
  const menu = new StringSelectMenuBuilder().setCustomId("sigil_shop_select").setPlaceholder(activeRaffles.length > 0 ? "Choose a ritual to join" : "The ritual circle is quiet...").setDisabled(activeRaffles.length === 0).setMinValues(1).setMaxValues(1);
  if (activeRaffles.length > 0) menu.addOptions(activeRaffles.slice(0, 25).map(raffle => ({ label: (raffle.name || "WoA Community Ritual").slice(0, 100), value: raffle.id, description: `${raffle.prize} • Ends ${new Date(raffle.endsAt).toLocaleString()}`.slice(0, 100) })));
  else menu.addOptions({ label: "The circle is quiet", value: "none", description: "No active ritual awaits your Sigils right now." });
  return [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)];
}

export function buildRedeemSuccessEmbed(raffleOrEntryCount: Raffle | number, entryCountOrName: number | string, sigilCost?: number, balance?: number) {
  const raffleName = typeof raffleOrEntryCount === "number" ? String(entryCountOrName) : raffleOrEntryCount.name;
  const entryCount = typeof raffleOrEntryCount === "number" ? raffleOrEntryCount : entryCountOrName as number;
  const cost = sigilCost ?? entryCount * SIGILS_PER_RAFFLE_ENTRY;
  const remaining = balance === undefined ? "Updated" : `${balance}`;
  return new EmbedBuilder().setColor(COLORS.green).setTitle("✨ THE SIGILS HAVE BEEN OFFERED").setDescription("The ritual circle accepts your Sigil offering. Your entries have been sealed.").addFields(
    { name: "🔮 Ritual", value: raffleName, inline: false },
    { name: "🎟️ Ritual Entries", value: `${entryCount}`, inline: true },
    { name: "💠 Sigils Offered", value: `${cost}`, inline: true },
    { name: "🪙 Sigils Remaining", value: remaining, inline: true }
  ).setTimestamp();
}
