export type DiscordSyncStatus = "idle" | "running" | "success" | "error";

export interface DiscordSyncState {
  guildId: string;
  lastSuccessfulSync?: Date;
  lastSyncStartedAt?: Date;
  lastSyncCompletedAt?: Date;
  status: DiscordSyncStatus;
  memberCount: number;
  roleCount: number;
  lastError?: string;
  createdAt: Date;
  updatedAt: Date;
}