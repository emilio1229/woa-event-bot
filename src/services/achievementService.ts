import { sigilStore } from "../sigilStore.js";
import { bountyStore } from "../utils/bountyStore.js";

export interface AchievementRecord {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: string;
}

export async function getUserAchievements(guildId: string, userId: string): Promise<AchievementRecord[]> {
  const user = await sigilStore.getUser(guildId, userId);
  const bounties = await bountyStore.getActive(guildId);
  const transactions = user.transactions.length;
  const balance = user.balance;
  const dailyClaims = user.transactions.filter(tx => tx.reason === "Daily reward").length;

  return [
    {
      id: "first-sigil",
      name: "First Sigil",
      description: "Earn your first Sigil.",
      icon: "💎",
      unlocked: balance > 0 || transactions > 0
    },
    {
      id: "daily-initiate",
      name: "Daily Initiate",
      description: "Claim a daily Sigil.",
      icon: "🌅",
      unlocked: dailyClaims >= 1,
      progress: `${Math.min(dailyClaims, 1)}/1`
    },
    {
      id: "sigil-adept",
      name: "Sigil Adept",
      description: "Reach 25 Sigils.",
      icon: "✨",
      unlocked: balance >= 25,
      progress: `${Math.min(balance, 25)}/25`
    },
    {
      id: "ledger-keeper",
      name: "Ledger Keeper",
      description: "Record 25 Sigil transactions.",
      icon: "📜",
      unlocked: transactions >= 25,
      progress: `${Math.min(transactions, 25)}/25`
    },
    {
      id: "bounty-watcher",
      name: "Bounty Watcher",
      description: "Visit the active bounty board while a hunt is running.",
      icon: "🜁",
      unlocked: bounties.length > 0
    }
  ];
}
