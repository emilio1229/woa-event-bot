import { randomUUID } from "node:crypto";
import { prisma } from "./database/prisma.js";

export interface RiddleRecord {
  id: string; guildId: string; channelId: string; messageId?: string;
  question: string; answer: string; hint?: string; reward: number;
  active: boolean; winnerId?: string | null; createdAt: Date;
}
export interface RiddleGuessRecord {
  id: string; riddleId: string; userId: string; answer: string;
  correct: boolean; createdAt: Date;
}
function normalize(value: string) { return value.trim().replace(/\s+/g, " ").toLocaleLowerCase(); }
function toRecord(r: any): RiddleRecord {
  return { ...r, messageId: r.messageId ?? undefined, hint: r.hint ?? undefined, winnerId: r.winnerId ?? undefined };
}
function toGuess(r: any): RiddleGuessRecord { return r; }

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

  async getById(id: string) {
    const r = await prisma.riddle.findUnique({ where: { id } });
    return r ? toRecord(r) : undefined;
  }

  async getActive(guildId: string) {
    const r = await prisma.riddle.findFirst({ where: { guildId, active: true }, orderBy: { createdAt: "desc" } });
    return r ? toRecord(r) : undefined;
  }

  async getActiveRiddles(guildId: string) {
    const rows = await prisma.riddle.findMany({
      where: { guildId, active: true },
      orderBy: { createdAt: "desc" }
    });
    return rows.map(toRecord);
  }

  async submitAnswer(id: string, answer: string, userId: string) {
    const r = await this.getById(id);
    if (!r || !r.active) return "closed" as const;
    if (normalize(answer) !== r.answer) {
      await this.recordGuess(id, userId, answer, false);
      return "wrong" as const;
    }

    const claimed = await prisma.riddle.updateMany({
      where: { id, active: true, winnerId: null },
      data: { active: false, winnerId: userId }
    });
    if (claimed.count !== 1) return "claimed" as const;

    await this.recordGuess(id, userId, answer, true);
    return "correct" as const;
  }

  async recordGuess(id: string, userId: string, answer: string, correct: boolean) {
    return toGuess(await prisma.riddleGuess.create({
      data: { id: randomUUID(), riddleId: id, userId, answer: answer.trim().replace(/\s+/g, " "), correct }
    }));
  }

  async getRecentGuesses(id: string, limit = 6) {
    const rows = await prisma.riddleGuess.findMany({ where: { riddleId: id }, orderBy: { createdAt: "desc" }, take: limit });
    return rows.reverse().map(toGuess);
  }

  async getAllGuesses(id: string) {
    const rows = await prisma.riddleGuess.findMany({ where: { riddleId: id }, orderBy: { createdAt: "asc" } });
    return rows.map(toGuess);
  }

  async getStats(id: string) {
    const [attempts, participants] = await Promise.all([
      prisma.riddleGuess.count({ where: { riddleId: id } }),
      prisma.riddleGuess.findMany({ where: { riddleId: id }, distinct: ["userId"], select: { userId: true } })
    ]);
    return { attempts, participants: participants.length };
  }

  async end(id: string) { await prisma.riddle.updateMany({ where: { id, active: true }, data: { active: false } }); }
}
export const riddleStore = new RiddleStore();
