import { prisma } from "../database/prisma.js";
import type { DiscordMember } from "../models/discordMember.js";

export type DiscordMemberRecord = Pick<
  DiscordMember,
  "guildId" | "discordUserId" | "username" | "displayName" | "avatarUrl" | "roleIds" | "joinedAt" | "isBot" | "lastSyncedAt"
>;

export class DiscordMemberRepository {
  async upsert(member: DiscordMemberRecord) {
    await prisma.discordMember.upsert({
      where: {
        guildId_discordUserId: {
          guildId: member.guildId,
          discordUserId: member.discordUserId
        }
      },
      create: member,
      update: member
    });
  }

  async bulkUpsert(members: DiscordMemberRecord[]) {
    if (members.length === 0) {
      return;
    }

    await prisma.$transaction(
      members.map(member => prisma.discordMember.upsert({
        where: {
          guildId_discordUserId: {
            guildId: member.guildId,
            discordUserId: member.discordUserId
          }
        },
        create: member,
        update: member
      }))
    );
  }

  async deleteMissingMembers(guildId: string, discordUserIds: string[]) {
    await prisma.discordMember.deleteMany({
      where: {
        guildId,
        discordUserId: {
          notIn: discordUserIds
        }
      },
    });
  }

  async remove(guildId: string, discordUserId: string) {
    await prisma.discordMember.deleteMany({
      where: { guildId, discordUserId }
    });
  }

  async updateUserProfile(discordUserId: string, username: string, avatarUrl?: string) {
    await prisma.discordMember.updateMany({
      where: { discordUserId },
      data: {
          username,
          avatarUrl,
          lastSyncedAt: new Date()
      }
    });
  }

  async removeRoleId(guildId: string, discordRoleId: string) {
    const members = await prisma.discordMember.findMany({
      where: {
        guildId,
        roleIds: {
          has: discordRoleId
        }
      }
    });

    await prisma.$transaction(
      members.map(member => prisma.discordMember.update({
        where: {
          guildId_discordUserId: {
            guildId: member.guildId,
            discordUserId: member.discordUserId
          }
        },
        data: {
          roleIds: member.roleIds.filter(roleId => roleId !== discordRoleId),
          lastSyncedAt: new Date()
        }
      }))
    );
  }

  async listMembers(guildId?: string) {
    return prisma.discordMember.findMany({
      where: guildId ? { guildId } : undefined,
      orderBy: [
        { displayName: "asc" },
        { username: "asc" }
      ]
    });
  }

  async listMembersByRoleIds(roleIds: string[], guildId?: string) {
    if (roleIds.length === 0) {
      return [];
    }

    return prisma.discordMember.findMany({
      where: {
        ...(guildId ? { guildId } : {}),
        roleIds: {
          hasSome: roleIds
        }
      },
      orderBy: [
        { displayName: "asc" },
        { username: "asc" }
      ]
    });
  }
}

export const discordMemberRepository = new DiscordMemberRepository();