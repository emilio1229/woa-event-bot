export type ArcaneClassId = "ember_mage"|"frostweaver"|"verdant_warden"|"storm_herald"|"voidcaller"|"sigilbinder";
export type ArcaneItemKind = "spell"|"armor"|"focus"|"relic"|"cosmetic";
export interface ArcaneStats { maxHp:number; maxMana:number; power:number; defense:number; speed:number; }
export interface ArcaneClass { id:ArcaneClassId; name:string; emoji:string; role:string; description:string; base:ArcaneStats; starterSpells:string[]; special:{name:string;description:string;manaCost:number}; }
export interface ArcaneItem { id:string; name:string; emoji:string; kind:ArcaneItemKind; rarity:string; cost:number; description:string; classId?:ArcaneClassId; stats?:Partial<ArcaneStats>; effect?:{type:string;value:number}; manaCost?:number; }
export interface ArcanePveEnemy { id:string; name:string; emoji:string; rarity:string; description:string; maxHp:number; maxMana:number; power:number; defense:number; speed:number; rewardXp:number; rewardSigils:number; }
export const ARCANE_CLASSES:ArcaneClass[]=[
{id:"ember_mage",name:"Ember Mage",emoji:"🔥",role:"Damage",description:"Aggressive fire magic.",base:{maxHp:95,maxMana:70,power:15,defense:8,speed:10},starterSpells:["ember_bolt","ember_ward"],special:{name:"Inferno",description:"Unleash a devastating burst of flame against the enemy.",manaCost:30}},
{id:"frostweaver",name:"Frostweaver",emoji:"❄️",role:"Control",description:"Cold magic and battlefield control.",base:{maxHp:105,maxMana:70,power:10,defense:11,speed:8},starterSpells:["frost_shard","frost_veil"],special:{name:"Absolute Zero",description:"Strike with freezing magic and leave the enemy weakened.",manaCost:30}},
{id:"verdant_warden",name:"Verdant Warden",emoji:"🌿",role:"Support",description:"Healing and protection.",base:{maxHp:120,maxMana:65,power:8,defense:14,speed:7},starterSpells:["verdant_bloom","thorn_guard"],special:{name:"Nature's Rebirth",description:"Restore health and raise a protective living ward.",manaCost:30}},
{id:"storm_herald",name:"Storm Herald",emoji:"⚡",role:"Speed",description:"Fast lightning and burst attacks.",base:{maxHp:90,maxMana:75,power:12,defense:8,speed:16},starterSpells:["storm_bolt","thunderstep"],special:{name:"Tempest Rush",description:"A rapid lightning assault that hits with exceptional force.",manaCost:30}},
{id:"voidcaller",name:"Voidcaller",emoji:"🌑",role:"Debuff",description:"Weakens enemies and drains power.",base:{maxHp:100,maxMana:80,power:10,defense:9,speed:11},starterSpells:["void_bolt","entropy"],special:{name:"Oblivion",description:"Tear at the enemy with void magic, weakening and draining them.",manaCost:30}},
{id:"sigilbinder",name:"Sigilbinder",emoji:"🔮",role:"Hybrid",description:"Manipulates magical power itself.",base:{maxHp:100,maxMana:85,power:11,defense:10,speed:10},starterSpells:["sigil_bolt","sigil_focus"],special:{name:"Arcane Convergence",description:"Collapse raw Sigil energy into a balanced strike and ward.",manaCost:30}}
];
export const ARCANE_PVE_ENEMIES:ArcanePveEnemy[]=[
{id:"ember_wraith",name:"Ember Wraith",emoji:"🔥",rarity:"Common",description:"A restless flame spirit prowling the outer realm.",maxHp:85,maxMana:40,power:10,defense:6,speed:9,rewardXp:40,rewardSigils:5},
{id:"frostbound_sentinel",name:"Frostbound Sentinel",emoji:"❄️",rarity:"Uncommon",description:"An ancient guardian carved from enchanted ice.",maxHp:125,maxMana:50,power:12,defense:11,speed:6,rewardXp:65,rewardSigils:8},
{id:"void_stalker",name:"Void Stalker",emoji:"🌑",rarity:"Rare",description:"A creature that hunts where the light of the realm fades.",maxHp:150,maxMana:60,power:15,defense:10,speed:13,rewardXp:90,rewardSigils:12},
{id:"astral_archon",name:"Astral Archon",emoji:"🌌",rarity:"Epic",description:"A powerful sentinel of the deeper Arcane Realm.",maxHp:210,maxMana:80,power:19,defense:14,speed:11,rewardXp:140,rewardSigils:20},
{id:"runic_troll",name:"Runic Troll",emoji:"👹",rarity:"Common",description:"A hulking bridge troll covered in old wizarding runes.",maxHp:110,maxMana:20,power:13,defense:9,speed:5,rewardXp:45,rewardSigils:5},
{id:"hexed_goblin",name:"Hexed Goblin",emoji:"👺",rarity:"Common",description:"A sneaky goblin who learned just enough spellcraft to be dangerous.",maxHp:75,maxMana:45,power:11,defense:5,speed:15,rewardXp:45,rewardSigils:6},
{id:"enchanted_golem",name:"Enchanted Golem",emoji:"🗿",rarity:"Uncommon",description:"A stone guardian animated by a forgotten spell.",maxHp:145,maxMana:30,power:14,defense:15,speed:4,rewardXp:70,rewardSigils:8},
{id:"witchwood_wolf",name:"Witchwood Wolf",emoji:"🐺",rarity:"Uncommon",description:"A moon-touched beast that prowls the forests beyond the wizard roads.",maxHp:105,maxMana:35,power:14,defense:7,speed:17,rewardXp:65,rewardSigils:8},
{id:"cursed_knight",name:"Cursed Knight",emoji:"🛡️",rarity:"Rare",description:"A fallen guardian bound to an ancient sorcerer's oath.",maxHp:165,maxMana:40,power:17,defense:13,speed:8,rewardXp:95,rewardSigils:13},
{id:"bog_witch",name:"Bog Witch",emoji:"🧙",rarity:"Rare",description:"A swamp-dwelling spellcaster whose curses linger long after the duel.",maxHp:130,maxMana:90,power:17,defense:8,speed:10,rewardXp:100,rewardSigils:14},
{id:"tower_chimera",name:"Tower Chimera",emoji:"🐲",rarity:"Epic",description:"A magical beast stitched from the nightmares of an abandoned wizard tower.",maxHp:195,maxMana:70,power:20,defense:12,speed:12,rewardXp:135,rewardSigils:19},
{id:"fallen_apprentice",name:"Fallen Apprentice",emoji:"🧙‍♂️",rarity:"Epic",description:"A rogue apprentice wielding unstable magic stolen from the Grand Archive.",maxHp:180,maxMana:110,power:21,defense:10,speed:14,rewardXp:150,rewardSigils:21},
{id:"ancient_spellwyrm",name:"Ancient Spellwyrm",emoji:"🐉",rarity:"Legendary",description:"A dragon that fed for centuries on raw arcane energy.",maxHp:260,maxMana:120,power:24,defense:16,speed:13,rewardXp:220,rewardSigils:30}
];
export const ARCANE_ITEMS:ArcaneItem[]=[
{id:"ember_bolt",name:"Ember Bolt",emoji:"🔥",kind:"spell",rarity:"common",cost:0,description:"Reliable fire damage.",classId:"ember_mage",effect:{type:"damage",value:18},manaCost:8},
{id:"ember_ward",name:"Ember Ward",emoji:"🛡️",kind:"spell",rarity:"common",cost:0,description:"Raise a protective ward.",classId:"ember_mage",effect:{type:"shield",value:14},manaCost:8},
{id:"flame_burst",name:"Flame Burst",emoji:"💥",kind:"spell",rarity:"uncommon",cost:45,description:"Heavy fire damage.",classId:"ember_mage",effect:{type:"damage",value:30},manaCost:14},
{id:"frost_shard",name:"Frost Shard",emoji:"❄️",kind:"spell",rarity:"common",cost:0,description:"Cold damage.",classId:"frostweaver",effect:{type:"damage",value:16},manaCost:8},
{id:"frost_veil",name:"Frost Veil",emoji:"🧊",kind:"spell",rarity:"common",cost:0,description:"Reduce incoming damage.",classId:"frostweaver",effect:{type:"guard",value:16},manaCost:8},
{id:"glacial_bind",name:"Glacial Bind",emoji:"⛓️",kind:"spell",rarity:"uncommon",cost:45,description:"Damage and control.",classId:"frostweaver",effect:{type:"damage",value:24},manaCost:14},
{id:"verdant_bloom",name:"Verdant Bloom",emoji:"🌿",kind:"spell",rarity:"common",cost:0,description:"Restore health.",classId:"verdant_warden",effect:{type:"heal",value:22},manaCost:8},
{id:"thorn_guard",name:"Thorn Guard",emoji:"🌱",kind:"spell",rarity:"common",cost:0,description:"Raise a shield.",classId:"verdant_warden",effect:{type:"shield",value:18},manaCost:8},
{id:"lifeweave",name:"Lifeweave",emoji:"✨",kind:"spell",rarity:"uncommon",cost:50,description:"Strong restoration.",classId:"verdant_warden",effect:{type:"heal",value:34},manaCost:14},
{id:"storm_bolt",name:"Storm Bolt",emoji:"⚡",kind:"spell",rarity:"common",cost:0,description:"Fast lightning damage.",classId:"storm_herald",effect:{type:"damage",value:17},manaCost:8},
{id:"thunderstep",name:"Thunderstep",emoji:"⚡",kind:"spell",rarity:"common",cost:0,description:"Strike with lightning.",classId:"storm_herald",effect:{type:"damage",value:14},manaCost:8},
{id:"chain_lightning",name:"Chain Lightning",emoji:"🌩️",kind:"spell",rarity:"uncommon",cost:55,description:"Powerful lightning.",classId:"storm_herald",effect:{type:"damage",value:28},manaCost:14},
{id:"void_bolt",name:"Void Bolt",emoji:"🌑",kind:"spell",rarity:"common",cost:0,description:"Precise void damage.",classId:"voidcaller",effect:{type:"damage",value:16},manaCost:8},
{id:"entropy",name:"Entropy",emoji:"🕳️",kind:"spell",rarity:"common",cost:0,description:"Weaken the enemy.",classId:"voidcaller",effect:{type:"weaken",value:10},manaCost:8},
{id:"void_drain",name:"Void Drain",emoji:"🌑",kind:"spell",rarity:"uncommon",cost:55,description:"Damage and recover.",classId:"voidcaller",effect:{type:"drain",value:20},manaCost:14},
{id:"sigil_bolt",name:"Sigil Bolt",emoji:"🔮",kind:"spell",rarity:"common",cost:0,description:"Balanced arcane damage.",classId:"sigilbinder",effect:{type:"damage",value:16},manaCost:8},
{id:"sigil_focus",name:"Sigil Focus",emoji:"🔮",kind:"spell",rarity:"common",cost:0,description:"Recover Mana.",classId:"sigilbinder",effect:{type:"mana",value:20},manaCost:8},
{id:"arcane_surge",name:"Arcane Surge",emoji:"✨",kind:"spell",rarity:"uncommon",cost:60,description:"Powerful arcane damage.",classId:"sigilbinder",effect:{type:"damage",value:25},manaCost:14},
{id:"apprentice_robes",name:"Apprentice Robes",emoji:"🧥",kind:"armor",rarity:"common",cost:0,description:"Starter robes.",stats:{defense:2}},
{id:"emberweave_mantle",name:"Emberweave Mantle",emoji:"🔥",kind:"armor",rarity:"uncommon",cost:60,description:"Ember-threaded armor.",stats:{defense:5,power:2}},
{id:"frostbound_raiment",name:"Frostbound Raiment",emoji:"❄️",kind:"armor",rarity:"rare",cost:90,description:"Steadying frost armor.",stats:{defense:7,maxHp:8}},
{id:"voidcloak",name:"Voidcloak",emoji:"🌑",kind:"armor",rarity:"rare",cost:100,description:"Impossible shadow armor.",stats:{defense:4,maxMana:10}},
{id:"apprentice_wand",name:"Apprentice Wand",emoji:"🪄",kind:"focus",rarity:"common",cost:0,description:"Starter magical focus.",stats:{power:2}},
{id:"storm_scepter",name:"Storm Scepter",emoji:"⚡",kind:"focus",rarity:"uncommon",cost:65,description:"Swift magical focus.",stats:{power:4,speed:2}},
{id:"sigil_tome",name:"Sigil Tome",emoji:"📖",kind:"focus",rarity:"rare",cost:110,description:"Deepens magical reserves.",stats:{power:3,maxMana:14}},
{id:"emberglass",name:"Emberglass",emoji:"🔶",kind:"relic",rarity:"uncommon",cost:75,description:"A once-per-battle ward.",effect:{type:"shield",value:12}},
{id:"feather_astraeos",name:"Feather of Astraeos",emoji:"🪶",kind:"relic",rarity:"rare",cost:125,description:"A rare evasive charm.",effect:{type:"evasion",value:10}},
{id:"lunar_eye",name:"Lunar Eye",emoji:"🌙",kind:"relic",rarity:"epic",cost:175,description:"Seize the initiative and act again immediately.",effect:{type:"initiative",value:4}},
{id:"ember_aura",name:"Ember Aura",emoji:"🔥",kind:"cosmetic",rarity:"uncommon",cost:50,description:"A cosmetic ember aura."},
{id:"astral_aura",name:"Astral Aura",emoji:"🌌",kind:"cosmetic",rarity:"rare",cost:100,description:"A cosmetic starlit aura."},
{id:"void_mask",name:"Void Mask",emoji:"🎭",kind:"cosmetic",rarity:"epic",cost:150,description:"A mysterious cosmetic mask."}
];
export function getClass(id:string){return ARCANE_CLASSES.find(x=>x.id===id);}
export function getPveEnemy(id:string){return ARCANE_PVE_ENEMIES.find(x=>x.id===id);}
export function getRandomPveEnemy(){return ARCANE_PVE_ENEMIES[Math.floor(Math.random()*ARCANE_PVE_ENEMIES.length)];}
export function getItem(id:string){return ARCANE_ITEMS.find(x=>x.id===id);}
export function getItems(kind?:ArcaneItemKind){return kind?ARCANE_ITEMS.filter(x=>x.kind===kind):ARCANE_ITEMS;}