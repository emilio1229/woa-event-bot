export interface Raffle {
  id: string;
  guildId: string;
  channelId: string;
  messageId?: string;
  threadId?: string;
  name: string;
  prize: string;
  endsAt: number;
  tagRole?: string;
  invocationText?: string;
  ritualType?: string;
  winnerId?: string | null;
  ended: boolean;
  entries: string[];
  boundUsers?: string[];
}

export type CreateRaffleInput = Omit<Raffle, "id" | "ended"> & {
  entries?: string[];
};

export type SigilTransactionType = "award" | "removal" | "redeem";

export interface SigilTransactionMetadata {
  actorId?: string;
  type?: SigilTransactionType;
  raffleId?: string;
  raffleName?: string;
  entryCount?: number;
  sigilCost?: number;
}

export interface SigilTransaction extends SigilTransactionMetadata {
  id: string;
  timestamp: string;
  amount: number;
  reason: string;
  balanceAfter: number;
}

export interface SigilUserRecord {
  userId: string;
  balance: number;
  transactions: SigilTransaction[];
  lastDaily?: number;
}

export interface SigilGuildRecord {
  users: Record<string, SigilUserRecord>;
}

export interface SigilStoreData {
  guilds: Record<string, SigilGuildRecord>;
}

export interface SigilGuildStats {
  totalUsers: number;
  totalBalance: number;
  totalAwarded: number;
  totalRemoved: number;
  totalRedeemed: number;
  totalTransactions: number;
}

export interface SigilRedemptionResult {
  sigilCost: number;
  user: SigilUserRecord;
  transaction: SigilTransaction;
}
