import { randomUUID } from "node:crypto";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle, type Interaction } from "discord.js";
import { prisma } from "../database/prisma.js";
import { arcaneStore } from "./store.js";
import { sigilStore } from "../sigilStore.js";

const PREFIX = "woa:arcane:familiar";
async function respondUpdate(i: any, payload: any) {
  return i.deferred || i.replied ? i.editReply(payload) : i.update(payload);
}
async function respondReply(i: any, payload: any) {
  return i.deferred || i.replied ? i.followUp(payload) : i.reply(payload);
}
const PETS = [
  { id: "archive_wisp", name: "Archive Wisp", emoji: "✨", rarity: "Common", lore: "A mote of forgotten memory. It chimes near erased records.", perk: "Begin each Trial with +5 Mana.", unlockBond: 0 },
  { id: "ember_fox", name: "Ember Fox", emoji: "🔥", rarity: "Uncommon", lore: "A small fox-spirit whose paws leave sparks on stone.", perk: "Your attacks deal +3 damage.", unlockBond: 20 },
  { id: "moon_moth", name: "Moon Moth", emoji: "🌙", rarity: "Rare", lore: "A silent moth that gathers light from places where stars have vanished.", perk: "An 8% chance to evade an enemy strike.", unlockBond: 45 },
  { id: "rune_tortoise", name: "Rune Tortoise", emoji: "🔷", rarity: "Rare", lore: "Its shell bears shifting runes that settle when its keeper is calm.", perk: "Defending grants +6 additional Ward.", unlockBond: 75 },
  { id: "voidling", name: "Voidling", emoji: "🌑", rarity: "Epic", lore: "A harmless fragment of the dark between stars, drawn to brave hearts.", perk: "Your attacks gain +2 arcane force.", unlockBond: 120 }
] as const;
type PetId = typeof PETS[number]["id"];

async function record(guildId: string, userId: string) {
  return prisma.arcaneFamiliarCollection.upsert({
    where: { guildId_userId: { guildId, userId } },
    create: { id: randomUUID(), guildId, userId, ownedIds: ["archive_wisp"], equippedId: "archive_wisp", bond: 0 },
    update: {}
  });
}
const pet = (id: string) => PETS.find(p => p.id === id);
function nicknameMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}
function escapeDiscordMarkdown(value: string): string {
  return value.replace(/[*_~|`]/g, "").replace(/[<>]/g, "");
}

export async function buildFamiliarView(guildId: string, userId: string) {
  const c = await arcaneStore.get(guildId, userId);
  if (!c) return { content: "Create your Wizard before visiting the Familiar Sanctum.", embeds: [], components: [] };
  const r = await record(guildId, userId);
  const equipped = pet(r.equippedId || "");
  const nicknames = nicknameMap(r.nicknames);
  const displayPetName = (p: typeof PETS[number]) => nicknames[p.id] || p.name;
  const list = PETS.map(p => {
    const owned = r.ownedIds.includes(p.id);
    const unlocked = r.bond >= p.unlockBond;
    const displayName = escapeDiscordMarkdown(displayPetName(p));
    return (owned ? "✅" : unlocked ? "🔓" : "🔒") + " " + p.emoji + " **" + displayName + "**" + (owned && nicknames[p.id] ? " *(" + p.name + ")*" : "") + " — " + (owned ? "Owned" : unlocked ? "Ready to discover" : "Bond " + p.unlockBond + " required") + "\n" + p.lore + "\n**Battle perk:** " + p.perk;
  }).join("\n\n");
  const e = new EmbedBuilder().setColor(0x6A0DAD).setTitle("🐾 THE FAMILIAR SANCTUM")
    .setDescription("Your companions are story-bound allies with unique combat perks. Equip one before entering a Trial; victories increase Bond and can awaken new familiars. Give your companion a name of its own, too!\n\n**Equipped:** " + (equipped ? equipped.emoji + " **" + escapeDiscordMarkdown(displayPetName(equipped)) + "**" + (nicknames[equipped.id] ? " *(" + equipped.name + ")*" : "") : "None") + "\n**Bond:** " + r.bond + " / 120\n\n" + list)
    .setFooter({ text: "Your equipped familiar’s passive perk applies in PvE Trials." });
  const options = PETS.filter(p => r.ownedIds.includes(p.id)).map(p => ({ label: displayPetName(p).slice(0, 100), value: p.id, emoji: p.emoji, description: p.id === r.equippedId ? "Currently equipped • " + p.name : p.rarity }));
  const rows: any[] = [];
  if (options.length) rows.push(new ActionRowBuilder<any>().addComponents(new StringSelectMenuBuilder().setCustomId(PREFIX + ":equip").setPlaceholder("Choose your companion").addOptions(options)));
  rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(PREFIX + ":rename").setLabel("✍️ Name Familiar").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(PREFIX + ":bond").setLabel("✨ Train • 5 Sigils").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("woa:arcane:open").setLabel("◀ Return").setStyle(ButtonStyle.Secondary)
  ));
  rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(PREFIX + ":refresh").setLabel("🔄 Refresh Sanctum").setStyle(ButtonStyle.Secondary)));
  return { embeds: [e], components: rows };
}

export async function handleFamiliarInteraction(i: Interaction) {
  if (!("customId" in i) || typeof i.customId !== "string" || !i.customId.startsWith(PREFIX + ":")) return false;
  if (!i.isMessageComponent() && !i.isModalSubmit()) return true;
  if (!i.guildId) { if (i.isRepliable()) await respondReply(i, { content: "The Familiar Sanctum is server-only.", flags: MessageFlags.Ephemeral }); return true; }
  try {
    const c = await arcaneStore.get(i.guildId, i.user.id);
    if (!c) { if (i.isRepliable()) await respondReply(i, { content: "Create your Wizard first.", flags: MessageFlags.Ephemeral }); return true; }
    const action = i.customId.slice((PREFIX + ":").length);
    const r = await record(i.guildId, i.user.id);
    if (action === "rename_submit" && i.isModalSubmit()) {
      const familiar = pet(r.equippedId || "");
      if (!familiar || !r.ownedIds.includes(familiar.id)) throw new Error("Equip a familiar before naming it.");
      const rawName = i.fields.getTextInputValue("familiar_name").trim().replace(/[\r\n]+/g, " ").replace(/[*_~|`<>]/g, "");
      if (rawName.length < 1 || rawName.length > 24) throw new Error("Choose a name between 1 and 24 characters.");
      if (/@everyone|@here|<@/i.test(rawName)) throw new Error("Familiar names cannot contain Discord mentions.");
      const nicknames = nicknameMap(r.nicknames);
      nicknames[familiar.id] = rawName;
      await prisma.arcaneFamiliarCollection.update({ where: { id: r.id }, data: { nicknames: nicknames as any } });
      await respondReply(i, { content: "🐾 **" + escapeDiscordMarkdown(rawName) + "** is now the name of your " + familiar.name + "! Your companion will use it in the Familiar Sanctum and battle logs.", flags: MessageFlags.Ephemeral });
      return true;
    }
    if (action === "rename" && i.isButton()) {
      const familiar = pet(r.equippedId || "");
      if (!familiar || !r.ownedIds.includes(familiar.id)) throw new Error("Equip a familiar before naming it.");
      const nicknames = nicknameMap(r.nicknames);
      const modal = new ModalBuilder().setCustomId(PREFIX + ":rename_submit").setTitle("Name Your Familiar");
      modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder().setCustomId("familiar_name").setLabel("What will you call your " + familiar.name + "?").setPlaceholder("A name worthy of a tiny legend").setValue(nicknames[familiar.id] || familiar.name).setRequired(true).setMinLength(1).setMaxLength(24).setStyle(TextInputStyle.Short)
      ));
      await i.showModal(modal);
      return true;
    }
    if (action === "refresh" && i.isButton()) {
      await respondUpdate(i, await buildFamiliarView(i.guildId, i.user.id));
      return true;
    }
    if (action === "equip" && i.isStringSelectMenu()) {
      const id = i.values[0];
      if (!r.ownedIds.includes(id)) throw new Error("You have not discovered that familiar yet.");
      await prisma.arcaneFamiliarCollection.update({ where: { id: r.id }, data: { equippedId: id } });
    } else if (action === "bond" && i.isButton()) {
      if (await sigilStore.getBalance(i.guildId, i.user.id) < 5) throw new Error("Familiar training costs 5 Sigils. Earn more through Realm activities or Trials.");
      await sigilStore.addTransaction(i.guildId, i.user.id, -5, "Arcane Familiar Bond Training", { type: "redeem" });
      const nextBond = Math.min(120, r.bond + 10);
      const unlocked = PETS.filter(p => p.unlockBond <= nextBond && !r.ownedIds.includes(p.id));
      const newlyOwned = unlocked.length ? unlocked[0] : undefined;
      await prisma.arcaneFamiliarCollection.update({ where: { id: r.id }, data: { bond: nextBond, ...(newlyOwned ? { ownedIds: [...r.ownedIds, newlyOwned.id] } : {}) } });
      await respondUpdate(i, await buildFamiliarView(i.guildId, i.user.id));
      if (newlyOwned) await i.followUp({ content: "🐾 New familiar discovered: " + newlyOwned.emoji + " **" + newlyOwned.name + "**!", flags: MessageFlags.Ephemeral });
      return true;
    } else throw new Error("That familiar action is not supported.");
    await respondUpdate(i, await buildFamiliarView(i.guildId, i.user.id));
  } catch (error) {
    const message = "❌ " + (error instanceof Error ? error.message : "The familiar action failed.");
    if (i.isRepliable() && !i.replied && !i.deferred) await i.reply({ content: message, flags: MessageFlags.Ephemeral });
    else if (i.isRepliable()) await i.followUp({ content: message, flags: MessageFlags.Ephemeral });
  }
  return true;
}
