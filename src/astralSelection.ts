import type { Client } from "discord.js";
import { sigilStore } from "./sigilStore.js";
import { createAstralSelectionNotification } from "./services/astralSelectionNotificationService.js";

export function startAstralSelection(client: Client): void {
  const intervalHours = 6;
  const intervalMs = intervalHours * 60 * 60 * 1000;

  console.log(`[AstralSelection] Started — runs every ${intervalHours} hours. Rewards and notifications are delivered only through the private /realm panel.`);

  setInterval(async () => {
    try {
      for (const [guildId] of client.guilds.cache) {
        const users = await sigilStore.getGuildUsers(guildId);
        const userIds = Object.keys(users);

        if (userIds.length === 0) continue;

        const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
        const amount = Math.floor(Math.random() * 3) + 1;
        const awardedAt = new Date();
        const { transaction } = await sigilStore.addTransaction(
          guildId,
          randomUserId,
          amount,
          "Astral Selection",
          { actorId: "system", type: "award" }
        );

        try {
          await createAstralSelectionNotification({
            guildId,
            userId: randomUserId,
            selectionId: transaction.id,
            amount,
            awardedAt
          });
        } catch (notificationError) {
          console.error("[AstralSelection] Could not save the Realm notification:", notificationError);
        }

        console.log(`[AstralSelection] Awarded ${amount} sigils to ${randomUserId}; notification saved for their private /realm panel.`);
      }
    } catch (err) {
      console.error("[AstralSelection] Error:", err);
    }
  }, intervalMs);
}
