import type { Collection, Guild, GuildMember, Role } from "discord.js";
import type { BotClient } from "../index.js";
import { discordMemberRepository, type DiscordMemberRecord } from "../repositories/discordMemberRepository.js";
import { discordRoleRepository, type DiscordRoleRecord } from "../repositories/discordRoleRepository.js";
import { discordSyncStateRepository } from "../repositories/discordSyncStateRepository.js";
import { logError, logInfo } from "../utils/logger.js";

function toDiscordMemberRecord(member: GuildMember, syncedAt: Date): DiscordMemberRecord {
  return {
    guildId: member.guild.id,
    discordUserId: member.user.id,
    username: member.user.username,
    displayName: member.displayName,
    avatarUrl: member.displayAvatarURL() || undefined,
    roleIds: member.roles.cache
      .filter(role => role.id !== member.guild.id)
      .map(role => role.id),
    joinedAt: member.joinedAt ?? undefined,
    isBot: member.user.bot,
    lastSyncedAt: syncedAt
  };
}

function toDiscordRoleRecord(role: Role, syncedAt: Date): DiscordRoleRecord {
  return {
    guildId: role.guild.id,
    discordRoleId: role.id,
    name: role.name,
    position: role.position,
    color: role.color === 0 ? undefined : role.color,
    lastSyncedAt: syncedAt
  };
}

function normalizeFetchedCollection<T>(collection: Collection<string, T | null>) {
  return Array.from(collection.values()).filter((value): value is T => value !== null);
}

async function reconcileGuild(guild: Guild) {
  const syncedAt = new Date();
  await discordSyncStateRepository.markSyncStarted(guild.id);

  try {
    const [membersCollection, rolesCollection] = await Promise.all([
      guild.members.fetch(),
      guild.roles.fetch()
    ]);

    const members = normalizeFetchedCollection(membersCollection).map(member => toDiscordMemberRecord(member, syncedAt));
    const roles = normalizeFetchedCollection(rolesCollection).map(role => toDiscordRoleRecord(role, syncedAt));

    await Promise.all([
      discordMemberRepository.bulkUpsert(members),
      discordRoleRepository.bulkUpsert(roles)
    ]);

    await Promise.all([
      discordMemberRepository.deleteMissingMembers(guild.id, members.map(member => member.discordUserId)),
      discordRoleRepository.deleteMissingRoles(guild.id, roles.map(role => role.discordRoleId))
    ]);

    await discordSyncStateRepository.markSyncSuccess(guild.id, members.length, roles.length);
    logInfo("Discord reconciliation sync completed.", {
      guildId: guild.id,
      guildName: guild.name,
      memberCount: members.length,
      roleCount: roles.length
    });
  } catch (error) {
    await discordSyncStateRepository.markSyncFailure(guild.id, error);
    logError("Discord reconciliation sync failed.", error, { guildId: guild.id });
    throw error;
  }
}

export async function reconcileDiscordToDatabase(client: BotClient) {
  const guilds = Array.from(client.guilds.cache.values());

  for (const guild of guilds) {
    await reconcileGuild(guild);
  }
}

export async function syncGuildMember(member: GuildMember) {
  await discordMemberRepository.upsert(toDiscordMemberRecord(member, new Date()));
}

export async function removeGuildMember(guildId: string, discordUserId: string) {
  await discordMemberRepository.remove(guildId, discordUserId);
}

export async function syncGuildRole(role: Role) {
  await discordRoleRepository.upsert(toDiscordRoleRecord(role, new Date()));
}

export async function removeGuildRole(guildId: string, discordRoleId: string) {
  await Promise.all([
    discordRoleRepository.remove(guildId, discordRoleId),
    discordMemberRepository.removeRoleId(guildId, discordRoleId)
  ]);
}

export async function syncDiscordUserProfile(discordUserId: string, username: string, avatarUrl?: string) {
  await discordMemberRepository.updateUserProfile(discordUserId, username, avatarUrl);
}