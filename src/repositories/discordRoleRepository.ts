import { prisma } from "../database/prisma.js";
import type { DiscordRole } from "../models/discordRole.js";

export type DiscordRoleRecord = Pick<
  DiscordRole,
  "guildId" | "discordRoleId" | "name" | "position" | "color" | "lastSyncedAt"
>;

export class DiscordRoleRepository {
  async upsert(role: DiscordRoleRecord) {
    await prisma.discordRole.upsert({
      where: {
        guildId_discordRoleId: {
          guildId: role.guildId,
          discordRoleId: role.discordRoleId
        }
      },
      create: role,
      update: role
    });
  }

  async bulkUpsert(roles: DiscordRoleRecord[]) {
    if (roles.length === 0) {
      return;
    }

    await prisma.$transaction(
      roles.map(role => prisma.discordRole.upsert({
        where: {
          guildId_discordRoleId: {
            guildId: role.guildId,
            discordRoleId: role.discordRoleId
          }
        },
        create: role,
        update: role
      }))
    );
  }

  async deleteMissingRoles(guildId: string, discordRoleIds: string[]) {
    await prisma.discordRole.deleteMany({
      where: {
        guildId,
        discordRoleId: {
          notIn: discordRoleIds
        }
      },
    });
  }

  async remove(guildId: string, discordRoleId: string) {
    await prisma.discordRole.deleteMany({
      where: { guildId, discordRoleId }
    });
  }

  async listRoles(guildId?: string) {
    return prisma.discordRole.findMany({
      where: guildId ? { guildId } : undefined,
      orderBy: [
        { position: "desc" },
        { name: "asc" }
      ]
    });
  }
}

export const discordRoleRepository = new DiscordRoleRepository();