import { prisma } from "../database/prisma.js";

export class DiscordSyncStateRepository {
  async markSyncStarted(guildId: string) {
    const startedAt = new Date();

    await prisma.discordSyncState.upsert({
      where: { guildId },
      create: {
        guildId,
        status: "running",
        lastSyncStartedAt: startedAt,
        memberCount: 0,
        roleCount: 0
      },
      update: {
          status: "running",
          lastSyncStartedAt: startedAt,
          lastError: null
      }
    });
  }

  async markSyncSuccess(guildId: string, memberCount: number, roleCount: number) {
    const completedAt = new Date();

    await prisma.discordSyncState.upsert({
      where: { guildId },
      create: {
        guildId,
        status: "success",
        memberCount,
        roleCount,
        lastSuccessfulSync: completedAt,
        lastSyncCompletedAt: completedAt
      },
      update: {
          status: "success",
          memberCount,
          roleCount,
          lastSuccessfulSync: completedAt,
          lastSyncCompletedAt: completedAt,
          lastError: null
      }
    });
  }

  async markSyncFailure(guildId: string, error: unknown) {
    await prisma.discordSyncState.upsert({
      where: { guildId },
      create: {
        guildId,
        status: "error",
        memberCount: 0,
        roleCount: 0,
        lastSyncCompletedAt: new Date(),
        lastError: error instanceof Error ? error.message : String(error)
      },
      update: {
          status: "error",
          lastSyncCompletedAt: new Date(),
          lastError: error instanceof Error ? error.message : String(error)
      }
    });
  }
}

export const discordSyncStateRepository = new DiscordSyncStateRepository();