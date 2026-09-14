import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DATA_FILE = path.join(DATA_DIR, "bounties.json");

export const bountyWeeklyImage = path.join(__dirname, "..", "..", "assets", "bounty.png");

export interface BountyRecord {
  id: string;
  guildId: string;
  channelId: string;
  messageId?: string;
  tagRoleId: string;
  dinos: string[];
  stats: string[];
  bonus?: string | null;
  createdAt: number;
  active: boolean;
}

function readAll(): BountyRecord[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as { bounties?: BountyRecord[] };
    return Array.isArray(parsed.bounties) ? parsed.bounties : [];
  } catch {
    return [];
  }
}

function writeAll(bounties: BountyRecord[]) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tempFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify({ bounties }, null, 2), "utf8");
  fs.renameSync(tempFile, DATA_FILE);
}

export const bountyStore = {
  async create(input: Omit<BountyRecord, "id" | "createdAt" | "active">): Promise<BountyRecord> {
    const record: BountyRecord = {
      ...input,
      id: `bounty_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      active: true
    };
    const bounties = readAll();
    bounties.push(record);
    writeAll(bounties);
    return record;
  },

  async setMessageId(id: string, messageId: string): Promise<BountyRecord | undefined> {
    const bounties = readAll();
    const record = bounties.find(bounty => bounty.id === id);
    if (!record) return undefined;
    record.messageId = messageId;
    writeAll(bounties);
    return record;
  },

  async getById(id: string): Promise<BountyRecord | undefined> {
    return readAll().find(bounty => bounty.id === id);
  },

  async getActive(guildId: string): Promise<BountyRecord[]> {
    return readAll().filter(bounty => bounty.guildId === guildId && bounty.active);
  },

  async deactivate(id: string): Promise<boolean> {
    const bounties = readAll();
    const record = bounties.find(bounty => bounty.id === id);
    if (!record) return false;
    record.active = false;
    writeAll(bounties);
    return true;
  }
};
