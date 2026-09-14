const bountyDrafts = new Map<string, BountyDraft>();
const postingDrafts = new Map<string, PostingDraft>();

type CouncilUpdate = Exclude<NonNullable<Parameters<ButtonInteraction["update"]>[0]>, string>;

async function updateCouncilPanel(interaction: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction, payload: CouncilUpdate) {
  if (interaction.isModalSubmit()) {
    if (interaction.isFromMessage()) {
      await interaction.deferUpdate();
      await interaction.message.edit(payload as Parameters<typeof interaction.message.edit>[0]);
      return;
    }
    if (!interaction.replied && !interaction.deferred) {
      const replyPayload = {
        ...payload,
        content: payload.content ?? undefined
      };
      await interaction.reply(replyPayload as Parameters<typeof interaction.reply>[0]);
    }
    return;
  }
  await interaction.update(payload);
}

export function isCouncilMember(interaction: Interaction) {