import { prisma } from "./database/prisma.js";
import { env } from "./config/env.js";

export interface RiddleAutoSettingsRecord {
  guildId: string;
  enabled: boolean;
  channelId: string | null;
  intervalMinutes: number;
  rewardMin: number;
  rewardMax: number;
  lastRunAt: Date | null;
}

class RiddleAutoSettingsStore {
  async get(guildId: string): Promise<RiddleAutoSettingsRecord> {
    return prisma.riddleAutoSettings.upsert({
      where: { guildId },
      create: {
        guildId,
        enabled: env.riddleAutoEnabled,
        channelId: env.riddleAutoChannelId,
        intervalMinutes: env.riddleAutoIntervalMinutes,
        rewardMin: Math.min(env.riddleAutoRewardMin, env.riddleAutoRewardMax),
        rewardMax: Math.max(env.riddleAutoRewardMin, env.riddleAutoRewardMax)
      },
      update: {}
    });
  }

  async update(guildId: string, data: Partial<Pick<RiddleAutoSettingsRecord, "enabled" | "channelId" | "intervalMinutes" | "rewardMin" | "rewardMax">>) {
    const current = await this.get(guildId);
    return prisma.riddleAutoSettings.update({ where: { guildId }, data: { ...data } });
  }

  async enabledGuilds() {
    return prisma.riddleAutoSettings.findMany({ where: { enabled: true, channelId: { not: null } } });
  }

  async due(guildId: string, now = new Date()) {
    const settings = await this.get(guildId);
    if (!settings.enabled || !settings.channelId) return false;
    if (!settings.lastRunAt) return true;
    return now.getTime() - settings.lastRunAt.getTime() >= settings.intervalMinutes * 60_000;
  }

  async markRun(guildId: string) {
    await prisma.riddleAutoSettings.update({ where: { guildId }, data: { lastRunAt: new Date() } });
  }
}

export const riddleAutoSettingsStore = new RiddleAutoSettingsStore();
