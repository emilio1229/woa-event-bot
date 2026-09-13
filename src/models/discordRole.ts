export interface DiscordRole {
  guildId: string;
  discordRoleId: string;
  name: string;
  position: number;
  color?: number;
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}