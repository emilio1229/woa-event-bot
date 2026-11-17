import { randomUUID } from "node:crypto";
import { prisma } from "../database/prisma.js";

export type CommunityRaffleStatus = "pending" | "changes_requested" | "rejected" | "approved" | "cancelled";
export type CommunityRaffleSubmission = {
  id: string; guildId: string; creatorId: string; name: string; prize: string; endsAt: bigint;
  status: string; reviewNote: string | null; reviewedBy: string | null; raffleId: string | null;
  announcementChannelId: string | null; notificationRoleId: string | null; createdAt: Date; updatedAt: Date;
};

export async function createCommunityRaffle(input: { guildId: string; creatorId: string; name: string; prize: string; endsAt: number }) {
  return prisma.communityRaffleSubmission.create({ data: { id: randomUUID(), ...input, endsAt: BigInt(input.endsAt), status: "pending" } });
}
export async function listPendingCommunityRaffles(guildId: string, take = 10) {
  return prisma.communityRaffleSubmission.findMany({ where: { guildId, status: "pending" }, orderBy: { createdAt: "asc" }, take });
}
export async function listMyCommunityRaffles(guildId: string, creatorId: string) {
  return prisma.communityRaffleSubmission.findMany({ where: { guildId, creatorId }, orderBy: { createdAt: "desc" }, take: 20 });
}
export async function getCommunityRaffle(id: string) {
  return prisma.communityRaffleSubmission.findUnique({ where: { id } });
}
export async function updateCommunityRaffle(id: string, guildId: string, creatorId: string, input: { name: string; prize: string; endsAt: number }) {
  const result = await prisma.communityRaffleSubmission.updateMany({ where: { id, guildId, creatorId, status: { in: ["pending", "changes_requested"] } }, data: { ...input, endsAt: BigInt(input.endsAt), status: "pending", reviewNote: null } });
  return result.count === 1 ? getCommunityRaffle(id) : null;
}
export async function cancelCommunityRaffle(id: string, guildId: string, creatorId: string) {
  const result = await prisma.communityRaffleSubmission.updateMany({ where: { id, guildId, creatorId, status: { in: ["pending", "changes_requested"] } }, data: { status: "cancelled" } });
  return result.count === 1;
}
export async function reviewCommunityRaffle(id: string, guildId: string, reviewerId: string, decision: "changes_requested" | "rejected", note: string) {
  const result = await prisma.communityRaffleSubmission.updateMany({ where: { id, guildId, status: "pending", creatorId: { not: reviewerId } }, data: { status: decision, reviewedBy: reviewerId, reviewNote: note } });
  return result.count === 1;
}
export async function approveCommunityRaffle(id: string, guildId: string, reviewerId: string, channelId: string, roleId: string | null) {
  return prisma.$transaction(async tx => {
    const submission = await tx.communityRaffleSubmission.findUnique({ where: { id } });
    if (!submission || submission.guildId !== guildId || submission.status !== "pending" || submission.creatorId === reviewerId) return null;
    if (submission.raffleId) return null;
    const raffleId = randomUUID();
    await tx.raffle.create({ data: { id: raffleId, guildId, channelId, name: submission.name, prize: submission.prize, endsAt: submission.endsAt, tagRole: roleId, invocationText: "Ancient sigils awaken, humming softly in the astral dark.", ritualType: "soul-binding", winnerId: null, ended: false, entries: [], boundUsers: [], hostId: submission.creatorId } });
    const changed = await tx.communityRaffleSubmission.updateMany({ where: { id, guildId, status: "pending", creatorId: { not: reviewerId }, raffleId: null }, data: { status: "approved", reviewedBy: reviewerId, reviewNote: null, raffleId, announcementChannelId: channelId, notificationRoleId: roleId } });
    if (changed.count !== 1) throw new Error("This raffle submission was already reviewed. No second raffle was created.");
    return tx.raffle.findUnique({ where: { id: raffleId } });
  }, { isolationLevel: "Serializable" });
}
