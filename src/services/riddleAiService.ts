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
    lines: ["I am a prison praised as mercy.", "I steal no life, yet silence the wild within.", "Carry a world in your palm, then give it room to wake.", "When the seal breaks, what slept remembers the earth."],
    hint: "A tiny vessel that can preserve something much larger.",
    reward: 15,
    notes: "Creature preservation."
  },
  {
    answer: "Tek Transmitter",
    lines: ["I have no wings, yet distance bends before me.", "Tributes vanish into silence and return somewhere else.", "I do not cross the realms; I make the realms exchange.", "A horizon becomes negotiable when I awaken."],
    hint: "Think beyond ordinary travel between realms.",
    reward: 18,
    notes: "Realm transfer."
  },
  {
    answer: "Dung Beetle",
    lines: ["The court ignores me until the gardens begin to hunger.", "What others discard becomes my little treasury.", "I carry a humble sphere, yet the tribe grows richer.", "In a wizard's hall, even refuse can become power."],
    hint: "A creature whose strange diet helps the farm.",
    reward: 12,
    notes: "Fertilizer and resource utility."
  },
  {
    answer: "Element",
    lines: ["I am not treasure, though tribes build around me.", "I am not fire, though machines beyond nature wake for me.", "Fragments of the ancients became a survivor's currency.", "When old technology hungers, I am the offering."],
    hint: "Rare fuel behind the most advanced technology.",
    reward: 20,
    notes: "Advanced resource."
  },
  {
    answer: "Obelisk",
    lines: ["Three silent towers watch lands that never agreed to be alike.", "Survivors gather beneath my shadow.", "Offer strange cargo to the light and the sky answers.", "My shape is a landmark before it is a machine."],
    hint: "Look upward when the map needs a landmark.",
    reward: 16,
    notes: "Transfer landmark."
  },
  {
    answer: "Gacha",
    lines: ["I sit like a beast, yet hunger for what you no longer value.", "Feed the collector and wait for fortune to crystallize.", "My gifts are born from appetite, not a crafting bench.", "Some keep me for mystery; others for what I produce."],
    hint: "A creature that turns offerings into useful crystals.",
    reward: 17,
    notes: "Resource-producing creature."
  },
  {
    answer: "Maewing",
    lines: ["I am neither nursery nor mother, yet the young cling to my care.", "My strange shape hides a talent tribes quickly learn to use.", "I turn a helpless beginning into an easier one.", "Among the young, my value is measured in what I can carry."],
    hint: "A creature famous for helping raise babies.",
    reward: 14,
    notes: "Nursing and pouch utility."
  },
  {
    answer: "Industrial Forge",
    lines: ["I swallow mountains one handful at a time.", "The little forge dreams of my appetite.", "Inside my furnace, stone and metal forget what they were.", "When a tribe thinks too large for a campfire, I am waiting."],
    hint: "A furnace built for industrial-scale refining.",
    reward: 13,
    notes: "Mass refining."
  },
  {
    answer: "Argentavis",
    lines: ["The sky is my road, but burden is my favorite passenger.", "I care less for speed than what the tribe can bring home.", "Mountains become shelves when I take flight.", "An expedition becomes easier when my shadow arrives."],
    hint: "A classic hauling flyer.",
    reward: 13,
    notes: "Flying transport."
  },
  {
    answer: "Reaper",
    lines: ["I begin as a threat before I ever become an ally.", "Darkness does not merely hide me; it changes the rules around me.", "A survivor can leave my encounter carrying more than a memory.", "Some creatures are tamed by trust; I was earned by surviving something stranger."],
    hint: "An Aberration creature with an unusual path to obtaining one.",
    reward: 21,
    notes: "Unusual creature acquisition."
  },
  {
    answer: "Net Projectile",
    lines: ["I was made for the moment when teeth become too convincing.", "I do not defeat the hunter; I briefly convince the hunted to stop.", "A moving target becomes a waiting problem.", "My magic is temporary, but temporary can be enough."],
    hint: "A tool for briefly immobilizing a creature.",
    reward: 11,
    notes: "Temporary immobilization."
  },
  {
    answer: "Tek Generator",
    lines: ["My heart is expensive, but my silence is useful.", "I feed invisible hunger across walls and floors.", "Machines around me never need to see the source.", "Where ordinary wires end, my field begins."],
    hint: "Advanced power without a web of visible cables.",
    reward: 16,
    notes: "Wireless advanced power."
  },
  {
    answer: "Industrial Cooker",
    lines: ["A recipe is only a promise until I make it useful.", "I turn a tribe's pantry into something deliberate.", "My work is measured in batches, not bowls.", "The alchemist's table became an industry in my hands."],
    hint: "Large-scale cooking and recipes.",
    reward: 12,
    notes: "Industrial cooking."
  },
  {
    answer: "Velonasaur",
    lines: ["I carry a storm in my back, but thunder is not my gift.", "When danger approaches, standing still can become a weapon.", "My ammunition is grown, not loaded.", "Among defenders, my spines speak first."],
    hint: "A defensive creature whose body provides its ranged attack.",
    reward: 17,
    notes: "Projectile defense."
  },
  {
    answer: "Tek Suit",
    lines: ["I make a survivor feel lighter without changing their bones.", "The sky becomes a hallway when my hidden engines answer.", "Water, cliffs, and distance lose some authority.", "I am armor only until movement becomes the real spell."],
    hint: "Advanced armor built around movement abilities.",
    reward: 18,
    notes: "Advanced mobility armor."
  },
  {
    answer: "Industrial Grinder",
    lines: ["Mistakes enter my mouth as finished things.", "I do not regret what the crafting bench made.", "Metal, hide, and ambition can all return to pieces.", "The tribe calls it recycling when being polite."],
    hint: "A machine that breaks crafted items back down.",
    reward: 14,
    notes: "Item recovery."
  },
  {
    answer: "Fabricator",
    lines: ["I am a forge with ambitions too strange for a campfire.", "Blueprints become matter beneath my hunger.", "Metal, crystal, and patience meet behind my door.", "The tribe comes to me when primitive tools have lost their authority."],
    hint: "A major crafting station between primitive and advanced gear.",
    reward: 13,
    notes: "Advanced crafting."
  },
  {
    answer: "Smithy",
    lines: ["I do not swing the hammer, yet many hammers depend on me.", "Blueprints whisper beside metal and hide.", "Primitive hands become ambitious at my bench.", "Before the strange machines, I taught survivors to build."],
    hint: "A foundational crafting station for better equipment.",
    reward: 10,
    notes: "Crafting station."
  },
  {
    answer: "Mortar and Pestle",
    lines: ["I ask for no furnace and need no lightning.", "Stone meets powder beneath my patient work.", "Medicine, narcotics, and stranger recipes begin with me.", "Small tools can still open large doors."],
    hint: "An early crafting station for powders and medicines.",
    reward: 9,
    notes: "Early crafting."
  },
  {
    answer: "Preserving Bin",
    lines: ["Time is my enemy, so I teach food to wait.", "Smoke is absent, yet spoilage slows beneath my care.", "A handful of fuel buys a little more tomorrow.", "I am a pantry for survivors who cannot eat everything today."],
    hint: "An early structure that slows food spoilage.",
    reward: 9,
    notes: "Food preservation."
  },
  {
    answer: "Refrigerator",
    lines: ["I keep tomorrow from becoming yesterday.", "What would wither quickly learns patience within me.", "My hunger is electrical, but my gift is time.", "A tribe with one of me wastes less of what it gathers."],
    hint: "Powered storage that greatly slows spoilage.",
    reward: 11,
    notes: "Cold storage."
  },
  {
    answer: "Tek Replicator",
    lines: ["I am not a smithy, yet I make the impossible commonplace.", "Resources enter; finished wonders emerge.", "My chamber is large because small ambition would insult it.", "When ordinary crafting reaches its ceiling, I open another door."],
    hint: "A huge advanced crafting station for endgame technology.",
    reward: 19,
    notes: "Endgame crafting."
  },
  {
    answer: "Tek Teleporter",
    lines: ["The road is long only until I am asked a question.", "Distance answers with silence, then disappears.", "No saddle carries the traveler.", "I make two places feel like neighboring rooms."],
    hint: "Advanced technology for instant movement between locations.",
    reward: 20,
    notes: "Instant travel."
  },
  {
    answer: "Tek Forcefield",
    lines: ["I build a wall without stacking a single stone.", "The boundary has no bricks, yet it tells danger where to stop.", "Energy becomes architecture around the tribe.", "When the invisible wall rises, trespass becomes a negotiation."],
    hint: "Advanced energy-based defensive barrier.",
    reward: 18,
    notes: "Energy defense."
  },
  {
    answer: "Heavy Miner's Helmet",
    lines: ["I wear no crown, yet darkness bows when I arrive.", "My gift is not wisdom but visibility.", "Caves lose their secret while I shine.", "A small light can make a deep place less hostile."],
    hint: "Headgear that provides strong light in dark places.",
    reward: 10,
    notes: "Exploration gear."
  },
  {
    answer: "Grappling Hook",
    lines: ["I throw my hand where my feet cannot go.", "A cliff becomes a staircase for a moment.", "I do not fly, yet I borrow the sky.", "One line can turn a fall into a climb."],
    hint: "A tool for reaching ledges and escaping danger.",
    reward: 10,
    notes: "Traversal tool."
  },
  {
    answer: "Parachute",
    lines: ["I am useless while standing and priceless while falling.", "The earth approaches; I answer by becoming larger.", "I cannot stop the journey, only change its ending.", "The sky lends me a moment of mercy."],
    hint: "A survival item that slows a fall.",
    reward: 8,
    notes: "Fall protection."
  },
  {
    answer: "Whip",
    lines: ["I carry no blade, yet I can command the hands of a survivor.", "A snap can turn loose things into claimed things.", "My reach is short compared with a spear, but stranger in purpose.", "Sometimes the fastest thief is the one with a little leather."],
    hint: "A tool useful for quickly picking up or disarming loose items.",
    reward: 9,
    notes: "Utility weapon."
  },
  {
    answer: "Bola",
    lines: ["I have no teeth, yet I can make legs forget their purpose.", "I fly from the hand and wrap an answer around motion.", "For a moment, speed becomes stillness.", "Small hunters learn my lesson early."],
    hint: "An early tool used to immobilize smaller creatures.",
    reward: 8,
    notes: "Early restraint."
  },
  {
    answer: "Spyglass",
    lines: ["I bring distant secrets close without moving a single foot.", "Through my eye, the wild reveals a little more of itself.", "I have no blade and no saddle, yet explorers value me.", "Distance is my only enemy, and I make it smaller."],
    hint: "A simple tool for observing distant creatures and places.",
    reward: 8,
    notes: "Exploration tool."
  },
  {
    answer: "GPS",
    lines: ["I know where I am even when the world refuses to explain itself.", "Coordinates become a language beneath my glass.", "Lost travelers call me wisdom.", "I do not move you; I simply tell you where you stand."],
    hint: "A device that shows your position using coordinates.",
    reward: 10,
    notes: "Navigation."
  },
  {
    answer: "Soul Trap",
    lines: ["I am a newer prison for an older miracle.", "A creature becomes small enough to carry without becoming gone.", "The cage has no bars and the captive leaves no footsteps.", "Release me, and the old shape returns."],
    hint: "A modern creature-storage item used by some ARK systems.",
    reward: 15,
    notes: "Creature storage."
  },
  {
    answer: "Taming",
    lines: ["I begin with fear and end with a name.", "The wild creature does not sign a contract, yet it changes allegiance.", "Patience, food, and danger may all become part of my ritual.", "A beast becomes a companion without ceasing to be itself."],
    hint: "The process of turning a wild creature into an ally.",
    reward: 14,
    notes: "Core ARK progression."
  },
  {
    answer: "Breeding",
    lines: ["I begin with two lives and end with possibilities.", "Time becomes part of the recipe.", "Blood remembers what survivors choose to preserve.", "The strongest tribes often inherit rather than discover."],
    hint: "Raising new creatures while preserving desirable traits.",
    reward: 16,
    notes: "Creature lineage."
  },
  {
    answer: "Mutagen",
    lines: ["I am not a potion for the weak of heart.", "A creature's future can change after my strange gift.", "I deal in inheritance rather than simple strength.", "In the right hands, evolution becomes a resource."],
    hint: "An advanced resource associated with creature mutations and breeding.",
    reward: 19,
    notes: "Breeding resource."
  },
  {
    answer: "Cryofridge",
    lines: ["I am a library whose books breathe.", "Each silent chamber remembers a creature waiting elsewhere.", "The cold is not for food this time.", "When the tribe has too many companions, I become their vault."],
    hint: "Storage built specifically for creature-containing pods.",
    reward: 14,
    notes: "Creature storage infrastructure."
  },
  {
    answer: "Industrial Grinder",
    lines: ["The forge creates; I reconsider.", "Finished things enter and leave as pieces.", "Even a costly mistake can teach the tribe something back.", "My purpose is not creation, but undoing creation usefully."],
    hint: "The industrial machine that dismantles crafted items.",
    reward: 14,
    notes: "Deconstruction."
  },
  {
    answer: "Plant Species X",
    lines: ["I grow where a turret would normally stand.", "Roots hold the ground while leaves answer intruders.", "Water and care become ammunition.", "A garden can guard a gate when the right seed is planted."],
    hint: "A defensive plant that attacks nearby threats.",
    reward: 16,
    notes: "Organic base defense."
  },
  {
    answer: "Plant Species Z",
    lines: ["I am a flower that prefers the battlefield.", "My gift can calm what claws would otherwise make dangerous.", "The plant does not need a saddle to change a fight.", "A strange blossom can become a survivor's advantage."],
    hint: "An unusual defensive/support plant found in Aberration.",
    reward: 16,
    notes: "Aberration flora."
  },
  {
    answer: "S+ Transmitter",
    lines: ["I imitate the towers, but ask less of the sky.", "Information and cargo answer my call from a base.", "A survivor can summon the distant without climbing a monument.", "The smaller herald serves a similar ancient purpose."],
    hint: "A modded base device that handles transfer functions.",
    reward: 17,
    notes: "Modded transfer utility."
  },
  {
    answer: "Argentavis",
    lines: ["I am a mountain's shadow with a saddle.", "The tribe gives me weight and I give them distance.", "A wild peak becomes reachable when my wings agree.", "I carry more than a fast flyer and ask less than a giant."],
    hint: "A famous ARK flyer valued for carrying loads.",
    reward: 13,
    notes: "Transport flyer."
  },
  {
    answer: "Ankylosaurus",
    lines: ["My tail is a hammer, but metal is my favorite treasure.", "Rock gives up its secrets beneath my patience.", "I do not mine with a pick, yet the tribe follows my path.", "Where ore sleeps, I become a walking tool."],
    hint: "A harvesting creature especially useful for metal and other rocks.",
    reward: 13,
    notes: "Resource harvesting."
  },
  {
    answer: "Doedicurus",
    lines: ["I wear a fortress and carry a secret appetite for stone.", "The mountain loses pieces when I begin my work.", "My body is round, but my purpose is surprisingly practical.", "Builders welcome my hunger."],
    hint: "A creature famous for gathering stone.",
    reward: 12,
    notes: "Stone harvesting."
  },
  {
    answer: "Therizinosaurus",
    lines: ["My claws look like a warning written in three lines.", "Wood, fiber, and meat all fall within my strange talents.", "I am gentle only after the tribe earns that privilege.", "A gatherer can be terrifying and useful at once."],
    hint: "A powerful all-around harvesting creature with enormous claws.",
    reward: 15,
    notes: "Versatile harvester."
  },
  {
    answer: "Castoroides",
    lines: ["I am a lumberjack with teeth and a river for a workshop.", "Trees become supplies beneath my patience.", "My strength is not merely in carrying wood.", "The shoreline often hides the tribe's best builder."],
    hint: "A large beaver useful for gathering wood.",
    reward: 12,
    notes: "Wood harvesting."
  },
  {
    answer: "Snow Owl",
    lines: ["Winter follows me, but I do not fear its bite.", "A wounded ally can find strange mercy beneath my wings.", "My flight is quiet; my gift is colder.", "In battle, I can make healing look like frost."],
    hint: "A cold-region flyer with a special healing ability.",
    reward: 16,
    notes: "Healing flyer."
  },
  {
    answer: "Shadowmane",
    lines: ["I move like a whisper and arrive like a storm.", "No saddle is needed for the pride I carry.", "The dark itself seems to favor my footsteps.", "Those who earn my trust gain a hunter built for the wild."],
    hint: "A powerful creature from Genesis 2 known for stealth and mobility.",
    reward: 19,
    notes: "Genesis creature."
  },
  {
    answer: "Rock Drake",
    lines: ["The cliff is my floor and the wall is merely another road.", "I wear the colors of my surroundings like borrowed robes.", "The sky is optional when stone offers a path.", "On the strangest map, I make gravity negotiable."],
    hint: "An Aberration creature famous for climbing and gliding.",
    reward: 19,
    notes: "Climbing and camouflage."
  },
  {
    answer: "Managarmr",
    lines: ["I do not merely run; I bargain with the air.", "The ground is a suggestion beneath my leaps.", "Cold follows my breath while distance loses its meaning.", "A rider can cross a battlefield before the eye catches up."],
    hint: "A fast ice creature with powerful leaps and mobility.",
    reward: 18,
    notes: "Extreme mobility."
  },
  {
    answer: "Gasbags",
    lines: ["I look too soft to be useful until the tribe needs a sky caravan.", "I swallow air and answer gravity with patience.", "Speed is not my talent; endurance is.", "A strange balloon can carry more than pride."],
    hint: "A Genesis creature used for floating transport and carrying weight.",
    reward: 17,
    notes: "Floating transport."
  },
  {
    answer: "Dodo",
    lines: ["The smallest court jester may still become a legend.", "I have little fear and even less dignity.", "Some tribes measure my worth in jokes; others in strange breeding.", "Do not mistake simplicity for uselessness."],
    hint: "One of ARK's simplest and most iconic creatures.",
    reward: 7,
    notes: "Iconic starter creature."
  },
  {
    answer: "Mammoth",
    lines: ["The forest hears my footsteps before the tribe sees me.", "My tusks are old weapons, but my greatest gift is labor.", "Wood bends to my strength.", "A giant from the cold can become a builder's companion."],
    hint: "A large creature prized for gathering huge amounts of wood.",
    reward: 13,
    notes: "Wood gathering."
  },
  {
    answer: "Quetzal",
    lines: ["I am a moving platform that learned to fly.", "My back can become a base above the clouds.", "The sky carries not only a rider, but a plan.", "Few flyers make the word 'airship' feel so literal."],
    hint: "A giant flyer capable of carrying structures on its platform saddle.",
    reward: 18,
    notes: "Platform flyer."
  },
  {
    answer: "Mammoth",
    lines: ["Cold is my kingdom, but trees are my treasure.", "A tribe may ride me into a forest and leave with half of it.", "I am slow enough to seem harmless and strong enough to prove otherwise.", "Some builders prefer patience with tusks."],
    hint: "A huge northern creature with excellent wood-gathering utility.",
    reward: 13,
    notes: "Northern harvester."
  },
  {
    answer: "Pteranodon",
    lines: ["I am the first taste of the open sky for many survivors.", "Speed is my answer to teeth on the ground.", "My saddle is modest, but the horizon is not.", "A beginner's wings can still unlock an entire island."],
    hint: "A common early flyer that opens up aerial exploration.",
    reward: 10,
    notes: "Early flyer."
  },
  {
    answer: "Trike",
    lines: ["My crown is made of horns, not gold.", "I push through brush while carrying a shield of bone.", "The berry fields become generous beneath my charge.", "A peaceful grazer can still teach a predator caution."],
    hint: "A horned herbivore useful for berries and defense.",
    reward: 10,
    notes: "Early herbivore."
  },
  {
    answer: "Thylacoleo",
    lines: ["The tree is my throne until an unlucky traveler passes beneath.", "I do not announce the fall; I become it.", "Claws meet bark, then survivor.", "The forest keeps a predator where the ground forgets to look."],
    hint: "A tree-climbing ambush predator.",
    reward: 16,
    notes: "Tree ambush creature."
  },
  {
    answer: "Titanoboa",
    lines: ["I have no legs, yet I can make a path feel closed.", "The swamp keeps many secrets, but few as patient as mine.", "I coil where the tribe would rather not step.", "Some ancient things never needed feet to become feared."],
    hint: "A large snake found in dangerous swamp environments.",
    reward: 14,
    notes: "Swamp predator."
  },
  {
    answer: "Mantis",
    lines: ["I carry no forge, yet I can wield another's craft.", "Give me the right tool and claws become a workshop.", "My arms were made for cutting; survivors taught them to do more.", "In the right hands, the wild becomes strangely well equipped."],
    hint: "A creature that can wield weapons and tools.",
    reward: 16,
    notes: "Weapon-wielding creature."
  },
  {
    answer: "Carcharodontosaurus",
    lines: ["I do not need a throne when the battlefield clears for me.", "The more danger I survive, the more dangerous I become.", "My hunger is measured in momentum.", "When rage becomes a resource, few predators compare."],
    hint: "A giant predator whose power can build through combat.",
    reward: 21,
    notes: "Late-game predator."
  },
  {
    answer: "Giganotosaurus",
    lines: ["Even the apex predator needs a reason to fear me.", "My temper is not a flaw; it is a warning.", "I was built less for companionship than for making the wild reconsider.", "When my footsteps arrive, smaller legends become quiet."],
    hint: "One of ARK's most famously dangerous giant predators.",
    reward: 21,
    notes: "Apex predator."
  },
  {
    answer: "Manticore",
    lines: ["I rule a throne no survivor can comfortably call home.", "Wings, sting, and ancient cruelty share one silhouette.", "Heroes do not tame my court; they challenge it.", "My defeat is a doorway, not a friendship."],
    hint: "A major boss fought in an arena.",
    reward: 22,
    notes: "Boss encounter."
  },
  {
    answer: "Broodmother Lysrix",
    lines: ["My web is not spun for flies alone.", "I rule beneath stone where heroes come carrying weapons.", "The swarm is my court and the arena my nest.", "To face me is to learn why the smallest legs can command fear."],
    hint: "A giant spider boss.",
    reward: 22,
    notes: "Boss encounter."
  },
  {
    answer: "Dragon",
    lines: ["I do not need a nest to make an arena feel like a kingdom.", "Fire answers every argument I make.", "Survivors bring armies because one life is not enough.", "My name is simple; my shadow is not."],
    hint: "A famous fire-breathing ARK boss.",
    reward: 22,
    notes: "Boss encounter."
  },
  {
    answer: "Rockwell",
    lines: ["I was once a scholar who mistook knowledge for permission.", "My ambition outgrew the body that carried it.", "Aberration remembers my name in places where the ceiling is the sky.", "Some bosses are beasts; I became something worse."],
    hint: "A major Aberration boss tied to a corrupted scientist.",
    reward: 22,
    notes: "Lore boss."
  },
  {
    answer: "Tek Cave",
    lines: ["The mountain keeps a door that opens only for the bold.", "Heat and darkness guard the final climb.", "Many enter with armies; few leave unchanged.", "The path upward ends where ancient machinery waits."],
    hint: "A dangerous endgame cave leading toward a major ascension.",
    reward: 20,
    notes: "Endgame location."
  },
  {
    answer: "Artifact of the Hunter",
    lines: ["I am called an artifact, yet hunters carry me like a trophy.", "The caves hide many answers, but mine favors the bold.", "A relic can become a key when an arena demands proof.", "I belong to the old language of bosses and tribute."],
    hint: "One of the cave relics used for boss tributes.",
    reward: 16,
    notes: "Boss tribute artifact."
  },
  {
    answer: "Beacon",
    lines: ["I fall from the heavens carrying gifts wrapped in danger.", "Survivors watch the sky when they need supplies.", "The light marks treasure, but treasure invites competition.", "Sometimes the safest road begins by looking upward."],
    hint: "A supply drop marked by colored light.",
    reward: 11,
    notes: "Supply drop."
  },
  {
    answer: "Supply Crate",
    lines: ["I arrive from above without wings of my own.", "My shell opens only after surviving the journey to me.", "Inside may wait tools, armor, or disappointment.", "The sky sometimes throws a tribe a bargain."],
    hint: "Airdropped container containing random loot.",
    reward: 10,
    notes: "Loot container."
  },
  {
    answer: "Loot Crate",
    lines: ["I am a treasure chest with no castle around me.", "The world hides me where survivors least expect fortune.", "Open me and chance decides whether the journey was worth it.", "Even a veteran can still hope when the lid appears."],
    hint: "A container that can hold random valuable loot.",
    reward: 10,
    notes: "Random loot."
  },
  {
    answer: "Tekgram",
    lines: ["I am not the machine, only the permission to understand it.", "Knowledge becomes power when a boss leaves a lesson behind.", "Without me, advanced blueprints remain silent.", "I am the key that turns impossible craft into known craft."],
    hint: "An unlock earned for advanced technology.",
    reward: 18,
    notes: "Technology unlock."
  },
  {
    answer: "Engram",
    lines: ["I am a memory that becomes a recipe.", "Survivors spend earned knowledge before their hands can build.", "I have no weight, yet I can unlock an entire workshop.", "Learning is my only material."],
    hint: "The system that unlocks craftable recipes.",
    reward: 10,
    notes: "Core progression system."
  }
];

let cursor = 0;

function chooseSeed(): RiddleSeed {
  // Mix the sequence so generation does not feel like a simple 1-2-3 rotation.
  const step = 7; // coprime with the current list length, giving a long cycle.
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
    hint: seed.hint,
    reward: seed.reward,
    notes: "Local Arcane Scribe • " + seed.notes
  };
}
