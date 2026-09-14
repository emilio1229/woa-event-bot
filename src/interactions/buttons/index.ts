import type { ButtonInteraction } from "discord.js";
import { handleRsvpGoing } from "./rsvpGoing.js";
import { parseEventRsvpButton } from "./shared.js";

export { buildEventRsvpButtons, isEventRsvpButton } from "./shared.js";

export async function dispatchEventButton(interaction: ButtonInteraction) {
  const parsed = parseEventRsvpButton(interaction.customId);

  if (!parsed) {
    return;
  }

  await handleRsvpGoing(interaction);
}
