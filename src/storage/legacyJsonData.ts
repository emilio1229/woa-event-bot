import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { EventRecord } from "../services/eventTypes.js";
import type { Raffle, SigilStoreData } from "../types/legacy.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "..", "data");

function readJsonFile<T>(fileName: string, fallback: T): T {
  const filePath = path.join(DATA_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function loadLegacyEvents(): EventRecord[] {
  const parsed = readJsonFile<{ events?: EventRecord[] }>("events.json", {});
  return Array.isArray(parsed.events) ? parsed.events : [];
}

export function loadLegacyRaffles(): Raffle[] {
  const parsed = readJsonFile<{ raffles?: Raffle[] }>("raffles.json", {});
  return Array.isArray(parsed.raffles) ? parsed.raffles : [];
}

export function loadLegacySigils(): SigilStoreData {
  const parsed = readJsonFile<SigilStoreData>("sigils.json", { guilds: {} });
  return parsed && typeof parsed === "object" ? parsed : { guilds: {} };
}

export function summarizeLegacyJsonData() {
  const events = loadLegacyEvents();
  const raffles = loadLegacyRaffles();
  const sigils = loadLegacySigils();
  const sigilUsers = Object.values(sigils.guilds).reduce((total, guild) => total + Object.keys(guild.users).length, 0);

  return {
    events: events.length,
    raffles: raffles.length,
    sigilGuilds: Object.keys(sigils.guilds).length,
    sigilUsers
  };
}