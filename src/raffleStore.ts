import type { CreateRaffleInput, Raffle } from "./types/legacy.js";

class RaffleStore {
  private raffles: Raffle[];
  private readonly debugEnabled: boolean;

  constructor() {
    this.raffles = [];
    this.debugEnabled = true; // toggle if needed
  }

  debug(msg: string) {
    if (this.debugEnabled) {
      console.log(`[RAFFLE DEBUG] ${msg}`);
    }
  }

  cleanup() {
    const before = this.raffles.length;

    this.raffles = this.raffles.filter(r => {
      const expiredByTime = Date.now() >= r.endsAt;
      return !r.ended && !expiredByTime;
    });

    const after = this.raffles.length;

    if (this.debugEnabled) {
      console.log(`[RAFFLE DEBUG] Cleanup removed ${before - after} raffles`);
    }
  }

  create(data: CreateRaffleInput): Raffle {
    this.cleanup(); // auto-clean before creating new raffle

    const raffle: Raffle = {
      ...data,
      id: Date.now().toString(),
      ended: false,
      entries: data.entries ?? []
    };

    this.raffles.push(raffle);
    this.debug(`Created raffle ${raffle.id}`);
    return raffle;
  }


  // Save updated raffle
  save(updated: Raffle) {
    const index = this.raffles.findIndex(r => r.id === updated.id);
    if (index !== -1) {
      this.raffles[index] = updated;
      this.debug(`Saved raffle ${updated.id}`);
    }

    this.cleanup(); // auto-clean after saving
  }


  // Mark raffle as ended (soft end)
  markEnded(raffleId: string) {
    const raffle = this.getById(raffleId);
    if (raffle) {
      raffle.ended = true;
      this.save(raffle);
      this.debug(`Marked raffle ${raffleId} as ended`);
    }
  }

  // Hard delete raffle
  end(raffleId: string) {
    this.raffles = this.raffles.filter(r => r.id !== raffleId);
    this.debug(`Hard removed raffle ${raffleId}`);
    this.cleanup(); // auto-clean after hard delete
  }

  // Return ALL raffles
  all(): Raffle[] {
    return this.raffles;
  }

  getById(id: string): Raffle | undefined {
    return this.raffles.find(r => r.id === id);
  }

  getIdByMessage(messageId: string | undefined): string | null {
    const raffle = this.raffles.find(r => r.messageId === messageId);
    return raffle ? raffle.id : null;
  }

  getByMessageId(messageId: string): Raffle | undefined {
    return this.raffles.find(r => r.messageId === messageId);
  }

  setMessageId(raffleId: string, messageId: string) {
    const raffle = this.getById(raffleId);
    if (raffle) {
      raffle.messageId = messageId;
      this.save(raffle);
      this.debug(`Set messageId for raffle ${raffleId}`);
    }
  }

  getActive(guildId: string): Raffle | undefined {
    const active = this.raffles.find(
      r =>
        r.guildId === guildId &&
        !r.ended &&                // MUST NOT be ended
        Date.now() < r.endsAt     // MUST still be running
    );

    this.debug(
      active
        ? `Active raffle found: ${active.id}`
        : `No active raffle for guild ${guildId}`
    );

    return active;
  }
}

export const raffleStore = new RaffleStore();
