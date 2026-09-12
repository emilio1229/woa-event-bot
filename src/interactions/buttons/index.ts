import type { ButtonInteraction } from "discord.js";
import { handleRsvpGoing } from "./rsvpGoing.js";
import { handleRsvpMaybe } from "./rsvpMaybe.js";
import { handleRsvpNo } from "./rsvpNo.js";
import { isEventRsvpButton, parseEventRsvpButton } from "./shared.js";

export { buildEventRsvpButtons, isEventRsvpButton } from "./shared.js";

export async function dispatchEventButton(interaction: ButtonInteraction) {
  const parsed = parseEventRsvpButton(interaction.customId);

  if (!parsed) {
    return;
  }

  if (parsed.state === "going") {
    await handleRsvpGoing(interaction);
    return;
  }

  if (parsed.state === "maybe") {
    await handleRsvpMaybe(interaction);
    return;
  }

  await handleRsvpNo(interaction);
}
