import { eventStore } from "../storage/eventStore.js";
import type { CreateEventInput, EventRecord, EventRsvpSummary, RsvpState } from "./eventTypes.js";

export function createEvent(input: CreateEventInput): EventRecord {
  return eventStore.create(input);
}

export function attachEventMessageId(eventId: string, messageId: string): EventRecord | undefined {
  return eventStore.updateMessageId(eventId, messageId);
}

export function getEventById(eventId: string): EventRecord | undefined {
  return eventStore.getById(eventId);
}

export function updateEventRsvp(
  eventId: string,
  userId: string,
  state: RsvpState
): EventRecord | undefined {
  return eventStore.updateRsvp(eventId, userId, state);
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
