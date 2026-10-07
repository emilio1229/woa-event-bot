import { randomUUID } from "node:crypto";
import { prisma } from "./database/prisma.js";

export interface RiddleRecord {
  id: string; guildId: string; channelId: string; messageId?: string;
  question: string; answer: string; hint?: string; reward: number;
  active: boolean; winnerId?: string | null; createdAt: Date;
}
function normalize(value: string) { return value.trim().replace(/\s+/g, " ").toLocaleLowerCase(); }
function toRecord(r: any): RiddleRecord {
  return { ...r, messageId: r.messageId ?? undefined, hint: r.hint ?? undefined, winnerId: r.winnerId ?? undefined };
}
class RiddleStore {
  async create(data: Omit<RiddleRecord, "id"|"active"|"createdAt">) {
    const r = await prisma.riddle.create({ data: {
      id: randomUUID(), guildId: data.guildId, channelId: data.channelId,
      messageId: data.messageId ?? null, question: data.question, answer: normalize(data.answer),
      hint: data.hint?.trim() || null, reward: data.reward, active: true, winnerId: null
    }});
    return toRecord(r);
  }
  async setMessageId(id: string, messageId: string) { await prisma.riddle.update({ where: { id }, data: { messageId } }); }
  async getById(id: string) { const r = await prisma.riddle.findUnique({ where: { id } }); return r ? toRecord(r) : undefined; }
  async getActive(guildId: string) {
    const r = await prisma.riddle.findFirst({ where: { guildId, active: true }, orderBy: { createdAt: "desc" } });
    return r ? toRecord(r) : undefined;
  }
  async submitAnswer(id: string, answer: string, userId: string) {
    const r = await this.getById(id);
    if (!r || !r.active) return "closed" as const;
    if (normalize(answer) !== r.answer) return "wrong" as const;
    const claimed = await prisma.riddle.updateMany({ where: { id, active: true, winnerId: null }, data: { active: false, winnerId: userId } });
    return claimed.count === 1 ? "correct" as const : "claimed" as const;
  }
  async end(id: string) { await prisma.riddle.updateMany({ where: { id, active: true }, data: { active: false } }); }
}
export const riddleStore = new RiddleStore();
