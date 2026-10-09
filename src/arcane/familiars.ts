import { randomUUID } from "node:crypto";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags, StringSelectMenuBuilder, type Interaction } from "discord.js";
import { prisma } from "../database/prisma.js";
import { arcaneStore } from "./store.js";
import { sigilStore } from "../sigilStore.js";

const PREFIX = "woa:arcane:familiar";
const PETS = [
  { id: "archive_wisp", name: "Archive Wisp", emoji: "✨", rarity: "Common", lore: "A mote of forgotten memory. It chimes near erased records.", unlockBond: 0 },
  { id: "ember_fox", name: "Ember Fox", emoji: "🔥", rarity: "Uncommon", lore: "A small fox-spirit whose paws leave sparks on stone.", unlockBond: 20 },
  { id: "moon_moth", name: "Moon Moth", emoji: "🌙", rarity: "Rare", lore: "A silent moth that gathers light from places where stars have vanished.", unlockBond: 45 },
  { id: "rune_tortoise", name: "Rune Tortoise", emoji: "🔷", rarity: "Rare", lore: "Its shell bears shifting runes that settle when its keeper is calm.", unlockBond: 75 },
  { id: "voidling", name: "Voidling", emoji: "🌑", rarity: "Epic", lore: "A harmless fragment of the dark between stars, drawn to brave hearts.", unlockBond: 120 }
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

export async function buildFamiliarView(guildId: string, userId: string) {
  const c = await arcaneStore.get(guildId, userId);
  if (!c) return { content: "Create your Wizard before visiting the Familiar Sanctum.", embeds: [], components: [] };
  const r = await record(guildId, userId);
  const equipped = pet(r.equippedId || "");
  const list = PETS.map(p => {
    const owned = r.ownedIds.includes(p.id);
    const unlocked = r.bond >= p.unlockBond;
    return (owned ? "✅" : unlocked ? "🔓" : "🔒") + " " + p.emoji + " **" + p.name + "** — " + (owned ? "Owned" : unlocked ? "Ready to discover" : "Bond " + p.unlockBond + " required") + "\n" + p.lore;
  }).join("\n\n");
  const e = new EmbedBuilder().setColor(0x6A0DAD).setTitle("🐾 THE FAMILIAR SANCTUM")
    .setDescription("Your companions are story-bound allies. Equip one to carry its presence into your Chronicle. Familiar bond grows as you advance the saga.\n\n**Equipped:** " + (equipped ? equipped.emoji + " **" + equipped.name + "**" : "None") + "\n**Bond:** " + r.bond + " / 120\n\n" + list)
    .setFooter({ text: "Companions are cosmetic/lore companions for now; they do not alter battle balance." });
  const options = PETS.filter(p => r.ownedIds.includes(p.id)).map(p => ({ label: p.name, value: p.id, emoji: p.emoji, description: p.id === r.equippedId ? "Currently equipped" : p.rarity }));
  const rows: any[] = [];
  if (options.length) rows.push(new ActionRowBuilder<any>().addComponents(new StringSelectMenuBuilder().setCustomId(PREFIX + ":equip").setPlaceholder("Choose your companion").addOptions(options)));
  rows.push(new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(PREFIX + ":bond").setLabel("✨ Train Familiar • 5 Sigils").setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId("woa:arcane:open").setLabel("◀ Return to Hall").setStyle(ButtonStyle.Secondary)));
  return { embeds: [e], components: rows };
}

export async function handleFamiliarInteraction(i: Interaction) {
  if (!("customId" in i) || typeof i.customId !== "string" || !i.customId.startsWith(PREFIX + ":")) return false;
  if (!i.isMessageComponent()) return true;
  if (!i.guildId) { if (i.isRepliable()) await i.reply({ content: "The Familiar Sanctum is server-only.", flags: MessageFlags.Ephemeral }); return true; }
  try {
    const c = await arcaneStore.get(i.guildId, i.user.id);
    if (!c) { if (i.isRepliable()) await i.reply({ content: "Create your Wizard first.", flags: MessageFlags.Ephemeral }); return true; }
    const action = i.customId.slice((PREFIX + ":").length);
    const r = await record(i.guildId, i.user.id);
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
      await i.update(await buildFamiliarView(i.guildId, i.user.id));
      if (newlyOwned) await i.followUp({ content: "🐾 New familiar discovered: " + newlyOwned.emoji + " **" + newlyOwned.name + "**!", flags: MessageFlags.Ephemeral });
      return true;
    } else throw new Error("That familiar action is not supported.");
    await i.update(await buildFamiliarView(i.guildId, i.user.id));
  } catch (error) {
    const message = "❌ " + (error instanceof Error ? error.message : "The familiar action failed.");
    if (i.isRepliable() && !i.replied && !i.deferred) await i.reply({ content: message, flags: MessageFlags.Ephemeral });
    else if (i.isRepliable()) await i.followUp({ content: message, flags: MessageFlags.Ephemeral });
  }
  return true;
}
