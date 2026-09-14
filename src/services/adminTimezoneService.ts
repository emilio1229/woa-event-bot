import { IANAZone } from "luxon";
import { prisma } from "../database/prisma.js";

export const COMMON_TIMEZONES = [
  ["🇺🇸 Pacific Time", "America/Los_Angeles"],
  ["🇺🇸 Arizona", "America/Phoenix"],
  ["🇺🇸 Mountain Time", "America/Denver"],
  ["🇺🇸 Central Time", "America/Chicago"],
  ["🇺🇸 Eastern Time", "America/New_York"],
  ["🇨🇦 Canada — Eastern", "America/Toronto"],
  ["🇺🇸 Alaska", "America/Anchorage"],
  ["🇺🇸 Hawaii", "Pacific/Honolulu"],
  ["🇧🇷 Brazil", "America/Sao_Paulo"],
  ["🇬🇧 United Kingdom / Scotland", "Europe/London"],
  ["🇮🇪 Ireland", "Europe/Dublin"],
  ["🇩🇰 Denmark", "Europe/Copenhagen"],
  ["🇩🇪 Germany", "Europe/Berlin"],
  ["🇫🇷 France", "Europe/Paris"],
  ["🇮🇹 Italy", "Europe/Rome"],
  ["🇷🇺 Moscow", "Europe/Moscow"],
  ["🇿🇦 South Africa", "Africa/Johannesburg"],
  ["🇦🇪 Dubai", "Asia/Dubai"],
  ["🇮🇳 India", "Asia/Kolkata"],
  ["🇹🇭 Thailand", "Asia/Bangkok"],
  ["🇸🇬 Singapore", "Asia/Singapore"],
  ["🇨🇳 China", "Asia/Shanghai"],
  ["🇯🇵 Japan", "Asia/Tokyo"],
  ["🇦🇺 Australia — Sydney", "Australia/Sydney"],
  ["🇳🇿 New Zealand", "Pacific/Auckland"]
] as const;

export function isValidIanaTimezone(timezone: string): boolean {
  return IANAZone.isValidZone(timezone.trim());
}

export async function getAdminTimezone(guildId: string, discordUserId: string): Promise<string | null> {
  const record = await prisma.adminTimezone.findUnique({
    where: {
      guildId_discordUserId: { guildId, discordUserId }
    }
  });

  return record?.timezone ?? null;
}

export async function setAdminTimezone(guildId: string, discordUserId: string, timezone: string): Promise<string> {
  const normalized = timezone.trim();
  if (!isValidIanaTimezone(normalized)) {
    throw new Error("That is not a valid IANA timezone. Example: America/Phoenix or Europe/London.");
  }

  const record = await prisma.adminTimezone.upsert({
    where: {
      guildId_discordUserId: { guildId, discordUserId }
    },
    create: { guildId, discordUserId, timezone: normalized },
    update: { timezone: normalized }
  });

  return record.timezone;
}
