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
  hint: string;
  reward: number;
  notes: string;
};

const RIDDLES: RiddleSeed[] = [
  {
    answer: "Cryopod",
    lines: [
      "I am a prison that is praised as mercy.",
      "I steal no life, yet I silence the wild within.",
      "Carry a world in your palm, then give it room to wake.",
      "The seal breaks, and what slept remembers the earth."
    ],
    hint: "The smallest vessel in the tribe can hold something far larger.",
    reward: 15,
    notes: "Uses the contradiction of a 'prison' that safely preserves a creature without naming its storage function."
  },
  {
    answer: "Tek Transmitter",
    lines: [
      "I have no wings, yet I make distance feel temporary.",
      "Tributes pass through my silence before they become elsewhere.",
      "I do not travel the realms; I persuade the realms to trade places.",
      "Seek the machine that makes a horizon negotiable."
    ],
    hint: "Think beyond ordinary travel.",
    reward: 18,
    notes: "Points toward cross-realm transfer without saying teleportation, uploads, or downloads."
  },
  {
    answer: "Dung Beetle",
    lines: [
      "The court ignores me until the gardens begin to hunger.",
      "What others discard becomes my little treasury.",
      "I carry a humble sphere, yet the tribe grows richer for it.",
      "In the wizard's hall, even refuse can become power."
    ],
    hint: "Look for the creature whose strange diet benefits a farm.",
    reward: 12,
    notes: "Uses the creature's low-status role and fertilizer/oil utility as indirect clues."
  },
  {
    answer: "Element",
    lines: [
      "I am not treasure, though whole tribes build around me.",
      "I am not fire, though I wake machines that seem beyond nature.",
      "The ancients left fragments; the survivors learned to spend them.",
      "When the old technology hungers, I become its currency."
    ],
    hint: "The rare fuel behind the most advanced devices.",
    reward: 20,
    notes: "Leans on ARK's ancient-tech lore and resource economy without naming Tek."
  },
  {
    answer: "Obelisk",
    lines: [
      "Three silent towers watch lands that never agreed to be alike.",
      "I do not rule a kingdom, yet survivors gather beneath my shadow.",
      "Offer strange cargo to the light and the sky answers.",
      "My shape is a landmark before it is a machine."
    ],
    hint: "Look upward when the map needs a landmark.",
    reward: 16,
    notes: "Uses the iconic three-tower structure and its transfer/functionality without directly naming it."
  },
  {
    answer: "Gacha",
    lines: [
      "I sit like a beast, yet my hunger is for what you no longer value.",
      "Feed the strange collector and wait for fortune to crystallize.",
      "My gifts are born from appetite, not from a crafting bench.",
      "Some tribes keep me for the mystery; others keep me for what I produce."
    ],
    hint: "A creature that can turn offerings into crafted crystals.",
    reward: 17,
    notes: "Focuses on the creature's recycling/production behavior and the randomness of its output."
  },
  {
    answer: "Maewing",
    lines: [
      "I am neither nursery nor mother, yet the young cling to my care.",
      "My strange shape hides a talent the tribe quickly learns to abuse.",
      "I can turn a helpless beginning into a much easier one.",
      "Among the young, my value is measured in what I can carry."
    ],
    hint: "Think of a creature famous for helping raise babies.",
    reward: 14,
    notes: "Clues its nursing and pouch behavior while avoiding direct naming of the mechanics."
  },
  {
    answer: "Industrial Forge",
    lines: [
      "I swallow mountains one handful at a time.",
      "The little forge dreams of my appetite.",
      "Inside my furnace, stone and metal forget what they were.",
      "When a tribe thinks too large for campfire craft, I am already waiting."
    ],
    hint: "The furnace built for an industrial-scale tribe.",
    reward: 13,
    notes: "Uses scale and transformation to distinguish the structure from ordinary refining tools."
  },
  {
    answer: "Argentavis",
    lines: [
      "The sky is my road, but burden is my favorite passenger.",
      "I am less interested in speed than in what the tribe can bring home.",
      "The mountains become shelves when I take flight.",
      "A survivor's expedition often becomes easier when my shadow arrives."
    ],
    hint: "A classic transport flyer prized for carrying heavy loads.",
    reward: 13,
    notes: "Indirectly targets the Argentavis through hauling, mountain travel, and expedition utility."
  },
  {
    answer: "Reaper",
    lines: [
      "I begin as a threat before I ever become an ally.",
      "The darkness does not merely hide me; it changes the rules around me.",
      "A survivor can leave my encounter carrying more than a memory.",
      "Some creatures are tamed by trust. I was earned by surviving something stranger."
    ],
    hint: "Aberration's dangerous creature with an unusual path to obtaining one.",
    reward: 21,
    notes: "Uses the Reaper's unusual acquisition process and Aberration atmosphere without explaining the exact mechanic."
  },
  {
    answer: "Net Projectile",
    lines: [
      "I was made for the moment when teeth become too convincing.",
      "I do not defeat the hunter; I briefly convince the hunted to stop.",
      "A moving target becomes a waiting problem.",
      "My magic is temporary, but sometimes temporary is enough."
    ],
    hint: "A tool for stopping a creature without killing it.",
    reward: 11,
    notes: "Describes the immobilizing function without using the word net or naming the weapon."
  },
  {
    answer: "Tek Generator",
    lines: [
      "My heart is expensive, but my silence is useful.",
      "I feed invisible hunger across walls and floors.",
      "The machines around me never need to see the source.",
      "Where ordinary wires end, my field begins."
    ],
    hint: "Advanced power without a web of visible cables.",
    reward: 16,
    notes: "Targets the wireless power field as the distinctive clue."
  },
  {
    answer: "Industrial Cooker",
    lines: [
      "A recipe is only a promise until I make it useful.",
      "I turn a tribe's pantry into something much more deliberate.",
      "My work is measured in batches, not bowls.",
      "The alchemist's table became an industry in my hands."
    ],
    hint: "Think large-scale cooking and recipes.",
    reward: 12,
    notes: "Separates the industrial cooking structure from the ordinary cooking pot through scale and recipes."
  },
  {
    answer: "Velonasaur",
    lines: [
      "I carry a storm in my back, but thunder is not my gift.",
      "When danger approaches, standing still can become a weapon.",
      "The creature's patience is measured in ammunition that is never loaded by hand.",
      "Among defenders, my spines speak first."
    ],
    hint: "A defensive creature whose body provides the ranged attack.",
    reward: 17,
    notes: "Points to the dorsal projectile attack and turret-like defensive role."
  },
  {
    answer: "Tek Suit",
    lines: [
      "I make a survivor feel lighter without changing their bones.",
      "The sky becomes a hallway when my hidden engines answer.",
      "Water, cliffs, and distance lose some of their authority.",
      "I am armor only until movement becomes the real spell."
    ],
    hint: "Advanced armor with movement abilities.",
    reward: 18,
    notes: "Uses movement abilities as the primary identity instead of simply saying futuristic armor."
  },
  {
    answer: "Industrial Grinder",
    lines: [
      "Mistakes enter my mouth as finished things.",
      "I do not regret what the crafting bench made.",
      "Metal, hide, and ambition can all return to pieces.",
      "The tribe calls it recycling when they are being polite."
    ],
    hint: "A machine that can break crafted items back down.",
    reward: 14,
    notes: "Uses the machine's deconstruction/recovery role as a lore-flavored riddle."
  }
];

let cursor = 0;

function chooseSeed(): RiddleSeed {
  const seed = RIDDLES[cursor % RIDDLES.length];
  cursor += 1;

  // Add a little process-level variation so repeated generations are not
  // identical while remaining deterministic and fully offline.
  const rotation = cursor % seed.lines.length;
  const lines = seed.lines.map((_, index) => seed.lines[(index + rotation) % seed.lines.length]);

  return { ...seed, lines };
}

export async function generateArcaneRiddle(): Promise<GeneratedArcaneRiddle> {
  const seed = chooseSeed();

  return {
    question: seed.lines.join("\n"),
    answer: seed.answer,
    hint: seed.hint,
    reward: seed.reward,
    notes: "Local Arcane Scribe • " + seed.notes
  };
}
