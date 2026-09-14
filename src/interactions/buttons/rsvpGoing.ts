import type { ButtonInteraction } from "discord.js";
import { handleEventRsvpButton } from "./shared.js";

export async function handleRsvpGoing(interaction: ButtonInteraction) {
  await handleEventRsvpButton(interaction);
}
