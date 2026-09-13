import { Events, type Role } from "discord.js";
import type { BotClient } from "../index.js";
import {
  removeGuildMember,
  removeGuildRole,
  syncDiscordUserProfile,
  syncGuildMember,
  syncGuildRole
} from "../services/discordSyncService.js";
import { logError } from "../utils/logger.js";

async function guardSync(action: string, context: Record<string, unknown>, work: () => Promise<void>) {
  try {
    await work();
  } catch (error) {
    logError(`Discord sync event failed: ${action}.`, error, context);
  }
}

export function registerDiscordSyncHandlers(client: BotClient) {
  client.on(Events.GuildMemberAdd, member => {
    void guardSync("guildMemberAdd", { guildId: member.guild.id, discordUserId: member.user.id }, async () => {
      await syncGuildMember(member);
    });
  });

  client.on(Events.GuildMemberRemove, member => {
    void guardSync("guildMemberRemove", { guildId: member.guild.id, discordUserId: member.user.id }, async () => {
      await removeGuildMember(member.guild.id, member.user.id);
    });
  });

  client.on(Events.GuildMemberUpdate, (_oldMember, newMember) => {
    void guardSync("guildMemberUpdate", { guildId: newMember.guild.id, discordUserId: newMember.user.id }, async () => {
      await syncGuildMember(newMember);
    });
  });

  client.on("userUpdate", (_oldUser, newUser) => {
    void guardSync("userUpdate", { discordUserId: newUser.id }, async () => {
      await syncDiscordUserProfile(newUser.id, newUser.username, newUser.displayAvatarURL() || undefined);
    });
  });

  client.on(Events.GuildRoleCreate, role => {
    void guardSync("roleCreate", { guildId: role.guild.id, discordRoleId: role.id }, async () => {
      await syncGuildRole(role as Role);
    });
  });

  client.on(Events.GuildRoleUpdate, (_oldRole, newRole) => {
    void guardSync("roleUpdate", { guildId: newRole.guild.id, discordRoleId: newRole.id }, async () => {
      await syncGuildRole(newRole as Role);
    });
  });

  client.on(Events.GuildRoleDelete, role => {
    void guardSync("roleDelete", { guildId: role.guild.id, discordRoleId: role.id }, async () => {
      await removeGuildRole(role.guild.id, role.id);
    });
  });
}