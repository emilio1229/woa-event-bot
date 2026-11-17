import { randomUUID } from "node:crypto";
import { prisma } from "./database/prisma.js";
import type { CreateRaffleInput, Raffle } from "./types/legacy.js";

function toRaffleRecord(raffle: {
  id: string;
  guildId: string;
  channelId: string;
  messageId: string | null;
  name: string;
  prize: string;
  endsAt: bigint;
  tagRole: string | null;
  invocationText: string | null;
  ritualType: string | null;
  winnerId: string | null;
  ended: boolean;
  entries: string[];
  boundUsers: string[];
  hostId: string | null;
  deliveryStatus: string | null;
  hostDeliveryConfirmedAt: Date | null;
  winnerReceiptConfirmedAt: Date | null;
  deliveryDisputeNote: string | null;
  deliveryDisputedAt: Date | null;
}): Raffle {
  return {
    ...raffle,
    endsAt: Number(raffle.endsAt),
    tagRole: raffle.tagRole ?? undefined,
    invocationText: raffle.invocationText ?? undefined,
    ritualType: raffle.ritualType ?? undefined,
    winnerId: raffle.winnerId ?? undefined,
    messageId: raffle.messageId ?? undefined,
    boundUsers: raffle.boundUsers.length > 0 ? raffle.boundUsers : [],
    hostId: raffle.hostId ?? null,
    deliveryStatus: raffle.deliveryStatus ?? null,
    hostDeliveryConfirmedAt: raffle.hostDeliveryConfirmedAt ?? null,
    winnerReceiptConfirmedAt: raffle.winnerReceiptConfirmedAt ?? null,
    deliveryDisputeNote: raffle.deliveryDisputeNote ?? null,
    deliveryDisputedAt: raffle.deliveryDisputedAt ?? null
  };
}

class RaffleStore {
  /** Historical raffles are retained permanently; cleanup must never erase entries or winners. */
  async cleanup(): Promise<void> {
    // Intentionally non-destructive. Retained for compatibility with older callers.
  }

  async create(data: CreateRaffleInput): Promise<Raffle> {
    const raffle: Raffle = {
      ...data,
      id: randomUUID(),
      ended: false,
      entries: data.entries ?? []
    };

    await prisma.raffle.create({
      data: {
        ...raffle,
        endsAt: BigInt(raffle.endsAt),
        messageId: raffle.messageId ?? null,
        tagRole: raffle.tagRole ?? null,
        invocationText: raffle.invocationText ?? null,
        ritualType: raffle.ritualType ?? null,
        winnerId: raffle.winnerId ?? null,
        boundUsers: raffle.boundUsers ?? [],
        hostId: raffle.hostId ?? null
      }
    });

    return raffle;
  }

  async save(updated: Raffle): Promise<void> {
    await prisma.raffle.upsert({
      where: { id: updated.id },
      create: {
        ...updated,
        endsAt: BigInt(updated.endsAt),
        messageId: updated.messageId ?? null,
        tagRole: updated.tagRole ?? null,
        invocationText: updated.invocationText ?? null,
        ritualType: updated.ritualType ?? null,
        winnerId: updated.winnerId ?? null,
        boundUsers: updated.boundUsers ?? [],
        hostId: updated.hostId ?? null
      },
      update: {
        guildId: updated.guildId,
        channelId: updated.channelId,
        messageId: updated.messageId ?? null,
        name: updated.name,
        prize: updated.prize,
        endsAt: BigInt(updated.endsAt),
        tagRole: updated.tagRole ?? null,
        invocationText: updated.invocationText ?? null,
        ritualType: updated.ritualType ?? null,
        winnerId: updated.winnerId ?? null,
        ended: updated.ended,
        entries: updated.entries,
        boundUsers: updated.boundUsers ?? [],
        hostId: updated.hostId ?? null
      }
    });
  }

  async markEnded(raffleId: string): Promise<void> {
    await prisma.raffle.updateMany({
      where: { id: raffleId },
      data: { ended: true }
    });
    await this.cleanup();
  }

  async end(raffleId: string, winnerId?: string | null): Promise<void> {
    const raffle = await prisma.raffle.findUnique({ where: { id: raffleId }, select: { hostId: true } });
    await prisma.raffle.updateMany({
      where: { id: raffleId },
      data: { ended: true, ...(winnerId !== undefined ? { winnerId } : {}), ...(raffle?.hostId && winnerId ? { deliveryStatus: "awaiting_host" } : {}) }
    });
  }

  async all(): Promise<Raffle[]> {
    const raffles = await prisma.raffle.findMany({
      orderBy: [
        { endsAt: "asc" },
        { createdAt: "asc" }
      ]
    });

    return raffles.map(toRaffleRecord);
  }

  async getById(id: string): Promise<Raffle | undefined> {
    const raffle = await prisma.raffle.findUnique({
      where: { id }
    });

    return raffle ? toRaffleRecord(raffle) : undefined;
  }

  async getIdByMessage(messageId: string | undefined): Promise<string | null> {
    if (!messageId) {
      return null;
    }

    const raffle = await prisma.raffle.findFirst({
      where: { messageId },
      select: { id: true }
    });
    return raffle?.id ?? null;
  }

  async getByMessageId(messageId: string): Promise<Raffle | undefined> {
    const raffle = await prisma.raffle.findFirst({
      where: { messageId }
    });

    return raffle ? toRaffleRecord(raffle) : undefined;
  }

  async setMessageId(raffleId: string, messageId: string): Promise<void> {
    await prisma.raffle.updateMany({
      where: { id: raffleId },
      data: { messageId }
    });
  }

  async getActive(guildId: string): Promise<Raffle | undefined> {
    const raffle = await prisma.raffle.findFirst({
      where: {
        guildId,
        ended: false,
        endsAt: {
          gt: BigInt(Date.now())
        }
      },
      orderBy: {
        endsAt: "asc"
      }
    });

    return raffle ? toRaffleRecord(raffle) : undefined;
  }
}

export const raffleStore = new RaffleStore();
