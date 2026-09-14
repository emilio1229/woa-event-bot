import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../database/prisma.js";
import type { CreateEventInput, EventRecord, RsvpState } from "../services/eventTypes.js";

const ENDED_MARKER = "[ENDED]";

function toEventRecord(event: {
  id: string;
  guildId: string;
  channelId: string;
  messageId: string | null;
  title: string;
  description: string;
  notes: string | null;
  hostId: string;
  creatorId: string;
  timezone: string;
  startAtIso: string;
  startAtUnix: number;
  createdAtIso: string;
  rsvps: Prisma.JsonValue;
}): EventRecord {
  const rawRsvps = event.rsvps && typeof event.rsvps === "object" && !Array.isArray(event.rsvps)
    ? event.rsvps as Record<string, unknown>
    : {};
  const goingRsvps = Object.fromEntries(Object.entries(rawRsvps).filter(([key, state]) => key !== "__endedAt" && state === "going")) as Record<string, RsvpState>;
  return { ...event, rsvps: goingRsvps };
}

function isEndedRsvps(value: Prisma.JsonValue): boolean {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && "__endedAt" in value);
}

class EventStore {
  async create(input: CreateEventInput): Promise<EventRecord> {
    const event: EventRecord = {
      id: randomUUID(),
      guildId: input.guildId,
      channelId: input.channelId,
      messageId: null,
      title: input.title,
      description: input.description,
      notes: input.notes ?? null,
      hostId: input.hostId,
      creatorId: input.creatorId,
      timezone: input.timezone,
      startAtIso: input.startAtIso,
      startAtUnix: input.startAtUnix,
      createdAtIso: new Date().toISOString(),
      rsvps: {}
    };
    await prisma.event.create({ data: { ...event, rsvps: event.rsvps as Prisma.InputJsonValue } });
    return event;
  }

  async getById(eventId: string): Promise<EventRecord | undefined> {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    return event ? toEventRecord(event) : undefined;
  }

  async getUpcoming(guildId: string, limit = 10): Promise<EventRecord[]> {
    const events = await prisma.event.findMany({
      where: { guildId, startAtUnix: { gt: Math.floor(Date.now() / 1000) } },
      orderBy: { startAtUnix: "asc" },
      take: Math.max(limit * 3, limit)
    });
    return events.filter(event => !isEndedRsvps(event.rsvps)).slice(0, limit).map(toEventRecord);
  }

  async updateMessageId(eventId: string, messageId: string): Promise<EventRecord | undefined> {
    const event = await prisma.event.update({ where: { id: eventId }, data: { messageId } }).catch(() => null);
    return event ? toEventRecord(event) : undefined;
  }

  async save(event: EventRecord): Promise<EventRecord> {
    await prisma.event.upsert({
      where: { id: event.id },
      create: { ...event, rsvps: event.rsvps as Prisma.InputJsonValue },
      update: { ...event, rsvps: event.rsvps as Prisma.InputJsonValue }
    });
    return event;
  }

  async end(eventId: string): Promise<EventRecord | undefined> {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) return undefined;
    const raw = event.rsvps && typeof event.rsvps === "object" && !Array.isArray(event.rsvps)
      ? event.rsvps as Record<string, Prisma.JsonValue>
      : {};
    if ("__endedAt" in raw) return toEventRecord(event);
    raw.__endedAt = new Date().toISOString();
    const originalNotes = event.notes ?? "";
    const endedNotes = originalNotes.startsWith(ENDED_MARKER) ? originalNotes : `${ENDED_MARKER} ${originalNotes}`.trim();
    const updated = await prisma.event.update({ where: { id: eventId }, data: { rsvps: raw as Prisma.InputJsonValue, notes: endedNotes } });
    return toEventRecord(updated);
  }

  async delete(eventId: string): Promise<boolean> {
    const result = await prisma.event.deleteMany({ where: { id: eventId } });
    return result.count > 0;
  }

  async updateRsvp(eventId: string, userId: string, state: RsvpState = "going"): Promise<EventRecord | undefined> {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || isEndedRsvps(event.rsvps)) return undefined;
    const record = toEventRecord(event);
    record.rsvps[userId] = state;
    return this.save(record);
  }
}

export const eventStore = new EventStore();
