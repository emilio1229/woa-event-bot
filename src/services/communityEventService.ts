import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "../database/prisma.js";

export type CommunityEventStatus = "pending" | "approved" | "changes_requested" | "rejected" | "cancelled" | "completed";
export type CommunityRsvpStatus = "going" | "waitlist";

export interface CommunityEventRecord {
  id: string; guildId: string; creatorId: string; title: string; category: string;
  mapLocation: string; description: string; startAtIso: string; startAtUnix: number;
  timezone: string; capacity: number; status: CommunityEventStatus; reviewNote: string | null;
  rsvps: Record<string, CommunityRsvpStatus>; audit: Array<Record<string, unknown>>;
}

type RawCommunityEvent = {
  id: string; guildId: string; creatorId: string; title: string; category: string;
  mapLocation: string; description: string; startAtIso: string; startAtUnix: number;
  timezone: string; capacity: number; status: string; reviewNote: string | null;
  rsvps: Prisma.JsonValue; audit: Prisma.JsonValue;
};

function normalize(raw: RawCommunityEvent): CommunityEventRecord {
  const rsvps = raw.rsvps && typeof raw.rsvps === "object" && !Array.isArray(raw.rsvps) ? raw.rsvps as Record<string, unknown> : {};
  const audit = Array.isArray(raw.audit) ? raw.audit as Array<Record<string, unknown>> : [];
  return { ...raw, status: raw.status as CommunityEventStatus,
    rsvps: Object.fromEntries(Object.entries(rsvps).filter((entry): entry is [string, CommunityRsvpStatus] => entry[1] === "going" || entry[1] === "waitlist")),
    audit };
}

function auditEntry(action: string, actorId: string, note?: string) {
  return { action, actorId, note: note ?? null, at: new Date().toISOString() };
}

export async function createCommunityEvent(input: {
  guildId: string; creatorId: string; title: string; category: string; mapLocation: string;
  description: string; startAtIso: string; startAtUnix: number; capacity: number; timezone?: string;
}) {
  const record = {
    id: randomUUID(), ...input, timezone: input.timezone ?? "UTC", status: "pending",
    reviewNote: null, rsvps: {} as Record<string, CommunityRsvpStatus>,
    audit: [auditEntry("submitted", input.creatorId)]
  };
  const saved = await prisma.communityEvent.create({ data: {
    ...record, rsvps: record.rsvps as Prisma.InputJsonValue, audit: record.audit as Prisma.InputJsonValue
  }});
  return normalize(saved);
}

export async function listApprovedCommunityEvents(guildId: string, limit = 10) {
  const rows = await prisma.communityEvent.findMany({ where: { guildId, status: "approved", startAtUnix: { gt: Math.floor(Date.now() / 1000) } }, orderBy: { startAtUnix: "asc" }, take: limit });
  return rows.map(normalize);
}

export async function listPendingCommunityEvents(guildId: string, limit = 10) {
  const rows = await prisma.communityEvent.findMany({ where: { guildId, status: { in: ["pending", "changes_requested"] } }, orderBy: { createdAt: "asc" }, take: limit });
  return rows.map(normalize);
}

export async function listMyCommunityEvents(guildId: string, creatorId: string, limit = 10) {
  const rows = await prisma.communityEvent.findMany({ where: { guildId, creatorId, status: { in: ["pending", "changes_requested", "approved", "rejected"] } }, orderBy: { startAtUnix: "asc" }, take: limit });
  return rows.map(normalize);
}

export async function getCommunityEvent(id: string) {
  const row = await prisma.communityEvent.findUnique({ where: { id } });
  return row ? normalize(row) : undefined;
}

export async function reviewCommunityEvent(id: string, guildId: string, actorId: string, decision: "approved" | "rejected" | "changes_requested", note?: string) {
  const current = await prisma.communityEvent.findUnique({ where: { id } });
  if (!current || current.guildId !== guildId || !["pending", "changes_requested"].includes(current.status)) return undefined;
  const audit = Array.isArray(current.audit) ? [...current.audit as Array<Record<string, unknown>>] : [];
  audit.push(auditEntry(decision, actorId, note));
  const updated = await prisma.communityEvent.update({ where: { id }, data: { status: decision, reviewNote: note ?? null, audit: audit as Prisma.InputJsonValue } });
  return normalize(updated);
}

export async function rsvpCommunityEvent(id: string, guildId: string, userId: string) {
  const current = await prisma.communityEvent.findUnique({ where: { id } });
  if (!current || current.guildId !== guildId || current.status !== "approved" || current.startAtUnix <= Math.floor(Date.now() / 1000)) return undefined;
  const event = normalize(current);
  const rsvps = { ...event.rsvps };
  const audit = [...event.audit];
  if (rsvps[userId]) {
    delete rsvps[userId];
    if (event.capacity > 0 && Object.values(rsvps).filter(v => v === "going").length < event.capacity) {
      const next = Object.keys(rsvps).find(user => rsvps[user] === "waitlist");
      if (next) rsvps[next] = "going";
    }
    audit.push(auditEntry("rsvp_left", userId));
  } else {
    const going = Object.values(rsvps).filter(v => v === "going").length;
    rsvps[userId] = event.capacity > 0 && going >= event.capacity ? "waitlist" : "going";
    audit.push(auditEntry(rsvps[userId] === "going" ? "rsvp_going" : "rsvp_waitlist", userId));
  }
  const updated = await prisma.communityEvent.update({ where: { id }, data: { rsvps: rsvps as Prisma.InputJsonValue, audit: audit as Prisma.InputJsonValue } });
  return normalize(updated);
}


export async function updateCommunityEventSubmission(id: string, guildId: string, creatorId: string, input: {
  title: string; category: string; mapLocation: string; description: string;
  startAtIso: string; startAtUnix: number; capacity: number;
}) {
  const current = await prisma.communityEvent.findUnique({ where: { id } });
  if (!current || current.guildId !== guildId || current.creatorId !== creatorId || !["pending", "changes_requested", "approved"].includes(current.status)) return undefined;
  const audit = Array.isArray(current.audit) ? [...current.audit as Array<Record<string, unknown>>] : [];
  audit.push(auditEntry("edited_resubmitted", creatorId));
  const updated = await prisma.communityEvent.update({ where: { id }, data: {
    ...input, status: "pending", reviewNote: null, audit: audit as Prisma.InputJsonValue
  }});
  return normalize(updated);
}

export async function cancelCommunityEvent(id: string, guildId: string, creatorId: string) {
  const current = await prisma.communityEvent.findUnique({ where: { id } });
  if (!current || current.guildId !== guildId || current.creatorId !== creatorId || !["pending", "changes_requested", "approved"].includes(current.status)) return undefined;
  const audit = Array.isArray(current.audit) ? [...current.audit as Array<Record<string, unknown>>] : [];
  audit.push(auditEntry("cancelled", creatorId));
  const updated = await prisma.communityEvent.update({ where: { id }, data: { status: "cancelled", audit: audit as Prisma.InputJsonValue } });
  return normalize(updated);
}
