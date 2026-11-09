import { randomUUID } from "node:crypto";
import { prisma } from "../database/prisma.js";

export interface AstralSelectionNotificationInput {
  guildId: string;
  userId: string;
  selectionId: string;
  amount: number;
  awardedAt: Date;
}

export async function createAstralSelectionNotification(input: AstralSelectionNotificationInput): Promise<void> {
  await prisma.astralSelectionNotification.createMany({
    data: [{
      id: randomUUID(),
      guildId: input.guildId,
      userId: input.userId,
      selectionId: input.selectionId,
      amount: input.amount,
      awardedAt: input.awardedAt
    }],
    skipDuplicates: true
  });
}

export async function countUnreadAstralSelectionNotifications(guildId: string, userId: string): Promise<number> {
  return prisma.astralSelectionNotification.count({
    where: { guildId, userId, readAt: null }
  });
}

export async function getAstralSelectionNotifications(guildId: string, userId: string, limit = 10) {
  return prisma.astralSelectionNotification.findMany({
    where: { guildId, userId },
    orderBy: { awardedAt: "desc" },
    take: Math.max(1, Math.min(limit, 25))
  });
}

export async function markAstralSelectionNotificationsRead(guildId: string, userId: string, ids: string[]): Promise<void> {
  if (!ids.length) return;
  await prisma.astralSelectionNotification.updateMany({
    where: { guildId, userId, id: { in: ids }, readAt: null },
    data: { readAt: new Date() }
  });
}
