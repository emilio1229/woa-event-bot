import { prisma } from "../database/prisma.js";

export interface GeneratedArcaneRiddle {
  question: string;
  answer: string;
  hint?: string;
  reward: number;
  notes: string;
}

type RiddleCategory = "creature" | "item" | "ability" | "lore" | "map" | "challenge" | "mixed";
type RiddleSeed = {
  answer: string;
  category: RiddleCategory;
  lines: string[];
  hints: string[];
  reward: number;
  notes: string;
};

/**
 * Curated riddles only. The answer and its distinctive words must never appear
 * in the public question or hint path. Hints narrow the reasoning in stages;
 * they must remain true and must not switch the answer into the wrong category.
 */
const RIDDLES: RiddleSeed[] = [
  {
    answer: "Pyromane Shoulder Form",
    category: "ability",
    lines: [
      "A pact was once measured in distance: one set of footsteps behind another.",
      "The Council found a second arrangement in which the smaller shadow no longer crossed the ground after its keeper.",
      "No new name entered the bestiary, yet the old entry no longer described every way the bond could appear.",
      "The creature had not changed its loyalty; only the arrangement had changed.",
      "What uncommon state did the Scribe fail to file under ordinary travel?"
    ],
    hints: [
      "The opening image is about proximity, but distance is only the surface of the clue.",
      "The bestiary entry stays the same even though the relationship looks different.",
      "Look for a named configuration of an existing tame, rather than riding gear or a separate item.",
      "Do not answer with the creature alone; the full name describes an alternate arrangement."
    ],
    reward: 70,
    notes: "The solution depends on distinguishing a creature's alternate state from a separate item."
  },
  {
    answer: "Cosmo",
    category: "creature",
    lines: [
      "I make a road where no mason laid a stone.",
      "A gap that defeats a runner may yield to the smallest architect in the dark.",
      "My gift is left behind, yet it carries another farther than my own feet could.",
      "The Council mistook the result for a bridge until it saw the thread being born.",
      "What little ally turns a strand into a route?"
    ],
    hints: [
      "The key is a route created during use, rather than a path found on a map.",
      "The useful clue is the material left behind, not the traveler's body.",
      "Search the strange companions associated with the underground Realm.",
      "The answer is the small web-making ally, not the web or the movement it enables."
    ],
    reward: 65,
    notes: "Separate the maker from the tool and the tool from its effect."
  },
  {
    answer: "Shastasaurus Saddle",
    category: "item",
    lines: [
      "Most gear begins as a promise to one rider.",
      "This design makes the creature beneath it matter more than the traveler above.",
      "The seafloor can remain untouched while a tribe brings its home below the waves.",
      "Doxo called it a foundation that learned to swim.",
      "What piece of equipment turns a living giant into a place to build?"
    ],
    hints: [
      "The answer is crafted equipment, not the animal carrying it.",
      "Its purpose is larger than controlling movement or protecting a rider.",
      "Look for the aquatic platform mechanic associated with a very large marine tame.",
      "Name the equipment that enables the mobile base; do not name the creature itself."
    ],
    reward: 75,
    notes: "The important distinction is between a mount and the structure-enabling equipment it carries."
  },
  {
    answer: "Yi Ling Feathers",
    category: "item",
    lines: [
      "The first record called them decoration; the second called them evidence.",
      "They leave their owner and cross a distance that ordinary plumage never would.",
      "No smith shaped them, and no quiver taught them to fly.",
      "In the dark, even something weightless can make a distant place unsafe.",
      "What biological material becomes a ranged threat?"
    ],
    hints: [
      "The answer is a material used by a creature, not a crafted weapon.",
      "Look for a natural part repurposed for an attack.",
      "The relevant hunter is associated with the darker underground map.",
      "Identify the material that is launched, rather than the animal that launches it."
    ],
    reward: 70,
    notes: "Keep the projectile distinct from both its source and its wielder."
  },
  {
    answer: "Dreadnoughtus Roar",
    category: "ability",
    lines: [
      "The strongest lock in the wasteland was not opened by a key.",
      "The answer cannot be held, sharpened, or loaded.",
      "It travels through the air and makes an enemy's advantage falter.",
      "Emilio's margin note read: 'Sometimes the counterspell has a throat.'",
      "What vocal act can interrupt a power built on Element?"
    ],
    hints: [
      "The answer is an action, not a creature or an item.",
      "Its impact is directed at a defensive advantage rather than ordinary health.",
      "The clue belongs to the enormous additions associated with the ruined future.",
      "Think of the sound-based countermeasure, not the creature that produces it."
    ],
    reward: 80,
    notes: "This is an ability clue: distinguish the action from its source."
  },
  {
    answer: "Fasolasuchus",
    category: "creature",
    lines: [
      "The dunes taught travelers to read the horizon.",
      "The oldest survivors learned that a quiet surface can be a lie.",
      "I borrow the ground's disguise, then make the distance between warning and danger vanish.",
      "Heathen crossed out 'tracks' in the bestiary and wrote 'absence'.",
      "What hunter makes the landscape itself part of its approach?"
    ],
    hints: [
      "The danger is not primarily above the sand or on the skyline.",
      "The clue describes an ambush strategy rather than speed alone.",
      "Look among the desert's unusual predators.",
      "Search for the creature known for approaching from beneath the surface."
    ],
    reward: 65,
    notes: "Solve the hunting method before narrowing the bestiary."
  },
  {
    answer: "Shastasaurus Echolocation",
    category: "ability",
    lines: [
      "I send a question into a place where sight has little authority.",
      "Nothing returns in a bottle, yet the empty dark becomes less empty.",
      "The answer is not a light, a map, or a creature's name.",
      "Rin wrote: 'The unseen can answer without speaking.'",
      "What sensory act turns a hidden space into information?"
    ],
    hints: [
      "The answer is a sensory ability, not a tool carried by a survivor.",
      "It relies on a signal and the information that returns.",
      "The mystery belongs to an enormous marine animal.",
      "Name the method of sensing, not the creature or the result it reveals."
    ],
    reward: 75,
    notes: "Separate the sensing method from both its user and its information."
  },
  {
    answer: "Deinonychus",
    category: "creature",
    lines: [
      "I turn another hunter's size into a temporary advantage.",
      "The ground is not the only battlefield, and the target is not always a place.",
      "My danger begins when I stop treating the larger body as an obstacle.",
      "A Valguero field report says the safest-looking mount may become the terrain.",
      "What predator makes its opponent part of the attack?"
    ],
    hints: [
      "The clue is about position and leverage, not raw size.",
      "One animal's body changes the way the other fights.",
      "Look among the distinctive predators associated with Valguero.",
      "Seek the climber known for attacking while attached to a larger creature."
    ],
    reward: 65,
    notes: "The defining clue is the unusual relationship with a larger target."
  },
  {
    answer: "Grendel",
    category: "challenge",
    lines: [
      "The Council entered a name into the bestiary and found no place to write its breeding notes.",
      "It cannot be persuaded to join a tribe; it can only be faced on its own terms.",
      "The arena does not ask what you can tame, but what you can survive.",
      "A monster from a story became a test written into the Realm.",
      "What Valguero trial answers a survivor's preparation with a named foe?"
    ],
    hints: [
      "Do not search for a normal tame or a craftable object.",
      "The answer belongs to a challenge encounter.",
      "Its name is tied to a monster from older storytelling.",
      "Look for the named Valguero challenge rather than the ordinary creature roster."
    ],
    reward: 80,
    notes: "Classify the encounter before looking for its name."
  },
  {
    answer: "Armadoggo",
    category: "creature",
    lines: [
      "The ruins kept their metal and lost their promises.",
      "One survivor found a promise that could walk on four feet.",
      "It was not bred from the old age of giants, yet it belongs in a world that forgot how to be kind.",
      "Emilio's record contains a paw print where a portrait should be.",
      "What loyal companion makes the wasteland feel less abandoned?"
    ],
    hints: [
      "The answer is a companion, but not a prehistoric giant.",
      "The clue emphasizes loyalty more than combat.",
      "Look to the ruined future rather than the older islands.",
      "Search the newer companion additions associated with Extinction."
    ],
    reward: 60,
    notes: "The emotional clues describe its role; the setting narrows the search."
  },
  {
    answer: "Ice Golem",
    category: "creature",
    lines: [
      "A cliff stood still for a hundred winters, until one morning it chose a direction.",
      "The material is familiar; the mistake is believing it must remain scenery.",
      "I wear the mountain's silence until my footsteps betray it.",
      "Panda's note was brief: 'If the horizon moves, reconsider the horizon.'",
      "What elemental guardian makes terrain appear to come alive?"
    ],
    hints: [
      "The opening image is meant to suggest a landscape feature.",
      "The answer is alive in the sense that it moves and acts, not a structure.",
      "Search among the elemental additions associated with Valguero.",
      "Look for the cold, stone-like guardian rather than a conventional animal."
    ],
    reward: 65,
    notes: "Distinguish scenery from a creature that resembles it."
  },
  {
    answer: "Cosmo's Web",
    category: "item",
    lines: [
      "A road is usually found, built, or crossed.",
      "Mine can be made in an instant, and it need not touch the ground.",
      "It is born from a companion, but the companion is not what the survivor travels on.",
      "Panda called it 'a route with no paving stones.'",
      "What strand-made tool lets a survivor cross a gap?"
    ],
    hints: [
      "The answer is the created tool, not its maker.",
      "It changes movement by spanning space rather than by speeding the traveler.",
      "Look to the tiny companion associated with the underground Realm.",
      "Name the web-based traversal tool, not the creature or the journey."
    ],
    reward: 65,
    notes: "Keep the maker, tool, and effect separate."
  }
  ,
  {
    answer: "The Sigil Era",
    category: "lore",
    lines: [
      "A realm does not change when a crown is polished; it changes when its people begin to leave new marks.",
      "The old pages still exist, but the Council has begun reading them through a different sign.",
      "It is neither a map nor a spell, yet it gives this chapter its name.",
      "What title belongs to the age now being written by the Wizards of Ark?"
    ],
    hints: [
      "The answer names a chapter in the community's story, not a place or a person.",
      "Think of the current era and the mark that represents it.",
      "The title has two parts: one is a magical symbol, the other is a period of history."
    ],
    reward: 75,
    notes: "WoA lore: identify the name of the current chapter without spelling it out in the clues."
  },
  {
    answer: "Grand Sigil Exchange",
    category: "lore",
    lines: [
      "Here, a deed can become a treasure, and a treasure can become a new beginning.",
      "No merchant weighs gold on these scales; the currency is earned through the realm's trials.",
      "Its doors are opened by a single mark, but the shelves hold many kinds of wonder.",
      "What hall lets a wizard trade hard-won symbols for useful magic?"
    ],
    hints: [
      "The answer is a place in the community's game, not a person.",
      "Its visitors spend the reward earned from riddles and events.",
      "The name combines a grand place of trade with the realm's magical currency."
    ],
    reward: 70,
    notes: "WoA community lore: the player-facing shop."
  },
  {
    answer: "Emilio the Great",
    category: "lore",
    lines: [
      "When the hall grows quiet, a certain title may still echo from the rafters.",
      "The name is spoken with ceremony, though the bearer is known to leave mischief in the margins.",
      "Not every legend needs a dragon; some require only a quill, a decree, and a flair for the dramatic.",
      "Which grand persona signs the stranger pages of this realm?"
    ],
    hints: [
      "The answer is a persona associated with the community, not an ARK creature.",
      "The title is deliberately theatrical.",
      "Look for the name paired with a boastful royal-sounding honorific."
    ],
    reward: 65,
    notes: "WoA in-joke: the server's grand wizard persona."
  },
  {
    answer: "High Wizards",
    category: "lore",
    lines: [
      "They do not rule by the height of a tower, nor by the length of a spell.",
      "Their standing is marked by trust, counsel, and the duty to keep the circle steady.",
      "Two seats may bear the title, yet the title itself belongs to a station, not a single name.",
      "What are the realm's senior councilors called?"
    ],
    hints: [
      "The answer is a council title, not a player name.",
      "It describes senior members trusted with guiding the community.",
      "The title joins a rank of mastery with practitioners of magic."
    ],
    reward: 70,
    notes: "WoA community lore: council leadership."
  },
  {
    answer: "Wizards, Warlocks & Witches",
    category: "lore",
    lines: [
      "Three paths enter the same hall, each bearing a different tradition of the unseen.",
      "One studies the art, one binds power by another road, and one follows an older craft.",
      "Together they are not a spell, a faction, or a map, but the words beneath the realm's banner.",
      "What three callings complete the community's motto?"
    ],
    hints: [
      "The answer is a phrase used as a motto, not a list of game classes.",
      "It contains three magical callings joined together.",
      "The phrase appears beneath the community's name."
    ],
    reward: 75,
    notes: "WoA identity: the community motto."
  },
  {
    answer: "The Council",
    category: "lore",
    lines: [
      "When a riddle is sealed, a reward weighed, or a realm's rules need a keeper, a circle gathers.",
      "Its members are not all the same, and its purpose is larger than any one voice.",
      "It can guide an event without being the event, and guard a law without being the law.",
      "What circle helps steer the Wizards of Ark?"
    ],
    hints: [
      "The answer is a group within the community, not a place on an ARK map.",
      "Its work includes guidance and administration.",
      "Think of a gathering of trusted advisors rather than one leader."
    ],
    reward: 65,
    notes: "WoA community lore: the administrative circle."
  }

];

function normalize(value: string): string {
  return value.toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

function answerLeaksInto(text: string, answer: string): boolean {
  const normalizedText = " " + normalize(text) + " ";
  const normalizedAnswer = normalize(answer);
  if (!normalizedAnswer) return true;

  // Reject the complete answer phrase, but do not reject ordinary clue words
  // that happen to overlap with part of a title (e.g. "grand" or "council").
  return normalizedText.includes(" " + normalizedAnswer + " ");
}

function isSafeSeed(seed: RiddleSeed): boolean {
  const publicText = [...seed.lines, ...seed.hints].join(" ");
  return !answerLeaksInto(publicText, seed.answer);
}

function buildHints(seed: RiddleSeed): string[] {
  // Fail closed if a future edit accidentally puts answer text into a clue.
  return seed.hints.map((hint, index) => answerLeaksInto(hint, seed.answer)
    ? [
        "Reconsider which image describes the subject and which only describes its surroundings.",
        "Separate the source of the clue from the action or object it produces.",
        "The setting narrows the search, but does not name the solution.",
        "Return to the line that describes an unusual relationship rather than a familiar label."
      ][Math.min(index, 3)]
    : hint);
}

export async function generateArcaneRiddle(): Promise<GeneratedArcaneRiddle> {
  const used = new Set(
    (await prisma.riddle.findMany({
      select: { answer: true },
      orderBy: { createdAt: "desc" },
      take: Math.min(8, RIDDLES.length * 2)
    })).map(row => normalize(row.answer))
  );

  const safeRiddles = RIDDLES.filter(isSafeSeed);
  if (!safeRiddles.length) {
    throw new Error("The Arcane Scribe has no riddle that passes the answer-leak rules.");
  }

  const unused = safeRiddles.filter(seed => !used.has(normalize(seed.answer)));
  const pool = unused.length ? unused : safeRiddles;
  const candidate = pool[Math.floor(Math.random() * pool.length)];

  return {
    question: candidate.lines.join("\n"),
    answer: candidate.answer,
    hint: JSON.stringify(buildHints(candidate)),
    reward: candidate.reward,
    notes: "Arcane Scribe • " + candidate.notes
  };
}
