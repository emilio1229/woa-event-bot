import type { ButtonInteraction } from "discord.js";
import { handleEventRsvpButton } from "./shared.js";

export async function handleRsvpMaybe(interaction: ButtonInteraction) {
  await handleEventRsvpButton(interaction, "maybe");
}
