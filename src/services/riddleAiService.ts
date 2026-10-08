import { prisma } from "../database/prisma.js";

export interface GeneratedArcaneRiddle {
  question: string;
  answer: string;
  hint?: string;
  reward: number;
  notes: string;
}

type RiddleCategory =
  | "creature"
  | "item"
  | "ability"
  | "lore"
  | "map"
  | "challenge"
  | "mixed";

type RiddleSeed = {
  answer: string;
  category: RiddleCategory;
  lines: string[];
  hints: string[];
  reward: number;
  notes: string;
};

/*
 * The Arcane Scribe is deliberately lore-first.
 *
 * Hints are progressive rather than direct answers:
 *  1. cryptic / misleading in interpretation, but still true
 *  2. WoA lore
 *  3. ASA/map context
 *  4. strong mechanical confirmation without naming the answer
 *
 * Keep these difficult. The goal is deduction, not instant ARK trivia.
 */
const RIDDLES: RiddleSeed[] = [
  {
    answer: "Yi Ling",
    category: "creature",
    lines: [
      "The Council once filed me under feather, then crossed the word out.",
      "I do not need a bow when my own body already knows how to become one.",
      "In the dark, distance is not safety. It is ammunition waiting to happen.",
      "Rin asked why I fear the ground less than those who stand upon it.",
      "What hunts by making its own plumage leave the body?"
    ],
    hints: [
      "The first archivist may have mistaken the clue for something harmless.",
      "Rin's note: the dangerous part is not how high the creature can go, but how far its attack can travel.",
      "Look toward the darkness of Aberration Ascended.",
      "Its feathers are more than feathers; they can be launched at a distant target."
    ],
    reward: 30,
    notes: "Lore-first ASA riddle • Yi Ling"
  },
  {
    answer: "Fasolasuchus",
    category: "creature",
    lines: [
      "The desert has a habit of teaching survivors to fear what moves above the sand.",
      "The wiser ones learned to fear what moves beneath it.",
      "I do not need the sky to hide my approach, nor a cave to conceal my hunger.",
      "Heathen called the old terror predictable. The new terror disagreed.",
      "What answers a footprint by leaving none until the attack has already begun?"
    ],
    hints: [
      "The obvious desert answer is useful only if you assume the danger comes from above.",
      "The Council record describes an ambusher rather than a wanderer.",
      "The trail leads to Scorched Earth Ascended.",
      "Think of the large new predator that can emerge from beneath the sand."
    ],
    reward: 30,
    notes: "Lore-first ASA riddle • Fasolasuchus"
  },
  {
    answer: "Shastasaurus",
    category: "creature",
    lines: [
      "I am a mountain that abandoned the land without becoming a ruin.",
      "The sea became my road, my shelter, and eventually my fortress.",
      "A survivor can stand upon me without standing upon the seafloor.",
      "Doxo wrote that the strangest ships do not need sails.",
      "What living vessel carries a tribe where foundations cannot?"
    ],
    hints: [
      "Do not assume the word 'mountain' means stone.",
      "Wizard's note: the answer is something alive that can become infrastructure.",
      "The clue belongs to The Center Ascended.",
      "Look for the enormous aquatic creature whose platform can turn it into an underwater base."
    ],
    reward: 31,
    notes: "Lore-first ASA riddle • Shastasaurus"
  },
  {
    answer: "Gigantoraptor",
    category: "creature",
    lines: [
      "The Council expected a predator. The nest answered first.",
      "I am measured less by what I kill than by what I teach the young to become.",
      "A giant can guard a nursery without needing a throne.",
      "Panda called the clue obvious, which is usually how Panda makes a clue dangerous.",
      "What enormous bird makes raising the next generation part of its mystery?"
    ],
    hints: [
      "The first mistake is assuming the nest is merely decoration.",
      "The Council's record spends unusually much ink on offspring.",
      "Look toward Ragnarok Ascended.",
      "Think of the giant bird whose special utility revolves around raising and caring for young creatures."
    ],
    reward: 29,
    notes: "Lore-first ASA riddle • Gigantoraptor"
  },
  {
    answer: "Dreadnoughtus",
    category: "creature",
    lines: [
      "I was not summoned to defeat a Titan by becoming a larger Titan.",
      "My answer is carried by four legs, a platform, and a voice.",
      "When Element makes something untouchable, the right sound can make it ordinary again.",
      "EmilioTheGreat wrote only one sentence in the margin: 'Do not mistake size for the weapon.'",
      "What giant came to Extinction carrying a countermeasure in its throat?"
    ],
    hints: [
      "The loudest clue is not necessarily the loudest attack.",
      "The Realm Warden's note points toward something made to challenge the enormous.",
      "The answer arrived with Extinction Ascended.",
      "Its roar can disrupt Element-based Titan defenses."
    ],
    reward: 32,
    notes: "Lore-first ASA riddle • Dreadnoughtus"
  },
  {
    answer: "Megaraptor",
    category: "creature",
    lines: [
      "My name promises a familiar hunter, but the promise is deliberately incomplete.",
      "The old word survives. The scale does not.",
      "A survivor who knows every raptor still has reason to hesitate when this one appears.",
      "Brendon marked the word 'raptor' and wrote beneath it: 'Read the first half again.'",
      "What new Valguero predator makes a familiar name unfamiliar?"
    ],
    hints: [
      "The clue may be hiding in the name rather than the creature.",
      "Brendon's note suggests that one familiar word has been enlarged beyond expectation.",
      "The answer belongs to Valguero Ascended.",
      "Think of the large new raptor-like predator introduced there."
    ],
    reward: 30,
    notes: "Lore-first ASA riddle • Megaraptor"
  },
  {
    answer: "Elderclaw",
    category: "creature",
    lines: [
      "The forest had guardians before the Council learned their names.",
      "I am not ancient because the calendar says so; I am ancient because the Realm behaves as though I remember it.",
      "My claws are a warning, but the trees are the real witness.",
      "Rin found records of me where ordinary bestiary pages should have been.",
      "What supernatural guardian entered the wild when Valguero became Ascended?"
    ],
    hints: [
      "The word 'elder' may point to age, but age is not the important part.",
      "The Council classifies this mystery differently from ordinary prehistoric wildlife.",
      "Begin with Valguero Ascended, then widen the map.",
      "Think of the Fantastic Tame that serves as a forest guardian."
    ],
    reward: 29,
    notes: "Lore-first ASA riddle • Elderclaw"
  },
  {
    answer: "Pyromane",
    category: "creature",
    lines: [
      "Fire is only my first disguise.",
      "A predator may become a companion without ceasing to be a predator.",
      "The smallest version of me is the clue most survivors ignore.",
      "Wizard wrote: 'If it can change shape, do not solve the larger shape first.'",
      "What Fantastic Tame refuses to remain one size?"
    ],
    hints: [
      "The obvious answer is the element around the creature, not the creature itself.",
      "Wizard's warning is about identity changing with form.",
      "The trail belongs to ASA's Fantastic Tames.",
      "Think of the fiery creature that can shift between a larger combat form and a shoulder form."
    ],
    reward: 29,
    notes: "Lore-first ASA riddle • Pyromane"
  },
  {
    answer: "Cosmo",
    category: "creature",
    lines: [
      "I weigh little, but I can make a wall irrelevant.",
      "My thread is more important than my legs.",
      "In a Realm where darkness makes a short distance feel endless, a line can become a road.",
      "Doxo called me a spider only after the Council had already used my gift.",
      "What tiny companion turns webbing into movement?"
    ],
    hints: [
      "The spider itself is a distraction; follow what it leaves behind.",
      "The Council cares more about the path than the creature making it.",
      "Look to Aberration Ascended.",
      "Think of the new shoulder pet whose webs create useful lines for traversal."
    ],
    reward: 28,
    notes: "Lore-first ASA riddle • Cosmo"
  },
  {
    answer: "Deinonychus",
    category: "creature",
    lines: [
      "I am proof that a large enemy can have a very small problem.",
      "The victim supplies the battlefield. I merely climb onto it.",
      "My size is the misdirection; my position is the threat.",
      "Heathen's old field note says, 'Never judge a predator from the ground.'",
      "What Valguero hunter turns another creature's body into a perch and a weapon?"
    ],
    hints: [
      "The obvious clue points toward speed; the useful clue points upward.",
      "Heathen's note suggests that the target can become part of the attack.",
      "The creature is strongly associated with Valguero.",
      "Think of the raptor-like predator known for clinging to larger creatures."
    ],
    reward: 28,
    notes: "Lore-first ASA riddle • Deinonychus"
  },
  {
    answer: "Aberrant Oviraptor",
    category: "creature",
    lines: [
      "An old thief entered a new darkness and became a different kind of clue.",
      "I care more about what is hidden inside a shell than what is outside it.",
      "The strange part is not my appetite. It is the Realm that taught me to glow.",
      "Panda found the original record and crossed out the word 'ordinary.'",
      "What egg-seeking creature was rewritten by Aberration?"
    ],
    hints: [
      "The clue is about a thief, but not the kind that steals from a vault.",
      "Panda's correction suggests an old species wearing an unusual identity.",
      "Look for an Aberrant remaster in ASA.",
      "Think of the Oviraptor variant associated with Aberration."
    ],
    reward: 27,
    notes: "Lore-first ASA riddle • Aberrant Oviraptor"
  },
  {
    answer: "Aberrant Gigantoraptor",
    category: "creature",
    lines: [
      "A giant bird entered a place where light is treasure.",
      "Its nest survived the journey, but the world around it did not remain familiar.",
      "One half of the answer belongs to a creature. The other half belongs to a Realm.",
      "Brendon wrote both halves on separate pages and filed them together.",
      "What happens when the giant nest guardian is rewritten by Aberration?"
    ],
    hints: [
      "Solve the bird and the Realm separately before joining them.",
      "The Council archives treat this as a variant, not an unrelated species.",
      "The trail leads into Aberration Ascended.",
      "Think of Gigantoraptor in its Aberrant form."
    ],
    reward: 28,
    notes: "Lore-first ASA riddle • Aberrant Gigantoraptor"
  },
  {
    answer: "Aberrant Fasolasuchus",
    category: "creature",
    lines: [
      "The desert learned to hide me. The cave learned to glow around me.",
      "I carried an old hunting trick into a Realm that should have rejected it.",
      "The answer is two places that do not seem willing to share one creature.",
      "Rin's note reads: 'Sometimes the mutation is the map.'",
      "What desert ambusher wears the colors of Aberration?"
    ],
    hints: [
      "The first clue points toward a habitat, but it is not the final habitat.",
      "Rin suggests solving the environment before solving the animal.",
      "Find the Aberrant version of a Scorched Earth predator.",
      "Think of Fasolasuchus adapted to Aberration."
    ],
    reward: 28,
    notes: "Lore-first ASA riddle • Aberrant Fasolasuchus"
  },
  {
    answer: "Grendel",
    category: "challenge",
    lines: [
      "My name belongs in an old monster story, but my story begins in a newer Realm.",
      "I cannot be tamed, only answered.",
      "The arena asks a question with claws, and the wrong answer has consequences.",
      "Wizard's record contains no breeding notes, only warnings.",
      "What new Valguero challenge wears the name of a monster?"
    ],
    hints: [
      "Do not search the tameable bestiary first.",
      "The Council files this under challenge, not creature ownership.",
      "The trail leads to Valguero Ascended.",
      "Think of the new boss encounter added with Valguero Ascended."
    ],
    reward: 31,
    notes: "Lore-first ASA riddle • Grendel"
  },
  {
    answer: "Ice Golem",
    category: "creature",
    lines: [
      "The mountain moved, and the survivor blamed the weather.",
      "Stone and ice are harmless until the landscape decides to walk.",
      "I look like scenery until scenery begins choosing targets.",
      "Heathen's warning: 'If the cliff has footsteps, stop calling it a cliff.'",
      "What elemental guardian turns the terrain itself into a creature?"
    ],
    hints: [
      "The cold is a clue, but not the whole clue.",
      "Heathen's note says the disguise matters more than the material.",
      "Search the elemental additions of Valguero Ascended.",
      "Think of the tameable ice-built golem."
    ],
    reward: 28,
    notes: "Lore-first ASA riddle • Ice Golem"
  },
  {
    answer: "Chalk Golem",
    category: "creature",
    lines: [
      "A pale mountain can be mistaken for a monument until it moves.",
      "I do not hide behind the landscape; I make the landscape my disguise.",
      "The color is the least interesting part of the answer.",
      "Panda's margin note simply says: 'The cliff blinked.'",
      "What pale elemental golem makes terrain look alive?"
    ],
    hints: [
      "The first clue can make you search for a structure instead of a creature.",
      "Panda's note is literal enough to be useful and vague enough to be annoying.",
      "The answer belongs to Valguero Ascended's new elemental creatures.",
      "Think of the pale, chalk-like golem variant."
    ],
    reward: 28,
    notes: "Lore-first ASA riddle • Chalk Golem"
  },
  {
    answer: "Armadoggo",
    category: "creature",
    lines: [
      "The wasteland kept many things that should have been lost. Loyalty was one of them.",
      "I am not a dinosaur, but I survived the same lesson: adapt or disappear.",
      "Bob did not need another weapon. He needed something that would follow.",
      "EmilioTheGreat's note contains only a paw print.",
      "What companion arrived to make the ruins feel a little less empty?"
    ],
    hints: [
      "The answer has four legs, but do not begin with the prehistoric bestiary.",
      "Bob's story matters more than the species list.",
      "Look toward Extinction Ascended and Wasteland War.",
      "Think of the canine companion introduced with Bob's Tall Tales."
    ],
    reward: 27,
    notes: "Lore-first ASA riddle • Armadoggo"
  },
  {
    answer: "Shastasaurus Echolocation",
    category: "ability",
    lines: [
      "The sea hides what the eye cannot name.",
      "I send nothing worth carrying and receive something worth fearing.",
      "The answer travels as a sound, but its prize is information.",
      "Rin wrote: 'Listen before you look.'",
      "What ability lets an ocean giant read the darkness without light?"
    ],
    hints: [
      "The answer is not a creature, though a creature performs it.",
      "Rin's advice is deliberately backwards for ordinary survival.",
      "The ability belongs to the giant aquatic addition of The Center Ascended.",
      "Think of the Shastasaurus sense that uses ultrasonic calls to reveal what is nearby."
    ],
    reward: 30,
    notes: "Lore-first ASA riddle • Shastasaurus echolocation"
  },
  {
    answer: "Dreadnoughtus Roar",
    category: "ability",
    lines: [
      "The weapon cannot be held because the weapon is the voice.",
      "It does not defeat a Titan by being sharper than the Titan.",
      "Element is powerful until something makes that power answerable.",
      "Doxo wrote: 'The loudest spell in the Realm has no mana cost.'",
      "What sound was made to turn Titan technology against itself?"
    ],
    hints: [
      "Do not look for a projectile.",
      "Doxo's clue points to an ability that affects technology rather than flesh.",
      "The answer belongs to Dreadnoughtus on Extinction Ascended.",
      "Think of its anti-Element roar used against Titans."
    ],
    reward: 31,
    notes: "Lore-first ASA riddle • Dreadnoughtus roar"
  },
  {
    answer: "Yi Ling Feathers",
    category: "item",
    lines: [
      "They once belonged to a body. Now they cross the distance between hunter and hunted.",
      "They look too light to be ammunition, which is precisely why the first record was wrong.",
      "Aberration taught a feather to become a threat.",
      "Wizard circled the word 'plumage' three times.",
      "What does the new dark-Realm hunter turn into a projectile?"
    ],
    hints: [
      "The misleading part is assuming the answer must be crafted ammunition.",
      "Wizard's note says the weapon is biological.",
      "The trail leads to Aberration Ascended.",
      "Think of the projectiles fired from Yi Ling's own feathers."
    ],
    reward: 29,
    notes: "Lore-first ASA riddle • Yi Ling feathers"
  },
  {
    answer: "Cosmo's Web",
    category: "item",
    lines: [
      "I am not a bridge, but I can become one.",
      "I am not a weapon, but a survivor can regret leaving me behind.",
      "The creature that makes me is tiny; the gap I defeat does not have to be.",
      "Panda called me 'a road with no ground.'",
      "What web-made tool turns empty space into a route?"
    ],
    hints: [
      "The first clue points toward construction, but no foundation is required.",
      "Panda's phrase describes a path that exists only because something was fired.",
      "Look to Cosmo and Aberration Ascended.",
      "Think of the web line created by Cosmo for traversal."
    ],
    reward: 28,
    notes: "Lore-first ASA riddle • Cosmo's web"
  },
  {
    answer: "Shastasaurus Saddle",
    category: "item",
    lines: [
      "A saddle usually carries a rider. Mine carries an idea.",
      "The ocean becomes a foundation when the creature beneath you is large enough.",
      "A tribe can bring its ambitions below the surface without building on the seafloor.",
      "Brendon wrote: 'This is not riding. This is relocation.'",
      "What equipment turns a sea giant into an underwater platform?"
    ],
    hints: [
      "Do not begin by looking for ordinary riding gear.",
      "Brendon's note suggests that the passenger is not the main purpose.",
      "The answer belongs to Shastasaurus on The Center Ascended.",
      "Think of its platform saddle that supports structures and equipment."
    ],
    reward: 30,
    notes: "Lore-first ASA riddle • Shastasaurus saddle"
  },
  {
    answer: "Dreadnoughtus Saddle",
    category: "item",
    lines: [
      "My rider is not the most dangerous thing I carry.",
      "A platform becomes a battlefield when the enemy is measured in Titans.",
      "The saddle is only the doorway; the artillery is the reason the door exists.",
      "Heathen wrote: 'Bring more than a spear.'",
      "What turns a giant Extinction mount into a mobile war platform?"
    ],
    hints: [
      "The answer is equipment, not the creature carrying it.",
      "Heathen's note implies ranged force on an enormous scale.",
      "Look toward Dreadnoughtus on Extinction Ascended.",
      "Think of the platform saddle designed to carry heavy weaponry."
    ],
    reward: 30,
    notes: "Lore-first ASA riddle • Dreadnoughtus saddle"
  },
  {
    answer: "Fasolasuchus Egg",
    category: "item",
    lines: [
      "The desert predator begins as something that cannot chase anything.",
      "A shell can conceal the future of a hunter better than any dune can conceal the present.",
      "The parent is the real clue; the object only remembers it.",
      "Rin refused to call it harmless.",
      "What fragile thing belongs to the creature that hunts beneath Scorched Earth?"
    ],
    hints: [
      "The answer is something that has not yet become dangerous.",
      "Rin's warning is about what the shell becomes, not what it is now.",
      "Search the breeding records of Scorched Earth Ascended.",
      "Think of the egg laid by Fasolasuchus."
    ],
    reward: 26,
    notes: "Lore-first ASA riddle • Fasolasuchus egg"
  },
  {
    answer: "Pyromane Form",
    category: "ability",
    lines: [
      "I have one name and two silhouettes.",
      "The survivor who solves only the large silhouette has solved half a clue.",
      "Fire does not explain me; transformation does.",
      "Wizard's note says: 'Same soul. Different battlefield.'",
      "What mechanic lets one Fantastic Tame become both predator and shoulder companion?"
    ],
    hints: [
      "The answer is a change, not an object.",
      "Wizard's note points toward one tame occupying two roles.",
      "Look at the form system of ASA Fantastic Tames.",
      "Think of Pyromane switching between its larger form and shoulder form."
    ],
    reward: 28,
    notes: "Lore-first ASA riddle • Pyromane forms"
  },
  {
    answer: "Elderclaw Taming",
    category: "challenge",
    lines: [
      "You cannot earn the forest's trust by treating the forest like a battlefield.",
      "The first mistake is assuming every creature waits to be knocked unconscious.",
      "My taming is closer to permission than conquest.",
      "Panda wrote: 'Stop chasing it like prey.'",
      "What unusual taming ritual belongs to the forest guardian?"
    ],
    hints: [
      "The misleading path is the normal knockout-tame routine.",
      "Panda's instruction tells you to change the relationship, not the weapon.",
      "The clue points to Elderclaw in ASA.",
      "Think of the nonstandard process required to tame Elderclaw."
    ],
    reward: 29,
    notes: "Lore-first ASA riddle • Elderclaw taming"
  },
  {
    answer: "Grendel Arena",
    category: "challenge",
    lines: [
      "The enemy has a name, but the room has one too.",
      "A survivor can understand the monster and still lose to the place.",
      "The walls are not scenery when the challenge was built around them.",
      "EmilioTheGreat's archive marks the arena before it marks the boss.",
      "Where does Valguero Ascended ask its newest challengers to prove themselves?"
    ],
    hints: [
      "The answer is a location, not the creature waiting inside.",
      "The Council's order of records is the clue: room first, enemy second.",
      "Look toward the new Valguero Ascended boss content.",
      "Think of the dedicated arena associated with the Grendel encounter."
    ],
    reward: 29,
    notes: "Lore-first ASA riddle • Grendel arena"
  },
  {
    answer: "Aberration",
    category: "map",
    lines: [
      "The Realm where darkness became geography taught survivors to carry light like a lifeline.",
      "The ceiling is no longer a ceiling. It is a threat, a route, or both.",
      "Glow and danger share the same vocabulary here.",
      "Rin's oldest warning reads: 'Do not confuse darkness with emptiness.'",
      "Which Realm turns surviving the underground into its own discipline?"
    ],
    hints: [
      "The first clue can describe a cave, but this cave is an entire world.",
      "Rin's warning is about a Realm whose environment changes ordinary survival rules.",
      "Several ASA-exclusive additions point back to this map.",
      "Think of the underground ARK with radiation, charge light, and vertical ecosystems."
    ],
    reward: 27,
    notes: "Lore-rich ASA map riddle • Aberration"
  },
  {
    answer: "The Center",
    category: "map",
    lines: [
      "My name sounds like a destination that should be obvious.",
      "Instead, the deeper you travel, the less certain the word 'center' becomes.",
      "The ocean hides one of my greatest living secrets.",
      "Wizard drew a circle around the word and then another around the circle.",
      "Which ASA Realm keeps a giant sea secret beneath its surface?"
    ],
    hints: [
      "The name itself is a trap; do not solve from geography alone.",
      "Wizard's circles suggest that the answer has layers.",
      "The Shastasaurus trail leads here.",
      "Think of the remastered ASA map where the enormous aquatic addition belongs."
    ],
    reward: 27,
    notes: "Lore-rich ASA map riddle • The Center"
  },
  {
    answer: "Scorched Earth",
    category: "map",
    lines: [
      "The sky is not the only thing that can kill you here.",
      "Water is wealth, shade is strategy, and the ground may conceal teeth.",
      "The Council learned that a desert can have more than one predator hidden beneath its surface.",
      "Heathen wrote: 'Bring water. Then bring patience.'",
      "Which Realm turns every oasis into a decision?"
    ],
    hints: [
      "The obvious answer is 'desert,' but the Realm has a proper name.",
      "Heathen's note points toward survival resources rather than a specific creature.",
      "The new sand ambusher is a major ASA clue.",
      "Think of the ARK Realm where water scarcity and heat shape the whole adventure."
    ],
    reward: 27,
    notes: "Lore-rich ASA map riddle • Scorched Earth"
  },
  {
    answer: "Extinction",
    category: "map",
    lines: [
      "I was built after the world had already become a warning.",
      "The old wilderness is replaced by ruins, Element, and things too large to ignore.",
      "Titans do not feel like bosses here. They feel like weather.",
      "EmilioTheGreat wrote: 'This Realm does not ask whether you are ready.'",
      "Which Realm turns the end of the world into a starting point?"
    ],
    hints: [
      "The answer is not an event; it is a Realm.",
      "The Council records repeatedly mention Titans and a world already damaged.",
      "Dreadnoughtus and Wasteland War additions point here.",
      "Think of the ruined ARK where Titans dominate the landscape."
    ],
    reward: 27,
    notes: "Lore-rich ASA map riddle • Extinction"
  },
  {
    answer: "Valguero",
    category: "map",
    lines: [
      "My valleys remember dinosaurs. My caves remember stranger things.",
      "A survivor can find snow, forest, desert, and underground danger without leaving one Realm.",
      "Recently, the archives grew heavier with new predators, golems, guardians, and a new challenge.",
      "Brendon wrote: 'The map did not change its name. It changed its secrets.'",
      "Which Realm became a crowded chapter of ASA mysteries?"
    ],
    hints: [
      "The diversity of environments is the decoy; the new additions are the real trail.",
      "Brendon's note points toward a remastered Realm gaining several unusual records.",
      "Megaraptor, Elderclaw, golems, and Grendel all point toward the same map.",
      "Think of Valguero Ascended."
    ],
    reward: 29,
    notes: "Lore-rich ASA map riddle • Valguero"
  },
  {
    answer: "Ragnarok",
    category: "map",
    lines: [
      "I was named for an ending, yet survivors keep finding reasons to begin here.",
      "Ice, fire, forest, ruin, and sea refuse to share a single mood.",
      "A giant nest added a new kind of guardian to the Realm.",
      "Panda wrote: 'Some endings have very large hatchlings.'",
      "Which Realm hides its newest clue inside a nest?"
    ],
    hints: [
      "The name suggests destruction, but the clue is about a place full of life.",
      "Panda's note points toward a creature whose story begins with young.",
      "The new giant bird was added to Ragnarok Ascended.",
      "Think of the official map associated with Gigantoraptor's ASA arrival."
    ],
    reward: 27,
    notes: "Lore-rich ASA map riddle • Ragnarok"
  },
  {
    answer: "Fantastic Tames",
    category: "lore",
    lines: [
      "The old bestiary was written as though every creature belonged to nature.",
      "Then something arrived that made the Council add a new category.",
      "Some burn, some guard, some weave, and none were satisfied with being ordinary.",
      "Rin called them 'the creatures that make the archive nervous.'",
      "What ASA collection contains the stranger companions that refuse ordinary rules?"
    ],
    hints: [
      "The answer is a category, not one animal.",
      "Rin's description is deliberately broader than the official label.",
      "Pyromane, Cosmo, and Elderclaw all point toward it.",
      "Think of ASA's Fantastic Tames."
    ],
    reward: 28,
    notes: "Lore-rich ASA riddle • Fantastic Tames"
  },
  {
    answer: "Bob's Tall Tales: Wasteland War",
    category: "lore",
    lines: [
      "The survivor is not the only storyteller in the wasteland.",
      "A companion, a ruined world, and a very stubborn old man can share the same chapter.",
      "The title sounds like a bedtime story until the ruins start answering back.",
      "Wizard wrote: 'Some tales are tall because the world is broken.'",
      "Which ASA chapter brings Bob's war story into the wasteland?"
    ],
    hints: [
      "The clue points toward a story rather than a creature.",
      "Bob is the key name; the war is the setting.",
      "Armadoggo is one of the strongest breadcrumbs.",
      "Think of the Wasteland War chapter of Bob's Tall Tales."
    ],
    reward: 27,
    notes: "Lore-rich ASA content riddle • Bob's Tall Tales: Wasteland War"
  },
  {
    answer: "Fasolasuchus",
    category: "mixed",
    lines: [
      "I have a mouth, but the mouth is not the first thing you should fear.",
      "I have a home, but the home is the part that disappears beneath you.",
      "The oldest desert trick is to hide the hunter where the hunter expects prey to look.",
      "Doxo's note simply says: 'The ground blinked.'",
      "What creature makes the sand itself part of the ambush?"
    ],
    hints: [
      "The answer can be mistaken for another desert predator if you only read the first line.",
      "Doxo's note suggests movement where survivors normally see terrain.",
      "Scorched Earth Ascended is the key Realm.",
      "Think of the large burrowing predator introduced there."
    ],
    reward: 30,
    notes: "Lore-first ASA riddle • Fasolasuchus"
  },
  {
    answer: "Shastasaurus",
    category: "mixed",
    lines: [
      "I am large enough that the word 'mount' stops being useful.",
      "My back can become a room, my call can become a warning, and the deep can become a road.",
      "The clue is not that I swim. Many things swim.",
      "The clue is that survivors can build their plans upon me.",
      "What creature makes the ocean itself feel less empty?"
    ],
    hints: [
      "The word 'mount' is intentionally too small for the answer.",
      "The Council records three clues: platform, sound, and depth.",
      "All three point toward The Center Ascended.",
      "Think of the enormous aquatic platform creature."
    ],
    reward: 31,
    notes: "Lore-first ASA riddle • Shastasaurus"
  },
  {
    answer: "Dreadnoughtus",
    category: "mixed",
    lines: [
      "A Titan sees me and should see prey.",
      "Instead, it sees a moving fortress carrying a sound it cannot comfortably ignore.",
      "The platform suggests siege. The voice suggests something stranger.",
      "Heathen wrote: 'If the Titan laughs, make it stop being protected.'",
      "What creature combines battlefield scale with an anti-Titan answer?"
    ],
    hints: [
      "Do not choose the answer merely because it is large.",
      "Heathen's note points toward a defense-breaking ability.",
      "Extinction Ascended is the Realm to investigate.",
      "Think of the new Titan-hunting sauropod-like creature."
    ],
    reward: 32,
    notes: "Lore-first ASA riddle • Dreadnoughtus"
  },
  {
    answer: "Elderclaw",
    category: "mixed",
    lines: [
      "The Council could have called me beast, but that would have made the clue too easy.",
      "I belong to the forest without being bound to its ordinary laws.",
      "My name sounds like a memory, my claws sound like a warning, and my taming sounds like a negotiation.",
      "Panda wrote: 'Do not confuse strange with random.'",
      "What guardian makes the forest feel like it has chosen a side?"
    ],
    hints: [
      "The answer is not a dinosaur.",
      "Panda's warning says the strange behavior is intentional.",
      "The trail begins with Valguero Ascended and extends to other ASA Realms.",
      "Think of the supernatural forest guardian known as Elderclaw."
    ],
    reward: 30,
    notes: "Lore-first ASA riddle • Elderclaw"
  },
  {
    answer: "Yi Ling",
    category: "mixed",
    lines: [
      "My first clue is a feather. My second is distance. My third is darkness.",
      "None of those alone are enough.",
      "The Council once assumed that the sky belonged to those with the largest wings.",
      "Aberration proved that a smaller hunter can make the sky irrelevant.",
      "What creature makes its own plumage part of the attack?"
    ],
    hints: [
      "A feather may be evidence, ammunition, or misdirection.",
      "Rin's records emphasize ranged danger rather than raw size.",
      "The answer is tied strongly to Aberration Ascended.",
      "Think of the feathered creature that fires its own feathers."
    ],
    reward: 30,
    notes: "Lore-first ASA riddle • Yi Ling"
  }
];

let shuffleBag: number[] = [];
let recentCategories: RiddleCategory[] = [];

function refillShuffleBag(): void {
  shuffleBag = RIDDLES.map((_, index) => index);
  for (let i = shuffleBag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffleBag[i], shuffleBag[j]] = [shuffleBag[j], shuffleBag[i]];
  }
}

async function chooseSeed(): Promise<RiddleSeed> {
  if (shuffleBag.length === 0) refillShuffleBag();

  // Avoid repeating the same category back-to-back when another category exists.
  const candidates = shuffleBag.filter((index) => {
    const category = RIDDLES[index].category;
    return recentCategories.length === 0 || category !== recentCategories[recentCategories.length - 1];
  });

  const pool = candidates.length > 0 ? candidates : shuffleBag;
  const selectedIndex = pool[Math.floor(Math.random() * pool.length)];
  shuffleBag = shuffleBag.filter((index) => index !== selectedIndex);

  const seed = RIDDLES[selectedIndex];
  recentCategories.push(seed.category);
  if (recentCategories.length > 4) recentCategories.shift();

  return seed;
}

export async function generateArcaneRiddle(): Promise<GeneratedArcaneRiddle> {
  // Prefer riddles whose answer has not already been used in the persistent riddle archive.
  // If the whole catalog has been used, the shuffle bag naturally starts a new cycle.
  const used = new Set(
    (
      await prisma.riddle.findMany({
        select: { answer: true },
        orderBy: { createdAt: "desc" },
        take: RIDDLES.length * 2
      })
    ).map((row) => row.answer.trim().toLowerCase())
  );

  let seed: RiddleSeed | undefined;
  const attempts = Math.max(1, shuffleBag.length);

  for (let i = 0; i < attempts; i += 1) {
    const candidate = await chooseSeed();
    if (!used.has(candidate.answer.trim().toLowerCase())) {
      seed = candidate;
      break;
    }
  }

  // If the persistent archive has exhausted the catalog, allow a new cycle.
  if (!seed) seed = await chooseSeed();

  return {
    question: seed.lines.join("\n"),
    answer: seed.answer,
    hint: JSON.stringify(seed.hints),
    reward: seed.reward,
    notes: "Local Arcane Scribe • " + seed.notes
  };
}
