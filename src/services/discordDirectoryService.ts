import { env } from "../config/env.js";
import { discordMemberRepository } from "../repositories/discordMemberRepository.js";
import { discordRoleRepository } from "../repositories/discordRoleRepository.js";

export class DiscordDirectoryService {
  async listMembers(guildId?: string) {
    return discordMemberRepository.listMembers(guildId);
  }

  async listRoles(guildId?: string) {
    return discordRoleRepository.listRoles(guildId);
  }

  async listCouncilMembers(guildId?: string, roleIds?: string[]) {
    const effectiveRoleIds = roleIds?.length ? roleIds : env.councilRoleIds;
    return discordMemberRepository.listMembersByRoleIds(effectiveRoleIds, guildId);
  }
}

export const discordDirectoryService = new DiscordDirectoryService();