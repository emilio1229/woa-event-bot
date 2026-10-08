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
    answer: "Fasolasuchus",
    lines: ["The sand does not always move because of wind.\nI arrive beneath the desert without asking the surface for permission.\nDeathworms once ruled this particular fear, until something older-looking learned to hunt from below.\nMy ambush begins where your eyes insist there is nothing worth watching.\nScorched Earth hides its answer under the answer you expected."],
    hints: ["Scorched Earth Ascended","The official ASA creature added to Scorched Earth","Think beyond Deathworms and look for the new sand ambusher.","Scorched Earth"],
    reward: 28,
    notes: "ASA-focused riddle • Fasolasuchus"
  },
  {
    answer: "Shastasaurus",
    lines: ["I am a mountain that chose the ocean.\nThe sea is not my prison; it is my road, my weapon, and my cargo hold.\nSomething inside me can turn a survivor's view of the deep completely around.\nI answer to no shoreline, yet tribes can build their ambitions upon me.\nThe Center keeps its largest secret where the surface cannot follow."],
    hints: ["The Center","The new aquatic creature added to The Center Ascended","Look for the creature that can become an underwater vessel.","The Center Ascended"],
    reward: 29,
    notes: "ASA-focused riddle • Shastasaurus"
  },
  {
    answer: "Yi Ling",
    lines: ["I do not need wings to make a wall feel temporary.\nThe darkness of Aberration taught me to turn height into ammunition.\nMy feathers are not decoration, and the distance between me and my target is part of the clue.\nI am small enough to underestimate and strange enough to punish that mistake.\nThe ceiling is safer than the ground only if you understand why."],
    hints: ["Aberration","The new Aberration creature known for ranged feather attacks and mobility","Think of the feathered creature added specifically to Aberration Ascended.","Aberration Ascended"],
    reward: 28,
    notes: "ASA-focused riddle • Yi Ling"
  },
  {
    answer: "Gigantoraptor",
    lines: ["I am built around a nest, but the nest is not where my story ends.\nThe young matter more than the trophy.\nA giant bird can be terrifying without ever needing to be the fastest thing in the sky.\nI teach a survivor that raising another creature can be a form of combat preparation.\nRagnarok received a new guardian whose greatest clue is what it protects."],
    hints: ["Ragnarok","The community-voted creature added to Ragnarok Ascended","Think about a huge bird whose special value involves raising and caring for babies.","Ragnarok Ascended"],
    reward: 28,
    notes: "ASA-focused riddle • Gigantoraptor"
  },
  {
    answer: "Dreadnoughtus",
    lines: ["The Titan is not my enemy because I am larger.\nIt is my enemy because I was built to make something enormous regret approaching.\nMy body carries a battlefield, but my voice carries the stranger clue.\nWhen I call, technology that should be untouchable suddenly becomes vulnerable.\nExtinction did not give survivors another mount. It gave them an answer to the Titans."],
    hints: ["Extinction","The community-voted titan hunter added to Extinction Ascended","Think of the giant sauropod-like creature with anti-Titan utility.","Extinction Ascended"],
    reward: 30,
    notes: "ASA-focused riddle • Dreadnoughtus"
  },
  {
    answer: "Megaraptor",
    lines: ["I look like the answer to a question that should have ended millions of years ago.\nThen the answer runs faster than expected.\nValguero's newest predator does not need a supernatural name to be dangerous.\nIts clue is hidden in the word 'raptor'—not because it is familiar, but because it changes what familiar means.\nThe memorial remembers survivors; I remind them that the wild remembers nothing."],
    hints: ["Valguero","The new tameable predator added to Valguero Ascended","Think of the large new raptor-like predator released with Valguero Ascended.","Valguero Ascended"],
    reward: 29,
    notes: "ASA-focused riddle • Megaraptor"
  },
  {
    answer: "Elderclaw",
    lines: ["The forest guardian is not old because of its name.\nIt is old because the Realm behaves differently when it notices you.\nI am not a dinosaur, yet the Council records me beside them because the wild has room for stranger things.\nMy claws are only half the clue; the other half is the forest itself.\nWhen Valguero became Ascended, something ancient walked into more than one Realm."],
    hints: ["Valguero, Aberration, Extinction, Ragnarok, The Center","The supernatural Fantastic Tame added alongside Valguero Ascended","Think beyond prehistoric animals and toward the forest guardian.","Lost Colony / Fantastic Tames"],
    reward: 28,
    notes: "ASA-focused riddle • Elderclaw"
  },
  {
    answer: "Pyromane",
    lines: ["Fire is not my attack. Fire is my second shape.\nA predator becomes a companion without forgetting what it was.\nThe strange clue is that I can make the environment around me part of the answer.\nI was introduced as a creature unlike the ordinary ARK bestiary, yet I still had to earn a place among survivors.\nFind the tame whose smallest form can ride where a normal shoulder pet would."],
    hints: ["The Center and other official maps","The first ARK Fantastic Tame","Think of the paid fantasy creature that can shift between a larger predator form and a shoulder-mounted form.","Fantastic Tames"],
    reward: 28,
    notes: "ASA-focused riddle • Pyromane"
  },
  {
    answer: "Cosmo",
    lines: ["I am tiny, but my thread can cross a room before the danger does.\nAberration made darkness a problem; I answer by making a line through it.\nI live near the shoulder, yet my usefulness is measured by where I can send you.\nThe clue is not the spider. The clue is what the spider spins for the survivor.\nSome of the best tools in a strange Realm look harmless until the first gap appears."],
    hints: ["Aberration","The new shoulder pet introduced with Aberration Ascended","Think of the small spider companion that creates useful web lines.","Aberration Ascended"],
    reward: 26,
    notes: "ASA-focused riddle • Cosmo"
  },
  {
    answer: "Deinonychus",
    lines: ["I am not the largest predator in the valley, which is exactly why my answer is easy to miss.\nI climb a body larger than myself and make size an unreliable defense.\nOne creature becomes a battlefield when several small hunters decide to share it.\nMy claws are obvious; my patience is not.\nValguero hides a lesson about how a pack can make mass irrelevant."],
    hints: ["Valguero","A Valguero creature now remastered in ASA","Think of the climbing pack predator that attacks larger creatures from their bodies.","Valguero Ascended"],
    reward: 26,
    notes: "ASA-focused riddle • Deinonychus"
  },
  {
    answer: "Aberrant Oviraptor",
    lines: ["The egg thief became something the caves could recognize.\nI am not merely a familiar creature painted in strange colors.\nAberration changed the rules around me, and the clue is in what I seek.\nMy greatest talent is not fighting; it is persuading a nest to reveal what it knows.\nWhen the Realm changes, even an old species can become a new mystery."],
    hints: ["Aberration","A remastered/new Aberrant variant in ASA","Think of the egg-focused creature found in Aberration Ascended.","Aberration Ascended"],
    reward: 25,
    notes: "ASA-focused riddle • Aberrant Oviraptor"
  },
  {
    answer: "Aberrant Gigantoraptor",
    lines: ["A giant bird entered a Realm where light itself is a resource.\nI carry a familiar shape into an unfamiliar ecosystem.\nMy young are important, but the cave is the part that makes the answer difficult.\nOne clue says 'bird.' Another says 'Aberration.' The answer is where those clues collide.\nThe same strange Realm can rewrite a creature without changing its ancestry."],
    hints: ["Aberration","The Aberrant variant of Gigantoraptor added in ASA","Think of the new giant bird's Aberrant form.","Aberration Ascended"],
    reward: 27,
    notes: "ASA-focused riddle • Aberrant Gigantoraptor"
  },
  {
    answer: "Aberrant Fasolasuchus",
    lines: ["The desert hunter went somewhere it had no business surviving.\nIts old home was sand, but the new clue is glow and stone.\nI still know how to ambush, yet the Realm has changed the rules around the ambush.\nA creature can be recognizable and still become a different riddle.\nAberration keeps proof that evolution is not the only thing that can make a creature strange."],
    hints: ["Aberration","The Aberrant Fasolasuchus variant listed with Aberration Ascended","Think of the Scorched Earth creature wearing Aberration's ecosystem.","Aberration Ascended"],
    reward: 27,
    notes: "ASA-focused riddle • Aberrant Fasolasuchus"
  },
  {
    answer: "Grendel",
    lines: ["I am not a creature you tame. I am a question you fight.\nValguero's memorial can remember the dead, but I am what waits when the living ask for proof.\nMy name sounds like a monster from an old story because that is exactly the kind of name a boss should have.\nThe arena matters as much as the enemy.\nFind the new challenge that arrived with Valguero Ascended."],
    hints: ["Valguero","The new Valguero Ascended boss","Think of the boss encounter introduced with Valguero Ascended.","Valguero Ascended"],
    reward: 29,
    notes: "ASA-focused riddle • Grendel"
  },
  {
    answer: "Ice Golem",
    lines: ["Stone should not breathe, and ice should not walk.\nValguero has little patience for that distinction.\nMy body looks like a structure until the structure decides to move.\nHeat is not the obvious answer; what matters is that the creature is built from the landscape.\nThe clue is a creature that feels like a resource node until it starts hunting."],
    hints: ["Valguero","A new tameable creature variant added with Valguero Ascended","Think of the elemental golem found in the Valguero expansion.","Valguero Ascended"],
    reward: 27,
    notes: "ASA-focused riddle • Ice Golem"
  },
  {
    answer: "Chalk Golem",
    lines: ["The mountain learned to walk, but it did not learn to forget where it came from.\nMy body looks like terrain because terrain is exactly the disguise.\nA survivor sees a cliff. Then the cliff sees the survivor.\nThe trick is not the material alone; it is the fact that the material becomes the creature.\nValguero has more than dinosaurs hiding in plain sight."],
    hints: ["Valguero","A new tameable creature variant added with Valguero Ascended","Think of the pale elemental golem added alongside the Ice Golem.","Valguero Ascended"],
    reward: 27,
    notes: "ASA-focused riddle • Chalk Golem"
  },
  {
    answer: "Armadoggo",
    lines: ["I am proof that a good dog can survive a world that should not contain one.\nI do not need to be a dinosaur to belong beside the survivors.\nMy strangest clue is that the wasteland becomes less lonely when I arrive.\nBob did not build a weapon. He found a companion that can do far more than look loyal.\nThe question is simple: what is the goodest creature in the ruins?"],
    hints: ["Extinction","The companion creature added with Bob's Tall Tales: Wasteland War","Think of the canine companion introduced with Extinction Ascended's Wasteland War.","Bob's Tall Tales"],
    reward: 25,
    notes: "ASA-focused riddle • Armadoggo"
  },
  {
    answer: "Cosmo's Web",
    lines: ["I am not a rope, but I can become a path.\nI am not a weapon, but I can change a fight before it starts.\nThe creature that makes me is smaller than the gap I help you cross.\nAberration survivors learned that a line can be more valuable than a wall.\nFind the tool made from the tiny spider's strange talent."],
    hints: ["Aberration","A utility created by Cosmo","Think of the web line produced by the new Aberration shoulder pet.","Cosmo"],
    reward: 25,
    notes: "ASA-focused riddle • Cosmo's Web"
  },
  {
    answer: "Fasolasuchus Egg",
    lines: ["The desert hunter begins as something that cannot hunt.\nA shell hides the answer until the survivor learns which creature laid it.\nThe clue is not simply 'egg'; it is the egg of the new predator that changed Scorched Earth.\nThe sands remember the parent even when the hatchling has not arrived.\nWhat looks fragile belongs to something that does not."],
    hints: ["Scorched Earth","The egg associated with the new ASA Scorched Earth predator","Think of the new creature added specifically to Scorched Earth Ascended.","Fasolasuchus"],
    reward: 24,
    notes: "ASA-focused riddle • Fasolasuchus Egg"
  },
  {
    answer: "Shastasaurus Saddle",
    lines: ["The creature is the vessel. I am the part that makes the vessel a base.\nThe deep ocean becomes a road, then a battlefield, then a workshop.\nThe answer is not a normal saddle because normal saddles were never designed for a creature this strange.\nThe Center's new giant can carry technology where no foundation can stand.\nWhat turns an aquatic giant into a ship?"],
    hints: ["The Center","The advanced saddle/platform equipment for Shastasaurus","Think of the equipment that transforms Shastasaurus into an underwater platform.","Shastasaurus"],
    reward: 27,
    notes: "ASA-focused riddle • Shastasaurus Saddle"
  },
  {
    answer: "Dreadnoughtus Saddle",
    lines: ["A creature this large needs more than a place for one rider.\nThe platform is the clue, but the real answer is what the platform is meant to fight.\nArtillery becomes useful when the target is measured in Titans.\nExtinction's newest giant was not designed for sightseeing.\nFind the saddle that turns a titan-killer into a mobile war platform."],
    hints: ["Extinction","The platform saddle for Dreadnoughtus","Think of the equipment that lets the giant carry artillery.","Dreadnoughtus"],
    reward: 27,
    notes: "ASA-focused riddle • Dreadnoughtus Saddle"
  },
  {
    answer: "Megaraptor Saddle",
    lines: ["A raptor that needs a saddle is already telling you it is not the raptor you remember.\nValguero's newest predator changes scale without changing the name's implication.\nThe answer sits between rider and predator, but the real clue is the creature it belongs to.\nA saddle can reveal an animal's intended role before the animal does.\nWhat lets the new Valguero hunter carry a survivor?"],
    hints: ["Valguero","The saddle for Megaraptor","Think of the equipment made for the new Valguero predator.","Megaraptor"],
    reward: 26,
    notes: "ASA-focused riddle • Megaraptor Saddle"
  },
  {
    answer: "Pyromane Form",
    lines: ["I have two answers and one name.\nOne answer walks beside you; the other sits where a shoulder companion belongs.\nThe transition is the clue, not the creature's fire.\nA survivor can mistake my identity because the same tame can occupy very different shapes.\nWhich Fantastic Tame refuses to stay one size?"],
    hints: ["Fantastic Tames","The two-form mechanic of Pyromane","Think of the ASA fantasy creature that can change between a larger combat form and a shoulder form.","Pyromane"],
    reward: 27,
    notes: "ASA-focused riddle • Pyromane Form"
  },
  {
    answer: "Elderclaw Forest Guardian",
    lines: ["The forest does not need a dinosaur to have a predator.\nMy name sounds ancient, but my arrival belongs to a much newer chapter of ASA.\nI appear across several Realms where ordinary wildlife already had the territory.\nThe clue is not what era I come from. It is what kind of creature the forest needed.\nWhen the trees gain a guardian, the guardian is the answer."],
    hints: ["Valguero and other ASA maps","Elderclaw's role as a supernatural forest guardian","Think of the Fantastic Tame added with Valguero Ascended.","Elderclaw"],
    reward: 26,
    notes: "ASA-focused riddle • Elderclaw Forest Guardian"
  },
  {
    answer: "Megaraptor Memorial",
    lines: ["A memorial records who ascended. A predator records who was careless.\nValguero contains both, but only one can move.\nThe new creature's name sounds familiar enough to fool you into thinking you already know it.\nThe trick is separating the old word from the new animal.\nWhat new ASA predator shares a name with a much smaller idea?"],
    hints: ["Valguero","A lore riddle about the new ASA Valguero predator","Think about the word 'raptor' and then ask what changed.","Megaraptor"],
    reward: 25,
    notes: "ASA-focused riddle • Megaraptor Memorial"
  },
  {
    answer: "Dreadnoughtus Roar",
    lines: ["The attack is not teeth, claws, or fire.\nThe sound itself changes the rules for something made from Element.\nA Titan can be enormous and still be vulnerable to the right noise.\nExtinction's newest creature carries its most unusual weapon in its throat.\nWhat kind of roar can become a countermeasure to technology?"],
    hints: ["Extinction","Dreadnoughtus' anti-Element roar","Think of the sound-based ability that disrupts Element against Titans.","Dreadnoughtus"],
    reward: 29,
    notes: "ASA-focused riddle • Dreadnoughtus Roar"
  },
  {
    answer: "Yi Ling Feathers",
    lines: ["They are not arrows, yet they cross the air like a warning.\nThey belong to a creature that made ranged attacks out of anatomy.\nAberration's darkness makes distance dangerous, so the answer is something that makes distance useful.\nThe feathers are the projectile, but the creature is the weapon system.\nWhat new ASA creature turned its plumage into artillery?"],
    hints: ["Aberration","Yi Ling's ranged feather attacks","Think of the new Aberration creature whose feathers can be fired.","Yi Ling"],
    reward: 28,
    notes: "ASA-focused riddle • Yi Ling Feathers"
  },
  {
    answer: "Shastasaurus Echolocation",
    lines: ["The ocean hides what the eye cannot see.\nI answer without creating a map.\nA sound leaves the creature, meets the darkness, and returns with information.\nThe same creature can turn that information into a weapon.\nThe Center's new sea giant does not merely swim through the dark—it listens to it."],
    hints: ["The Center","Shastasaurus' echolocation mechanic","Think of the aquatic creature whose ultrasonic calls reveal and disorient.","Shastasaurus"],
    reward: 28,
    notes: "ASA-focused riddle • Shastasaurus Echolocation"
  },
  {
    answer: "Elderclaw Taming",
    lines: ["I am not won by treating the forest like a battlefield.\nThe answer is patience disguised as pursuit.\nA supernatural guardian does not accept the same logic as an ordinary prehistoric animal.\nThe clue is that taming me feels more like earning permission than knocking something unconscious.\nWhat kind of tame asks the survivor to understand the creature first?"],
    hints: ["Valguero","The unusual taming style of Elderclaw","Think of the supernatural Fantastic Tame introduced with Valguero Ascended.","Elderclaw"],
    reward: 27,
    notes: "ASA-focused riddle • Elderclaw Taming"
  },
  {
    answer: "Grendel Arena",
    lines: ["The boss is not the only thing that can defeat you.\nThe room can make a correct answer become a bad one.\nValguero's new endgame challenge asks the survivor to understand the space as much as the enemy.\nThe name belongs to a monster, but the lesson belongs to the arena.\nWhere does Valguero Ascended test the survivor?"],
    hints: ["Valguero","The arena associated with the Grendel boss fight","Think of the new Valguero boss encounter and its dedicated arena.","Grendel"],
    reward: 27,
    notes: "ASA-focused riddle • Grendel Arena"
  }
];

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
