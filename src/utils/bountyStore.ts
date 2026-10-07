import path from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "../database/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const bountyWeeklyImage = path.join(__dirname, "..", "..", "assets", "bounty.png");

export interface BountyRecord {
  id: string;
  guildId: string;
  channelId: string;
  messageId?: string;
  tagRoleId: string;
  dinos: string[];
  stats: string[];
  bonus?: string | null;
  createdAt: number;
  active: boolean;
}

function toRecord(bounty: {
  id: string; guildId: string; channelId: string; messageId: string | null;
  tagRoleId: string; dinos: string[]; stats: string[]; bonus: string | null;
  createdAt: Date; active: boolean;
}): BountyRecord {
  return {
    id: bounty.id, guildId: bounty.guildId, channelId: bounty.channelId,
    messageId: bounty.messageId ?? undefined, tagRoleId: bounty.tagRoleId,
    dinos: bounty.dinos, stats: bounty.stats, bonus: bounty.bonus,
    createdAt: bounty.createdAt.getTime(), active: bounty.active
  };
}

export const bountyStore = {
  async create(input: Omit<BountyRecord, "id" | "createdAt" | "active">): Promise<BountyRecord> {
    const record = await prisma.bounty.create({
      data: {
        id: "bounty_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
        guildId: input.guildId,
        channelId: input.channelId,
        messageId: input.messageId ?? null,
        tagRoleId: input.tagRoleId,
        dinos: input.dinos,
        stats: input.stats,
        bonus: input.bonus ?? null,
        active: true
      }
    });
    return toRecord(record);
  },

  async setMessageId(id: string, messageId: string): Promise<BountyRecord | undefined> {
    const result = await prisma.bounty.updateMany({ where: { id }, data: { messageId } });
    if (!result.count) return undefined;
    return this.getById(id);
  },

  async getById(id: string): Promise<BountyRecord | undefined> {
    const bounty = await prisma.bounty.findUnique({ where: { id } });
    return bounty ? toRecord(bounty) : undefined;
  },

  async getActive(guildId: string): Promise<BountyRecord[]> {
    const bounties = await prisma.bounty.findMany({
      where: { guildId, active: true },
      orderBy: { createdAt: "desc" }
    });
    return bounties.map(toRecord);
  },

  async deactivate(id: string): Promise<boolean> {
    const result = await prisma.bounty.updateMany({
      where: { id, active: true },
      data: { active: false }
    });
    return result.count > 0;
  }
};
