import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { writeJsonAtomic } from "./utils/atomicJson.js";
import type {
  SigilGuildRecord,
  SigilGuildStats,
  SigilRedemptionResult,
  SigilStoreData,
  SigilTransaction,
  SigilTransactionMetadata,
  SigilUserRecord
} from "./types/legacy.js";

const configuredSigilRate = Number.parseInt(process.env.SIGILS_PER_RAFFLE_ENTRY ?? "", 10);
export const SIGILS_PER_RAFFLE_ENTRY = Number.isInteger(configuredSigilRate) && configuredSigilRate > 0
  ? configuredSigilRate
  : 100;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");
const DATA_PATH = path.join(DATA_DIR, "sigils.json");

class SigilStore {
  private data: SigilStoreData;

  constructor() {
    this.data = this.load();
  }

  load(): SigilStoreData {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });

      if (!fs.existsSync(DATA_PATH)) {
        return { guilds: {} };
      }

      const raw = fs.readFileSync(DATA_PATH, "utf8");
      const parsed = JSON.parse(raw) as SigilStoreData;
      return parsed && typeof parsed === "object" ? parsed : { guilds: {} };
    } catch (err) {
      console.error("Failed to load sigil store:", err);
      return { guilds: {} };
    }
  }

  persist() {
    writeJsonAtomic(DATA_PATH, this.data);
  }

  save() {
    this.persist();
  }

  ensureGuild(guildId: string): SigilGuildRecord {
    if (!this.data.guilds[guildId]) {
      this.data.guilds[guildId] = { users: {} };
    }

    return this.data.guilds[guildId];
  }

  ensureUser(guildId: string, userId: string): SigilUserRecord {
    const guild = this.ensureGuild(guildId);

    if (!guild.users[userId]) {
      guild.users[userId] = {
        userId,
        balance: 0,
        transactions: []
      };
    }

    return guild.users[userId];
  }

  getGuildUsers(guildId: string): Record<string, SigilUserRecord> {
    return this.ensureGuild(guildId).users;
  }

  recalculateUser(user: SigilUserRecord) {
    let runningBalance = 0;

    for (let index = user.transactions.length - 1; index >= 0; index -= 1) {
      runningBalance += user.transactions[index].amount;
      user.transactions[index].balanceAfter = runningBalance;
    }

    user.balance = runningBalance;
  }

  getUser(guildId: string, userId: string): SigilUserRecord {
    return this.ensureUser(guildId, userId);
  }

  getBalance(guildId: string, userId: string): number {
    return this.getUser(guildId, userId).balance;
  }

  addTransaction(
    guildId: string,
    userId: string,
    amount: number,
    reason: string,
    metadata: SigilTransactionMetadata = {}
  ): { user: SigilUserRecord; transaction: SigilTransaction } {
    if (!Number.isInteger(amount) || amount === 0) {
      throw new Error("Sigil amount must be a non-zero integer.");
    }

    const user = this.ensureUser(guildId, userId);
    const nextBalance = user.balance + amount;

    if (nextBalance < 0) {
      throw new Error("This user does not have enough sigils for that adjustment.");
    }

    const transaction: SigilTransaction = {
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      amount,
      reason,
      balanceAfter: nextBalance,
      ...metadata
    };

    user.balance = nextBalance;
    user.transactions.unshift(transaction);

    this.persist();
    return { user, transaction };
  }

  rollbackTransaction(guildId: string, userId: string, transactionId: string): boolean {
    const user = this.ensureUser(guildId, userId);
    const index = user.transactions.findIndex(transaction => transaction.id === transactionId);

    if (index === -1) {
      return false;
    }

    user.transactions.splice(index, 1);
    this.recalculateUser(user);
    this.persist();
    return true;
  }

  award(guildId: string, userId: string, amount: number, reason: string, actorId?: string): SigilUserRecord {
    return this.addTransaction(guildId, userId, amount, reason, {
      actorId,
      type: amount > 0 ? "award" : "removal"
    }).user;
  }

  awardSigils(
    guildId: string,
    userId: string,
    amount: number,
    reason: string,
    actorId = "system"
  ): SigilUserRecord {
    return this.award(guildId, userId, amount, reason, actorId);
  }

  redeem(
    guildId: string,
    userId: string,
    entryCount: number,
    raffleId: string,
    raffleName: string
  ): SigilRedemptionResult {
    if (!Number.isInteger(entryCount) || entryCount <= 0) {
      throw new Error("Entry count must be a positive integer.");
    }

    const sigilCost = entryCount * SIGILS_PER_RAFFLE_ENTRY;
    const result = this.addTransaction(
      guildId,
      userId,
      -sigilCost,
      `Redeemed ${entryCount} raffle ${entryCount === 1 ? "entry" : "entries"} for ${raffleName}`,
      {
        type: "redeem",
        raffleId,
        raffleName,
        entryCount,
        sigilCost
      }
    );

    return {
      sigilCost,
      user: result.user,
      transaction: result.transaction
    };
  }

  getTransactions(guildId: string, userId: string, limit = 10): SigilTransaction[] {
    return this.getUser(guildId, userId).transactions.slice(0, limit);
  }

  getLeaderboard(guildId: string, limit = 10): SigilUserRecord[] {
    const guild = this.ensureGuild(guildId);

    return Object.values(guild.users)
      .sort((a, b) => b.balance - a.balance || b.transactions.length - a.transactions.length)
      .slice(0, limit);
  }

  getGuildStats(guildId: string): SigilGuildStats {
    const guild = this.ensureGuild(guildId);
    const users = Object.values(guild.users);

    let totalAwarded = 0;
    let totalRemoved = 0;
    let totalRedeemed = 0;
    let totalTransactions = 0;

    for (const user of users) {
      totalTransactions += user.transactions.length;

      for (const tx of user.transactions) {
        if (tx.amount > 0) {
          totalAwarded += tx.amount;
        } else {
          totalRemoved += Math.abs(tx.amount);

          if (tx.type === "redeem") {
            totalRedeemed += Math.abs(tx.amount);
          }
        }
      }
    }

    return {
      totalUsers: users.length,
      totalBalance: users.reduce((sum, user) => sum + user.balance, 0),
      totalAwarded,
      totalRemoved,
      totalRedeemed,
      totalTransactions
    };
  }
}

export const sigilStore = new SigilStore();
