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
      "In the deep places, the first sign of danger may be a change in the rules rather than a visible body.",
      "One portable source of borrowed daylight changes what is willing to approach.",
      "It does not need a throne to make an entire expedition regret its route.",
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
      "The weather seems to gather its own will, then keep it moving above the broken world.",
      "Its territory is measured from above, while the ruins below serve as witnesses rather than shelter.",
      "Its scale rules out an ordinary mount, but its movements are far too deliberate to be a storm.",
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
      "In this territory, the old boundary between root and guardian has stopped holding.",
      "The forest's outline becomes unreliable when its protector chooses to move.",
      "Its domain is the green refuge that survived the fall of the old world.",
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
      "The stillness of the frozen wastes can gather itself and begin to march.",
      "Its passage belongs to a place where footprints are temporary, but the damage is not.",
      "The title is simple; reaching the encounter is the true test of preparation.",
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
      "The most important command in a battle may come from something too small to hold the weapon.",
      "For a short time, an opponent's own power can be made to serve a different intent.",
      "Its advantage is not force, but the unsettling question of who is choosing the next move.",
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
      "The safest route through a cavern may run above the path everyone else follows.",
      "Its strange harvest comes from the hunt itself, and the darkness offers it more than cover.",
      "An old superstition has acquired a place in the Council's field records.",
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
      "Some living fortresses begin with an exchange no ordinary breeder would call routine.",
      "The process requires both a living intermediary and a costly offering that cannot be improvised at the last moment.",
      "Its wings suggest an old kind of hunter; its value is revealed by the weight it can bear.",
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
      "The last climb begins at a threshold where preparation matters more than exploration.",
      "The passage punishes hesitation with heat and pressure, and its end is a gateway to a greater trial.",
      "The approach tests a tribe's readiness before the destination tests its ability to endure.",
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
      "The arena's smallest threats arrive in numbers, but the true danger is the source that keeps sending them.",
      "The entrance requires proof of prior trials, and the floor can become crowded before the main foe is understood.",
      "Its title points to a lineage, and that lineage is not merely ceremonial.",
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
      "The arena's architecture offers a clue, but the danger is a living opponent rather than the broken stone.",
      "Position matters as much as strength; one mistake can turn the arena itself against a prepared team.",
      "Its shape belongs to a familiar family of primates, while the trial around it is anything but familiar.",
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
      "The battlefield refuses to stay on the ground, forcing survivors to account for threats that arrive from above.",
      "Armor against a close strike does little for a team that ignores the danger carried through the air.",
      "The name is almost too ordinary for a creature tied to one of the Island's defining trials.",
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

const GENERIC_ANSWER_TERMS = new Set([
  "artifact", "artifacts", "council", "creature", "creatures", "exchange",
  "explorer", "element", "grand", "high", "notes", "shadow", "saddle",
  "sigil", "tek", "titan", "water", "wizard", "wizards", "warlock",
  "warlocks", "witch", "witches", "roar", "web", "form", "shoulder",
  "feathers", "golem", "ice", "charge", "the"
]);

function answerLeaksInto(text: string, answer: string): boolean {
  const normalizedText = " " + normalize(text) + " ";
  const normalizedAnswer = normalize(answer);
  if (!normalizedAnswer) return true;

  // Catch both a full answer phrase and distinctive long answer tokens.
  // Common WoA/ARK nouns are excluded from token checks to avoid rejecting
  // fair clues merely because they share broad category vocabulary.
  if (normalizedText.includes(" " + normalizedAnswer + " ")) return true;

  const distinctiveTokens = normalizedAnswer
    .split(" ")
    .filter(token => token.length >= 8 && !GENERIC_ANSWER_TERMS.has(token));
  return distinctiveTokens.some(token => normalizedText.includes(" " + token + " "));
}

function isSafeSeed(seed: RiddleSeed): boolean {
  const publicText = [...seed.lines, ...seed.hints].join(" ");
  return !answerLeaksInto(publicText, seed.answer);
}

const HARDENED_HINTS: Record<string, string[]> = {
  "Pyromane Shoulder Form": [
    "The clue concerns where a companion is positioned, not a change to its species.",
    "Compare a tame that follows at ground level with one whose position is fixed relative to its keeper.",
    "The answer is a named configuration of a shoulder companion, not equipment.",
    "Identify the alternate carry-state associated with the fire-themed tame."
  ],
  "Cosmo": [
    "The maker is much smaller than the route it enables.",
    "Look for a companion whose useful trace remains after it has moved on.",
    "Its traversal aid is spun rather than built from stone or metal.",
    "Name the Aberration companion that produces the thread used for crossing gaps."
  ],
  "Shastasaurus Saddle": [
    "The answer changes what can be built around a mount, not how fast it swims.",
    "Think of a mobile structure rather than ordinary riding equipment.",
    "The host is a very large marine tame capable of carrying a base-like platform.",
    "Name the equipment that turns that aquatic tame into a place to build."
  ],
  "Yi Ling Feathers": [
    "The clue points to a biological material, not the animal that releases it.",
    "This material can leave its source and threaten a target at range.",
    "Its use is closer to ammunition than to ordinary plumage.",
    "Identify the launched material associated with the cliff-dwelling Aberration hunter."
  ],
  "Dreadnoughtus Roar": [
    "The answer is heard rather than held.",
    "Its value is in disrupting an advantage, not dealing ordinary damage alone.",
    "The target is advanced defensive technology powered by Element.",
    "Name the vocal ability of the enormous Extinction creature that counters Tek shielding."
  ],
  "Fasolasuchus": [
    "The danger is hidden by the terrain instead of approaching across its surface.",
    "The key mechanic is an ambush that begins below the visible ground.",
    "Narrow the search to a large desert predator associated with burrowing.",
    "Name the Scorched Earth creature that can conceal itself beneath sand."
  ],
  "Shastasaurus Echolocation": [
    "The answer gathers information without making the dark visibly bright.",
    "A signal is sent out; what returns is knowledge rather than an object.",
    "The ability belongs to a giant marine tame and helps reveal what sight misses.",
    "Name the sound-based sensing ability of that aquatic giant."
  ],
  "Deinonychus": [
    "The advantage comes from position, not simply from being larger or faster.",
    "This predator can use another creature's body as part of its attack.",
    "Look for a small pack hunter known for clinging to much larger targets.",
    "Name the Valguero predator that attacks while attached to another creature."
  ],
  "Grendel": [
    "The answer belongs to a named encounter, not the ordinary tame roster.",
    "The arena tests preparation through a specific opponent.",
    "Its name comes from a famous literary monster rather than an ARK species family.",
    "Identify the named Valguero challenge encounter described in the bank."
  ],
  "Armadoggo": [
    "The clue describes a companion from a later chapter of ARK, not a prehistoric giant.",
    "Its role is defined by following and assisting a survivor.",
    "Look to the ruined future setting and its newer dog-like companion.",
    "Name the loyal companion introduced with Extinction content."
  ],
  "Ice Golem": [
    "The apparent landscape feature is mobile and acts independently.",
    "Its body resembles a natural formation rather than a conventional animal.",
    "The clues point to a cold, stone-like elemental creature associated with Valguero.",
    "Name the living frost-and-stone guardian."
  ],
  "Cosmo's Web": [
    "Separate the maker from the thing left behind.",
    "The tool changes traversal by spanning space rather than increasing speed.",
    "It is a temporary strand created by a small companion from Aberration.",
    "Name the web-based traversal tool, not its maker."
  ],
  "The Sigil Era": [
    "The answer names a chapter in WoA's own history, not a map or game mechanic.",
    "One part of the title is a symbolic mark; the other means a period of time.",
    "Think of the community's current named chapter.",
    "Give the exact two-part title used for this WoA era."
  ],
  "Grand Sigil Exchange": [
    "The answer is a player-facing destination in the community's Discord game.",
    "Its visitors spend a currency earned through participation rather than ordinary ARK resources.",
    "It is the realm's central place for trading that earned currency for rewards.",
    "Name the community shop whose title combines a grand trading hall with its magical currency."
  ],
  "Emilio the Great": [
    "The answer is a community persona, not a staff role or ARK creature.",
    "The title is deliberately theatrical and belongs to the server's lore.",
    "Look for the persona associated with grand decrees and mischievous notes.",
    "Give the exact name and honorific of WoA's grand wizard persona."
  ],
  "High Wizards": [
    "The answer is a rank shared by trusted members, not an individual name.",
    "It describes senior guidance within the community's leadership circle.",
    "The title combines an elevated rank with a familiar magical calling.",
    "Name the senior council title used in WoA."
  ],
  "Wizards, Warlocks & Witches": [
    "The answer is the community's motto, not a list of playable classes.",
    "It contains three distinct magical callings joined in one phrase.",
    "The words appear beneath the community's identity.",
    "Give the exact three-part WoA slogan, including its conjunctions."
  ],
  "The Council": [
    "The answer is a group that helps govern the community, not a location.",
    "Its role is to guide decisions and maintain rules rather than run one event.",
    "Think of a circle of trusted administrators rather than a single leader.",
    "Name WoA's governing group."
  ],
  "Artifact of the Clever": [
    "The clue concerns a cave relic whose title praises a mental quality.",
    "It is collected after a traversal challenge, not crafted or equipped as armor.",
    "Look among the Island's named artifacts and distinguish cleverness from strength or immunity.",
    "Name the Island artifact associated with cleverness."
  ],
  "Artifact of the Devourer": [
    "The answer is a cave relic, not the creature implied by its title.",
    "Its name evokes consumption rather than stealth, wisdom, or resistance.",
    "Search the Island artifact set and match the title to that idea.",
    "Name the artifact whose title refers to a consumer."
  ],
  "Artifact of the Immune": [
    "The sought object is a relic, not the protective item a survivor might use nearby.",
    "Its title describes resistance to a harmful environment.",
    "Look among the Island's cave artifacts rather than consumables or armor.",
    "Name the artifact whose title refers to being unaffected by harm."
  ],
  "Tek Transmitter": [
    "The answer is a placeable structure, not a creature or a portable container.",
    "Its function involves moving survivors between distant maps.",
    "It provides transfer access from a base rather than serving as a crafting station.",
    "Name the advanced structure used to access map transfers."
  ],
  "Cryopod": [
    "The answer stores a living tame, not ordinary inventory.",
    "It suspends the creature until the survivor chooses to release it.",
    "Think of the portable stasis device rather than a fridge or building.",
    "Name the item used to store and redeploy a tame in stasis."
  ],
  "Wyvern Milk": [
    "The resource is used during raising, not as a general-purpose meal.",
    "Its source is dangerous and closely tied to a particular hatchling's needs.",
    "It is obtained from the adult form of the creature being raised.",
    "Name the resource needed to raise a young wyvern."
  ],
  "Nameless": [
    "The threat is associated with a subterranean map where darkness changes the rules.",
    "A portable source of charge illumination affects how the enemy behaves.",
    "Look for the hostile Aberration creature that makes light strategically important.",
    "Name the underground enemy affected by charge light."
  ],
  "Reaper Queen": [
    "The answer is the adult creature involved in an unusual acquisition process, not its offspring.",
    "The process leaves a survivor carrying a developing second life.",
    "Look to Aberration's dangerous subterranean predators rather than ordinary breeding.",
    "Name the creature whose attack can lead to a Reaper pregnancy."
  ],
  "Rock Drake": [
    "The answer combines vertical movement with long travel through the air, but is not a conventional flyer.",
    "Its camouflage can make a moving threat difficult to notice.",
    "The mount is strongly associated with Aberration's cliffs and hazardous depths.",
    "Name the climbing, gliding, camouflaging mount from Aberration."
  ],
  "Charge Node": [
    "The answer is a fixed world feature, not a creature or handheld lamp.",
    "It restores a resource used by specialized equipment in a dark environment.",
    "Look for the Aberration station that replenishes charge rather than generating ordinary electricity.",
    "Name the structure that restores charge to compatible gear."
  ],
  "Gasbags": [
    "The creature's signature advantage involves storing and releasing something lighter than itself.",
    "Its movement can be altered by taking in or expelling gas.",
    "Look to the unusual Extinction creature used for buoyancy and carrying weight.",
    "Name the inflatable-looking tame that uses gas to control movement."
  ],
  "Orbital Supply Drop": [
    "The event is a defended objective, not a routine container that can be opened without resistance.",
    "Waves of enemies arrive while survivors protect a falling reward.",
    "The encounter belongs to Extinction and is often abbreviated to three letters.",
    "Name the wave-based Extinction defense event."
  ],
  "Element Vein": [
    "The objective is a resource site that must be defended while it is harvested.",
    "Its value attracts waves of hostile creatures rather than a single boss.",
    "Look to Extinction's exposed deposits of advanced energy material.",
    "Name the resource-defense event centered on exposed Element."
  ],
  "Desert Titan": [
    "The answer is a titanic creature associated with one of Extinction's environmental regions.",
    "Its encounter involves the sky and the wasteland rather than a conventional cave arena.",
    "Distinguish it from the forest and ice counterparts by its desert domain.",
    "Name the desert-dwelling Titan."
  ],
  "Forest Titan": [
    "The answer is one of three regional Titans, distinguished by what surrounds it.",
    "Its domain is overgrown and woody rather than frozen or arid.",
    "The encounter belongs to Extinction's corrupted world.",
    "Name the Titan associated with the forest."
  ],
  "Ice Titan": [
    "The answer is a regional Titan whose environment is defined by cold.",
    "It is not the smaller stone-like creature suggested by a frozen cliff.",
    "Look to Extinction's Titan encounters and separate the frozen domain from forest and desert.",
    "Name the Titan associated with ice."
  ],
  "Oasisaur": [
    "The answer is a living refuge rather than an ordinary combat mount.",
    "Its defining role is connected to an oasis and restoring what the wasteland has taken.",
    "Look to the desert-themed creature added with Scorched Earth content.",
    "Name the oasis-bearing creature."
  ],
  "Maewing": [
    "The answer supports raising young from more than one species.",
    "Its role resembles a mobile nursery more than a conventional mount.",
    "The creature can carry and feed babies using a specialized pouch.",
    "Name the creature known for its nursing pouch."
  ],
  "Noglin": [
    "The answer changes a battle by interfering with another creature's control.",
    "Its defining trick is mental intrusion rather than raw size or ordinary damage.",
    "Look to the small, unsettling creature introduced with Genesis Part 2.",
    "Name the creature that can take control of another being."
  ],
  "Ferox": [
    "The answer changes dramatically when exposed to a particular resource.",
    "Its small form is not the whole story; the transformation is central to its danger.",
    "Look to the Genesis creature whose behavior changes after consuming Element.",
    "Name the creature that transforms after consuming Element."
  ],
  "Shadowmane": [
    "The answer's strongest traits involve coordinated movement and a pack, not a saddle.",
    "It is a feline-like Genesis Part 2 creature with stealth-oriented combat behavior.",
    "Look for the tame whose group presence changes how it performs in a fight.",
    "Name the stealthy pack-oriented feline."
  ],
  "Desmodus": [
    "The answer is a nocturnal flyer whose utility goes beyond ordinary flight.",
    "Its signature role includes extracting a useful resource from living targets.",
    "Look to Fjordur's large bat-like tame rather than a conventional bird.",
    "Name the vampire-like creature associated with blood harvesting."
  ],
  "Rhyniognatha": [
    "The answer is a large insect whose acquisition is unlike ordinary egg hatching.",
    "Its life cycle involves a host and a risky process imposed on a survivor's tame.",
    "Look to the unusual creature introduced with The Island's later content update.",
    "Name the giant insect associated with the extraordinary impregnation mechanic."
  ],
  "Artifact of the Strong": [
    "The answer is an Island cave relic whose title praises physical power.",
    "It is a collectible objective, not a weapon or a boss trophy.",
    "Compare the Island artifact names and distinguish strength from cleverness or immunity.",
    "Name the artifact associated with strength."
  ],
  "Explorer Notes": [
    "The answer is a collectible record that rewards discovery with experience.",
    "It preserves observations left by people who explored before the current survivor.",
    "Look for a discoverable record found throughout ARK's maps, not a craftable book.",
    "Name the collectible records that reveal ARK's lore and grant XP."
  ],
  "Tek Cave": [
    "The answer is a final approach that tests a tribe before it reaches an endgame arena.",
    "The route itself is dangerous, and its destination is more important than loot along the way.",
    "It is found on The Island and leads toward the final boss sequence.",
    "Name the endgame cave leading to the Island's final ascent."
  ],
  "Broodmother Lysrix": [
    "The answer is a boss whose battlefield fills with smaller attackers.",
    "Its theme is a nest-building arthropod rather than an ape or dragon.",
    "Look to The Island's boss arenas and the trophy associated with spider-like offspring.",
    "Name the spider-like Island boss."
  ],
  "Megapithecus": [
    "The answer is an arena boss whose brute force contrasts with a more nimble opponent.",
    "Its form evokes a primate, and the encounter punishes careless positioning.",
    "Look among The Island's three principal bosses, excluding the spider and the fire-breathing one.",
    "Name the giant ape-like boss."
  ],
  "Dragon": [
    "The answer is an arena boss whose threat comes from fire and attacks that bypass ordinary confidence in armor.",
    "Its silhouette belongs to mythic reptilian flight, not a primate or arachnid.",
    "Look among The Island's main boss encounters and distinguish the fire-themed one.",
    "Name the fire-breathing boss of The Island."
  ],
  "Tek Replicator": [
    "The answer is an advanced crafting station rather than a power source or travel structure.",
    "It produces equipment that ordinary benches cannot handle.",
    "Look for the high-tier device used to craft Tek technology.",
    "Name the advanced station that crafts Tek items."
  ],
  "Gacha": [
    "The answer turns selected offerings into an uncertain output.",
    "Its production depends on what it consumes and on its own unusual behavior.",
    "Look to Extinction's tame that can generate resources or collectible items from offerings.",
    "Name the creature known for producing resources from consumed items."
  ],
  "Tek Bridge": [
    "The answer is a build piece that changes the geometry of a base, not a tool for moving the builder.",
    "Its purpose is to create a walkable connection over a gap.",
    "Look among advanced structures rather than mounts or traversal gadgets.",
    "Name the Tek structure piece that spans open space."
  ],
  "Water Vein": [
    "The answer is a natural resource point hidden in an arid map.",
    "A survivor must place the right structure to draw from it.",
    "It is neither a river nor a carried container; it is a source beneath the desert surface.",
    "Name the Scorched Earth feature that can be tapped for water."
  ],
  "Phoenix": [
    "The answer's appearance is governed by an extreme environmental condition.",
    "It is a rare creature rather than the storm that reveals it.",
    "Look to Scorched Earth and the heat cycle that can make it appear.",
    "Name the legendary fire bird tied to extreme heat and firestorms."
  ],
  "Charge Lantern": [
    "The answer is portable and uses stored charge rather than ordinary fuel.",
    "Its glow affects more than visibility in a dangerous underground environment.",
    "Look for the handheld tool associated with Aberration's charge-light mechanics.",
    "Name the portable device that projects charge light."
  ],
  "Tek Generator": [
    "The answer supplies power rather than crafting equipment or transferring survivors.",
    "It runs advanced structures without relying on ordinary fuel.",
    "Distinguish the base's power source from a transmitter and a replicator.",
    "Name the structure that powers nearby Tek devices."
  ]
};

function buildHints(seed: RiddleSeed): string[] {
  const categoryFallback: Record<RiddleCategory, string> = {
    creature: "Classify the subject by its behavior, not by its appearance alone.",
    item: "Separate the thing being described from the result it enables.",
    ability: "The answer names a capability, not the creature or tool behind it.",
    lore: "The solution belongs to the realm's own established lore.",
    map: "The clue points to a world feature rather than a tame or inventory object.",
    challenge: "Identify the encounter or trial, not a creature you could keep.",
    mixed: "Separate the central clue from the setting used to disguise it."
  };
  const fallbacks = [
    "Reconsider which image describes the subject and which only describes its surroundings.",
    "Separate the source of the clue from the action or object it produces.",
    "The setting narrows the search, but does not name the solution.",
    categoryFallback[seed.category]
  ];
  const hints = (HARDENED_HINTS[seed.answer] ?? seed.hints).slice(0, 4);
  while (hints.length < 4) hints.push(categoryFallback[seed.category]);

  // Always expose exactly four stages. If a clue accidentally echoes the
  // answer, replace it with a safe reasoning prompt instead of leaking it.
  return hints.map((hint, index) => answerLeaksInto(hint, seed.answer)
    ? fallbacks[index]
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

  const uniqueRiddles = [...new Map<string, RiddleSeed>(RIDDLES.map(seed => [normalize(seed.answer), seed] as const)).values()];
  const safeRiddles = uniqueRiddles.filter(isSafeSeed);
  if (!safeRiddles.length) {
    throw new Error("The Arcane Scribe has no riddle that passes the answer-leak rules.");
  }

  const unused = safeRiddles.filter(seed => !used.has(normalize(seed.answer)));
  const pool = unused.length ? unused : safeRiddles;
  const candidate = pool[Math.floor(Math.random() * pool.length)];

  return {
    // Reveal only the opening clues publicly. The remaining two lines become
    // progressive hints, unlocked only after this wizard makes incorrect guesses.
    question: candidate.lines.slice(0, 2).join("\n") + "\n\nWhat is the Scribe asking you to identify?",
    answer: candidate.answer,
    // The public prompt gives only the opening setup. The answer path is
    // exactly four staged hints; later seed lines are not appended as extra
    // near-answer reveals.
    hint: JSON.stringify(buildHints(candidate)),
    reward: candidate.reward,
    notes: "Arcane Scribe • " + candidate.notes
  };
}
