import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import type { CreateEventInput, EventRecord, RsvpState } from "../services/eventTypes.js";
import { logError } from "../utils/logger.js";

interface EventStoreState {
  events: EventRecord[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DATA_PATH = path.join(DATA_DIR, "events.json");

class EventStore {
  private state: EventStoreState;

  constructor() {
    this.state = this.load();
  }

  private load(): EventStoreState {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });

      if (!fs.existsSync(DATA_PATH)) {
        return { events: [] };
      }

      const raw = fs.readFileSync(DATA_PATH, "utf8");
      const parsed = JSON.parse(raw) as Partial<EventStoreState>;

      return {
        events: Array.isArray(parsed.events) ? parsed.events : []
      };
    } catch (error) {
      logError("Failed to load event store.", error);
      return { events: [] };
    }
  }

  private persist() {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(this.state, null, 2));
  }

  create(input: CreateEventInput): EventRecord {
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

    this.state.events.push(event);
    this.persist();
    return event;
  }

  getById(eventId: string): EventRecord | undefined {
    return this.state.events.find(event => event.id === eventId);
  }

  updateMessageId(eventId: string, messageId: string): EventRecord | undefined {
    const event = this.getById(eventId);

    if (!event) {
      return undefined;
    }

    event.messageId = messageId;
    this.persist();
    return event;
  }

  save(event: EventRecord): EventRecord {
    const eventIndex = this.state.events.findIndex(current => current.id === event.id);

    if (eventIndex === -1) {
      this.state.events.push(event);
    } else {
      this.state.events[eventIndex] = event;
    }

    this.persist();
    return event;
  }

  updateRsvp(eventId: string, userId: string, state: RsvpState): EventRecord | undefined {
    const event = this.getById(eventId);

    if (!event) {
      return undefined;
    }

    event.rsvps[userId] = state;
    this.persist();
    return event;
  }
}

export const eventStore = new EventStore();
