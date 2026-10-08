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
    answer: "Obelisk",
    lines: [
      "Three ancient witnesses stand where no king built a throne.",
      "Heathen calls them anchors. Wizard calls them doors.",
      "Rin once warned that a door is only useful if you know which side you are leaving.",
      "They do not travel between Realms. They make travel possible.",
      "Survivors offer strange trophies beneath their light, and the sky answers with permission."
    ],
    hints: [
      "The answer is a place before it is a machine.",
      "Its purpose is tied to the boundary between one Realm and another.",
      "Look for the three landmarks that survivors use when ordinary roads are no longer enough.",
      "Their names are usually spoken by color rather than by shape."
    ],
    reward: 20,
    notes: "WoA lore + ARK landmark; layered interpretation."
  },
  {
    answer: "Cryopod",
    lines: [
      "Panda once called me a prison. Doxo corrected her: a prison has a prisoner who can escape.",
      "I hold something that is larger than my hand, yet I am not a cage.",
      "The Realm forgets a creature's footsteps while I remember its existence.",
      "When my seal opens, the old life returns as though distance never happened.",
      "To the careless, I am storage. To a tribe, I am the difference between having one companion and having a hundred."
    ],
    hints: [
      "The answer carries life without carrying the creature's body in the usual way.",
      "Think of a container that changes the problem of distance and space.",
      "It became especially valuable once tribes stopped treating creatures as permanent passengers.",
      "The thing inside can be released again."
    ],
    reward: 19,
    notes: "WoA staff flavor + ARK utility."
  },
  {
    answer: "Tek Transmitter",
    lines: [
      "Wizard says I am a doorway. EmilioTheGreat says I am a receipt.",
      "Neither is entirely correct.",
      "I do not move a survivor by myself, yet entire inventories may vanish beneath my signal.",
      "The Realm on one side does not become the Realm on the other.",
      "Instead, the distance between them becomes a problem the machine refuses to respect."
    ],
    hints: [
      "The answer deals with transfer rather than ordinary movement.",
      "It can move more than a survivor.",
      "Think of the machinery that lets separate Realms exchange what you carry.",
      "Its destination may be another map entirely."
    ],
    reward: 22,
    notes: "Cross-Realm infrastructure."
  },
  {
    answer: "Element",
    lines: [
      "Rin wrote that I am neither treasure nor fuel, and then crossed out both words.",
      "Doxo found me beneath worlds that should never have shared the same sky.",
      "Machines hunger for me, but I was never made for machines.",
      "Bosses guard fragments of the knowledge that surrounds me.",
      "The Realm does not reward those who merely possess me. It rewards those who understand what my existence means."
    ],
    hints: [
      "The answer is older than the survivor who spends it.",
      "Its importance grows as technology stops being primitive.",
      "Bosses and advanced machines both point toward it.",
      "Think of the strange blue resource at the heart of ARK's highest technology."
    ],
    reward: 24,
    notes: "ARK endgame resource framed as WoA lore."
  },
  {
    answer: "Dung Beetle",
    lines: [
      "Heathen laughed when this creature first entered the Council's records.",
      "Brendon did not laugh. He asked what the gardens would do without it.",
      "It eats what every civilized tribe tries to forget.",
      "What leaves its mouth is more valuable than what entered it.",
      "The Realm has learned an old lesson: usefulness is not always glamorous."
    ],
    hints: [
      "The answer is small, living, and often ignored until a tribe needs it.",
      "Its strange diet is the important clue, not its appearance.",
      "Its work benefits agriculture rather than combat.",
      "What it produces helps turn waste into something a farm can use."
    ],
    reward: 17,
    notes: "WoA humor + ARK farming utility."
  },
  {
    answer: "Rock Drake",
    lines: [
      "Panda swears the mountain has no floor. Rin says the creature simply refuses to need one.",
      "It wears another color when the Realm demands patience.",
      "It climbs where wings would be useless and glides where feet would betray the traveler.",
      "Its greatest trick is not climbing, nor gliding, nor hiding.",
      "It teaches survivors that a wall can be a road if you stop thinking like a survivor."
    ],
    hints: [
      "The answer makes vertical terrain behave differently.",
      "It belongs to a Realm where the environment itself feels hostile to ordinary movement.",
      "Camouflage is part of its reputation.",
      "Think of the Aberration creature that turns cliffs into routes."
    ],
    reward: 22,
    notes: "Aberration lore + movement puzzle."
  },
  {
    answer: "Carcharodontosaurus",
    lines: [
      "Wizard recorded one rule: never mistake hunger for weakness.",
      "The creature's power is not simply what it begins with.",
      "The more terrible the encounter becomes, the more terrible it may become in return.",
      "EmilioTheGreat once called it a storm with teeth.",
      "Unlike many legends, this one does not need a throne to make the Realm step aside."
    ],
    hints: [
      "The answer is a creature, but the clue is really about momentum.",
      "Its strength can grow through what happens around it.",
      "Think of one of ARK's largest predators added late to the creature roster.",
      "Its name begins with C and is often shortened by survivors."
    ],
    reward: 23,
    notes: "ARK creature with combat progression."
  },
  {
    answer: "Artifact",
    lines: [
      "Doxo says the old caves are libraries where the books are afraid of being read.",
      "Brendon says that is nonsense.",
      "Then Brendon refuses to explain why the Council keeps certain relics away from ordinary shelves.",
      "An Artifact is useless until someone knows what kind of door is waiting for it.",
      "The oldest survivors learned that some trophies are not trophies at all."
    ],
    hints: [
      "The answer is found rather than crafted.",
      "Its importance becomes obvious when a great enemy must be summoned.",
      "Different caves can hide different versions of the same kind of key.",
      "Think of the relics survivors collect for boss tributes."
    ],
    reward: 18,
    notes: "ARK boss progression as WoA mystery."
  },
  {
    answer: "Mutagen",
    lines: [
      "Rin called it inheritance with teeth.",
      "Heathen called that description unnecessarily dramatic.",
      "Neither denied that the substance can change what a creature passes forward.",
      "The Council keeps records of bloodlines, but this belongs to the stranger pages.",
      "It does not merely make a creature stronger today. It concerns what tomorrow's creature might become."
    ],
    hints: [
      "The answer concerns offspring more than the parent standing in front of you.",
      "It belongs to advanced breeding knowledge.",
      "Genesis-era survivors associate it with changing inherited potential.",
      "Think beyond ordinary mutations and toward the resource used to influence them."
    ],
    reward: 21,
    notes: "Breeding lore."
  },
  {
    answer: "Beacon",
    lines: [
      "EmilioTheGreat says the sky rarely gives gifts without asking the ground to compete for them.",
      "A colored light appears where no tower stood a moment before.",
      "Heathen watches the horizon. Wizard checks the route. Panda checks who else noticed.",
      "Inside may be salvation, junk, or exactly what the tribe needed three minutes too late.",
      "The mystery is not why it falls. The mystery is why survivors keep running toward it."
    ],
    hints: [
      "The answer comes from above.",
      "Its color can tell survivors something before anyone reaches it.",
      "It is a temporary opportunity rather than a permanent structure.",
      "Think of ARK's falling supply markers."
    ],
    reward: 16,
    notes: "Supply-drop lore with staff reactions."
  },
  {
    answer: "Tek Replicator",
    lines: [
      "Wizard insists I am a forge. Doxo insists a forge should not look like a room built by a god.",
      "The argument ends when someone places impossible materials inside.",
      "What comes out was not carved, hammered, or stitched.",
      "It is the moment crafting stops feeling like crafting.",
      "The Council records me among the machines that made primitive thinking obsolete."
    ],
    hints: [
      "The answer is a structure, not a creature.",
      "It belongs near the far end of technological progression.",
      "Its scale matters as much as its purpose.",
      "Think of the enormous station used to craft advanced Tek technology."
    ],
    reward: 20,
    notes: "Tek progression."
  },
  {
    answer: "Rockwell",
    lines: [
      "Doxo warned the Council not to trust a scholar who believes every mystery owes him an answer.",
      "The warning arrived too late.",
      "The name survived the man, but the man survived his own limits.",
      "In one Realm, knowledge stopped being something he studied and became something that studied him.",
      "The final clue is the simplest: some bosses were never born monsters."
    ],
    hints: [
      "The answer is a person before it is a boss.",
      "His story is strongly tied to Aberration.",
      "He is associated with science, ambition, and corruption.",
      "Think of the ARK boss whose name belonged to a human once."
    ],
    reward: 24,
    notes: "ARK lore boss."
  },
  {
    answer: "Tek Teleporter",
    lines: [
      "Panda asked why anyone would walk when the Realm could simply be told to move.",
      "Rin answered that the Realm never moves. The traveler does.",
      "No road connects the beginning to the end.",
      "No saddle carries the journey.",
      "For a moment, two distant places behave as though they were never distant at all."
    ],
    hints: [
      "The answer solves distance rather than carrying weight.",
      "It is advanced technology rather than a creature ability.",
      "Its purpose is movement between chosen locations.",
      "Think of the giant Tek device that makes instant travel possible."
    ],
    reward: 19,
    notes: "Advanced travel."
  },
  {
    answer: "Soul Trap",
    lines: [
      "Heathen refuses to call it a prison because prisons are built for criminals.",
      "Wizard calls it a library because every creature inside is waiting for its page to be opened.",
      "A living thing becomes small enough to carry, yet its life is not erased.",
      "The trick is not in the creature. It is in what the container remembers.",
      "The Realm learned that storage could become something much stranger than shelves."
    ],
    hints: [
      "The answer stores creatures rather than ordinary items.",
      "The creature is not permanently changed by being stored.",
      "The item is a more modern ARK solution to creature storage.",
      "Think of the small container survivors use to carry a creature's essence."
    ],
    reward: 18,
    notes: "Creature storage with WoA framing."
  },
  {
    answer: "Sigil",
    lines: [
      "EmilioTheGreat keeps one rule close: a Sigil is worth more when it has been earned.",
      "Rin says the Realm remembers every bargain made with one.",
      "Wizard calls them currency. Doxo calls them keys.",
      "Panda merely asks how many you have.",
      "They have no weight, yet the Grand Exchange will trade real power for them."
    ],
    hints: [
      "The answer is not an ARK item you harvest from a node.",
      "It belongs specifically to the Wizards of Ark universe.",
      "It is earned through the Realm's challenges rather than bought with ordinary currency.",
      "Think of the resource used throughout the Arcane Realm."
    ],
    reward: 15,
    notes: "Core WoA universe lore."
  },
  {
    answer: "Trial",
    lines: [
      "Brendon says a Trial is a place where the Realm stops giving warnings.",
      "Heathen says that is dramatic.",
      "Then the gates close.",
      "Creatures, rivals, spells, and choices all become evidence.",
      "Victory is not merely surviving. It is proving what kind of wizard you became while trying."
    ],
    hints: [
      "The answer is a system inside the Arcane Realm rather than an ARK map.",
      "It can involve fighting, but fighting is not the whole point.",
      "It is where PvE and PvP challenges belong in the Realm.",
      "Think of the place where wizards test their builds."
    ],
    reward: 14,
    notes: "WoA Arcane Realm lore."
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
