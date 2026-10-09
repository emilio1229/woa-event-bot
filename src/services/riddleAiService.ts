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
,
  {
    "answer": "Artifact of the Clever",
    "category": "item",
    "lines": [
      "The first test is not strength, but whether a traveler can tell a shortcut from a trap.",
      "Its resting place favors those who study a passage before entering it.",
      "The prize bears a name that praises a mind, though it waits far from a library.",
      "Which relic is earned by surviving a trial of narrow ways?"
    ],
    "hints": [
      "The answer is an artifact, not a creature or crafted tool.",
      "Its title praises thought rather than physical power.",
      "Match that idea to one of the Island's cave relics."
    ],
    "reward": 70,
    "notes": "Arcane Scribe • item knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Artifact of the Devourer",
    "category": "item",
    "lines": [
      "Some relics wait where the world becomes hostile.",
      "Its title belongs to a hunger that does not negotiate.",
      "The path tests whether a survivor can endure a place that punishes hesitation.",
      "Which Island artifact takes its name from something that consumes?"
    ],
    "hints": [
      "Look among the Island's cave artifacts.",
      "The title evokes consuming, not wisdom or stealth.",
      "Match that meaning to the artifact list."
    ],
    "reward": 70,
    "notes": "Arcane Scribe • item knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Artifact of the Immune",
    "category": "item",
    "lines": [
      "The air itself becomes an opponent, yet the sought prize is not a mask.",
      "A name associated with resistance marks the end of the descent.",
      "Those who mistake the clue for a potion search the wrong inventory.",
      "Which relic is named for one who can withstand what harms others?"
    ],
    "hints": [
      "The answer is a cave artifact, not protective equipment.",
      "The title describes a quality of the survivor.",
      "Look for the Island relic whose name evokes resistance to harm."
    ],
    "reward": 70,
    "notes": "Arcane Scribe • item knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Tek Transmitter",
    "category": "item",
    "lines": [
      "A tribe may cross a world without asking a mount to carry the distance.",
      "This device makes a meeting point out of a place that once held only walls.",
      "It is not the gateway itself, yet it can send a traveler toward one.",
      "What advanced structure helps survivors move between distant realms?"
    ],
    "hints": [
      "The answer is a placeable high-technology structure.",
      "Its purpose concerns travel between maps.",
      "Think of the device that opens transfer options from a base."
    ],
    "reward": 75,
    "notes": "Arcane Scribe • item knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Cryopod",
    "category": "item",
    "lines": [
      "A living companion waits inside a pause that can be carried.",
      "The container is neither cage nor grave; time resumes when the keeper permits it.",
      "Its convenience has rules, and careless use can turn preparation into a mistake.",
      "What portable device stores a tame in suspended stasis?"
    ],
    "hints": [
      "The answer is portable, not a building.",
      "It stores a creature rather than ordinary inventory.",
      "Its purpose is to carry and redeploy tames through stasis."
    ],
    "reward": 65,
    "notes": "Arcane Scribe • item knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Wyvern Milk",
    "category": "item",
    "lines": [
      "A hatchling's first danger is not always a rival; sometimes it is the clock.",
      "The remedy comes from a dangerous source and serves a very particular appetite.",
      "It is not a potion brewed by a survivor, nor a meal fit for every tame.",
      "What rare resource helps a young drake survive its earliest hours?"
    ],
    "hints": [
      "The answer is a resource, not a saddle or weapon.",
      "It is associated with raising a specific hatchling.",
      "The source is dangerous, and the resource is used during raising."
    ],
    "reward": 75,
    "notes": "Arcane Scribe • item knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Nameless",
    "category": "creature",
    "lines": [
      "The warning comes before the shape, and the shape often comes too late.",
      "A light carried by a survivor can change whether the dark remains empty.",
      "It is less a ruler of the deep than a punishment for entering unprepared.",
      "What Aberration threat makes illumination more than a convenience?"
    ],
    "hints": [
      "The answer is a hostile creature associated with Aberration.",
      "The clue centers on darkness and a light source.",
      "Find the underground enemy whose behavior makes charge light strategic."
    ],
    "reward": 75,
    "notes": "Arcane Scribe • creature knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Reaper Queen",
    "category": "creature",
    "lines": [
      "One victory can leave a survivor carrying a second battle beneath their ribs.",
      "The process is not a simple tame, and the offspring does not arrive by ordinary breeding.",
      "A dangerous encounter becomes a timer that follows you home.",
      "Which Aberration predator is central to this unusual way of obtaining its kin?"
    ],
    "hints": [
      "The answer is the creature, not the resulting young.",
      "The clue describes a distinctive acquisition mechanic.",
      "Look to Aberration's subterranean predators and unusual reproductive process."
    ],
    "reward": 80,
    "notes": "Arcane Scribe • creature knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Rock Drake",
    "category": "creature",
    "lines": [
      "It treats a sheer wall as a road and the air between ledges as a promise.",
      "Its disguise can turn a moving hunter into a missing detail in the scenery.",
      "A survivor who watches only the ground has already lost the argument.",
      "Which Aberration mount makes climbing and gliding one journey?"
    ],
    "hints": [
      "The answer is a mount associated with Aberration.",
      "Its signature movement combines vertical surfaces and long glides.",
      "Camouflage is another defining clue; it is not a conventional flyer."
    ],
    "reward": 75,
    "notes": "Arcane Scribe • creature knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Charge Node",
    "category": "map",
    "lines": [
      "In a realm where the sun is absent, stored brightness becomes a resource.",
      "The survivor does not craft this source from a pocket lamp; they find a fixed point that answers a device's need.",
      "It is a station of power, not a creature and not a weapon.",
      "What Aberration structure restores charge to compatible equipment?"
    ],
    "hints": [
      "The answer is a fixed environmental structure.",
      "It is connected to charge-based technology, not ordinary fuel.",
      "Find the map feature used to recharge compatible items."
    ],
    "reward": 70,
    "notes": "Arcane Scribe • map knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Gasbags",
    "category": "creature",
    "lines": [
      "A battlefield may be crossed by something that seems to have borrowed its shape from a storm cloud.",
      "It turns a sudden intake into a long journey, then spends that reserve to change its momentum.",
      "It is not a flyer in the usual sense, though gravity can seem negotiable.",
      "Which Extinction creature travels by managing stored air?"
    ],
    "hints": [
      "The answer is an Extinction creature.",
      "Its movement depends on inhaling and expelling gas.",
      "Find the creature used for buoyant travel and bursts of movement."
    ],
    "reward": 70,
    "notes": "Arcane Scribe • creature knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Orbital Supply Drop",
    "category": "challenge",
    "lines": [
      "The sky opens over the ruined world, but the prize does not simply fall into waiting hands.",
      "A claim must be defended in waves, and each pause is only the next test in disguise.",
      "The treasure is less a chest than a temporary siege.",
      "What Extinction event asks survivors to protect a falling cache from repeated attacks?"
    ],
    "hints": [
      "The answer is a timed world event, not a boss.",
      "It involves defending a supply point against successive waves.",
      "Look to Extinction's falling caches and the combat encounter around them."
    ],
    "reward": 80,
    "notes": "Arcane Scribe • challenge knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Element Vein",
    "category": "challenge",
    "lines": [
      "The wasteland's power does not arrive polished or safe.",
      "A tribe must hold a wound in the earth while hostile forces try to end the bargain early.",
      "The reward is gathered from the ground, but the real test is keeping the ground yours.",
      "What Extinction encounter asks survivors to defend a source of raw power?"
    ],
    "hints": [
      "The answer is a defendable world encounter.",
      "Its objective is tied to collecting a valuable resource from the ground.",
      "Find the staged defense of a raw-power deposit."
    ],
    "reward": 80,
    "notes": "Arcane Scribe • challenge knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Desert Titan",
    "category": "creature",
    "lines": [
      "A storm has learned to carry a heartbeat.",
      "The sky is not its home so much as its territory, and the ruined city watches it pass like an omen.",
      "It is too vast for ordinary taming and too deliberate to mistake for weather.",
      "Which colossal Extinction guardian commands the desert air?"
    ],
    "hints": [
      "The answer is one of Extinction's Titans.",
      "The clues point to the desert and aerial movement.",
      "Choose the Titan associated with the desert biome."
    ],
    "reward": 80,
    "notes": "Arcane Scribe • creature knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Forest Titan",
    "category": "creature",
    "lines": [
      "The canopy has no need of a throne when the trees themselves can rise.",
      "Its body makes the border between creature and landscape difficult to draw.",
      "The ruined world gave its woodland a guardian too large to hide behind a trunk.",
      "Which Titan is bound to Extinction's overgrown green heart?"
    ],
    "hints": [
      "The answer is an Extinction Titan.",
      "The imagery is forest and living vegetation, not ice or desert.",
      "Identify the guardian of the forested region."
    ],
    "reward": 80,
    "notes": "Arcane Scribe • creature knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Ice Titan",
    "category": "creature",
    "lines": [
      "The cold here is more than weather; it has learned to advance.",
      "A frozen giant carries the silence of a biome where ordinary tracks vanish quickly.",
      "Its name is plain, but earning the right to face it is not.",
      "Which Titan embodies Extinction's frozen domain?"
    ],
    "hints": [
      "The answer is an Extinction Titan.",
      "The setting is a frozen biome.",
      "Distinguish it from the desert and forest counterparts."
    ],
    "reward": 75,
    "notes": "Arcane Scribe • creature knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Oasisaur",
    "category": "creature",
    "lines": [
      "A refuge crosses the dry world without leaving the dunes behind.",
      "Its back can become shelter, making a living landscape out of a journey.",
      "The answer is not a place on a map, though travelers may treat it as one.",
      "What colossal creature carries an oasis across the sands?"
    ],
    "hints": [
      "The answer is a creature with a mobile habitat-like role.",
      "Its defining feature is a living oasis.",
      "Look among newer creatures connected to desert oasis mechanics."
    ],
    "reward": 80,
    "notes": "Arcane Scribe • creature knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Maewing",
    "category": "creature",
    "lines": [
      "It is no parent by blood, yet it can ease the burden of raising a nursery.",
      "Its care is broad enough to serve more than one youngling.",
      "It is a mount, but its most valuable work may happen when no rider is watching.",
      "Which creature helps tend and feed nearby young?"
    ],
    "hints": [
      "The answer is a creature known for raising young.",
      "Its nursery role can help multiple babies.",
      "Find the unusual gliding creature with a nursing mechanic."
    ],
    "reward": 75,
    "notes": "Arcane Scribe • creature knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Noglin",
    "category": "creature",
    "lines": [
      "The body you see may not be the will that moves it.",
      "A brief invasion of thought can turn an enemy's strength into an unfamiliar instrument.",
      "It wins not by overpowering every target, but by borrowing the target's choices.",
      "Which Extinction creature can take control of another survivor or creature?"
    ],
    "hints": [
      "The answer is a creature with a control-based ability.",
      "Its power concerns directing another being rather than ordinary damage.",
      "Find Extinction's creature associated with mind control."
    ],
    "reward": 80,
    "notes": "Arcane Scribe • creature knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Ferox",
    "category": "creature",
    "lines": [
      "A small companion carries a secret that changes the scale of the room.",
      "The transformation is tied to a substance survivors covet for other reasons.",
      "Do not judge its danger by the form that first accepts your attention.",
      "Which creature can change dramatically after exposure to a rare power source?"
    ],
    "hints": [
      "The answer is a creature with two notably different forms.",
      "The transformation is associated with Element.",
      "Look among Aberration's unusual tames, not ordinary predators."
    ],
    "reward": 75,
    "notes": "Arcane Scribe • creature knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Shadowmane",
    "category": "creature",
    "lines": [
      "It arrives without the usual promise of saddle and reins.",
      "Water is part of its mystery, and a group can make its presence more dangerous than one silhouette suggests.",
      "Its first lesson is that some hunters do not need to announce themselves.",
      "Which stealthy creature blends mobility with sudden attacks?"
    ],
    "hints": [
      "The answer is a creature, not an item or ability.",
      "The clues emphasize stealth, water, and group behavior.",
      "Look among the distinctive tames associated with Genesis Part 2."
    ],
    "reward": 75,
    "notes": "Arcane Scribe • creature knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Desmodus",
    "category": "creature",
    "lines": [
      "A cave's ceiling becomes a road, and night becomes an ally.",
      "It can carry a survivor through darkness while turning the hunt into a source of useful essence.",
      "Its silhouette recalls old folklore, but its place in the bestiary is real.",
      "Which creature makes blood, flight, and the cavern one connected clue?"
    ],
    "hints": [
      "The answer is a flying creature associated with caves.",
      "Blood collection and unusual mobility are important mechanics.",
      "Look among the creatures introduced with Fjordur."
    ],
    "reward": 75,
    "notes": "Arcane Scribe • creature knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Rhyniognatha",
    "category": "creature",
    "lines": [
      "A fortress may be born from a process that looks more like a bargain than a breeding plan.",
      "The path asks for a host and a resource few tribes keep casually at hand.",
      "Its silhouette recalls an ancient insect, but its utility is measured in what it can carry.",
      "Which giant insect requires an unusual impregnation process to obtain?"
    ],
    "hints": [
      "The answer is a creature with a nonstandard acquisition method.",
      "The process involves a host and a rare resource.",
      "Find the unusual giant insect with a specialized reproduction mechanic."
    ],
    "reward": 80,
    "notes": "Arcane Scribe • creature knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Artifact of the Strong",
    "category": "item",
    "lines": [
      "A name promises brute force, but the path to it asks for careful movement.",
      "The prize is not a weapon and does not strike on its own.",
      "Those who search the arena for it arrive after the test has already begun.",
      "Which Island relic praises power while waiting at the end of a cave trial?"
    ],
    "hints": [
      "The answer is a cave artifact.",
      "Its title describes physical might.",
      "Use the Island artifact names to find the relic associated with strength."
    ],
    "reward": 70,
    "notes": "Arcane Scribe • item knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Explorer Notes",
    "category": "lore",
    "lines": [
      "The dead leave no council meeting, yet their observations continue to change the living.",
      "A scrap of the past can reveal a voice, a discovery, or a history the map never tells directly.",
      "They are scattered like breadcrumbs, but their purpose is not to feed anything.",
      "What hidden records reward discovery with fragments of the world's story?"
    ],
    "hints": [
      "The answer is a collectible lore feature, not a crafting material.",
      "Finding them reveals records from past survivors.",
      "Look for scattered discoveries that document the world's history."
    ],
    "reward": 70,
    "notes": "Arcane Scribe • lore knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Tek Cave",
    "category": "challenge",
    "lines": [
      "The final ascent begins where ordinary survival stops being enough.",
      "Heat and hostile guardians narrow the route, and the destination is not a supply cache.",
      "The entrance is a test of preparation before it becomes a test of endurance.",
      "What Island challenge leads survivors toward the final overseer?"
    ],
    "hints": [
      "The answer is a major endgame challenge location.",
      "It is on the Island and leads to a final boss encounter.",
      "Find the cave whose completion grants access to the Overseer."
    ],
    "reward": 80,
    "notes": "Arcane Scribe • challenge knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Broodmother Lysrix",
    "category": "challenge",
    "lines": [
      "The first warning may arrive on many legs, but the arena is not an ordinary nest.",
      "A relic opens the way to a battle where small shapes can fill the ground.",
      "The name belongs to a guardian whose brood is part of the threat.",
      "Which Island boss rules the spider-themed arena?"
    ],
    "hints": [
      "The answer is an Island boss.",
      "Its theme centers on spiders and a brood.",
      "Match the arachnid imagery to the Island's boss roster."
    ],
    "reward": 75,
    "notes": "Arcane Scribe • challenge knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Megapithecus",
    "category": "challenge",
    "lines": [
      "A ruined gateway frames a foe whose strength is easier to recognize than its title.",
      "The arena's danger is not only the opponent but the ground that may fail beneath a careless step.",
      "A great ape stands where the cold approaches the end of the trial.",
      "Which Island boss turns a frozen arena into a test of footing?"
    ],
    "hints": [
      "The answer is an Island boss.",
      "The clues point to an ape-like opponent and a hazardous arena.",
      "Choose the boss associated with the snowy arena."
    ],
    "reward": 75,
    "notes": "Arcane Scribe • challenge knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Dragon",
    "category": "challenge",
    "lines": [
      "The arena borrows the shape of a legend, and the air itself becomes part of the danger.",
      "A survivor who prepares only for claws may overlook what falls from above.",
      "Its title is shorter than its shadow, and its trial is among the Island's final tests.",
      "Which Island boss makes flight and fire central to the battle?"
    ],
    "hints": [
      "The answer is an Island boss, not a wild encounter.",
      "Its defining threat includes aerial attacks and fire.",
      "Match those clues to the Island's major boss arenas."
    ],
    "reward": 75,
    "notes": "Arcane Scribe • challenge knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Tek Replicator",
    "category": "item",
    "lines": [
      "A workbench for the age after metal, it does not merely improve the old craft.",
      "Its size and appetite for power announce that the tribe has crossed into another tier.",
      "The result may be equipment, but the station itself is the achievement.",
      "What advanced crafting station produces high-tier technology?"
    ],
    "hints": [
      "The answer is a crafting structure.",
      "It belongs to the Tek tier and is used for advanced crafting.",
      "Do not confuse it with a transmitter or generator."
    ],
    "reward": 70,
    "notes": "Arcane Scribe • item knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Gacha",
    "category": "creature",
    "lines": [
      "A gift may appear after the keeper has learned not to ask too directly.",
      "It consumes ordinary offerings, then leaves behind a result shaped by its strange appetite.",
      "A tribe may call it a producer, but its moods are part of the machine.",
      "Which creature turns selected resources into collectible outputs?"
    ],
    "hints": [
      "The answer is a creature used for resource production.",
      "Its output is not guaranteed by ordinary crafting recipes.",
      "Find Extinction's tame associated with producing crystals or resources."
    ],
    "reward": 70,
    "notes": "Arcane Scribe • creature knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Tek Bridge",
    "category": "item",
    "lines": [
      "A gap becomes a decision rather than a barrier when a tribe carries the right technology.",
      "It does not fly the builder across, and it does not leave a living creature behind.",
      "The structure's purpose is to make two sides behave as one route.",
      "What advanced build piece creates a crossing over open space?"
    ],
    "hints": [
      "The answer is a structure piece, not a mount or traversal tool.",
      "Its purpose is to span a gap and create a walkable route.",
      "Look for the Tek building piece designed as a bridge."
    ],
    "reward": 65,
    "notes": "Arcane Scribe • item knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Water Vein",
    "category": "map",
    "lines": [
      "The desert hides its most important resource beneath a surface that gives little away.",
      "A survivor may carry a container, but the land must first reveal where it can be filled.",
      "It is not a river, and its usefulness depends on bringing the right structure to it.",
      "What Scorched Earth feature lets a tribe draw water from the ground?"
    ],
    "hints": [
      "The answer is a map feature rather than a creature.",
      "It is associated with Scorched Earth's water scarcity.",
      "Find the underground water source that can be tapped."
    ],
    "reward": 70,
    "notes": "Arcane Scribe • map knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Phoenix",
    "category": "creature",
    "lines": [
      "Most survivors search for a body; this one may announce itself as a column of flame.",
      "Its appearance obeys a harsh cycle, and a storm can matter more than a trap.",
      "It is not simply a bird that prefers warm places; the desert writes its rules into the encounter.",
      "Which rare Scorched Earth creature is tied to extreme heat and firestorms?"
    ],
    "hints": [
      "The answer is a rare creature, not a weather event.",
      "Its appearance is associated with extreme heat on Scorched Earth.",
      "Find the legendary fire bird whose availability depends on the heat cycle."
    ],
    "reward": 80,
    "notes": "Arcane Scribe • creature knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Charge Lantern",
    "category": "item",
    "lines": [
      "A hand-held answer to the dark does more than illuminate a path.",
      "Its glow can change the balance between a survivor and something that should not be approached unprepared.",
      "It is not the source of power, but a tool that spends it to shape the encounter.",
      "What portable Aberration tool projects charge light?"
    ],
    "hints": [
      "The answer is a portable item.",
      "Its light is tied to charge mechanics rather than ordinary fuel.",
      "Find the handheld tool used to illuminate and repel certain underground threats."
    ],
    "reward": 70,
    "notes": "Arcane Scribe • item knowledge: solve the defining mechanic before naming the subject."
  },
  {
    "answer": "Tek Generator",
    "category": "item",
    "lines": [
      "A base grows beyond the age of wires, but it still needs a heart.",
      "This heart does not eat ordinary fuel, and its reach can make distant devices feel connected.",
      "It is not a crafting station, nor the device that moves a survivor between worlds.",
      "What advanced power source runs nearby Tek structures?"
    ],
    "hints": [
      "The answer is a power-generating structure.",
      "It uses advanced technology rather than gasoline.",
      "Distinguish the power source from a replicator or transmitter."
    ],
    "reward": 70,
    "notes": "Arcane Scribe • item knowledge: solve the defining mechanic before naming the subject."
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
