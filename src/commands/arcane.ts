import { SlashCommandBuilder,type ChatInputCommandInteraction } from "discord.js";
import { buildArcaneEntry } from "../arcane/panel.js";
import { arcaneStore } from "../arcane/store.js";
import type { CommandModule } from "../utils/commandLoader.js";
const command:CommandModule={data:new SlashCommandBuilder().setName("arcane").setDescription("Enter the Wizards of Ark Arcane Trials mini-RPG."),async execute(i:ChatInputCommandInteraction){if(!i.guildId){await i.reply({content:"The Arcane Trials only exist within a WoA realm.",ephemeral:true});return;}await i.reply({...buildArcaneEntry(Boolean(await arcaneStore.get(i.guildId,i.user.id))),ephemeral:true});}};
export default command;