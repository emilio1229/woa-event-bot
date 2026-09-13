import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import type { CreateRaffleInput, Raffle } from "./types/legacy.js";
import { writeJsonAtomic } from "./utils/atomicJson.js";

interface RaffleStoreState {
  raffles: Raffle[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "..", "data", "raffles.json");

class RaffleStore {
  private raffles: Raffle[];

  constructor() {
    this.raffles = this.load();
  }

  private load(): Raffle[] {
    try {
      if (!fs.existsSync(DATA_PATH)) return [];

      const parsed = JSON.parse(fs.readFileSync(DATA_PATH, "utf8")) as Partial<RaffleStoreState>;
      return Array.isArray(parsed.raffles) ? parsed.raffles : [];
    } catch (error) {
      console.error("Failed to load raffle store:", error);
      return [];
    }
  }

  private persist(): void {
    writeJsonAtomic(DATA_PATH, { raffles: this.raffles });
  }

  /** Removes raffles that were fully announced and explicitly completed. */
  cleanup(): void {
    const activeRaffles = this.raffles.filter(raffle => !raffle.ended);
    if (activeRaffles.length !== this.raffles.length) {
      this.raffles = activeRaffles;
      this.persist();
    }
  }

  create(data: CreateRaffleInput): Raffle {
    this.cleanup();

    const raffle: Raffle = {
      ...data,
      id: randomUUID(),
      ended: false,
      entries: data.entries ?? []
    };

    this.raffles.push(raffle);
    this.persist();
    return raffle;
  }

  save(updated: Raffle): void {
    const index = this.raffles.findIndex(raffle => raffle.id === updated.id);
    if (index === -1) return;

    this.raffles[index] = updated;
    this.persist();
  }

  markEnded(raffleId: string): void {
    const raffle = this.getById(raffleId);
    if (!raffle) return;

    raffle.ended = true;
    this.save(raffle);
    this.cleanup();
  }

  end(raffleId: string): void {
    const nextRaffles = this.raffles.filter(raffle => raffle.id !== raffleId);
    if (nextRaffles.length === this.raffles.length) return;

    this.raffles = nextRaffles;
    this.persist();
  }

  all(): Raffle[] {
    return this.raffles;
  }

  getById(id: string): Raffle | undefined {
    return this.raffles.find(raffle => raffle.id === id);
  }

  getIdByMessage(messageId: string | undefined): string | null {
    const raffle = this.raffles.find(current => current.messageId === messageId);
    return raffle?.id ?? null;
  }

  getByMessageId(messageId: string): Raffle | undefined {
    return this.raffles.find(raffle => raffle.messageId === messageId);
  }

  setMessageId(raffleId: string, messageId: string): void {
    const raffle = this.getById(raffleId);
    if (!raffle) return;

    raffle.messageId = messageId;
    this.save(raffle);
  }

  getActive(guildId: string): Raffle | undefined {
    return this.raffles.find(
      raffle => raffle.guildId === guildId && !raffle.ended && Date.now() < raffle.endsAt
    );
  }
}

export const raffleStore = new RaffleStore();
