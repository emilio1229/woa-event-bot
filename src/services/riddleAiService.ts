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
  },
{
    answer: "Shadowmane",
    lines: [
      "I arrive where the forest is quiet, and leave behind the suspicion that the forest was never empty.",
      "Panda says I am a cat. Rin says cats do not vanish between heartbeats.",
      "I borrow the shape of darkness, then return from it with teeth.",
      "The strange part is not that I hunt. It is that the hunt can begin before you know I am there.",
      "Some survivors bring weapons. Others bring patience and learn which is worth more."
    ],
    hints: [
      "The answer is a creature whose greatest advantage is concealment and positioning.",
      "It is strongly associated with Genesis Part 2.",
      "Look for a predator that can cloak itself and move in ways ordinary mounts cannot.",
      "Its name suggests darkness, but the real clue is how it enters a fight."
    ],
    reward: 28,
    notes: "Genesis Part 2 creature; stealth and ambush mechanics."
  },
  {
    answer: "Maewing",
    lines: [
      "Brendon called me an impossible nursery. Heathen asked why the nursery could outrun most riders.",
      "I carry the young without being their mother, feed what I did not birth, and travel as though gravity were optional.",
      "The Council stopped arguing when the babies began following me.",
      "My greatest trick is not speed. It is making several problems look like one creature-shaped solution.",
      "Panda simply asked whether I could do it again."
    ],
    hints: [
      "The answer is a newer creature famous for utility rather than combat.",
      "It is associated with raising and transporting babies.",
      "Genesis Part 2 is the important map connection.",
      "Think of the gliding mammal that can function as a mobile nursery."
    ],
    reward: 27,
    notes: "Genesis Part 2 utility creature."
  },
  {
    answer: "Desmodus",
    lines: [
      "At night I become the reason a torch feels less like protection.",
      "Wizard says every good mount should solve a problem. Doxo asks why mine creates several new ones.",
      "I drink from the living, see what the darkness hides, and make the ceiling feel closer than the ground.",
      "My gift is not simply flight. It is turning another creature's blood into an advantage.",
      "Rin wrote one final note: never assume the night is empty."
    ],
    hints: [
      "The answer is a nocturnal flying creature from Fjordur.",
      "Blood is more than food in this riddle.",
      "Its utility includes unusual vision and stealth-related abilities.",
      "Think of ARK's giant vampire bat mount."
    ],
    reward: 28,
    notes: "Fjordur creature; blood and night mechanics."
  },
  {
    answer: "Andrewsarchus",
    lines: [
      "Heathen said the boar looked too angry to be useful. Panda asked whether that mattered once it became a vehicle.",
      "I have four legs, but some survivors make me behave like a machine.",
      "Armor can turn my back into a cockpit, while my natural temper remains unchanged.",
      "The trick is not becoming technology. It is carrying technology where technology should not have legs.",
      "Fjordur taught the Council that even an old-looking beast can hide a very modern idea."
    ],
    hints: [
      "The answer is a Fjordur creature with a unique saddle.",
      "The saddle changes the creature's role dramatically.",
      "Think about a mount that can function like an armed mobile vehicle.",
      "Its unusual saddle is the key to the final deduction."
    ],
    reward: 29,
    notes: "Fjordur creature; armored saddle and vehicle-like utility."
  },
  {
    answer: "Fenrir",
    lines: [
      "The Council heard a wolf's name and expected fur. What arrived looked like winter given permission to hunt.",
      "Rin said the cold was not the dangerous part.",
      "Heathen disagreed after the first frozen breath.",
      "I am not merely a creature of a northern myth; I am a reward for surviving one.",
      "Find the place where the final answer is not found in the wild, but earned."
    ],
    hints: [
      "The answer is tied directly to Fjordur's boss progression.",
      "It is a wolf-like creature with powerful cold-themed abilities.",
      "You do not tame it in the normal wild-creature way.",
      "Think of the reward associated with defeating Fjordur's final boss."
    ],
    reward: 30,
    notes: "Fjordur boss reward; intentionally separates myth from acquisition."
  },
  {
    answer: "Desmodus Blood Pack",
    lines: [
      "Doxo called it a debt paid in red. Wizard called it a resource with an expiration date.",
      "The creature that creates it must first take something from the living.",
      "What is gathered is not merely consumed by the hunter that gathered it.",
      "The deeper question is why a survivor would deliberately collect what a predator normally takes for itself.",
      "The answer belongs to the strange economy of one creature's hunger."
    ],
    hints: [
      "The answer is a crafted/collected resource associated with Desmodus.",
      "It is produced through the creature's feeding behavior.",
      "Its value comes from preserving what would otherwise be consumed.",
      "Look to Fjordur and the blood-related mechanics of the giant bat."
    ],
    reward: 27,
    notes: "Creature-specific resource mystery."
  },
  {
    answer: "Amargasaurus",
    lines: [
      "My back carries weapons I did not forge, and my temper changes with the world around me.",
      "Heathen said the spikes were enough. Panda asked what the spikes were for.",
      "Heat can make one answer. Cold can make another. The same creature can become a different problem without changing species.",
      "I came from a land where even the weather seems determined to choose a side.",
      "The Council learned that sometimes the environment is part of the saddle."
    ],
    hints: [
      "The answer is a Lost Island creature.",
      "Its back-mounted spikes are central to its identity.",
      "Temperature affects the behavior or ammunition-like effect of those spikes.",
      "Think of the sauropod-like creature that weaponizes environmental conditions."
    ],
    reward: 28,
    notes: "Lost Island creature; temperature-linked spike mechanics."
  },
  {
    answer: "Sinomacrops",
    lines: [
      "I am small enough to be overlooked and useful enough to make a survivor regret overlooking me.",
      "I ride where a shoulder pet rides, yet I make the air itself a little less trustworthy.",
      "Panda called me a nuisance until I carried the answer over a wall.",
      "My Realm is full of giants, but my value is measured in what I let the giant do.",
      "Sometimes the smallest companion changes the rules of movement."
    ],
    hints: [
      "The answer is a shoulder-mounted Lost Island creature.",
      "It is especially useful for gliding and mobility.",
      "Its size is deliberately misleading.",
      "Think of the tiny feathered companion that can help a survivor move through the air."
    ],
    reward: 25,
    notes: "Lost Island utility creature."
  },
  {
    answer: "Dinopithecus",
    lines: [
      "Panda said the forest had learned to throw things back.",
      "I climb, leap, and arrive with more than one problem attached to me.",
      "My riders discovered that some creatures do not need claws to make a battlefield chaotic.",
      "The strangest clue is the one that sounds least like a creature: sometimes the troop is more important than the individual.",
      "Lost Island gave the Council a new definition of 'pack behavior.'"
    ],
    hints: [
      "The answer is a Lost Island primate.",
      "It is known for ranged attacks and unusual pack-oriented combat.",
      "Think beyond ordinary melee attacks.",
      "The clue about a troop points toward its unique combat mechanics."
    ],
    reward: 27,
    notes: "Lost Island creature; ranged/pack combat."
  },
  {
    answer: "Basilisk",
    lines: [
      "I do not need a saddle to make the ground feel temporary.",
      "Doxo said I was a serpent. Rin corrected him: a serpent that learned the value of hiding.",
      "My body disappears beneath the world, then returns where the world least wants it.",
      "I am most comfortable where the surface itself feels like an unfinished thought.",
      "If you hear the Realm before you see me, you have already given away too much."
    ],
    hints: [
      "The answer is a burrowing creature associated strongly with Aberration.",
      "It attacks from underground rather than treating the surface as its only battlefield.",
      "Its taming method is unusual and involves a creature's egg.",
      "Think of the giant snake-like ambusher that burrows through terrain."
    ],
    reward: 28,
    notes: "Aberration creature; burrowing and egg-based taming."
  },
  {
    answer: "Karkinos",
    lines: [
      "Two hands, no need for a handshake.",
      "One arm can carry what the other arm is still trying to throw.",
      "Heathen called me a crab. Wizard asked why the crab had opinions about physics.",
      "My strength is not simply in damage; it is in deciding where everything else will be standing.",
      "Aberration made a grappler out of something that was never meant to be polite."
    ],
    hints: [
      "The answer is an Aberration creature built around its two powerful arms.",
      "It can carry creatures and survivors in unusual ways.",
      "Its movement and throwing abilities are as important as its attacks.",
      "Think of the giant crab that turns positioning into a weapon."
    ],
    reward: 27,
    notes: "Aberration creature; carrying and throwing mechanics."
  },
  {
    answer: "Roll Rat",
    lines: [
      "I dig without asking permission and roll without admitting the difference.",
      "Panda thought the tunnels were empty until the tunnel answered.",
      "My treasure is buried, but I am not a treasure hunter.",
      "The strange bargain is simple: give me a reason to dig, and I may give the surface a reason to regret it.",
      "In one Realm, even a rat can make the ground itself part of combat."
    ],
    hints: [
      "The answer is an Aberration creature with strong burrowing behavior.",
      "It can move resources through the ground in a distinctive way.",
      "Its saddle and movement are central to the riddle.",
      "Think of the large rodent that rolls and digs through Aberration."
    ],
    reward: 26,
    notes: "Aberration creature; rolling and burrowing utility."
  },
  {
    answer: "Bulbdog",
    lines: [
      "I am not a torch, but darkness changes when I arrive.",
      "I am not a guard, but I notice something approaching before you do.",
      "Brendon called me a lamp with instincts. Doxo objected to the word 'lamp.'",
      "My size suggests decoration until the Realm becomes dangerous.",
      "Then the smallest light in the cave can become the most important creature beside you."
    ],
    hints: [
      "The answer is an Aberration shoulder pet.",
      "Its glow is only one part of its value.",
      "It can detect nearby threats or creatures.",
      "Think of the small light-producing companion used in Aberration."
    ],
    reward: 24,
    notes: "Aberration shoulder pet; charge-light and detection."
  },
  {
    answer: "Snow Owl",
    lines: [
      "I fly where the cold should have made flight a bad idea.",
      "My first gift is speed. My second is making an injured ally look less injured.",
      "Heathen called that healing. Wizard called it stasis with feathers.",
      "I can become less of a creature for a moment and more of a shelter.",
      "Extinction taught survivors that sometimes the best attack is refusing to let the team fall."
    ],
    hints: [
      "The answer is an Extinction creature with a strong support role.",
      "Its freezing ability can protect and restore allies.",
      "Flight is obvious, but not the core clue.",
      "Think of the large owl whose special ability creates a frozen healing effect."
    ],
    reward: 27,
    notes: "Extinction creature; healing/freeze utility."
  },
  {
    answer: "Gacha",
    lines: [
      "I am fed what you no longer need and asked to decide whether it was worth keeping.",
      "Panda says I am a recycler. Heathen says that is an insult to anything that can produce a crystal from trash.",
      "My appetite is measured in discarded things, but my reward is not always predictable.",
      "The Council learned that the right pile of uselessness can become something a tribe actually wants.",
      "I do not craft the treasure. I judge the offering."
    ], 
    hints: [
      "The answer is an Extinction creature with a resource-conversion mechanic.",
      "It consumes items and can produce special crystals.",
      "The mystery is about turning unwanted materials into something useful.",
      "Think of the large mammal that acts like a living recycling station."
    ],
    reward: 26,
    notes: "Extinction resource-conversion creature."
  },
  {
    answer: "Managarmr",
    lines: [
      "I do not fly the way birds do, and I do not jump the way beasts do.",
      "I simply decide that the distance between two points is negotiable.",
      "Wizard called my movement elegant. Heathen called it an invitation to crash into a wall.",
      "My breath makes cold useful, but my real trick is how quickly the battlefield changes around me.",
      "Extinction gave the sky a creature that treats momentum as a language."
    ],
    hints: [
      "The answer is an Extinction creature with extraordinary movement.",
      "It can launch through the air in bursts rather than using ordinary flight.",
      "Its breath attack is cold-based.",
      "Think of the fast, dragon-like mount famous for aerial dashing."
    ],
    reward: 28,
    notes: "Extinction creature; aerial dash and frost breath."
  },
  {
    answer: "Velonasaur",
    lines: [
      "I look like a creature until the moment someone walks into my range.",
      "Then the air itself becomes crowded with reasons to move.",
      "Panda asked whether I was a plant. Wizard asked whether plants usually shoot that accurately.",
      "My defense is not a wall. It is the promise that approaching me has consequences.",
      "Extinction made a turret out of something that still has a heartbeat."
    ],
    hints: [
      "The answer is an Extinction creature used for ranged defense.",
      "Its attack fires many projectiles from its body.",
      "It can be especially useful when defending a position.",
      "Think of the plant-like creature that behaves like a living turret."
    ],
    reward: 27,
    notes: "Extinction defensive creature."
  },
  {
    answer: "Gasbags",
    lines: [
      "I was built by evolution to be lighter than my problem.",
      "The first lesson is that I can swallow air. The second is that I can make that air someone else's problem.",
      "Heathen said I looked ridiculous. Brendon asked whether ridiculous could carry a base's worth of weight.",
      "My shape is the joke until the tribe needs to move something enormous.",
      "Extinction has many monsters. Mine wins arguments with buoyancy."
    ],
    hints: [
      "The answer is an Extinction creature with unusual transport utility.",
      "Its movement depends on storing and releasing gas.",
      "Weight capacity is a major part of its usefulness.",
      "Think of the giant inflatable-looking creature used for hauling."
    ],
    reward: 25,
    notes: "Extinction hauling creature."
  },
  {
    answer: "Magmasaur",
    lines: [
      "Do not ask me to respect the temperature of your forge.",
      "I was born where stone remembers being fire.",
      "My appetite includes metal, my breath includes heat, and my body makes ordinary armor feel optimistic.",
      "Rin said I was a furnace that learned to walk. Doxo asked whether furnaces usually have eggs.",
      "The answer lives where the word 'survival' begins to sound like a geological problem."
    ],
    hints: [
      "The answer is a Genesis Part 1 creature associated with volcanic terrain.",
      "It can process or gather metal-related resources in unusual ways.",
      "Heat is central to both its attacks and utility.",
      "Think of the volcanic creature whose body functions like a living furnace."
    ],
    reward: 29,
    notes: "Genesis Part 1 creature; volcanic and metal utility."
  },
  {
    answer: "Ferox",
    lines: [
      "Small enough to mistake for a companion. Hungry enough to regret the mistake.",
      "The Council learned that one body can have two answers depending on what it consumes.",
      "Panda called the first answer adorable. Heathen refused to comment on the second.",
      "I do not simply tame. I change the question of what was tamed.",
      "Genesis gave the survivor a creature whose size is the least reliable clue."
    ],
    hints: [
      "The answer is a Genesis Part 1 creature with two distinct forms.",
      "Element is involved in its transformation.",
      "Its small form is deceptively harmless-looking.",
      "Think of the creature that becomes much larger after consuming Element."
    ],
    reward: 29,
    notes: "Genesis Part 1 transformation creature."
  },
  {
    answer: "Astrocetus",
    lines: [
      "The ocean ended, so I kept going.",
      "Wizard asked whether a whale could be a ship. Doxo answered only after seeing the cannons.",
      "I carry a crew where there should be no water, and I make the sky behave like an ocean.",
      "My greatest clue is the place I should not be able to exist.",
      "Genesis taught the Council that even a whale can become a vessel if the Realm is strange enough."
    ],
    hints: [
      "The answer is a massive Genesis Part 1 creature.",
      "It travels through space rather than an ordinary ocean.",
      "Its saddle supports a mobile base/warship-like role.",
      "Think of the space whale capable of carrying structures and heavy weaponry."
    ],
    reward: 30,
    notes: "Genesis Part 1 creature; space travel and platform saddle."
  },
  {
    answer: "Tek Stryder",
    lines: [
      "I have a head that does not belong to a beast and a body that does not belong to a machine.",
      "I harvest, transport, and make a tribe question why it ever used a pick.",
      "EmilioTheGreat says I am what happens when technology gets tired of being carried.",
      "My usefulness is measured less by what I kill than by what I can gather while walking.",
      "Genesis Part 2 made the machine mount feel almost like a creature and the creature feel almost like a machine."
    ],
    hints: [
      "The answer is a Genesis Part 2 tame with heavy technological design.",
      "It has multiple configurations and strong harvesting utility.",
      "Its saddle and equipment are closely tied to Tek technology.",
      "Think of the robotic-looking creature used for industrial-scale resource gathering."
    ],
    reward: 30,
    notes: "Genesis Part 2 Tek creature; industrial utility."
  },
  {
    answer: "Noglin",
    lines: [
      "I do not need your body to make your body betray you.",
      "Doxo called me a parasite. Panda called me a very small bad decision.",
      "The victim keeps moving, but the question of who is steering has changed.",
      "My size is a distraction from the only thing that matters: permission was never requested.",
      "Genesis Part 2 introduced a creature whose greatest weapon is someone else's hands."
    ],
    hints: [
      "The answer is a Genesis Part 2 creature associated with mind control.",
      "It is small and can attach to larger creatures or survivors.",
      "The clue is about controlling another being rather than dealing direct damage.",
      "Think of the strange parasite that can take control of targets."
    ],
    reward: 29,
    notes: "Genesis Part 2 creature; mind-control mechanic."
  },
  {
    answer: "Shadowmane Cloak",
    lines: [
      "I am worn without being armor and activated without becoming a weapon.",
      "My purpose is to make attention slide past the wearer.",
      "Rin says the strongest disguise is not looking different; it is making others stop looking.",
      "The strange part is that the cloak is not made for a wizard at all.",
      "It belongs to a creature whose name already sounds like an eclipse."
    ],
    hints: [
      "The answer is a Shadowmane-related ability/effect rather than a normal armor piece.",
      "Stealth and reduced detection are the important concepts.",
      "Genesis Part 2 is the strongest connection.",
      "Think about the Shadowmane's ability to conceal itself and allies."
    ],
    reward: 27,
    notes: "Genesis Part 2 creature ability."
  },
  {
    answer: "Cryofridge",
    lines: [
      "The pod remembers one life. I remember an entire army.",
      "Brendon called me a library. Heathen asked why the books bite.",
      "My shelves do not hold pages; they hold possibilities that would otherwise need cages, food, and space.",
      "A tribe can build a fortress around creatures without letting the creatures occupy the fortress.",
      "The cold is not the point. Organization is."
    ],
    hints: [
      "The answer is related to creature storage but is not the portable container.",
      "It is a structure designed to store many cryopods.",
      "Think of the powered storage solution added for managing large collections of pods.",
      "Its value is long-term organization and preservation."
    ],
    reward: 25,
    notes: "Creature-storage structure."
  },
  {
    answer: "Net Projectile",
    lines: [
      "I defeat strength by refusing to fight strength.",
      "A giant can have more health, more teeth, and more confidence, yet still become suddenly horizontal.",
      "Wizard calls it restraint. Panda calls it the fastest argument in the Realm.",
      "The weapon is small, the target is not, and the effect lasts just long enough to change the entire plan.",
      "Sometimes the best way to tame a monster is to make it stop being a monster for a moment."
    ],
    hints: [
      "The answer is a ranged restraint item rather than a damage weapon.",
      "It can immobilize certain creatures temporarily.",
      "It is fired from a Harpoon Launcher.",
      "Think of the tool survivors use when brute force is less useful than pinning a target down."
    ],
    reward: 24,
    notes: "ARK utility item; restraint rather than damage."
  },
  {
    answer: "Desert Cloth",
    lines: [
      "The sun is an enemy that never swings.",
      "Armor can stop claws, but I was designed for a threat that attacks everything by existing overhead.",
      "Heathen says the best armor is sometimes the armor you forget you are wearing.",
      "I am light because survival here punishes anyone who mistakes protection for weight alone.",
      "The map is dry, but the answer is not simply 'sand.'"
    ],
    hints: [
      "The answer is a specialized armor set.",
      "Heat resistance is more important than protection from direct attacks.",
      "Scorched Earth is the strongest environmental connection.",
      "Think of the lightweight armor survivors use to endure extreme heat."
    ],
    reward: 23,
    notes: "Scorched Earth armor/environment riddle."
  },
  {
    answer: "Wyvern Milk",
    lines: [
      "The mother is absent. The child is hungry. The solution belongs to neither ordinary farming nor ordinary taming.",
      "Panda asked why anyone would risk stealing a thing that cannot be bought.",
      "The answer is taken from a danger that can fly faster than the person carrying it.",
      "What nourishes the young is obtained from the very creature that made the young difficult to raise.",
      "In the trench, kindness looks suspiciously like theft."
    ],
    hints: [
      "The answer is associated with raising baby Wyverns.",
      "It is obtained from adult female Wyverns rather than crafted.",
      "Scorched Earth is the classic source.",
      "The key is the unusual method required to keep a Wyvern baby alive."
    ],
    reward: 29,
    notes: "Wyvern raising resource; acquisition risk is the mystery."
  },
  {
    answer: "Nameless Venom",
    lines: [
      "The creature has no name, yet its young require a thing with a name.",
      "Doxo said that sounded backwards. Rin said Aberration has always enjoyed that joke.",
      "The resource is taken from something survivors usually avoid rather than seek.",
      "It feeds an offspring whose parent does not remain beside it in the ordinary way.",
      "The answer is proof that some of the Realm's most valuable supplies come from things you would rather not meet."
    ],
    hints: [
      "The answer is an Aberration resource connected to raising a specific creature.",
      "It is obtained from Nameless creatures.",
      "The young creature being raised is not a normal egg-hatched baby.",
      "Think of the resource required for raising Rock Drake babies."
    ],
    reward: 28,
    notes: "Aberration breeding resource."
  },
  {
    answer: "Ambergris",
    lines: [
      "The sea leaves a gift that looks too ordinary to be important.",
      "Then a creature in the cold asks for it as though the ocean had sent lunch.",
      "Wizard called it whale-stone. Brendon refused to correct him.",
      "It is carried, consumed, and valued far from the place where its name makes sense.",
      "The answer is a resource whose strangest property is not where it comes from, but who needs it."
    ],
    hints: [
      "The answer is a resource associated with Genesis Part 1.",
      "It comes from a creature rather than a normal resource node.",
      "A particular aquatic/ice-associated creature consumes it.",
      "Think of the substance gathered from space whales and fed to baby Magmasaurs."
    ],
    reward: 28,
    notes: "Genesis resource with cross-creature breeding use."
  },
  {
    answer: "Mutagen Bulb",
    lines: [
      "A flower can be a weapon, a resource, or a question depending on which Realm you are standing in.",
      "Rin warned that this one should never be judged by its color alone.",
      "It grows where survival has become an experiment.",
      "Its value appears only after someone understands what it can change.",
      "Genesis Part 2 hides strange answers in places that look almost harmless."
    ],
    hints: [
      "The answer is a Genesis Part 2 resource.",
      "It is associated with Mutagen and the transformation of certain creatures/resources.",
      "It is found in the alien environment rather than crafted normally.",
      "Think of the unusual plant-like resource used in advanced Genesis progression."
    ],
    reward: 28,
    notes: "Genesis Part 2 resource mystery."
  },
  {
    answer: "Element Shard",
    lines: [
      "I am not the thing the machines truly want, but I am close enough that they accept the imitation.",
      "A mountain of me can look like a fortune until someone asks where the full version went.",
      "Doxo says fragments can be more dangerous than whole things because survivors underestimate them.",
      "I power technology while remaining only a piece of the greater mystery.",
      "The answer is what happens when an endgame resource is allowed to exist in a cheaper shape."
    ],
    hints: [
      "The answer is a processed form related directly to Element.",
      "It is used as a resource for certain Tek technologies and structures.",
      "Genesis-era and late-game environments can point toward it.",
      "Think of the small shard-like form rather than the full Element resource."
    ],
    reward: 26,
    notes: "Element derivative resource."
  },
  {
    answer: "Black Pearl",
    lines: [
      "I grow in darkness and pay for machines that never learned to breathe.",
      "The sea keeps me better than the land, and the things guarding me rarely appreciate collectors.",
      "Heathen says treasure should sparkle. Doxo says that is exactly why this treasure is dangerous.",
      "I am small enough to carry and important enough to make Tek machinery suddenly less impossible.",
      "The Realm's oldest rule still applies: valuable things tend to be inconveniently protected."
    ],
    hints: [
      "The answer is a rare resource strongly associated with the ocean and certain dangerous creatures.",
      "It is important for advanced crafting.",
      "Tusoteuthis and Trilobites can lead you toward it.",
      "Think of the dark pearl-like resource used in Tek progression."
    ],
    reward: 26,
    notes: "Advanced resource; ocean and Tek crafting clues."
  },
  {
    answer: "Chitin",
    lines: [
      "I am armor taken from creatures that wore it first.",
      "The owner is gone, but the shell remains useful to someone with a forge.",
      "Panda says I am the Realm's oldest example of recycling. Heathen says survivors have been doing it since day one.",
      "I am neither bone nor stone, though beginners often confuse me with both.",
      "The answer begins with the dead and ends with protection."
    ],
    hints: [
      "The answer is a harvested resource from exoskeletal creatures.",
      "It is used in crafting armor and other early-to-mid progression items.",
      "Insects and certain shell-covered creatures are strong clues.",
      "Think of the hard biological material survivors harvest from creatures like Trilobites and insects."
    ],
    reward: 22,
    notes: "Foundational resource written as a material-reuse mystery."
  },
  {
    answer: "Polymer",
    lines: [
      "One version begins with chemistry. Another begins with something that bites.",
      "Wizard says the Realm permits shortcuts, but only if the shortcut is equally unpleasant.",
      "I become weapons, armor, machines, and mistakes made by anyone who forgets where they left the refrigerator.",
      "My two origins look unrelated until a survivor notices they produce the same result.",
      "The clue is not how I am used. It is why two completely different roads lead to me."
    ],
    hints: [
      "The answer is an advanced crafting material with two common forms.",
      "One form is crafted from Organic Polymer; another is made from Obsidian and Cementing Paste.",
      "Organic Polymer sources include certain creatures and plants.",
      "Think of the material required for many advanced weapons, armor, and structures."
    ],
    reward: 25,
    notes: "Crafting material; dual-source mechanic."
  },
  {
    answer: "Cementing Paste",
    lines: [
      "I am the glue between primitive stone and advanced ambition.",
      "Castoroides builds where I hide, insects carry pieces of my story, and survivors learn quickly that water does not make me easier to find.",
      "Doxo calls me mortar. Wizard calls me an economic problem.",
      "Without me, many of the Realm's strongest structures remain ideas.",
      "The riddle is really about what holds progress together when wood is no longer enough."
    ],
    hints: [
      "The answer is a major crafting resource.",
      "Beaver dams and Achatina can point toward it.",
      "It is heavily used in stone and advanced structures.",
      "Think of the sticky material made from Chitin/Keratin and Stone."
    ],
    reward: 23,
    notes: "Foundational construction resource."
  },
  {
    answer: "Honey",
    lines: [
      "Sweetness is the least dangerous thing about me.",
      "The hive protects something a survivor can eat, but approaching the hive can make eating feel like the final clue.",
      "Panda asked why anyone would steal from insects. Heathen asked why anyone would build a giant creature out of breakfast.",
      "I can lure, nourish, and become a tool for taming something far larger than myself.",
      "The answer is small, sticky, and capable of moving a giant."
    ],
    hints: [
      "The answer is a resource gathered from Giant Bee Hives.",
      "It has unusual utility in taming and luring certain creatures.",
      "It is also a food item with special properties.",
      "Think of the sticky resource used to lure and tame creatures such as the Woolly Rhino."
    ],
    reward: 24,
    notes: "Resource with unusual taming utility."
  },
  {
    answer: "Sanguine Elixir",
    lines: [
      "A potion made from blood should not sound comforting, yet the Realm has stranger bargains.",
      "The bat that makes it does not ask for herbs. It asks for what flows inside the living.",
      "Rin says healing is a matter of interpretation. Doxo says that is why nobody should let him name potions.",
      "The effect is simple, but the ingredient tells you which creature taught survivors how to make it.",
      "Fjordur's darkest mount leaves behind a recipe that is more useful than its origin suggests."
    ],
    hints: [
      "The answer is a Desmodus-related consumable.",
      "Its creation involves Blood Packs.",
      "It has a special taming-related use.",
      "Think of the elixir crafted from the vampire bat's blood-harvesting mechanic."
    ],
    reward: 27,
    notes: "Fjordur/Desmodus consumable."
  },
  {
    answer: "Carcharodontosaurus Saddle",
    lines: [
      "The creature is the obvious threat. I am the quiet reason the threat can be ridden.",
      "Wizard says every monster becomes more complicated when someone gives it a saddle.",
      "Mine is expensive because the Realm expects a rider to survive sitting above the teeth.",
      "The blueprint is not the mystery. The mystery is which late arrival made tribes rethink the meaning of a predator mount.",
      "EmilioTheGreat would probably say the saddle is the least dangerous part."
    ],
    hints: [
      "The answer is a late-game saddle for one of ARK's largest predators.",
      "The creature itself is the Carcharodontosaurus.",
      "Its crafting cost and level requirement are part of its identity.",
      "Think of the saddle that lets survivors ride the 'storm with teeth.'"
    ],
    reward: 26,
    notes: "Equipment riddle tied to a modern creature."
  },
  {
    answer: "Tek Cave",
    lines: [
      "The door is not the final challenge. It is the agreement that you are ready for the final challenge.",
      "Heathen says the mountain is merely a throat. Wizard says that is not comforting.",
      "The deeper you go, the less the surface rules matter.",
      "At the end, the Realm stops asking whether you can survive and asks whether you can survive what comes after.",
      "Only those who understand the island's oldest secret reach the place where the sky is no longer the destination."
    ],
    hints: [
      "The answer is an Island endgame location.",
      "It is a dangerous cave leading toward the Overseer encounter.",
      "Access is tied to high-level boss progression.",
      "Think of the volcanic passage that serves as the final gauntlet before the Island's ultimate boss."
    ],
    reward: 30,
    notes: "Island endgame location; deliberately avoids naming the boss in the riddle."
  },
  {
    answer: "Overseer",
    lines: [
      "Every great survivor eventually learns that the enemy was not always standing in front of them.",
      "The Council has argued whether I am a creature, a machine, or a verdict.",
      "I watch from above, but 'above' is not a place you can reach by climbing.",
      "The Island's final question is not written on stone. It is written in everything the survivor learned before entering the volcano.",
      "When the arena opens, the Realm finally reveals who was watching."
    ],
    hints: [
      "The answer is the final boss of The Island.",
      "It is associated with the volcano and Tek Cave progression.",
      "Its forms and arena mechanics are more unusual than a normal creature boss.",
      "Think of the entity waiting after the Tek Cave gauntlet."
    ],
    reward: 30,
    notes: "Island final boss/lore riddle."
  },
  {
    answer: "Broodmother Lysrix",
    lines: [
      "The web is the least interesting thing about the chamber.",
      "The first mistake is assuming the guardian waits for you. The second is assuming the cave belongs to you.",
      "Wizard calls the arena a nursery. Heathen refuses to explain why the nursery has a tribute requirement.",
      "Bring the wrong trophies and the old door remains closed.",
      "The answer is a queen whose court is made of things that do not belong in a court."
    ],
    hints: [
      "The answer is an Island boss.",
      "Its arena and name are tied to spiders and a cave environment.",
      "Artifacts and tribute resources are required to summon it.",
      "Think of the spider queen among the Island's three original major bosses."
    ],
    reward: 28,
    notes: "Island boss riddle."
  },
  {
    answer: "Megapithecus",
    lines: [
      "I am large enough that the name sounds like an exaggeration until the first roar answers for it.",
      "The arena is cold, the tribute is old, and the mistake is thinking size is the whole clue.",
      "Rin says every giant has a weakness. Heathen says some giants simply have better places to throw you.",
      "I guard an arena where falling can matter almost as much as fighting.",
      "The Island's second great question is written in fur."
    ],
    hints: [
      "The answer is an Island boss associated with a snowy arena.",
      "It is a giant ape rather than a dragon or spider.",
      "Knockback and the arena's terrain are important clues.",
      "Think of the original Island boss known as the giant ape."
    ],
    reward: 28,
    notes: "Island boss; terrain and knockback clue."
  },
  {
    answer: "Dragon",
    lines: [
      "The name is too simple for what it guards.",
      "Heat is not merely an environmental hazard; it is part of the enemy's identity.",
      "Wizard says bring the strongest creature you own. Rin says bring one that can survive being asked the wrong question.",
      "The arena is a warning disguised as a floor.",
      "Of the Island's great guardians, I am the one whose name needs no explanation."
    ],
    hints: [
      "The answer is the Island's fire-breathing boss.",
      "Its arena is volcanic and its attacks include powerful fire damage.",
      "It is one of the original three Island tribute bosses.",
      "Think of the boss whose name is simply the creature it resembles."
    ],
    reward: 28,
    notes: "Island boss; deliberately simple answer hidden behind arena clues."
  },
  {
    answer: "King Titan",
    lines: [
      "The word 'king' is not a title. It is a measurement.",
      "Extinction's final enemy is not merely large; it turns the landscape into part of the encounter.",
      "Doxo said the city was already dead. Brendon asked what could possibly be left to destroy.",
      "The answer walks where ordinary creatures become scenery.",
      "When the final battle begins, the question is no longer whether the survivor is strong enough, but whether the world is."
    ],
    hints: [
      "The answer is the ultimate Extinction Titan boss.",
      "Its scale is far beyond ordinary creatures.",
      "It is fought in a dedicated endgame encounter after the other Titans.",
      "Think of Extinction's largest and final Titan."
    ],
    reward: 30,
    notes: "Extinction final boss; scale is the central misdirection."
  },
  {
    answer: "Rockwell Prime",
    lines: [
      "The old scholar returned, but not as the same question.",
      "Doxo refused to call it resurrection. Rin refused to call it victory.",
      "The city around the arena is cleaner than the story that produced what waits inside.",
      "I am a memory wearing a newer shape, and the shape is much harder to reason with.",
      "Genesis Part 2 ends where knowledge began: with someone asking what happens when power is finally understood."
    ],
    hints: [
      "The answer is the Genesis Part 2 final boss.",
      "It is a transformed continuation of a major ARK character.",
      "The encounter takes place on the ship's endgame path.",
      "Think of Rockwell after the events of Aberration."
    ],
    reward: 30,
    notes: "Genesis Part 2 final boss/lore."
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
