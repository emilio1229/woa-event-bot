import { prisma } from "../database/prisma.js";
import type { Raffle } from "../types/legacy.js";

/**
 * Pick a winner while preventing the same person from winning again for
 * a random 5–10 completed raffles. Duplicate entries remain weighted.
 *
 * The winner, cooldown countdown, and new cooldown are written atomically so
 * retries/restarts do not consume the same raffle's cooldown more than once.
 */
export async function chooseRaffleWinner(raffle: Raffle): Promise<string | null> {
  return prisma.$transaction(async tx => {
    const storedRaffle = await tx.raffle.findUnique({
      where: { id: raffle.id }
    });

    if (!storedRaffle) {
      // This should be rare, but don't invent a winner if the raffle vanished.
      return raffle.winnerId ?? null;
    }

    if (storedRaffle.winnerId) {
      return storedRaffle.winnerId;
    }

    const entries = storedRaffle.entries ?? [];
    const cooldowns = await tx.raffleWinnerCooldown.findMany({
      where: { guildId: storedRaffle.guildId },
      select: { userId: true, rafflesRemaining: true }
    });
    const coolingDown = new Set(
      cooldowns
        .filter(cooldown => cooldown.rafflesRemaining > 0)
        .map(cooldown => cooldown.userId)
    );

    // Keep duplicate entries to preserve the existing weighted-entry system.
    let eligibleEntries = entries.filter(userId => !coolingDown.has(userId));

    // If every entrant is on cooldown, allow a draw from the full entry pool
    // rather than leaving the raffle without a winner.
    if (eligibleEntries.length === 0) {
      eligibleEntries = entries;
    }

    const winnerId = eligibleEntries.length > 0
      ? eligibleEntries[Math.floor(Math.random() * eligibleEntries.length)]
      : null;

    // Every completed raffle advances existing cooldowns once.
    await tx.raffleWinnerCooldown.updateMany({
      where: { guildId: storedRaffle.guildId },
      data: { rafflesRemaining: { decrement: 1 } }
    });
    await tx.raffleWinnerCooldown.deleteMany({
      where: { guildId: storedRaffle.guildId, rafflesRemaining: { lte: 0 } }
    });

    if (winnerId) {
      const cooldownLength = 5 + Math.floor(Math.random() * 6); // 5–10 raffles
      await tx.raffleWinnerCooldown.upsert({
        where: {
          guildId_userId: {
            guildId: storedRaffle.guildId,
            userId: winnerId
          }
        },
        create: {
          guildId: storedRaffle.guildId,
          userId: winnerId,
          rafflesRemaining: cooldownLength
        },
        update: {
          rafflesRemaining: cooldownLength
        }
      });
    }

    await tx.raffle.update({
      where: { id: storedRaffle.id },
      data: { winnerId }
    });

    return winnerId;
  });
}
