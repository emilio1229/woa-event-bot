import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "./database/prisma.js";
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

function buildDefaultSigilUserRecord(discordUserId: string): SigilUserRecord {
  return {
    userId: discordUserId,
    balance: 0,
    transactions: []
  };
}

function parseSigilTransactions(value: Prisma.JsonValue): SigilTransaction[] {
  return Array.isArray(value) ? (value as unknown as SigilTransaction[]) : [];
}

function toSigilUserRecord(account: {
  guildId: string;
  discordUserId: string;
  balance: number;
  lastDaily: bigint | null;
  transactions: Prisma.JsonValue;
}): SigilUserRecord {
  return {
    userId: account.discordUserId,
    balance: account.balance,
    transactions: parseSigilTransactions(account.transactions),
    lastDaily: account.lastDaily === null ? undefined : Number(account.lastDaily)
  };
}

function toSigilStoreData(accounts: Array<{
  guildId: string;
  discordUserId: string;
  balance: number;
  lastDaily: bigint | null;
  transactions: Prisma.JsonValue;
}>): SigilStoreData {
  return {
    guilds: accounts.reduce<SigilStoreData["guilds"]>((guilds, account) => {
      guilds[account.guildId] ??= { users: {} };
      guilds[account.guildId].users[account.discordUserId] = toSigilUserRecord(account);
      return guilds;
    }, {})
  };
}

class SigilStore {
  private recalculateUser(user: SigilUserRecord) {
    let runningBalance = 0;

    for (let index = user.transactions.length - 1; index >= 0; index -= 1) {
      runningBalance += user.transactions[index].amount;
      user.transactions[index].balanceAfter = runningBalance;
    }

    user.balance = runningBalance;
  }

  private async getAccount(guildId: string, userId: string) {
    return prisma.sigilAccount.findUnique({
      where: {
        guildId_discordUserId: {
          guildId,
          discordUserId: userId
        }
      }
    });
  }

  private async writeUser(guildId: string, user: SigilUserRecord): Promise<void> {
    await prisma.sigilAccount.upsert({
      where: {
        guildId_discordUserId: {
          guildId,
          discordUserId: user.userId
        }
      },
      create: {
        guildId,
        discordUserId: user.userId,
        balance: user.balance,
        transactions: user.transactions as unknown as Prisma.InputJsonValue,
        lastDaily: user.lastDaily === undefined ? null : BigInt(user.lastDaily)
      },
      update: {
        balance: user.balance,
        transactions: user.transactions as unknown as Prisma.InputJsonValue,
        lastDaily: user.lastDaily === undefined ? null : BigInt(user.lastDaily)
      }
    });
  }

  async load(): Promise<SigilStoreData> {
    const accounts = await prisma.sigilAccount.findMany();
    return toSigilStoreData(accounts);
  }

  async persist(): Promise<void> {}

  async save(): Promise<void> {}

  async ensureGuild(guildId: string): Promise<SigilGuildRecord> {
    return {
      users: await this.getGuildUsers(guildId)
    };
  }

  async ensureUser(guildId: string, userId: string): Promise<SigilUserRecord> {
    return this.getUser(guildId, userId);
  }

  async getGuildUsers(guildId: string): Promise<Record<string, SigilUserRecord>> {
    const accounts = await prisma.sigilAccount.findMany({
      where: { guildId }
    });
    return accounts.reduce<Record<string, SigilUserRecord>>((users, account) => {
      users[account.discordUserId] = toSigilUserRecord(account);
      return users;
    }, {});
  }

  async getUser(guildId: string, userId: string): Promise<SigilUserRecord> {
    const account = await this.getAccount(guildId, userId);
    return account ? toSigilUserRecord(account) : buildDefaultSigilUserRecord(userId);
  }

  async getBalance(guildId: string, userId: string): Promise<number> {
    return (await this.getUser(guildId, userId)).balance;
  }

  async addTransaction(
    guildId: string,
    userId: string,
    amount: number,
    reason: string,
    metadata: SigilTransactionMetadata = {}
  ): Promise<{ user: SigilUserRecord; transaction: SigilTransaction }> {
    if (!Number.isInteger(amount) || amount === 0) {
      throw new Error("Sigil amount must be a non-zero integer.");
    }

    const user = await this.getUser(guildId, userId);
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

    await this.writeUser(guildId, user);
    return { user, transaction };
  }

  async rollbackTransaction(guildId: string, userId: string, transactionId: string): Promise<boolean> {
    const user = await this.getUser(guildId, userId);
    const index = user.transactions.findIndex(transaction => transaction.id === transactionId);

    if (index === -1) {
      return false;
    }

    user.transactions.splice(index, 1);
    this.recalculateUser(user);
    await this.writeUser(guildId, user);
    return true;
  }

  async award(guildId: string, userId: string, amount: number, reason: string, actorId?: string): Promise<SigilUserRecord> {
    return (await this.addTransaction(guildId, userId, amount, reason, {
      actorId,
      type: amount > 0 ? "award" : "removal"
    })).user;
  }

  async awardSigils(
    guildId: string,
    userId: string,
    amount: number,
    reason: string,
    actorId = "system"
  ): Promise<SigilUserRecord> {
    return this.award(guildId, userId, amount, reason, actorId);
  }

  async redeem(
    guildId: string,
    userId: string,
    entryCount: number,
    raffleId: string,
    raffleName: string
  ): Promise<SigilRedemptionResult> {
    if (!Number.isInteger(entryCount) || entryCount <= 0) {
      throw new Error("Entry count must be a positive integer.");
    }

    const sigilCost = entryCount * SIGILS_PER_RAFFLE_ENTRY;
    const result = await this.addTransaction(
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

  async setLastDaily(guildId: string, userId: string, lastDaily: number): Promise<void> {
    const user = await this.getUser(guildId, userId);
    user.lastDaily = lastDaily;
    await this.writeUser(guildId, user);
  }

  async getTransactions(guildId: string, userId: string, limit = 10): Promise<SigilTransaction[]> {
    return (await this.getUser(guildId, userId)).transactions.slice(0, limit);
  }

  async getLeaderboard(guildId: string, limit = 10): Promise<SigilUserRecord[]> {
    const accounts = await prisma.sigilAccount.findMany({
      where: { guildId },
      orderBy: [
        { balance: "desc" },
        { updatedAt: "desc" }
      ],
      take: limit
    });

    return accounts.map(toSigilUserRecord);
  }

  async getGuildStats(guildId: string): Promise<SigilGuildStats> {
    const guild = await this.ensureGuild(guildId);
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
