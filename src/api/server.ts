import { timingSafeEqual } from "node:crypto";
import Fastify from "fastify";
import { env } from "../config/env.js";
import { discordDirectoryService } from "../services/discordDirectoryService.js";

interface DiscordDirectoryQuery {
  guildId?: string;
  roleIds?: string;
}

function parseRoleIds(value?: string) {
  return value
    ?.split(",")
    .map(roleId => roleId.trim())
    .filter(Boolean) ?? [];
}

function isValidApiKey(candidate: string): boolean {
  const expected = Buffer.from(env.apiKey);
  const provided = Buffer.from(candidate);

  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

export function buildApiServer() {
  const app = Fastify({ logger: false });

  app.get("/health", async () => ({ ok: true }));

  app.addHook("onRequest", async (request, reply) => {
    if (!request.url.startsWith("/api/")) {
      return;
    }

    const providedKey = request.headers["x-api-key"];

    if (typeof providedKey !== "string" || !isValidApiKey(providedKey)) {
      await reply.code(401).send({ error: "Unauthorized" });
    }
  });

  app.get<{ Querystring: DiscordDirectoryQuery }>("/api/discord/members", async request => {
    const members = await discordDirectoryService.listMembers(request.query.guildId);
    return { data: members };
  });

  app.get<{ Querystring: DiscordDirectoryQuery }>("/api/discord/roles", async request => {
    const roles = await discordDirectoryService.listRoles(request.query.guildId);
    return { data: roles };
  });

  app.get<{ Querystring: DiscordDirectoryQuery }>("/api/discord/council", async request => {
    const roleIds = parseRoleIds(request.query.roleIds);
    const members = await discordDirectoryService.listCouncilMembers(request.query.guildId, roleIds);

    return {
      data: members,
      roleIds: roleIds.length > 0 ? roleIds : undefined
    };
  });

  return app;
}