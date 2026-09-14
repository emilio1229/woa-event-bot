export type RsvpState = "going";

export interface EventRecord {
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
  rsvps: Record<string, RsvpState>;
}

export interface CreateEventInput {
  guildId: string;
  channelId: string;
  title: string;
  description: string;
  notes?: string | null;
  hostId: string;
  creatorId: string;
  timezone: string;
  startAtIso: string;
  startAtUnix: number;
}

export interface EventRsvpSummary {
  going: number;
}
