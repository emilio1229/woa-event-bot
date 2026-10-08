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
      "The third clue narrows the era or Realm.",
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The third clue places the mystery in a particular part of the Realm.",
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
      "The third clue narrows the era or Realm.",
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The first clue tells you what kind of thing you are seeking.",
      "Rin's note reads: 'Sometimes the mutation is the map.'",
      "What desert ambusher wears the colors of Aberration?"
    ],
    hints: [
      "The first clue points toward a habitat, but it is not the final habitat.",
      "Rin suggests solving the environment before solving the animal.",
      "Find the Aberrant version of a Scorched Earth predator.",
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The third clue narrows the era or Realm.",
      "The final clue points toward the subject's most distinctive trait."
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
      "The first clue tells you what kind of thing you are seeking.",
      "Rin's advice is deliberately backwards for ordinary survival.",
      "The ability belongs to the giant aquatic addition of The Center Ascended.",
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The first clue tells you what kind of thing you are seeking.",
      "Heathen's note implies ranged force on an enormous scale.",
      "The third clue narrows the era or Realm.",
      "The final clue points toward the subject's most distinctive trait."
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
      "The first clue tells you what kind of thing you are seeking.",
      "Rin's warning is about what the shell becomes, not what it is now.",
      "Search the breeding records of Scorched Earth Ascended.",
      "The final clue points toward the subject's most distinctive trait."
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
      "The first clue tells you what kind of thing you are seeking.",
      "Wizard's note points toward one tame occupying two roles.",
      "The third clue narrows the era, Realm, or context.",
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The first clue tells you what kind of thing you are seeking.",
      "The Council's order of records is the clue: room first, enemy second.",
      "The third clue narrows the era or Realm.",
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The first clue tells you what kind of thing you are seeking.",
      "The Council records repeatedly mention Titans and a world already damaged.",
      "Dreadnoughtus and Wasteland War additions point here.",
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The first clue tells you what kind of thing you are seeking.",
      "Rin's description is deliberately broader than the official label.",
      "Pyromane, Cosmo, and Elderclaw all point toward it.",
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The final clue points toward the subject's most distinctive trait."
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
      "The first clue tells you what kind of thing you are seeking.",
      "Panda's warning says the strange behavior is intentional.",
      "The trail begins with Valguero Ascended and extends to other ASA Realms.",
      "The final clue points toward the subject's most distinctive trait."
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
      "The first clue tells you what kind of thing you are seeking.",
      "The final clue points toward the subject's most distinctive trait."
    ],
    reward: 30,
    notes: "Lore-first ASA riddle • Yi Ling"
  },
{
  "answer": "Bison",
  "category": "creature",
  "lines": [
    "I carry the weight of a wild place without asking it to follow me.",
    "My horns are older than the Council, but my chapter is newer than the map's old name.",
    "Ragnarok gave the archives another reason to fear the quiet herd.",
    "Panda wrote: 'Not everything powerful announces itself.'",
    "What horned wanderer joined the Ascended Realm?"
  ],
  "hints": [
    "The horns are a distraction; think about the creature's place in a herd.",
    "Panda's note points toward quiet strength rather than aggression.",
    "The trail leads to Ragnarok Ascended.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 31,
  "notes": "Lore-rich ASA riddle • Bison"
},
{
  "answer": "Drakelings",
  "category": "creature",
  "lines": [
    "Four small dragons entered the archives without agreeing on what a dragon should be.",
    "They can rest upon a shoulder, yet their value is not merely companionship.",
    "The Council recorded several seasonal identities where one creature should have had one.",
    "Rin called them 'small answers to large problems.'",
    "What miniature dragons carry different seasonal gifts?"
  ],
  "hints": [
    "Do not solve the word dragon; solve what changes between them.",
    "Rin's phrase points toward utility hidden inside companionship.",
    "The third clue narrows the era or Realm.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 31,
  "notes": "Lore-rich ASA riddle • Drakelings"
},
{
  "answer": "Veilwyn",
  "category": "creature",
  "lines": [
    "I am a companion whose greatest weapon may be the space around me.",
    "Defense, offense, and speed can all change when I am near.",
    "The Council could not agree whether I was a creature or an aura wearing a creature's shape.",
    "Wizard simply wrote: 'Watch the glow, not the body.'",
    "What mysterious companion bends a survivor's battlefield through an aura?"
  ],
  "hints": [
    "The body is the decoy; the effect is the clue.",
    "Wizard's note points toward buffs rather than direct attacks.",
    "Look to the Lost Colony Fantastic Tame content.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Veilwyn"
},
{
  "answer": "SIR-5rM8",
  "category": "creature",
  "lines": [
    "I have no appetite for berries, yet I can still serve a tribe.",
    "My hands belong to a machine, my loyalty belongs to a survivor.",
    "The Council filed me beside chores rather than combat.",
    "Brendon wrote: 'The quietest worker may be the most useful.'",
    "What robot companion turns routine work into something automatic?"
  ],
  "hints": [
    "Do not search the creature catalogue for claws.",
    "Brendon's note points toward labor rather than battle.",
    "The third clue points toward the wider lore surrounding the mystery.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • SIR-5rM8"
},
{
  "answer": "Burrowbuck",
  "category": "creature",
  "lines": [
    "The safest road is sometimes the one nobody can see.",
    "I leave the surface without leaving the journey behind.",
    "A pursuer may follow my tracks only to discover that the tracks were the trap.",
    "Doxo wrote: 'A tunnel is a road that refuses witnesses.'",
    "What swift creature turns hidden dens and temporary tunnels into movement?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Doxo's note points toward travel and misdirection.",
    "The creature was introduced as a Fantastic Tame in 2026.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 31,
  "notes": "Lore-rich ASA riddle • Burrowbuck"
},
{
  "answer": "Boaratos",
  "category": "creature",
  "lines": [
    "The fire does not merely surround me; it follows the force of my charge.",
    "A tusk can be a tool, a threat, and a promise of what happens after the fight.",
    "Astraeos added a new beast that treats battle and burning timber with equal enthusiasm.",
    "Heathen wrote: 'Never call a boar harmless after the smoke begins.'",
    "What fiery bruiser arrived with the final Astraeos chapter?"
  ],
  "hints": [
    "The word boar is necessary but not sufficient.",
    "Heathen's note points toward a creature whose heat has practical uses too.",
    "Follow the final Astraeos update.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Boaratos"
},
{
  "answer": "Astraeos",
  "category": "map",
  "lines": [
    "The Realm that keeps adding secrets eventually becomes a secret itself.",
    "Islands, deep water, ruins, bosses, and strange creatures refuse to share one simple story.",
    "Abyssanthos hides beneath the surface while Pyranthos stretches the desert above it.",
    "EmilioTheGreat wrote: 'The map is larger than its name.'",
    "Which custom Realm became a crowded chapter of new ARK mysteries?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "EmilioTheGreat's note points toward a world with several distinct regions.",
    "The third clue narrows the era or Realm.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Astraeos"
},
{
  "answer": "Abyssanthos",
  "category": "map",
  "lines": [
    "The sea has a place where drowning is no longer the first concern.",
    "The deep becomes a roofless city of water, stone, and pockets where a survivor can breathe.",
    "The Council marked it as a region rather than a simple cave.",
    "Rin wrote: 'The ocean sometimes keeps rooms.'",
    "What deep-sea region of Astraeos shelters buildable air pockets?"
  ],
  "hints": [
    "The clue sounds like a cave, but the scale is larger.",
    "Rin's note points toward underwater spaces that can be inhabited.",
    "The region belongs to Astraeos.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Abyssanthos"
},
{
  "answer": "Helianthos",
  "category": "map",
  "lines": [
    "Not every island is built to frighten you.",
    "Some keep their mountains, flowers, and peaceful creatures like a secret garden between harsher chapters.",
    "The Council called one such island a pause between storms.",
    "Panda wrote: 'Even the wild needs somewhere to breathe.'",
    "Which Astraeos island hides peaceful plains beneath large ridges?"
  ],
  "hints": [
    "Do not follow the combat clues first.",
    "Panda's note points toward scenery and peaceful wildlife.",
    "Look among Astraeos's named islands.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 31,
  "notes": "Lore-rich ASA riddle • Helianthos"
},
{
  "answer": "Pyranthos",
  "category": "map",
  "lines": [
    "The desert was not finished when the sand stopped at the horizon.",
    "A gigantic new landmass rose from the heat and made old maps feel incomplete.",
    "The Council drew its border twice because once did not feel sufficient.",
    "Heathen wrote: 'Bring water twice.'",
    "What Astraeos desert landmass expanded the Realm's harsh side?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Heathen's warning points toward an unusually large desert.",
    "The landmass was added to Astraeos.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Pyranthos"
},
{
  "answer": "Abyssalus",
  "category": "challenge",
  "lines": [
    "The deep has a name for what waits beneath it.",
    "A survivor can prepare for a creature and still be unprepared for the place where the creature rules.",
    "The Council records call this one an ascension rather than an ordinary encounter.",
    "Doxo wrote: 'The void has a throne beneath the tide.'",
    "What Astraeos boss hides behind the title Void Beneath?"
  ],
  "hints": [
    "The word void is not metaphorical enough to solve this.",
    "Doxo's note points toward an underwater boss.",
    "Look to Astraeos's ascension encounters.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Abyssalus"
},
{
  "answer": "Shallocis",
  "category": "challenge",
  "lines": [
    "The sky has a throne too, but it is not made of clouds.",
    "The Council learned that 'above' can be as dangerous as 'below.'",
    "One Astraeos encounter carries the title Void Above.",
    "Wizard wrote: 'Look up only after checking the horizon.'",
    "What boss rules the upper half of that paired mystery?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Wizard's note suggests vertical contrast.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Shallocis"
},
{
  "answer": "Colossus",
  "category": "challenge",
  "lines": [
    "A name this large should be easy to notice.",
    "Instead, the Council found that size was the least mysterious part of the encounter.",
    "It stands among the miniboss records where ordinary creatures stop being the right comparison.",
    "Brendon wrote only: 'The name is honest.'",
    "What Astraeos miniboss is called Colossus?"
  ],
  "hints": [
    "The name is almost the clue, which is why it is a trap.",
    "Brendon's note says not to search for a hidden synonym.",
    "Look among Astraeos minibosses.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Colossus"
},
{
  "answer": "Kroaratos",
  "category": "challenge",
  "lines": [
    "The archives contain a name that sounds like a roar before the creature is ever seen.",
    "Astraeos gave the name to a miniboss that refuses to be filed under ordinary wildlife.",
    "Panda wrote: 'Some names arrive before the footsteps.'",
    "What strange miniboss carries this growling name?"
  ],
  "hints": [
    "The sound of the name is part of the misdirection.",
    "Panda's note suggests the title itself is a clue.",
    "Search Astraeos's miniboss records.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Kroaratos"
},
{
  "answer": "Grand Tortugar",
  "category": "creature",
  "lines": [
    "A shell can be armor, a home, or a platform for something much stranger.",
    "The Council had already learned to respect turtles before one became grand enough to deserve the adjective.",
    "Its saddle appears in the records of things earned rather than casually crafted.",
    "Wizard wrote: 'Some shells carry more than a creature.'",
    "What colossal turtle became an Astraeos legend?"
  ],
  "hints": [
    "Do not stop at ordinary turtles.",
    "Wizard's note points toward scale and a special saddle.",
    "Look among Astraeos's new creatures and miniboss rewards.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Grand Tortugar"
},
{
  "answer": "Manticore",
  "category": "challenge",
  "lines": [
    "The old monster returned to a Realm that was not part of its oldest legend.",
    "Lion, scorpion, and wing share one silhouette, but none explains the whole answer.",
    "The Council simply filed the encounter under 'do not underestimate.'",
    "Heathen wrote: 'Three beasts, one shadow.'",
    "What Astraeos boss borrows from several nightmares at once?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Heathen's note points toward a composite monster.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Manticore"
},
{
  "answer": "Hydraskos the Unbroken",
  "category": "challenge",
  "lines": [
    "Some names describe a creature. Mine describes an argument that has not ended.",
    "The Council's Astraeos records contain a boss whose title sounds more like a prophecy than a species.",
    "Rin underlined one word: 'Unbroken.'",
    "What boss carries the title that refuses to admit defeat?"
  ],
  "hints": [
    "The important word is not the creature's shape.",
    "Rin's underline points toward the title itself.",
    "Look among Astraeos's boss encounters.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Hydraskos the Unbroken"
},
{
  "answer": "Minotarchos",
  "category": "challenge",
  "lines": [
    "A labyrinth does not need walls when the monster itself is the warning.",
    "The Council found a miniboss whose name remembers an old maze and adds a crown to it.",
    "Panda wrote: 'A king does not need a throne to guard a maze.'",
    "What Astraeos miniboss carries the Minotaur's shadow?"
  ],
  "hints": [
    "The maze is thematic, not necessarily the whole location clue.",
    "Panda's note points toward a crowned labyrinth monster.",
    "Look among Astraeos minibosses.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Minotarchos"
},
{
  "answer": "Scorpion King",
  "category": "challenge",
  "lines": [
    "The desert has many stingers, but one wears a title instead of a species name.",
    "The Council's record sounds like a royal decree written in venom.",
    "Heathen wrote: 'Never kneel to the thing with a tail.'",
    "What Astraeos encounter turns a familiar arthropod into royalty?"
  ],
  "hints": [
    "Do not answer with an ordinary scorpion.",
    "Heathen's warning points toward a named encounter.",
    "The title appears among Astraeos's special creatures and bosses.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Scorpion King"
},
{
  "answer": "Scorpion Queen",
  "category": "challenge",
  "lines": [
    "The crown changed hands without changing the shape of the threat.",
    "Where one royal stinger appears, another record waits beside it.",
    "The Council refused to call the pair ordinary wildlife.",
    "Panda wrote: 'A throne can have two shadows.'",
    "What companion title completes the royal scorpion pair?"
  ],
  "hints": [
    "The clue depends on pairing rather than anatomy.",
    "Panda's note suggests a second royal counterpart.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Scorpion Queen"
},
{
  "answer": "Tidepups",
  "category": "creature",
  "lines": [
    "The sea keeps secrets, but sometimes it sends them ashore in pairs.",
    "These small companions belong to the ocean's gentler vocabulary.",
    "The Council recorded them among Astraeos's additions rather than ancient survivors.",
    "Rin wrote: 'Not every tide brings teeth.'",
    "What small aquatic companions ride the edge of the new sea?"
  ],
  "hints": [
    "The word tide matters more than the word pup.",
    "Rin's note points toward peaceful ocean life.",
    "Look among Astraeos's new spawner additions.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Tidepups"
},
{
  "answer": "Palaeoctopus",
  "category": "creature",
  "lines": [
    "The ocean kept an older shape and gave it a newer chapter.",
    "Eight arms are the obvious clue, but age is the stranger one.",
    "The Council called it a living fossil of a mystery.",
    "Brendon wrote: 'Count first. Date later.'",
    "What ancient-looking cephalopod joined Astraeos's waters?"
  ],
  "hints": [
    "Eight arms narrows the field but does not finish it.",
    "Brendon's note points toward the name's ancient meaning.",
    "Look among Astraeos ocean spawns.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Palaeoctopus"
},
{
  "answer": "Trireme",
  "category": "item",
  "lines": [
    "I carry people without being alive and cross water without asking the sea to tame itself.",
    "The Council's sailors call me a ship, but the name belongs to a much older tradition.",
    "Three banks of oars are hidden inside my identity.",
    "Wizard wrote: 'The number is the clue.'",
    "What Astraeos vessel bears the ancient three-rowed name?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Wizard's number clue refers to the historical meaning of the name.",
    "Look among Astraeos's new ship types.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Trireme"
},
{
  "answer": "Astral Souls",
  "category": "item",
  "lines": [
    "They are not ordinary currency, yet the Council counts them.",
    "They are not living creatures, yet they are called souls.",
    "Astraeos hides them among the rewards of its strongest encounters.",
    "Doxo wrote: 'Some prizes are pieces of the night.'",
    "What strange apex reward carries a celestial name?"
  ],
  "hints": [
    "The word souls is intentionally misleading if you expect a creature.",
    "Doxo's note points toward a reward rather than a tame.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Astral Souls"
},
{
  "answer": "Hex Coins",
  "category": "item",
  "lines": [
    "A coin is usually a promise of value. Mine is also a clue about magic.",
    "The Council found them where victories become rewards.",
    "The shape is ordinary; the name is not.",
    "Rin wrote: 'Currency can remember a curse.'",
    "What Astraeos apex drop carries the language of hexes?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Rin's note points toward the magical wording in its name.",
    "Look among Astraeos apex drops.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Hex Coins"
},
{
  "answer": "Valguero Memorial",
  "category": "lore",
  "lines": [
    "Names can become monuments without becoming statues.",
    "The dead do not answer here, but their names do.",
    "The Council gave the memorial a strange power: it can be changed by the people who run the Realm.",
    "Brendon wrote: 'A list can be a monument.'",
    "What Valguero feature remembers those who ascended?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Brendon's note points toward names being the important structure.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Valguero Memorial"
},
{
  "answer": "Nunatak",
  "category": "challenge",
  "lines": [
    "The mountain keeps a name that sounds like stone.",
    "The challenge is older in tone than the Realm that hosts it.",
    "Ragnarok's newest boss does not need a crown to make the ice feel smaller.",
    "Heathen wrote: 'The mountain has a guardian.'",
    "What new Ragnarok boss bears the name Nunatak?"
  ],
  "hints": [
    "The answer sounds like terrain, but it is an encounter.",
    "Heathen's note points toward a guardian rather than a location.",
    "Look among Ragnarok Ascended boss fights.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Nunatak"
},
{
  "answer": "Ragnarok Bison",
  "category": "lore",
  "lines": [
    "The name of the creature is simple. The history around it is not.",
    "A remastered Realm gained a new horned presence while keeping its old name.",
    "Panda wrote: 'Sometimes a new chapter begins with an old-looking animal.'",
    "What new creature made Ragnarok's herds feel different?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Panda's note points toward a new creature in an old Realm.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Ragnarok Bison"
},
{
  "answer": "Deinonychus Nest",
  "category": "item",
  "lines": [
    "The first clue tells you what kind of thing you are seeking.",
    "A nest can look like scenery until someone understands what it protects.",
    "Valguero's cliffs keep more secrets than the Council first recorded.",
    "Rin wrote: 'Look down before you look up.'",
    "What place belongs to the cliff-clinging predator's beginning?"
  ],
  "hints": [
    "Do not solve the creature; solve what it leaves behind.",
    "Rin's note points toward reproduction and location.",
    "The third clue places the mystery in a particular part of the Realm.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Deinonychus Nest"
},
{
  "answer": "Ghost Yi Ling",
  "category": "creature",
  "lines": [
    "A familiar silhouette returned without behaving like the thing survivors remembered.",
    "The Council's Halloween records are full of creatures that should not have been there.",
    "This one kept its feathers and lost something less visible.",
    "Wizard wrote: 'Do not trust the body during Fear.'",
    "What spectral hunter wore Yi Ling's shape?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Wizard's warning points toward Fear Ascended.",
    "Look among the event's ghost creatures.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Ghost Yi Ling"
},
{
  "answer": "Ghost Gigantoraptor",
  "category": "creature",
  "lines": [
    "A giant bird should be difficult to mistake, even after death.",
    "Yet the Council's Fear records proved otherwise.",
    "A familiar nest guardian returned wearing the wrong kind of absence.",
    "Panda wrote: 'Some ghosts still look hungry.'",
    "What spectral giant bird haunted the event?"
  ],
  "hints": [
    "The size is the clue, but the season is the lock.",
    "Panda's note points toward Fear Ascended variants.",
    "Look among the ghost creatures.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Ghost Gigantoraptor"
},
{
  "answer": "Ghost Ceratosaurus",
  "category": "creature",
  "lines": [
    "The horned hunter returned from the wrong side of the veil.",
    "Its silhouette remained recognizable, but its presence did not.",
    "The Council stopped calling the event wildlife after the second sighting.",
    "Doxo wrote: 'The dead do not need to be summoned twice.'",
    "What spectral predator borrowed the Ceratosaurus shape?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Doxo's note points toward Fear Ascended.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Ghost Ceratosaurus"
},
{
  "answer": "Ghost Argentavis",
  "category": "creature",
  "lines": [
    "The sky carried a shape survivors already knew, but the shape had forgotten the rules of life.",
    "Feathers became an omen instead of a sign of ordinary flight.",
    "Rin refused to look up after sunset.",
    "What spectral bird of prey appeared during Fear?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Rin's behavior is the clue to the season.",
    "Look among Fear Ascended ghost creatures.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Ghost Argentavis"
},
{
  "answer": "Ghost Snow Owl",
  "category": "creature",
  "lines": [
    "Cold was already dangerous before the veil opened.",
    "Then the Council found an owl that made the night feel colder still.",
    "The species was familiar; the silence was not.",
    "Heathen wrote: 'If the snow moves, leave.'",
    "What spectral bird haunted the frozen places?"
  ],
  "hints": [
    "The answer keeps the original creature's identity.",
    "Heathen's note points toward a ghost variant rather than a normal owl.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Ghost Snow Owl"
},
{
  "answer": "Ecto Lantern",
  "category": "item",
  "lines": [
    "I am carried like a tool but used like a ward.",
    "My purpose is not to defeat the dead directly, but to make them less certain of themselves.",
    "The Council issued me when ordinary weapons proved the wrong answer.",
    "Wizard wrote: 'Light first. Victory second.'",
    "What Fear Ascended tool weakens wild ghosts?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Wizard's note points toward weakening rather than defeating.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Ecto Lantern"
},
{
  "answer": "Ectoplasm",
  "category": "item",
  "lines": [
    "The dead leave something behind, but it is not a body.",
    "The Council learned to collect the residue of the impossible and turn it into something wearable.",
    "A ghost disappears; the resource remains.",
    "Panda wrote: 'Even fear can become material.'",
    "What event resource replaced direct ghost costume drops?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Panda's note points toward turning an event creature into a resource.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Ectoplasm"
},
{
  "answer": "Mutagen Ooze",
  "category": "item",
  "lines": [
    "The invaders were small, the residue was strange, and the reward was neither.",
    "A sewer of mutations can leave behind the material needed for celebration.",
    "The Council called it ooze because a better word would have made it sound too useful.",
    "Doxo wrote: 'Do not lick the clue.'",
    "What Fear Ascended material came from defeating the Mousers?"
  ],
  "hints": [
    "The silly wording is deliberate; the material is real.",
    "Doxo's note points toward a resource from event enemies.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Mutagen Ooze"
},
{
  "answer": "Araneo",
  "category": "creature",
  "lines": [
    "The old spider was never content with staying on the floor.",
    "After its new chapter, walls became roads and webs became lines through the air.",
    "The Council's old bestiary suddenly looked vertically incomplete.",
    "Rin wrote: 'The ceiling was always part of the map.'",
    "What spider learned to make elevated terrain part of its hunt?"
  ],
  "hints": [
    "Do not search only for a new species; the old one changed.",
    "Rin's note points toward a creature overhaul.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Araneo"
},
{
  "answer": "Giganotosaurus",
  "category": "creature",
  "lines": [
    "The old giant received a new reason to make survivors reconsider distance.",
    "Its name was already feared before the Council began rewriting its chapter.",
    "The largest answer is not always the correct one, but sometimes the old terror really is the clue.",
    "Heathen wrote: 'Some legends need no introduction.'",
    "Which apex carnivore remains one of ARK's classic giants?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Heathen's note points toward a classic ARK legend.",
    "Look among the major ASA creature TLC discussions.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Giganotosaurus"
},
{
  "answer": "Megalosaurus",
  "category": "creature",
  "lines": [
    "The cave keeps a predator that changes its patience when the sun is gone.",
    "The Council learned that darkness can be an advantage rather than a problem.",
    "One creature's strange schedule is itself a weapon.",
    "Wizard wrote: 'Night is not empty. It is permission.'",
    "What nocturnal predator turns darkness into strength?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Wizard's note points toward nighttime advantage.",
    "The final clue points toward the subject's most distinctive trait.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Megalosaurus"
},
{
  "answer": "Quetzalcoatlus",
  "category": "creature",
  "lines": [
    "The sky has had many rulers, but one can carry more than wings should permit.",
    "The Council measured its usefulness by what it can transport, not merely how high it flies.",
    "A platform turns flight into architecture.",
    "Brendon wrote: 'A bird becomes a base when the back is wide enough.'",
    "What giant flyer carries the idea of a moving platform?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Brendon's note points toward utility through size.",
    "The third clue narrows the era or Realm.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Quetzalcoatlus"
},
{
  "answer": "Thylacoleo",
  "category": "creature",
  "lines": [
    "The tree is not safe just because the ground is far below.",
    "The Council learned that some predators choose their ambush from above.",
    "A pounce can turn a familiar forest into a trap.",
    "Panda wrote: 'Never trust the branch that looks convenient.'",
    "What tree-climbing predator makes the canopy dangerous?"
  ],
  "hints": [
    "The clue points toward vertical hunting rather than speed.",
    "Panda's branch is the important word.",
    "The final clue points toward the subject's most distinctive trait.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 31,
  "notes": "Lore-rich ASA riddle • Thylacoleo"
},
{
  "answer": "Brontosaurus",
  "category": "creature",
  "lines": [
    "My footsteps are large enough to become weather in the imagination of a survivor.",
    "The Council once mistook my size for simplicity.",
    "A platform on my back turns patience into infrastructure.",
    "Rin wrote: 'The quiet giant is still a moving fortress.'",
    "What enormous herbivore can carry a tribe through the wilderness?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.'",
    "Rin's note points toward the platform saddle.",
    "The final clue points toward the subject's most distinctive trait.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Brontosaurus"
},
{
  "answer": "Plesiosaur",
  "category": "creature",
  "lines": [
    "The sea has monsters that resemble ships and ships that resemble monsters.",
    "My long neck breaks the silhouette that survivors expect from a marine giant.",
    "The Council's old sailors learned not to trust the shape beneath the waves.",
    "Doxo wrote: 'Count the neck, then count the teeth.'",
    "What marine reptile carries that impossible outline?"
  ],
  "hints": [
    "The neck is more useful than the word sea.",
    "Doxo's note points toward a long-necked marine predator.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 31,
  "notes": "Lore-rich ASA riddle • Plesiosaur"
},
{
  "answer": "Megalodon",
  "category": "creature",
  "lines": [
    "The oldest fear in the sea needs no platform and no armor.",
    "A single fin can turn an open ocean into a question.",
    "The Council has written its name for years, yet survivors still look twice.",
    "Heathen wrote: 'The first shark is never the last shark.'",
    "What classic predator made the ocean feel dangerous from the beginning?"
  ],
  "hints": [
    "The clue is deliberately simple; the history is the harder part.",
    "Heathen's note points toward the iconic ocean predator.",
    "The final clue points toward the subject's most distinctive trait.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Megalodon"
},
{
  "answer": "Compy",
  "category": "creature",
  "lines": [
    "A small creature can be dangerous by refusing to arrive alone.",
    "The Council learned that size is not the same as threat when several sets of teeth agree.",
    "One tiny survivor becomes a nuisance; a crowd becomes a riddle.",
    "Panda wrote: 'Count them before you laugh.'",
    "What little carnivore turns numbers into its weapon?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Panda's warning is about numbers.",
    "The final clue points toward the subject's most distinctive trait.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 31,
  "notes": "Lore-rich ASA riddle • Compy"
},
{
  "answer": "Carnotaurus",
  "category": "creature",
  "lines": [
    "The horns are obvious, which makes them the least interesting clue.",
    "A fast predator can make a straight path feel shorter than it is.",
    "The Council's old hunters called it a bull with teeth and regretted underestimating the comparison.",
    "Wizard wrote: 'The crown is on the nose.'",
    "What horned carnivore carries that strange crown?"
  ],
  "hints": [
    "Ignore the horns at first; think about the silhouette.",
    "Wizard's note points toward the facial horns.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Carnotaurus"
},
{
  "answer": "Therizinosaurus",
  "category": "creature",
  "lines": [
    "The forest contains a herbivore whose hands make the word harmless difficult to defend.",
    "The Council learned that gathering and fighting can share the same anatomy.",
    "Long claws became tools before they became a warning.",
    "Rin wrote: 'Never judge a vegetarian by the salad.'",
    "What strange herbivore makes its claws the center of the clue?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Rin's note points toward a herbivore with enormous claws.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 31,
  "notes": "Lore-rich ASA riddle • Therizinosaurus"
},
{
  "answer": "Rhyniognatha",
  "category": "creature",
  "lines": [
    "The sky can carry an insect large enough to make the word insect feel like a joke.",
    "Its brood begins in another creature, which makes the first clue misleading.",
    "The Council's breeders learned that the nursery can be more dangerous than the adult.",
    "Doxo wrote: 'The host is part of the story.'",
    "What giant insect turns parasitism into a chapter of ARK lore?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Doxo's note points toward unusual reproduction.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Rhyniognatha"
},
{
  "answer": "Oasisaur",
  "category": "creature",
  "lines": [
    "The desert contains something that behaves more like a sanctuary than a beast.",
    "Water, shade, and survival gather around a creature that looks like a moving landscape.",
    "The Council called it an oasis before they admitted it could walk.",
    "Heathen wrote: 'Bring thirst to the thing that defeats thirst.'",
    "What desert guardian carries an oasis on its back?"
  ],
  "hints": [
    "The word oasis is the strongest clue, but not the whole answer.",
    "Heathen's note points toward a creature that provides survival utility.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Oasisaur"
},
{
  "answer": "Rock Drake",
  "category": "creature",
  "lines": [
    "I climb where the ground gives up.",
    "I disappear where the eye expects a body.",
    "The Council learned that wings are unnecessary when stone itself becomes a road.",
    "Rin wrote: 'If the wall is the path, stop looking for stairs.'",
    "What Aberrant predator turns cliffs into roads?"
  ],
  "hints": [
    "Do not solve this as an ordinary flying creature.",
    "Rin's note points toward climbing and camouflage.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 31,
  "notes": "Lore-rich ASA riddle • Rock Drake"
},
{
  "answer": "Karkinos",
  "category": "creature",
  "lines": [
    "Two arms are not enough for the work I was asked to do.",
    "The Council's survivors learned to treat enemies and allies as equally liftable.",
    "In Aberration, a creature can be transport, weapon, and escape route at once.",
    "Panda wrote: 'When the road has claws, let it carry you.'",
    "What giant crustacean turns grabbing into utility?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Panda's note points toward grabbing rather than biting.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Karkinos"
},
{
  "answer": "Reaper",
  "category": "creature",
  "lines": [
    "The darkness gave birth to something that makes the word predator feel unfinished.",
    "The Council's records speak of implantation, birth, and a body that does not begin as your own.",
    "No ordinary taming story survives this clue.",
    "Wizard wrote: 'Some companions begin as consequences.'",
    "What Aberrant terror turns reproduction into a survival mechanic?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Wizard's note points toward implantation rather than eggs.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Reaper"
},
{
  "answer": "Basilisk",
  "category": "creature",
  "lines": [
    "The ground can hide a serpent, but the serpent can also hide from the ground.",
    "A survivor sees only a question mark until the sand decides to move.",
    "The Council filed this hunter beside creatures that make ordinary terrain unreliable.",
    "Heathen wrote: 'Watch the soil, not the horizon.'",
    "What Aberrant serpent makes the earth itself suspicious?"
  ],
  "hints": [
    "The clue points toward subterranean movement.",
    "Heathen's note says where to watch.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Basilisk"
},
{
  "answer": "Bulbdog",
  "category": "creature",
  "lines": [
    "A tiny light can be more valuable than a large weapon in a Realm without enough sun.",
    "The Council learned to carry illumination that can also sense danger.",
    "The glow is not decoration; it is information.",
    "Rin wrote: 'The smallest lantern may be the best warning.'",
    "What shoulder companion became an icon of Aberration survival?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Rin's note points toward a living source of light.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Bulbdog"
},
{
  "answer": "Featherlight",
  "category": "creature",
  "lines": [
    "I weigh little enough to ride a shoulder, but I reveal what the darkness wants hidden.",
    "The Council's survivors learned that light can be a form of scouting.",
    "A tiny glow can expose a much larger threat.",
    "Brendon wrote: 'The lantern has eyes.'",
    "What glowpet turns illumination into awareness?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Brendon's note points toward a light-producing shoulder pet.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Featherlight"
},
{
  "answer": "Shinehorn",
  "category": "creature",
  "lines": [
    "Two horns can make a creature look like a symbol before it ever becomes a companion.",
    "Its light is gentle until the Realm around it makes that gentleness important.",
    "The Council kept it close because darkness does not care how brave you are.",
    "Panda wrote: 'Carry the glow that cannot be stolen.'",
    "What Aberrant shoulder pet bears light on its horns?"
  ],
  "hints": [
    "The horns are not for combat.",
    "Panda's note points toward a glowpet.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Shinehorn"
},
{
  "answer": "Glowtail",
  "category": "creature",
  "lines": [
    "My name gives away the tail and hides the reason you need it.",
    "The Council values me because darkness has rules, and I can bend one of them.",
    "Small, bright, and almost easy to overlook, I became part of Aberration's survival language.",
    "Doxo wrote: 'The tail is the torch.'",
    "What glowpet carries light behind it?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Doxo's note points toward illumination in Aberration.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Glowtail"
},
{
  "answer": "Maewing",
  "category": "creature",
  "lines": [
    "I am not a bird, but the sky becomes easier to reach when I am around.",
    "I carry young, glide far, and make the word mammal unexpectedly useful.",
    "The Council's breeders learned that parenting can become transportation.",
    "Wizard wrote: 'The nursery learned to fly.'",
    "What creature turns gliding and childcare into one strange utility?"
  ],
  "hints": [
    "Do not solve this as a flying reptile.",
    "Wizard's note points toward carrying babies and gliding.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Maewing"
},
{
  "answer": "Shadowmane",
  "category": "creature",
  "lines": [
    "I can become less visible when the world expects me to be seen.",
    "The Council found a predator whose greatest weapon is sometimes the moment before the attack.",
    "A pride can appear where there was nothing a heartbeat earlier.",
    "Rin wrote: 'The shadow is not empty.'",
    "What Genesis creature makes stealth part of its identity?"
  ],
  "hints": [
    "The word shadow is more useful than the word mane.",
    "Rin's note points toward stealth and group behavior.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 31,
  "notes": "Lore-rich ASA riddle • Shadowmane"
},
{
  "answer": "Astrodelphis",
  "category": "creature",
  "lines": [
    "A creature from the sea can learn to chase the stars without leaving the survivor behind.",
    "The Council's Genesis records became very strange when dolphins started wearing technology.",
    "Space, speed, and saddle became one sentence.",
    "EmilioTheGreat wrote: 'Even the ocean has an orbit.'",
    "What Genesis companion turns a dolphin-like body into a spacefaring mount?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "EmilioTheGreat's note points toward the spaceborne version.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Astrodelphis"
},
{
  "answer": "Tek Stryder",
  "category": "creature",
  "lines": [
    "I look less like a dinosaur and more like a machine that remembered the shape of one.",
    "The Council did not tame me by throwing food at my mouth.",
    "Technology became a creature, and the creature became a tool for harvesting and building.",
    "Brendon wrote: 'The saddle is the least mechanical part.'",
    "What Genesis construct walks as a living machine?"
  ],
  "hints": [
    "Do not solve this as a normal tame.",
    "Brendon's note points toward a technological creature.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Tek Stryder"
},
{
  "answer": "Noglin",
  "category": "creature",
  "lines": [
    "The smallest creature in the room can become the most dangerous if the wrong mind belongs to it.",
    "The Council learned that possession can be more frightening than damage.",
    "A body may remain standing while its choices stop being its own.",
    "Doxo wrote: 'The thief does not steal the body.'",
    "What Genesis creature turns control itself into a weapon?"
  ],
  "hints": [
    "The clue is about control, not size.",
    "Doxo's note points toward mind manipulation.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Noglin"
},
{
  "answer": "Ferox",
  "category": "creature",
  "lines": [
    "A small companion can hide a much larger answer.",
    "The Council learned that size is not always a permanent property.",
    "One form looks harmless enough to invite trust; another makes that trust expensive.",
    "Panda wrote: 'Never solve the creature at its smallest.'",
    "What Genesis creature changes dramatically after consuming its strange resource?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Panda's warning points toward two forms.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 31,
  "notes": "Lore-rich ASA riddle • Ferox"
},
{
  "answer": "Managarmr",
  "category": "creature",
  "lines": [
    "I move through cold air as though the sky were a second ground.",
    "The Council records speak of freezing, dashing, and distance collapsing at once.",
    "A survivor can blink and discover the creature has crossed the battlefield.",
    "Heathen wrote: 'Do not measure the ice by footsteps.'",
    "What Extinction predator turns movement into a weapon?"
  ],
  "hints": [
    "The cold is only half the clue.",
    "Heathen's note points toward extraordinary mobility.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Managarmr"
},
{
  "answer": "Snow Owl",
  "category": "creature",
  "lines": [
    "The sky can heal while looking like it came to hunt.",
    "The Council learned that a predator's silhouette can hide a support role.",
    "Cold feathers and a restorative gift made one Extinction bird unusually valuable.",
    "Rin wrote: 'Not every dive is an attack.'",
    "What owl turns a frozen descent into aid?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Rin's note points toward healing rather than damage.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Snow Owl"
},
{
  "answer": "Gasbags",
  "category": "creature",
  "lines": [
    "I carry air because the air is the thing that carries me.",
    "The Council laughed at the shape until the wasteland made vertical travel important.",
    "A creature can be a balloon without being a machine.",
    "Wizard wrote: 'The sky is lighter than you think.'",
    "What Extinction creature turns stored gas into movement?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Wizard's note points toward a living gas-filled creature.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Gasbags"
},
{
  "answer": "Managarmr Ice Breath",
  "category": "ability",
  "lines": [
    "The first clue tells you what kind of thing you are seeking.",
    "It leaves the mouth and turns distance into a problem for whoever stands in its path.",
    "The Council's Extinction hunters learned that movement does not matter if the air itself becomes hostile.",
    "Heathen wrote: 'Run before the breath arrives.'",
    "What attack makes the Managarmr's breath a battlefield?"
  ],
  "hints": [
    "The clue describes an attack, not the creature.",
    "Heathen's warning points toward ranged freezing.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 31,
  "notes": "Lore-rich ASA riddle • Managarmr Ice Breath"
},
{
  "answer": "Armadoggo",
  "category": "lore",
  "lines": [
    "A dog arrived in a world of ruins and somehow became part of the survival plan.",
    "The Council expected loyalty; the wasteland demanded utility.",
    "A companion can carry a chapter of hope without changing the broken world around it.",
    "EmilioTheGreat wrote: 'Some heroes have paws.'",
    "What Wasteland War companion became a symbol of loyalty?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "EmilioTheGreat's note points toward a canine companion.",
    "The third clue narrows the era or Realm.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Armadoggo"
},
{
  "answer": "SIR-5rM8",
  "category": "lore",
  "lines": [
    "A robot can become part of the household without becoming the household.",
    "The Council's records describe chores, repairs, sorting, and harvesting rather than battles.",
    "The strangest part is that the helper can feel like a character in the story.",
    "Wizard wrote: 'The machine is useful because it remembers the boring things.'",
    "What Lost Colony companion handles routine work?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Wizard's note points toward automation.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • SIR-5rM8"
},
{
  "answer": "Cosmo Threat Sense",
  "category": "ability",
  "lines": [
    "The web is visible. The warning is not.",
    "A tiny companion can know that danger exists before the survivor understands why.",
    "The Council values information more than silk in the darkest places.",
    "Rin wrote: 'The best alarm is the one that speaks before the trap.'",
    "What Cosmo ability detects threats?"
  ],
  "hints": [
    "Do not answer with the web itself.",
    "Rin's note points toward information rather than movement.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Cosmo Threat Sense"
},
{
  "answer": "Pyromane Shoulder Form",
  "category": "ability",
  "lines": [
    "The larger body is only half the story.",
    "The other half fits where a survivor would normally carry a small companion.",
    "The Council learned that fire can be portable without becoming a torch.",
    "Panda wrote: 'Small does not mean harmless.'",
    "What form lets the Pyromane ride on a survivor's shoulder?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Panda's note points toward the smaller silhouette.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Pyromane Shoulder Form"
},
{
  "answer": "Elderclaw Forest Guardian",
  "category": "lore",
  "lines": [
    "The forest was never empty; it was merely waiting for a name.",
    "When the Council finally gave the guardian one, the trees seemed less like scenery.",
    "A creature can become a legend before it becomes a tame.",
    "Rin wrote: 'Some guardians belong to the story before they belong to you.'",
    "What Fantastic Tame was described as a supernatural forest guardian?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Rin's note points toward lore surrounding Elderclaw.",
    "Look to the Elderclaw Fantastic Tame release.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 31,
  "notes": "Lore-rich ASA riddle • Elderclaw Forest Guardian"
},
{
  "answer": "Grand Tortugar Saddle",
  "category": "item",
  "lines": [
    "The shell is not the whole answer; the equipment tells you what the creature is meant to carry.",
    "The Council's reward ledger places this saddle among Astraeos's harder-won prizes.",
    "A giant turtle can become more than a mount when the saddle changes the purpose.",
    "Brendon wrote: 'Build on the shell.'",
    "What special saddle belongs to the Grand Tortugar?"
  ],
  "hints": [
    "The creature and item are separate answers.",
    "Brendon's note points toward utility beyond riding.",
    "Look among Astraeos miniboss loot.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Grand Tortugar Saddle"
},
{
  "answer": "Ossidon Saddle",
  "category": "item",
  "lines": [
    "The Council's saddle ledger contains a name that sounds less like equipment and more like a forgotten god.",
    "It was not handed to survivors for merely taking a walk.",
    "Astraeos keeps rare saddles where minibosses keep their secrets.",
    "Doxo wrote: 'Some mounts must be earned twice.'",
    "What rare saddle shares its name with Ossidon?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Doxo's note points toward rare loot.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Ossidon Saddle"
},
{
  "answer": "Megaraptor Saddle",
  "category": "item",
  "lines": [
    "A new predator needs a new way to carry a survivor.",
    "The Council's saddle ledger grew another line when Valguero Ascended opened.",
    "The first clue tells you what kind of thing you are seeking.",
    "Heathen wrote: 'New claws deserve new leather.'",
    "What saddle belongs to the Megaraptor?"
  ],
  "hints": [
    "The creature's name is only half the answer.",
    "Heathen's note points toward equipment.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Megaraptor Saddle"
},
{
  "answer": "Fasolasuchus Saddle",
  "category": "item",
  "lines": [
    "The desert's hidden hunter eventually learned to carry more than its own hunger.",
    "The Council's crafting records distinguish ordinary riding from equipment built for a predator that does not stay on the surface.",
    "Rin wrote: 'The sand should not be the only thing that moves.'",
    "What equipment belongs to the Fasolasuchus?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Rin's note points toward a saddle.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Fasolasuchus Saddle"
},
{
  "answer": "Yi Ling Saddle",
  "category": "item",
  "lines": [
    "The creature that makes distance dangerous does not need a conventional saddle to make the Council nervous.",
    "Its equipment record is stranger because the rider and the weapon share the same silhouette.",
    "Wizard wrote: 'Do not strap a weapon to the hunter. The hunter already is one.'",
    "What equipment belongs to the feathered Aberrant predator?"
  ],
  "hints": [
    "The clue is deliberately about the relationship between rider and weapon.",
    "Wizard's note points toward a creature-specific saddle.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Yi Ling Saddle"
},
{
  "answer": "Dreadnoughtus Platform",
  "category": "item",
  "lines": [
    "A platform can be a floor, a fortress, or a warning.",
    "When the creature beneath it is built for Titans, the floor becomes part of the weapon.",
    "The Council's siege notes mention a mount whose back can carry more than a rider.",
    "Heathen wrote: 'Build the battlefield before the battle.'",
    "What platform equipment belongs to Dreadnoughtus?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Heathen's note points toward mobile infrastructure.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Dreadnoughtus Platform"
},
{
  "answer": "Shastasaurus Platform",
  "category": "item",
  "lines": [
    "The ocean has no floor where survivors want one, so the answer brings the floor with them.",
    "A creature becomes a base because its back becomes architecture.",
    "The Council's underwater builders stopped asking where to build.",
    "Brendon wrote: 'Bring the foundation.'",
    "What platform equipment makes Shastasaurus into mobile infrastructure?"
  ],
  "hints": [
    "The clue is about building rather than swimming.",
    "Brendon's note points toward a platform saddle.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Shastasaurus Platform"
},
{
  "answer": "Ragnarok Ascended",
  "category": "lore",
  "lines": [
    "An old Realm returned wearing a newer face.",
    "The mountains remembered themselves, but the archives gained new names.",
    "A bison, a giant bird, and a new boss all entered the same chapter.",
    "Panda wrote: 'Old maps can hide new handwriting.'",
    "What remastered Realm received those additions?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Panda's note points toward a remaster rather than a new world.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Ragnarok Ascended"
},
{
  "answer": "Valguero Ascended",
  "category": "lore",
  "lines": [
    "A familiar Realm returned with a memorial, new predators, strange golems, and a challenge that did not exist in the old records.",
    "The Council called the additions a new chapter rather than a new book.",
    "Brendon wrote: 'The valley remembers. The archive does not.'",
    "What remastered Realm opened that chapter?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Brendon's note points toward the Ascended remaster.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Valguero Ascended"
},
{
  "answer": "The Center Ascended",
  "category": "lore",
  "lines": [
    "An old name returned with a sea giant large enough to change what a base means.",
    "The Council's maps gained a new reason to measure the ocean.",
    "Rin wrote: 'The center is not the middle. It is what you build around.'",
    "Which remastered Realm received the Shastasaurus chapter?"
  ],
  "hints": [
    "The word center is deliberately not a geography lesson.",
    "Rin's note points toward the remastered map.",
    "Follow the Shastasaurus trail.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • The Center Ascended"
},
{
  "answer": "Extinction Ascended",
  "category": "lore",
  "lines": [
    "Ruins were not enough; the remaster brought a giant answer to the Titan problem.",
    "The Council's old apocalypse received a new chapter without becoming less apocalyptic.",
    "Heathen wrote: 'The end got larger.'",
    "Which remastered Realm received Dreadnoughtus?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Heathen's note points toward a remastered apocalypse.",
    "Follow the Dreadnoughtus trail.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Extinction Ascended"
},
{
  "answer": "Scorched Earth Ascended",
  "category": "lore",
  "lines": [
    "The desert returned with a predator that refused to remain visible.",
    "The Council's old thirst became a new reason to watch the ground.",
    "Doxo wrote: 'The sand remembers footsteps you cannot see.'",
    "Which remastered Realm received the buried hunter?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Doxo's note points toward the remastered desert.",
    "Follow the Fasolasuchus trail.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Scorched Earth Ascended"
},
{
  "answer": "Lost Colony",
  "category": "lore",
  "lines": [
    "The Council opened an archive where small dragons, strange companions, and unfinished stories could coexist.",
    "The name suggests absence, but the records are crowded.",
    "Rin wrote: 'What is lost is not always gone.'",
    "Which expansion chapter houses these newer companions?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Rin's note points toward the expansion's name and theme.",
    "The third clue narrows the era or Realm.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Lost Colony"
},
{
  "answer": "Bob's Tall Tales",
  "category": "lore",
  "lines": [
    "A survivor's story can become taller without becoming less true.",
    "Bob's name sits at the center of chapters that turn ordinary survival into something more personal.",
    "The Council keeps finding companions and machines in the margins.",
    "Wizard wrote: 'The witness became part of the tale.'",
    "What story series follows Bob through the new ARKs?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Wizard's note points toward the narrator at the center.",
    "The third clue narrows the era or Realm.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Bob's Tall Tales"
},
{
  "answer": "Abyssanthos Air Pockets",
  "category": "ability",
  "lines": [
    "The ocean usually asks a survivor to bring air.",
    "Here, the environment occasionally answers first.",
    "The Council's builders found rooms where the water did not completely win.",
    "Rin wrote: 'Breathe where the sea forgot to close.'",
    "What environmental feature makes Abyssanthos unusually buildable underwater?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Rin's note points toward breathable spaces.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Abyssanthos Air Pockets"
},
{
  "answer": "Burrowbuck Gateway Tunnel",
  "category": "ability",
  "lines": [
    "A road can be temporary and still be faster than a permanent one.",
    "The Council learned that distance can disappear if the entrance itself is hidden.",
    "The creature does not merely burrow; it changes where the journey begins.",
    "Doxo wrote: 'The shortest path is the one you open.'",
    "What Burrowbuck utility creates temporary travel tunnels?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Doxo's note points toward temporary routes.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 31,
  "notes": "Lore-rich ASA riddle • Burrowbuck Gateway Tunnel"
},
{
  "answer": "Burrowbuck Dust Cloud",
  "category": "ability",
  "lines": [
    "Sometimes the best defense is to make the pursuer doubt what they are seeing.",
    "A chase can end without a wall if the air becomes the wall.",
    "The Council recorded a cloud that belongs to a creature built around misdirection.",
    "Panda wrote: 'Confusion is a doorway too.'",
    "What Burrowbuck trick clouds the pursuit?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Panda's note points toward misdirection rather than distance.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Burrowbuck Dust Cloud"
},
{
  "answer": "Burrowbuck Hidden Hazard",
  "category": "ability",
  "lines": [
    "A trail can be a trap even when no one laid a visible one.",
    "The Council's scouts learned that retreat can leave danger behind.",
    "The creature's defense continues after it has already escaped.",
    "Heathen wrote: 'Leave them something to remember.'",
    "What concealed Burrowbuck trick punishes reckless pursuit?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Heathen's note points toward a hazard left behind.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Burrowbuck Hidden Hazard"
},
{
  "answer": "Boaratos Bleed",
  "category": "ability",
  "lines": [
    "The wound is not the whole attack; the attack teaches the wound to keep speaking.",
    "The Council's battle notes describe a fiery bruiser whose strength is not only impact.",
    "Astraeos gave a boar a reason to be feared after the first hit.",
    "Heathen wrote: 'The first strike is only the beginning.'",
    "What lingering effect belongs to Boaratos?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Heathen's note points toward damage that persists.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Boaratos Bleed"
},
{
  "answer": "Boaratos Charring",
  "category": "ability",
  "lines": [
    "The forest does not always fall cleanly.",
    "Sometimes the fire arrives before the tree does.",
    "The Council discovered that the same heat used in battle can make gathering strangely destructive.",
    "Panda wrote: 'Even lumber remembers fire.'",
    "What fiery utility lets Boaratos char vegetation?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Panda's note points toward gathering and fire.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Boaratos Charring"
},
{
  "answer": "Elderclaw Tame Trust",
  "category": "ability",
  "lines": [
    "The forest guardian does not ask for the usual bargain.",
    "A survivor must understand the creature before the creature accepts the survivor.",
    "The Council called this a taming ritual because 'taming' sounded simpler than the truth.",
    "Rin wrote: 'Trust is the resource.'",
    "What principle lies behind Elderclaw's unusual taming?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Rin's note points toward relationship rather than force.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 31,
  "notes": "Lore-rich ASA riddle • Elderclaw Tame Trust"
},
{
  "answer": "Megaraptor Pounce",
  "category": "ability",
  "lines": [
    "The ground becomes shorter when the hunter decides to cross it all at once.",
    "A large raptor does not need a long chase if the attack begins with a leap.",
    "The Council's Valguero notes warn against giving the predator a clean line.",
    "Wizard wrote: 'Distance is only real until it isn't.'",
    "What attack lets Megaraptor close the gap violently?"
  ],
  "hints": [
    "The clue is about movement becoming an attack.",
    "Wizard's note points toward a gap-closing move.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Megaraptor Pounce"
},
{
  "answer": "Deinonychus Cling",
  "category": "ability",
  "lines": [
    "A wall is not required when the enemy itself can become the wall.",
    "The Council's hunters learned to fight from a position that ordinary predators cannot maintain.",
    "The creature's claws turn another body into terrain.",
    "Heathen wrote: 'The target is the perch.'",
    "What Deinonychus trick lets it cling to larger creatures?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Heathen's note points toward using the target as terrain.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Deinonychus Cling"
},
{
  "answer": "Yi Ling Feather Volley",
  "category": "ability",
  "lines": [
    "One feather is a clue. Many feathers are a sentence.",
    "The Council learned that distance can be filled with pieces of the hunter itself.",
    "Aberration's darkness gave the sky a new kind of ammunition.",
    "Doxo wrote: 'The flock is the weapon.'",
    "What ranged attack sends Yi Ling's feathers outward?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Doxo's note points toward a grouped projectile attack.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Yi Ling Feather Volley"
},
{
  "answer": "Shastasaurus Platform Building",
  "category": "ability",
  "lines": [
    "A creature becomes architecture when survivors stop thinking of it as transportation.",
    "The Council's underwater builders carry foundations where foundations should not exist.",
    "The sea giant's greatest trick may be what happens on its back.",
    "Brendon wrote: 'The floor moves because the world beneath it does.'",
    "What Shastasaurus utility lets survivors build upon its platform?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Brendon's note points toward construction on a living platform.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 31,
  "notes": "Lore-rich ASA riddle • Shastasaurus Platform Building"
},
{
  "answer": "Dreadnoughtus Anti-Titan Roar",
  "category": "ability",
  "lines": [
    "The first clue tells you what kind of thing you are seeking.",
    "It is a command delivered as sound to something that should not have to listen.",
    "The Council's Titan records changed after the roar was documented.",
    "EmilioTheGreat wrote: 'Make the giant answer the giant.'",
    "What Dreadnoughtus roar interferes with Titan protection?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "EmilioTheGreat's note points toward one giant countering another.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Dreadnoughtus Anti-Titan Roar"
},
{
  "answer": "Cosmo Web Line",
  "category": "ability",
  "lines": [
    "A thread becomes a road only when someone believes it can hold the distance.",
    "The Council's smallest companion creates one of the strangest traversal tools in the archives.",
    "A wall, a gap, or a ledge can all become negotiable.",
    "Rin wrote: 'The line is the bridge.'",
    "What Cosmo utility creates a web line for traversal?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Rin's note points toward a fired or placed web line.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Cosmo Web Line"
},
{
  "answer": "Cosmo Web Shot",
  "category": "ability",
  "lines": [
    "The projectile is not metal, and the launcher is not a weapon.",
    "A tiny companion can fire the beginning of a route.",
    "The Council stopped laughing when the route crossed a gap.",
    "Panda wrote: 'Silk travels farther than feet.'",
    "What Cosmo action sends webbing outward?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Panda's note points toward ranged webbing.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Cosmo Web Shot"
},
{
  "answer": "Araneo Web Traverse",
  "category": "ability",
  "lines": [
    "The spider was once expected to stay close to the ground.",
    "Then the walls became roads and the ceiling became an ambush point.",
    "The Council's TLC changed not just damage, but geography.",
    "Wizard wrote: 'The old spider found a third dimension.'",
    "What Araneo movement uses webs and elevated terrain?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Wizard's note points toward the TLC's traversal changes.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Araneo Web Traverse"
},
{
  "answer": "Valguero Memorial Entries",
  "category": "lore",
  "lines": [
    "The monument has names, but the names do not have to be ancient.",
    "The Council gave server keepers the power to decide who the memorial remembers.",
    "A list became part of the world itself.",
    "Brendon wrote: 'The living can edit the names of the remembered.'",
    "What server setting controls the names displayed on Valguero's memorial?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Brendon's note points toward administrator-controlled names.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 31,
  "notes": "Lore-rich ASA riddle • Valguero Memorial Entries"
},
{
  "answer": "Astraeos Ocean Wave Physics",
  "category": "lore",
  "lines": [
    "The sea does not always behave like a painted surface.",
    "Astraeos gave the water motion of its own, making ships and shores feel less fixed.",
    "The Council's cartographers learned that the ocean could become part of the terrain.",
    "Doxo wrote: 'The map moves without moving.'",
    "What Astraeos system changed how its ocean behaves?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Doxo's note points toward dynamic water behavior.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Astraeos Ocean Wave Physics"
},
{
  "answer": "Astraeos Boss Terminal",
  "category": "item",
  "lines": [
    "The Council built a doorway that does not look like a doorway.",
    "It stands where preparation becomes confrontation.",
    "A boss terminal is less interesting as furniture than as a promise.",
    "Wizard wrote: 'The machine is the question. The arena is the answer.'",
    "What Astraeos structure begins the path toward its boss encounters?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Wizard's note points toward a terminal used for boss content.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Astraeos Boss Terminal"
},
{
  "answer": "Astral Direwolf",
  "category": "creature",
  "lines": [
    "The old wolf learned a new vocabulary of stars.",
    "The Council did not file it beside ordinary predators because its loot tells a different story.",
    "Its body is familiar; its purpose in the archive is not.",
    "Rin wrote: 'Some wolves hunt for things that are not meat.'",
    "What Astraeos creature carries an astral identity and cave-loot purpose?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Rin's note points toward the astral variant.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 31,
  "notes": "Lore-rich ASA riddle • Astral Direwolf"
},
{
  "answer": "Astral Mammoth",
  "category": "creature",
  "lines": [
    "A giant herbivore became part of a strange reward ecosystem.",
    "The Council's ice records mention a mammoth whose identity begins with the stars.",
    "Its size is old; its astral nature is new.",
    "Panda wrote: 'The biggest clue is the smallest word.'",
    "What astral giant mammoth joined Astraeos?"
  ],
  "hints": [
    "The word 'astral' matters more than the word mammoth.",
    "Panda's note points toward the prefix.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Astral Mammoth"
},
{
  "answer": "Astral Megalodon",
  "category": "creature",
  "lines": [
    "The sea already had a famous hunter; the stars gave it another name.",
    "The Council's underwater loot records distinguish the familiar from the astral.",
    "A fin can be ancient and still become a new clue.",
    "Doxo wrote: 'The ocean has constellations too.'",
    "What astral shark appears in Astraeos's waters?"
  ],
  "hints": [
    "Do not answer with the ordinary giant shark.",
    "Doxo's note points toward the astral variant.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Astral Megalodon"
},
{
  "answer": "Astral Mosasaurus",
  "category": "creature",
  "lines": [
    "The old sea predator grew a new title without shrinking its appetite.",
    "The Council's deepest records mark an astral version among rare underwater threats.",
    "Its silhouette is familiar enough to fool someone who reads too quickly.",
    "Heathen wrote: 'Read the first word, not the last.'",
    "What astral marine giant is hidden in that instruction?"
  ],
  "hints": [
    "The important clue is the prefix.",
    "Heathen's note points toward a named variant.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Astral Mosasaurus"
},
{
  "answer": "Astral Tusoteuthis",
  "category": "creature",
  "lines": [
    "The sea's oldest grasping shadow learned a celestial name.",
    "The Council already feared the arms; the stars merely made the file stranger.",
    "A survivor who sees the silhouette may solve the species but miss the answer.",
    "Wizard wrote: 'The tentacles are old. The adjective is not.'",
    "What astral cephalopod haunts Astraeos?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Wizard's note points toward the variant name.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Astral Tusoteuthis"
},
{
  "answer": "Astral Deinosuchus",
  "category": "creature",
  "lines": [
    "A river predator can become a myth without leaving the water.",
    "The Council's astral records add a celestial prefix to an ancient ambush.",
    "The jaws are ordinary enough to be the wrong clue.",
    "Rin wrote: 'The third clue narrows the era, Realm, or context.'",
    "What astral crocodilian appears in Astraeos?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Rin's note points toward the prefix.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Astral Deinosuchus"
},
{
  "answer": "Genesis Ocean",
  "category": "map",
  "lines": [
    "The ocean is no longer merely a border when islands appear inside it like stepping stones.",
    "The Council's Genesis records describe a maritime chapter where ships and procedural islands change the rhythm of exploration.",
    "Bob's story learned to travel by water.",
    "Brendon wrote: 'The map became a voyage.'",
    "What biome becomes the defining stage of the Genesis Part 1 remaster?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Brendon's note points toward the maritime redesign.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Genesis Ocean"
},
{
  "answer": "Pirate Camps",
  "category": "challenge",
  "lines": [
    "A camp can be a trap, a shop, or both.",
    "The Council learned that not every occupied outpost wants the same thing from a survivor.",
    "Some camps fight. Some trade. The uncertainty is part of the voyage.",
    "Panda wrote: 'Ask before you swing.'",
    "What Genesis ocean encounters scatter across the islands?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Panda's note points toward the difference between hostile and friendly camps.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Pirate Camps"
},
{
  "answer": "Market Camp",
  "category": "challenge",
  "lines": [
    "The safest camp is not necessarily empty of pirates.",
    "A stranger may offer goods where another would offer a fight.",
    "The Council's sailors learned that survival sometimes begins with asking a price.",
    "Rin wrote: 'Not every flag means war.'",
    "What neutral outpost offers discounted goods in the Genesis ocean?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Rin's note points toward neutral merchants.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Market Camp"
},
{
  "answer": "Chained Megachelon",
  "category": "challenge",
  "lines": [
    "A giant turtle can become an island, but chains change the story.",
    "The Council found a creature that looks like a shelter trapped in a problem.",
    "The clue is not simply the animal; it is the condition written beside its name.",
    "Heathen wrote: 'Free the giant before you admire it.'",
    "What Genesis ocean encounter is built around a chained Megachelon?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Heathen's note points toward the chained condition.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Chained Megachelon"
},
{
  "answer": "Brimstone Bay",
  "category": "map",
  "lines": [
    "A bay can sound peaceful until the name begins to burn.",
    "The Council's Genesis records use the word brimstone where sailors expected salt.",
    "The shoreline is only half the clue; the name itself remembers fire.",
    "Doxo wrote: 'Some coasts smell like the underworld.'",
    "What Genesis Ocean location carries that sulfurous name?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Doxo's note points toward the name's infernal meaning.",
    "Look among the Genesis Ocean named areas.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Brimstone Bay"
},
{
  "answer": "Market Port",
  "category": "map",
  "lines": [
    "A port is where journeys pause, but this one also changes what survivors can buy.",
    "The Council's sailors marked it as a place of trade rather than conquest.",
    "The clue is commerce hidden inside a maritime chapter.",
    "Wizard wrote: 'A harbor can be a weapon against scarcity.'",
    "What Genesis Ocean location serves as a market port?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Wizard's note points toward trade and travel.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Market Port"
},
{
  "answer": "Helianthos Plains",
  "category": "map",
  "lines": [
    "Flowers and peaceful creatures sound like a clue with no teeth.",
    "That is precisely why the Council marked the plains as unusual.",
    "A harsh world can hide a quiet chapter without becoming gentle.",
    "Panda wrote: 'Peace is still a landmark.'",
    "What Astraeos landscape is known for flower-filled plains?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Panda's note points toward a peaceful landscape.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Helianthos Plains"
},
{
  "answer": "Astraeos Wyvern Cave",
  "category": "challenge",
  "lines": [
    "The cave was not content with being a cave.",
    "The Council's records mention mesh, water, and missing pieces before they mention the creatures inside.",
    "A place can become lore through the things survivors discover are wrong with it.",
    "Brendon wrote: 'The hole is part of the story.'",
    "What Astraeos location became known among the Realm's cave records?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Brendon's note points toward a cave with its own history.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 31,
  "notes": "Lore-rich ASA riddle • Astraeos Wyvern Cave"
},
{
  "answer": "Astraeos Artifact Caves",
  "category": "challenge",
  "lines": [
    "Five doors beneath one Realm ask five different questions.",
    "The Council did not place the artifacts where a casual traveler would expect them.",
    "The caves are not merely scenery; they are pieces of the path to ascension.",
    "Rin wrote: 'Five relics, five ways to get lost.'",
    "What Astraeos exploration feature hides five new artifact caves?"
  ],
  "hints": [
    "The number five is the clue to the feature, not a random count.",
    "Rin's note points toward artifact hunting.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Astraeos Artifact Caves"
},
{
  "answer": "Rhyniognatha Drone Nest Cave",
  "category": "challenge",
  "lines": [
    "The nest is not the creature, and the cave is not merely a cave.",
    "The Council found a place where the word drone changes the meaning of the nursery.",
    "A survivor who enters expecting stone may leave remembering wings.",
    "Doxo wrote: 'The hive has a doorway.'",
    "What Astraeos cave hides a Rhyniognatha drone nest?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Doxo's note points toward a specialized cave.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Rhyniognatha Drone Nest Cave"
},
{
  "answer": "Astraeos Lightning Giga",
  "category": "creature",
  "lines": [
    "The old giant already carried enough fear without weather joining the file.",
    "Then the Council recorded a version whose identity begins with a storm.",
    "A Legendary OSD may now ask a much larger question.",
    "Heathen wrote: 'When the sky joins the Giga, leave the ground.'",
    "What lightning-charged giant can appear in Astraeos's highest OSDs?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Heathen's note points toward an elemental version.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Astraeos Lightning Giga"
},
{
  "answer": "Legendary OSD",
  "category": "challenge",
  "lines": [
    "The drops are not the only thing that makes this defense legendary.",
    "The enemies can include creatures survivors normally prepare to avoid rather than invite.",
    "The Council calls the difficulty by a word that also means myth.",
    "Wizard wrote: 'If the reward sounds ordinary, you have not survived long enough.'",
    "What Astraeos defense tier carries the highest title?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Wizard's note points toward the name of the tier.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Legendary OSD"
},
{
  "answer": "Astraeos OSD",
  "category": "challenge",
  "lines": [
    "The wasteland taught survivors to defend machines while waves came for them.",
    "Astraeos borrowed the idea and filled it with a stranger collection of enemies.",
    "The Council's defenders watch the horizon and the reward table at the same time.",
    "Panda wrote: 'Protect the box. Read the loot later.'",
    "What defense activity received a custom Astraeos version?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Panda's note points toward waves around a protected objective.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Astraeos OSD"
},
{
  "answer": "Astraeos Miniboss Loot",
  "category": "item",
  "lines": [
    "The Council does not hand every prize to the survivor who simply finds it.",
    "Some rewards wait behind creatures whose names sound like myths.",
    "Saddles, souls, and strange coins can all emerge from the same ledger.",
    "Wizard wrote: 'The chest is the final clue.'",
    "What reward pool gathers rare Astraeos miniboss prizes?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Wizard's note points toward rewards from special encounters.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Astraeos Miniboss Loot"
},
{
  "answer": "Astraeos Grand Tortugar Saddle Loot",
  "category": "item",
  "lines": [
    "A shell can hide a treasure until the right battle has been won.",
    "The Council's loot records place one giant turtle saddle among miniboss rewards.",
    "The clue is equipment earned through combat rather than simply crafted from a blueprint.",
    "Heathen wrote: 'The turtle guards its own saddle.'",
    "What rare loot item belongs to the Grand Tortugar?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Heathen's note points toward miniboss loot.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 31,
  "notes": "Lore-rich ASA riddle • Astraeos Grand Tortugar Saddle Loot"
},
{
  "answer": "Bob's True Tales",
  "category": "lore",
  "lines": [
    "The name sounds like a continuation, but the story is not content to remain behind.",
    "Bob's next chapter carries the survivor toward an ocean of islands, ships, and older secrets.",
    "The Council has begun filing future voyages under a new title.",
    "Rin wrote: 'The tale is still moving.'",
    "What continuation follows Bob and Meeka toward the Evercave?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Rin's note points toward the next chapter of Bob's journey.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Bob's True Tales"
},
{
  "answer": "Tides of Fortune",
  "category": "lore",
  "lines": [
    "The ocean became more than a biome when the story itself learned to sail.",
    "Ships, fortresses, randomized islands, and a search for an ancient secret all share one title.",
    "The Council calls it fortune because the sea refuses to reveal everything at once.",
    "Doxo wrote: 'Some maps are voyages disguised as chapters.'",
    "What Bob's True Tales chapter turns Genesis into a maritime adventure?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Doxo's note points toward a maritime expansion.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Tides of Fortune"
},
{
  "answer": "Evercave",
  "category": "lore",
  "lines": [
    "The name sounds like a place that should have been found already.",
    "Instead, it waits at the end of a journey involving Bob, Meeka, and secrets buried by time.",
    "The Council's map has a blank where the story insists there is something.",
    "EmilioTheGreat wrote: 'Some caves are destinations, not holes.'",
    "What ancient destination are Bob and Meeka seeking?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "EmilioTheGreat's note points toward a named story location.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Evercave"
},
{
  "answer": "Concavenator",
  "category": "creature",
  "lines": [
    "The Council's new bestiary contains a predator whose name sounds like geometry before it sounds like teeth.",
    "Its arrival crossed several Realms, making the answer less about one map and more about a new chapter in ASA's creature roster.",
    "Wizard wrote: 'A strange name can travel farther than a strange beast.'",
    "What ARK: Additions creature officially joined ASA?"
  ],
  "hints": [
    "The unusual name is the strongest clue.",
    "Wizard's note points toward an official ASA creature addition.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Concavenator"
},
{
  "answer": "Acrocanthosaurus",
  "category": "creature",
  "lines": [
    "The longer the battle lasts, the less comfortable the opponent becomes.",
    "Injury does not merely weaken this giant; it can become momentum.",
    "The Council filed the creature under frontline power rather than fragile speed.",
    "Heathen wrote: 'Do not mistake wounded for finished.'",
    "What ARK: Additions giant turns punishment into escalation?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Heathen's note points toward resilience and momentum.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Acrocanthosaurus"
},
{
  "answer": "Therizinosaurus TLC",
  "category": "lore",
  "lines": [
    "The creature already had a reputation, but the Council decided the old chapter was not finished.",
    "A classic herbivore can become new again without changing its name.",
    "The archive calls this kind of return a TLC.",
    "Panda wrote: 'Sometimes the old pages need sharper ink.'",
    "What classic ARK creature received a later TLC in ASA?"
  ],
  "hints": [
    "The first clue tells you what kind of thing you are seeking.",
    "Panda's note points toward a TLC rather than a release.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the subject's most distinctive trait."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Therizinosaurus TLC"
},
{
  "answer": "Cerberax",
  "category": "creature",
  "lines": [
    "Three heads should be enough to solve almost any riddle, which is why the Council refuses to stop there.",
    "The name belongs to a Fantastic Tame whose identity is built around a mythic shape.",
    "Wizard wrote: 'The number is only the beginning.'",
    "What three-headed companion entered ASA's Fantastic Tames?"
  ],
  "hints": [
    "Three is the obvious clue; the myth is the lock.",
    "Wizard's note points toward a multi-headed Fantastic Tame.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the three-headed Fantastic Tame."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Cerberax"
},
{
  "answer": "Gargantar",
  "category": "creature",
  "lines": [
    "The Council discovered that some creatures solve problems by swallowing them.",
    "The name sounds enormous because the creature's appetite agrees.",
    "A survivor who sees the mouth first may miss the strange utility behind it.",
    "Doxo wrote: 'Some answers disappear inside the answer.'",
    "What Fantastic Tame is known for its enormous swallowing trick?"
  ],
  "hints": [
    "The mouth is the clue, but the name is not simply 'giant.'",
    "Doxo's note points toward an unusual consumption ability.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the Fantastic Tame whose appetite is part of its mystery."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Gargantar"
},
{
  "answer": "Fjördür Ascended",
  "category": "map",
  "lines": [
    "The north keeps a name written with a strange letter, and the Council keeps an even stranger prophecy beside it.",
    "A free remaster is planned to arrive with another community-voted creature.",
    "The map is not yet the answer's full story; its arrival is.",
    "Rin wrote: 'Some realms are clues before they are doors.'",
    "What future Ascended Realm is scheduled as the next free remaster?"
  ],
  "hints": [
    "The answer concerns a future map release rather than a current creature.",
    "Rin's note points toward the roadmap.",
    "The third clue narrows the era, Realm, or context.",
    "The final clue points toward the northern Realm named in the roadmap."
  ],
  "reward": 28,
  "notes": "Lore-rich ASA riddle • Fjördür Ascended"
}
];

let shuffleBag: number[] = [];
let recentCategories: RiddleCategory[] = [];

function normalizeHintText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function hintsAreSafe(seed: RiddleSeed): boolean {
  const answer = normalizeHintText(seed.answer);
  return Boolean(answer) && seed.hints.length > 0 && seed.hints.every((hint) => {
    const text = normalizeHintText(hint);
    return !text.includes(answer);
  });
}

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
    if (!used.has(candidate.answer.trim().toLowerCase()) && hintsAreSafe(candidate)) {
      seed = candidate;
      break;
    }
  }

  // If the persistent archive has exhausted the catalog, allow a new cycle.
  if (!seed) {
    for (let i = 0; i < RIDDLES.length; i += 1) {
      const candidate = await chooseSeed();
      if (hintsAreSafe(candidate)) {
        seed = candidate;
        break;
      }
    }
  }
  if (!seed) throw new Error("No riddle with safe hints is available.");

  return {
    question: seed.lines.join("\n"),
    answer: seed.answer,
    hint: JSON.stringify(seed.hints),
    reward: seed.reward,
    notes: "Local Arcane Scribe • " + seed.notes
  };
}
