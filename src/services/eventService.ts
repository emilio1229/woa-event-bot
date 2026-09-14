import { eventStore } from "../storage/eventStore.js";
import type { CreateEventInput, EventRecord, EventRsvpSummary, RsvpState } from "./eventTypes.js";

export async function createEvent(input: CreateEventInput): Promise<EventRecord> {
  return eventStore.create(input);
}

export async function attachEventMessageId(eventId: string, messageId: string): Promise<EventRecord | undefined> {
  return eventStore.updateMessageId(eventId, messageId);
}

export async function getEventById(eventId: string): Promise<EventRecord | undefined> {
  return eventStore.getById(eventId);
}

export async function getUpcomingEvents(guildId: string, limit = 10): Promise<EventRecord[]> {
  return eventStore.getUpcoming(guildId, limit);
}

export async function updateEventRsvp(
  eventId: string,
  userId: string,
  state: RsvpState
): Promise<EventRecord | undefined> {
  return eventStore.updateRsvp(eventId, userId, state);
}

export async function deleteEvent(eventId: string): Promise<boolean> {
  return eventStore.delete(eventId);
}

export function getEventRsvpSummary(event: EventRecord): EventRsvpSummary {
  return Object.values(event.rsvps).reduce<EventRsvpSummary>(
    (summary, state) => {
      summary[state] += 1;
      return summary;
    },
    { going: 0, maybe: 0, no: 0 }
  );
}
