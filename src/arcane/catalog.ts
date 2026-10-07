export type ArcaneClassId = "ember_mage"|"frostweaver"|"verdant_warden"|"storm_herald"|"voidcaller"|"sigilbinder";
export type ArcaneItemKind = "spell"|"armor"|"focus"|"relic"|"cosmetic";
export interface ArcaneStats { maxHp:number; maxMana:number; power:number; defense:number; speed:number; }
export interface ArcaneClass { id:ArcaneClassId; name:string; emoji:string; role:string; description:string; base:ArcaneStats; starterSpells:string[]; }
export interface ArcaneItem { id:string; name:string; emoji:string; kind:ArcaneItemKind; rarity:string; cost:number; description:string; classId?:ArcaneClassId; stats?:Partial<ArcaneStats>; effect?:{type:string;value:number}; }
export const ARCANE_CLASSES:ArcaneClass[]=[
{id:"ember_mage",name:"Ember Mage",emoji:"🔥",role:"Damage",description:"Aggressive fire magic.",base:{maxHp:95,maxMana:70,power:15,defense:8,speed:10},starterSpells:["ember_bolt","ember_ward"]},
{id:"frostweaver",name:"Frostweaver",emoji:"❄️",role:"Control",description:"Cold magic and battlefield control.",base:{maxHp:105,maxMana:70,power:10,defense:11,speed:8},starterSpells:["frost_shard","frost_veil"]},
{id:"verdant_warden",name:"Verdant Warden",emoji:"🌿",role:"Support",description:"Healing and protection.",base:{maxHp:120,maxMana:65,power:8,defense:14,speed:7},starterSpells:["verdant_bloom","thorn_guard"]},
{id:"storm_herald",name:"Storm Herald",emoji:"⚡",role:"Speed",description:"Fast lightning and burst attacks.",base:{maxHp:90,maxMana:75,power:12,defense:8,speed:16},starterSpells:["storm_bolt","thunderstep"]},
{id:"voidcaller",name:"Voidcaller",emoji:"🌑",role:"Debuff",description:"Weakens enemies and drains power.",base:{maxHp:100,maxMana:80,power:10,defense:9,speed:11},starterSpells:["void_bolt","entropy"]},
{id:"sigilbinder",name:"Sigilbinder",emoji:"🔮",role:"Hybrid",description:"Manipulates magical power itself.",base:{maxHp:100,maxMana:85,power:11,defense:10,speed:10},starterSpells:["sigil_bolt","sigil_focus"]}
];
export const ARCANE_ITEMS:ArcaneItem[]=[
{id:"ember_bolt",name:"Ember Bolt",emoji:"🔥",kind:"spell",rarity:"common",cost:0,description:"Reliable fire damage.",classId:"ember_mage",effect:{type:"damage",value:18}},
{id:"ember_ward",name:"Ember Ward",emoji:"🛡️",kind:"spell",rarity:"common",cost:0,description:"Raise a protective ward.",classId:"ember_mage",effect:{type:"shield",value:14}},
{id:"flame_burst",name:"Flame Burst",emoji:"💥",kind:"spell",rarity:"uncommon",cost:45,description:"Heavy fire damage.",classId:"ember_mage",effect:{type:"damage",value:30}},
{id:"frost_shard",name:"Frost Shard",emoji:"❄️",kind:"spell",rarity:"common",cost:0,description:"Cold damage.",classId:"frostweaver",effect:{type:"damage",value:16}},
{id:"frost_veil",name:"Frost Veil",emoji:"🧊",kind:"spell",rarity:"common",cost:0,description:"Reduce incoming damage.",classId:"frostweaver",effect:{type:"guard",value:16}},
{id:"glacial_bind",name:"Glacial Bind",emoji:"⛓️",kind:"spell",rarity:"uncommon",cost:45,description:"Damage and control.",classId:"frostweaver",effect:{type:"damage",value:24}},
{id:"verdant_bloom",name:"Verdant Bloom",emoji:"🌿",kind:"spell",rarity:"common",cost:0,description:"Restore health.",classId:"verdant_warden",effect:{type:"heal",value:22}},
{id:"thorn_guard",name:"Thorn Guard",emoji:"🌱",kind:"spell",rarity:"common",cost:0,description:"Raise a shield.",classId:"verdant_warden",effect:{type:"shield",value:18}},
{id:"lifeweave",name:"Lifeweave",emoji:"✨",kind:"spell",rarity:"uncommon",cost:50,description:"Strong restoration.",classId:"verdant_warden",effect:{type:"heal",value:34}},
{id:"storm_bolt",name:"Storm Bolt",emoji:"⚡",kind:"spell",rarity:"common",cost:0,description:"Fast lightning damage.",classId:"storm_herald",effect:{type:"damage",value:17}},
{id:"thunderstep",name:"Thunderstep",emoji:"⚡",kind:"spell",rarity:"common",cost:0,description:"Strike with lightning.",classId:"storm_herald",effect:{type:"damage",value:14}},
{id:"chain_lightning",name:"Chain Lightning",emoji:"🌩️",kind:"spell",rarity:"uncommon",cost:55,description:"Powerful lightning.",classId:"storm_herald",effect:{type:"damage",value:28}},
{id:"void_bolt",name:"Void Bolt",emoji:"🌑",kind:"spell",rarity:"common",cost:0,description:"Precise void damage.",classId:"voidcaller",effect:{type:"damage",value:16}},
{id:"entropy",name:"Entropy",emoji:"🕳️",kind:"spell",rarity:"common",cost:0,description:"Weaken the enemy.",classId:"voidcaller",effect:{type:"weaken",value:10}},
{id:"void_drain",name:"Void Drain",emoji:"🌑",kind:"spell",rarity:"uncommon",cost:55,description:"Damage and recover.",classId:"voidcaller",effect:{type:"drain",value:20}},
{id:"sigil_bolt",name:"Sigil Bolt",emoji:"🔮",kind:"spell",rarity:"common",cost:0,description:"Balanced arcane damage.",classId:"sigilbinder",effect:{type:"damage",value:16}},
{id:"sigil_focus",name:"Sigil Focus",emoji:"🔮",kind:"spell",rarity:"common",cost:0,description:"Recover Mana.",classId:"sigilbinder",effect:{type:"mana",value:20}},
{id:"arcane_surge",name:"Arcane Surge",emoji:"✨",kind:"spell",rarity:"uncommon",cost:60,description:"Powerful arcane damage.",classId:"sigilbinder",effect:{type:"damage",value:25}},
{id:"apprentice_robes",name:"Apprentice Robes",emoji:"🧥",kind:"armor",rarity:"common",cost:0,description:"Starter robes.",stats:{defense:2}},
{id:"emberweave_mantle",name:"Emberweave Mantle",emoji:"🔥",kind:"armor",rarity:"uncommon",cost:60,description:"Ember-threaded armor.",stats:{defense:5,power:2}},
{id:"frostbound_raiment",name:"Frostbound Raiment",emoji:"❄️",kind:"armor",rarity:"rare",cost:90,description:"Steadying frost armor.",stats:{defense:7,maxHp:8}},
{id:"voidcloak",name:"Voidcloak",emoji:"🌑",kind:"armor",rarity:"rare",cost:100,description:"Impossible shadow armor.",stats:{defense:4,maxMana:10}},
{id:"apprentice_wand",name:"Apprentice Wand",emoji:"🪄",kind:"focus",rarity:"common",cost:0,description:"Starter magical focus.",stats:{power:2}},
{id:"storm_scepter",name:"Storm Scepter",emoji:"⚡",kind:"focus",rarity:"uncommon",cost:65,description:"Swift magical focus.",stats:{power:4,speed:2}},
{id:"sigil_tome",name:"Sigil Tome",emoji:"📖",kind:"focus",rarity:"rare",cost:110,description:"Deepens magical reserves.",stats:{power:3,maxMana:14}},
{id:"emberglass",name:"Emberglass",emoji:"🔶",kind:"relic",rarity:"uncommon",cost:75,description:"A once-per-battle ward.",effect:{type:"shield",value:12}},
{id:"feather_astraeos",name:"Feather of Astraeos",emoji:"🪶",kind:"relic",rarity:"rare",cost:125,description:"A rare evasive charm.",effect:{type:"evasion",value:10}},
{id:"lunar_eye",name:"Lunar Eye",emoji:"🌙",kind:"relic",rarity:"epic",cost:175,description:"A relic that sharpens initiative.",effect:{type:"initiative",value:4}},
{id:"ember_aura",name:"Ember Aura",emoji:"🔥",kind:"cosmetic",rarity:"uncommon",cost:50,description:"A cosmetic ember aura."},
{id:"astral_aura",name:"Astral Aura",emoji:"🌌",kind:"cosmetic",rarity:"rare",cost:100,description:"A cosmetic starlit aura."},
{id:"void_mask",name:"Void Mask",emoji:"🎭",kind:"cosmetic",rarity:"epic",cost:150,description:"A mysterious cosmetic mask."},
{id:"riddlebreaker_title",name:"The Riddlebreaker",emoji:"🧩",kind:"cosmetic",rarity:"rare",cost:125,description:"A prestigious WoA title."}
];
export function getClass(id:string){return ARCANE_CLASSES.find(x=>x.id===id);}
export function getItem(id:string){return ARCANE_ITEMS.find(x=>x.id===id);}
export function getItems(kind?:ArcaneItemKind){return kind?ARCANE_ITEMS.filter(x=>x.kind===kind):ARCANE_ITEMS;}