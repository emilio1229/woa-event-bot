import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../database/prisma.js";
import type { CreateEventInput, EventRecord, RsvpState } from "../services/eventTypes.js";

function toEventRecord(event: {
  id: string;
  guildId: string;
  channelId: string;
  messageId: string | null;
  title: string;
  notes: string | null;
  hostId: string;
  creatorId: string;
  timezone: string;
  startAtIso: string;
  startAtUnix: number;
  createdAtIso: string;
  rsvps: Prisma.JsonValue;
}): EventRecord {
  return {
    ...event,
    rsvps: (event.rsvps ?? {}) as Record<string, RsvpState>
  };
}

class EventStore {
  async create(input: CreateEventInput): Promise<EventRecord> {
    const event: EventRecord = {
      id: randomUUID(),
      guildId: input.guildId,
      channelId: input.channelId,
      messageId: null,
      title: input.title,
      notes: input.notes ?? null,
      hostId: input.hostId,
      creatorId: input.creatorId,
      timezone: input.timezone,
      startAtIso: input.startAtIso,
      startAtUnix: input.startAtUnix,
      createdAtIso: new Date().toISOString(),
      rsvps: {}
    };

    await prisma.event.create({
      data: {
        ...event,
        rsvps: event.rsvps as Prisma.InputJsonValue
      }
    });

    return event;
  }

  async getById(eventId: string): Promise<EventRecord | undefined> {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    return event ? toEventRecord(event) : undefined;
  }

  async getUpcoming(guildId: string, limit = 10): Promise<EventRecord[]> {
    const events = await prisma.event.findMany({
      where: {
        guildId,
        startAtUnix: { gt: Math.floor(Date.now() / 1000) }
      },
      orderBy: { startAtUnix: "asc" },
      take: limit
    });

    return events.map(toEventRecord);
  }

  async updateMessageId(eventId: string, messageId: string): Promise<EventRecord | undefined> {
    const event = await prisma.event.update({
      where: { id: eventId },
      data: { messageId }
    }).catch(() => null);

    return event ? toEventRecord(event) : undefined;
  }

  async save(event: EventRecord): Promise<EventRecord> {
    await prisma.event.upsert({
      where: { id: event.id },
      create: {
        ...event,
        rsvps: event.rsvps as Prisma.InputJsonValue
      },
      update: {
        ...event,
        rsvps: event.rsvps as Prisma.InputJsonValue
      }
    });

    return event;
  }

  async delete(eventId: string): Promise<boolean> {
    const result = await prisma.event.deleteMany({
      where: { id: eventId }
    });

    return result.count > 0;
  }

  async updateRsvp(eventId: string, userId: string, state: RsvpState): Promise<EventRecord | undefined> {
    const event = await this.getById(eventId);

    if (!event) {
      return undefined;
    }

    event.rsvps[userId] = state;
    return this.save(event);
  }
}

export const eventStore = new EventStore();
