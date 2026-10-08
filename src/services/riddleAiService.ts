export interface GeneratedArcaneRiddle {
  question: string;
  answer: string;
  hint?: string;
  reward: number;
  notes: string;
}

type RiddleSeed = {
  answer: string;
  lines: string[];
  hints: string[];
  reward: number;
  notes: string;
};

const RIDDLES: RiddleSeed[] = [
  {
    answer: "The Red Obelisk",
    lines: [
      "I am called a landmark by those who fear names and a witness by those who collect them.",
      "Heathen says I never move. Wizard says that is precisely why I can send you somewhere else.",
      "Rin once asked which color a memory has when it crosses a sky that is not its own.",
      "I ask for trophies, but I am not a collector; I answer requests, but I am not a servant.",
      "Stand beneath me long enough and you may realize the road was never the thing doing the traveling."
    ],
    hints: [
      "Do not begin with the word 'obelisk'; begin with what a stationary landmark can permit.",
      "The answer is tied to transfer between Realms and to three recurring landmarks.",
      "Its identity is separated from the idea of a normal doorway: the traveler remains the traveler.",
      "The color is not decoration. It is part of the answer's identity."
    ],
    reward: 25,
    notes: "Hard ARK landmark mystery; color and transfer clues are deliberately indirect."
  },
  {
    answer: "Cryopod",
    lines: [
      "Panda called me a coffin until Doxo asked why the dead are never returned from mine.",
      "I make a giant smaller without cutting it, distant without moving it, and absent without losing it.",
      "A tribe can own a hundred answers to a problem while carrying only a handful of them.",
      "My prisoner has no bars, no hunger, and no footsteps until the keeper decides the story resumes.",
      "The trick is not that I hold life. The trick is that the Realm agrees to forget its size."
    ],
    hints: [
      "The answer solves space and transport at the same time.",
      "What is stored can later return in a living state.",
      "Think of the item tribes use to carry creatures without leading them.",
      "Its most important property is what it lets the Realm temporarily stop tracking."
    ],
    reward: 24,
    notes: "Creature storage presented as a paradox rather than a utility description."
  },
  {
    answer: "Tek Transmitter",
    lines: [
      "Wizard called me a door and EmilioTheGreat called me a receipt; both descriptions fail in different directions.",
      "I can be standing perfectly still while something that was never near you becomes yours.",
      "A creature may cross my boundary without walking, while an entire map remains exactly where it was.",
      "Doxo says the clever part is not where I send things, but what I convince the Realm to count as the same journey.",
      "I am less a road than an argument that distance should not matter."
    ],
    hints: [
      "The answer concerns cross-map transfer, not ordinary fast travel.",
      "The important clue is the exchange of inventories and creatures rather than the travel of a body.",
      "It belongs to advanced ARK infrastructure.",
      "Look for the device that acts as a transfer point rather than a destination."
    ],
    reward: 26,
    notes: "Cross-Realm transfer riddle with deliberately overlapping teleportation language."
  },
  {
    answer: "Element",
    lines: [
      "Rin wrote 'treasure' and erased it. Doxo wrote 'fuel' and erased that too.",
      "It is mined, refined, spent, corrupted, shaped, and yet never behaves like an ordinary resource.",
      "Machines hunger for it, but its history reaches beyond the machines that consume it.",
      "Heathen says every Realm leaves fingerprints on the same mystery; Wizard says the fingerprints are the mystery.",
      "The strange part is not that survivors need it. The strange part is how many impossible things become ordinary once they have it."
    ],
    hints: [
      "Think of ARK's endgame technology before thinking of a crafting ingredient.",
      "Its forms and uses change across the wider ARK story.",
      "It connects advanced machinery, boss progression, and the deeper history of the ARKs.",
      "The answer is the substance that makes the impossible feel manufactured."
    ],
    reward: 27,
    notes: "Endgame resource framed around its narrative significance rather than appearance."
  },
  {
    answer: "Dung Beetle",
    lines: [
      "Brendon once asked why the Council records a creature that most heroes refuse to notice.",
      "Heathen answered, 'Because heroes still need gardens.'",
      "I begin with what the tribe throws away and return something the tribe cannot grow without.",
      "My treasure is not carried on my back, and my value is greatest where nobody wants to look.",
      "Panda called that disgusting. Brendon called it efficient."
    ],
    hints: [
      "The answer is deliberately hidden behind the contrast between waste and cultivation.",
      "Its usefulness is agricultural rather than martial.",
      "The creature's diet is the mechanism behind its value.",
      "Think of the ARK creature that turns a tribe's waste into fertilizer and oil."
    ],
    reward: 23,
    notes: "Utility creature riddle with misdirection away from combat."
  },
  {
    answer: "Rock Drake",
    lines: [
      "Panda said the cliff was impassable. Rin asked whether the cliff had ever been asked politely.",
      "I treat a wall as a floor, darkness as a cloak, and falling as a route.",
      "My Realm is one where the safest path often looks like the least reasonable one.",
      "I do not merely cross the landscape; I make the landscape betray its own geometry.",
      "The final lesson is simple: when the ground stops being necessary, the mountain loses half its power."
    ],
    hints: [
      "The answer is a creature whose movement changes how terrain is understood.",
      "Vertical surfaces are part of the clue, not merely scenery.",
      "Camouflage matters, but it is not the first ability you should chase.",
      "Look to Aberration for the survivor's answer to impossible cliffs."
    ],
    reward: 25,
    notes: "Aberration movement riddle; avoids listing abilities directly."
  },
  {
    answer: "Carcharodontosaurus",
    lines: [
      "Wizard wrote one warning in the margin: never measure a storm by the first drop.",
      "My danger is partly mine and partly borrowed from what happens around me.",
      "The more the Realm feeds the encounter, the less sensible the original measure becomes.",
      "EmilioTheGreat called me a storm with teeth, but the storm is not the part that should concern you.",
      "I am proof that sometimes the battlefield can become part of the creature."
    ],
    hints: [
      "The answer is a late-game ARK predator whose combat potential can change during an encounter.",
      "Look for the mechanic that rewards what happens around the creature.",
      "The clue is about momentum rather than raw base statistics.",
      "Its common survivor nickname is much shorter than its full name."
    ],
    reward: 28,
    notes: "High-difficulty creature riddle centered on its rage mechanic without naming it."
  },
  {
    answer: "Artifact",
    lines: [
      "Doxo called the caves libraries. Brendon asked why the books keep trying to kill the reader.",
      "I am found where the Realm hides its oldest questions, yet I am not the answer to any of them.",
      "A trophy becomes a key only after someone knows which hunger is waiting above it.",
      "Carry the wrong one to the wrong ritual and my importance becomes wonderfully useless.",
      "The Council learned that some objects are valuable not because of what they do, but because of what they permit."
    ],
    hints: [
      "The answer is recovered from dangerous places rather than crafted at a station.",
      "Its purpose is connected to boss summoning and tribute.",
      "Different versions can correspond to different major encounters.",
      "Think of the cave relics survivors collect before a boss fight."
    ],
    reward: 24,
    notes: "Boss-progression object disguised as a philosophical mystery."
  },
  {
    answer: "Mutagen",
    lines: [
      "Rin called me inheritance with teeth. Heathen called that unnecessarily poetic.",
      "I do not ask what the creature is today; I ask what its descendants are allowed to become.",
      "The Council can measure a bloodline, but this substance concerns the part that refuses to stay measured.",
      "Use me once and the result may not be standing beside you long enough to understand what changed.",
      "My true target is not the present body. It is the future written inside it."
    ],
    hints: [
      "The answer belongs to advanced breeding rather than ordinary healing.",
      "The clue about descendants is more important than the clue about the current creature.",
      "Genesis-era knowledge is strongly associated with it.",
      "Think of the resource used to influence a creature's inherited mutation potential."
    ],
    reward: 27,
    notes: "Breeding mystery focused on inheritance and delayed consequences."
  },
  {
    answer: "Supply Drop",
    lines: [
      "EmilioTheGreat says the sky gives nothing freely; Panda says that depends on whether you arrive before everyone else.",
      "For a little while, a place that did not matter becomes the center of every tribe's attention.",
      "Its contents are unknown until the journey is already worth the risk.",
      "The light announces an opportunity, but never promises that the opportunity belongs to you.",
      "Heathen says the oldest trick in survival is making everyone race toward the same prize."
    ],
    hints: [
      "The answer is temporary and arrives from above.",
      "Its location becomes contested because its contents are not known beforehand.",
      "Color is useful information, but the object itself is more important than the color.",
      "Think of ARK's falling caches rather than a permanent structure."
    ],
    reward: 22,
    notes: "Supply-drop riddle designed around competition and uncertainty."
  },
  {
    answer: "Tek Replicator",
    lines: [
      "Wizard called me a forge. Doxo asked why a forge needs to feel like a laboratory.",
      "Inside me, resources stop resembling the things they were and become things the old world could not have made.",
      "I am too large to mistake for a workbench and too precise to mistake for a furnace.",
      "The survivor who first uses me has crossed an invisible line: crafting is no longer about making tools for survival.",
      "It is about manufacturing the technology that changes what survival means."
    ],
    hints: [
      "The answer is a large advanced crafting station.",
      "It belongs near the end of the technological progression.",
      "Its purpose includes creating Tek equipment and structures.",
      "Think of the enormous machine that replaces the idea of a normal crafting bench."
    ],
    reward: 26,
    notes: "Tek progression riddle focused on the transition from primitive crafting."
  },
  {
    answer: "Rockwell",
    lines: [
      "Doxo's warning was not that the scholar would fail. It was that he would succeed at the wrong question.",
      "He collected answers until the answers began changing the person asking for them.",
      "The Realm remembers him first as a man of knowledge and later as something knowledge should never have produced.",
      "His greatest experiment did not end when the experiment became him.",
      "Brendon says that is why some names belong in history and others belong in warnings."
    ],
    hints: [
      "The answer is a human figure from ARK's deeper story.",
      "Science and obsession are central to the transformation.",
      "Aberration is the strongest Realm connection.",
      "Think of the boss whose name and identity existed before the monster did."
    ],
    reward: 29,
    notes: "ARK lore riddle with character-to-boss transformation as the deduction."
  },
  {
    answer: "Tek Teleporter",
    lines: [
      "Panda asked why anyone would build roads after learning that the Realm can be persuaded to skip them.",
      "Rin answered that the road is still there; only the journey has been denied.",
      "I require no saddle, no gate, and no visible path between beginning and end.",
      "Two places remain where they were, yet a survivor can behave as though distance briefly stopped existing.",
      "I do not conquer space. I simply refuse to participate in it."
    ],
    hints: [
      "The answer is advanced travel technology.",
      "Unlike a transmitter, the clue centers on moving a survivor between established locations.",
      "There is no ordinary journey between the two points.",
      "Think of the large Tek structure used for instantaneous point-to-point travel."
    ],
    reward: 25,
    notes: "Teleportation riddle intentionally overlaps with transmitter clues."
  },
  {
    answer: "Soul Trap",
    lines: [
      "Heathen says a prison holds someone against their will. Wizard says mine holds someone until their owner remembers them.",
      "A living creature becomes small enough to hide in a pocket without becoming less alive.",
      "The container remembers more than a cage could ever carry: identity, existence, and the possibility of return.",
      "Open it and the impossible argument ends because the Realm accepts the creature again.",
      "The riddle is not about where the creature went. It is about what was preserved when it disappeared."
    ],
    hints: [
      "The answer is a creature-storage item used by survivors.",
      "The important clue is preservation rather than containment.",
      "It is associated with the modern creature-storage system in ARK.",
      "Think of the compact container that stores a creature's essence until release."
    ],
    reward: 24,
    notes: "Creature-storage riddle written as a memory/identity puzzle."
  },
  {
    answer: "Sigil",
    lines: [
      "EmilioTheGreat says a Sigil is only valuable when the Realm knows how you earned it.",
      "Wizard calls it currency because merchants understand numbers. Doxo calls it a key because doors understand purpose.",
      "Rin says neither is wrong, which is more troubling than choosing one.",
      "Panda asks how many you have, then somehow already knows the answer.",
      "It weighs nothing, fits nowhere, and yet the Grand Sigil Exchange will trade lasting power for it."
    ],
    hints: [
      "The answer belongs to Wizards of Ark rather than the base ARK item list.",
      "It is earned through the Realm's activities and challenges.",
      "It functions as the economy behind the Arcane Realm.",
      "Think of the resource that players accumulate to obtain permanent Realm upgrades."
    ],
    reward: 21,
    notes: "Core WoA economy riddle; deliberately avoids calling it 'currency' in the riddle."
  },
  {
    answer: "Trial",
    lines: [
      "Brendon says a Trial begins before the first attack. Heathen says it begins when the gates close.",
      "The enemy is only one piece of the evidence.",
      "A spell can be powerful and still reveal the wrong wizard; a relic can save you and still prove nothing.",
      "When the doors open again, the Realm has learned how you think under pressure.",
      "Victory is merely the final word in a sentence written by every choice before it."
    ],
    hints: [
      "The answer is a feature of the Arcane Realm, not an ARK map location.",
      "Combat may occur, but the clue is broader than simply defeating an enemy.",
      "PvE and PvP challenges are both part of this system.",
      "Think of the section where a wizard's build and decisions are tested."
    ],
    reward: 20,
    notes: "Core Arcane Realm feature presented as a character test rather than a battle menu."
  },
  {
    answer: "The Realm Panel",
    lines: [
      "Wizard says I am a window. Rin says windows show what is outside, while I show what the Realm expects of you.",
      "EmilioTheGreat built the road through menus, but the road is not the destination.",
      "I can show power without being power, choices without making them for you, and doors without being a door.",
      "Panda once found something hidden behind me that everyone had been staring at for days.",
      "If you know what I am, you know where the Realm speaks to its players."
    ],
    hints: [
      "The answer is a WoA interface rather than an in-world object.",
      "It is the central place where players access Arcane Realm systems.",
      "The clue about doors means buttons and sections, not physical portals.",
      "Think of the existing player-facing panel that gathers the Realm's major features."
    ],
    reward: 22,
    notes: "Cluster-specific interface mystery; answer is intentionally meta."
  }
];

let cursor = 0;

function chooseSeed(): RiddleSeed {
  const step = 7;
  const index = (cursor * step + Math.floor(cursor / RIDDLES.length)) % RIDDLES.length;
  const seed = RIDDLES[index];
  cursor += 1;
  const shift = (cursor * 3) % seed.lines.length;
  const lines = seed.lines.map((_, index) => seed.lines[(index + shift) % seed.lines.length]);
  return { ...seed, lines };
}

export async function generateArcaneRiddle(): Promise<GeneratedArcaneRiddle> {
  const seed = chooseSeed();
  return {
    question: seed.lines.join("\n"),
    answer: seed.answer,
    hint: JSON.stringify(seed.hints),
    reward: seed.reward,
    notes: "Local Arcane Scribe • " + seed.notes
  };
}
