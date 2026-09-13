export interface DiscordMember {
  guildId: string;
  discordUserId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  roleIds: string[];
  joinedAt?: Date;
  isBot: boolean;
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}