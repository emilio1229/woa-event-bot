import type { ButtonInteraction } from "discord.js";
import { handleEventRsvpButton } from "./shared.js";

export async function handleRsvpNo(interaction: ButtonInteraction) {
  await handleEventRsvpButton(interaction, "no");
}
