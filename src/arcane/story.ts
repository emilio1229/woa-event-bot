import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags, type Interaction } from "discord.js";
import { prisma } from "../database/prisma.js";
import { arcaneStore } from "./store.js";
import { sigilStore } from "../sigilStore.js";

export const STORY_PREFIX = "woa:arcane:story";
async function respondUpdate(i: any, payload: any) {
 return i.deferred || i.replied ? i.editReply(payload) : i.update(payload);
}
async function respondReply(i: any, payload: any) {
 return i.deferred || i.replied ? i.followUp(payload) : i.reply(payload);
}
const btn=(label:string,id:string,style:ButtonStyle=ButtonStyle.Primary)=>new ButtonBuilder().setLabel(label).setCustomId(id).setStyle(style);
const row=(...b:ButtonBuilder[])=>new ActionRowBuilder<ButtonBuilder>().addComponents(b);
type StoryState={step:number;route:string;familiar:string;claimed:boolean;encounterCleared:boolean;bossCleared:boolean;bossRewardClaimed:boolean;chapter2EncounterCleared:boolean;chapter2BossCleared:boolean;chapter2RewardClaimed:boolean};
const defaults:StoryState={step:0,route:"unselected",familiar:"archive_wisp",claimed:false,encounterCleared:false,bossCleared:false,bossRewardClaimed:false,chapter2EncounterCleared:false,chapter2BossCleared:false,chapter2RewardClaimed:false};
async function getState(guildId:string,userId:string):Promise<StoryState>{
 const record=await prisma.arcaneQuestProgress.findUnique({where:{guildId_userId:{guildId,userId}}});
 return {...defaults,...(record?.state as Partial<StoryState>|null||{})};
}
async function saveState(guildId:string,userId:string,state:StoryState){
 await prisma.arcaneQuestProgress.upsert({where:{guildId_userId:{guildId,userId}},create:{id:guildId+":"+userId,guildId,userId,chapter:state.step>=7?"hollow_crown_2":"hollow_crown_1",step:state.step,state:state as any},update:{chapter:state.step>=7?"hollow_crown_2":"hollow_crown_1",step:state.step,state:state as any}});
}
const scenes=[
 {title:"I • THE PAGE THAT NEVER WAS",body:"The Hall's lamps burn violet tonight. As you approach the Codex, every page turns at once—except one, which remains blank. Ink crawls across it without a quill. First comes a date older than the Council. Then a name: yours.\n\nThe Archivist slams the book shut. “That page was removed before your birth.” From somewhere beneath the floor, a bell answers. There is no bell beneath the Hall.",objective:"Speak to the Archivist and examine the impossible page.",action:"🔎 Examine the page"},
 {title:"THE ARCHIVIST'S OMISSION",body:"The Archivist insists the page is a forgery, yet refuses to touch its silver seal. Three marks remain in the dust: an open eye, a broken circle, and a crown with its center missing.\n\n“The Veilkeepers guarded a door,” the Archivist admits. “They did not guard what was behind it. They guarded the world from remembering it.”",objective:"Record the three marks in your Chronicle.",action:"📜 Record the sigil"},
 {title:"II • THE UNQUIET SIGIL",body:"A sigil appears in cold light. It does not burn; it remembers. The nearest relic answers with a note too low for ordinary ears. Across the Hall, lamps dim in sequence, pointing toward a door the Council insists has never existed.\n\nBeyond it, each stair bears a different version of the same symbol—carefully scratched away. Something below whispers your name, not as a greeting, but as a correction.",objective:"Follow the sigil into the sealed stairwell.",action:"🜂 Follow the whisper"},
 {title:"A COMPANION IN THE DARK",body:"A small light drifts from a crack in the stone: an Archive Wisp, a familiar made from stray memories and forgotten words. It circles your shoulder, then projects a page that no living scribe remembers writing.\n\nThe wisp chooses you—or recognizes you. It offers no explanation, only a soft chime whenever the missing crown is mentioned.",objective:"Welcome your first familiar and begin earning its trust.",action:"✨ Bond with the Archive Wisp"},
 {title:"III • THE COUNCIL'S SILENCE",body:"The Veiled Regent receives you beneath seven suspended lanterns. At the sight of your sigil, every flame turns blue. The Regent calls it an omen, then orders the guards to leave.\n\n“The Council has buried this truth to prevent panic,” the Regent says. “But silence has become another lock. If you seek answers, choose whose secrets you are willing to carry.”",objective:"Choose which lead to pursue. This affects your optional faction path.",action:"🗝️ Choose a lead"},
 {title:"IV • THE NIGHT BETWEEN STARS",body:"That night, every star above the Realm vanishes for a single breath. Across the Hall, Wizards see the same impossible image: a crown suspended over a bottomless sea, its empty center shaped exactly like the mark on your page.\n\nA voice speaks through every silent mirror: “The Crown was never broken. It was divided. And one of its pieces has begun to remember.”",objective:"Preserve the shared vision in your Chronicle.",action:"🌌 Preserve the vision"},
 {title:"V • THE HOLLOW CROWN",body:"At the stairwell's end lies a door with no handle. Your familiar settles against the lock, and the sigil answers. The door opens only a finger's width. Beyond it, something ancient draws a breath—and the entire Realm remembers a name it has spent centuries forgetting.\n\nThe Unwritten speaks from the dark: “You are not the key. You are the reason the lock was made.”",objective:"Defeat the Guardian and seal the Undercroft.",action:"👑 Complete the chapter"},
 {title:"CHAPTER II • THE BLIGHTED WILDS",body:"The Guardian's last ward breaks, but the Hollow Crown does not fall silent. A green-black pulse travels beneath the Realm and reaches the old forest beyond the wizard roads. Overnight, familiar paths twist into thorn-walled corridors; leaves whisper names that were never spoken aloud.\n\nThe Archivist gives you a cracked compass. “The blight is following the missing page. Find its source before the Wilds become a second archive—one that records only things it has devoured.”",objective:"Enter the Blighted Wilds and track the pulse toward the Rotroot Shrine.",action:"🌿 Enter the Blighted Wilds"},
 {title:"THE HUNTER IN THE THORNS",body:"A Blighted Stalker drops from the canopy, its thorned hide pulsing with the same silver-green ink that marked the impossible page. It circles rather than charges. Each lunge leaves it exposed for a heartbeat—if you can keep your nerve and choose your moment.\n\nYour familiar gives a warning chime. The Wilds are testing your instincts now, not merely your strength.",objective:"Defeat the Blighted Stalker to clear the path.",action:"⚔️ Face the Stalker"},
 {title:"THE ROTROOT SHRINE",body:"Beyond the hunter's trail, you find a shrine grown around a tree whose roots pierce stone like fingers. The blight gathers here, drawing symbols into the bark. Your Chronicle's broken-circle mark fits one of them perfectly.\n\nThe tree opens a hollow in its trunk. Inside rests a splinter of the Crown, beating like a second heart. When you reach for it, the roots rise—and an ancient Warden speaks through every leaf.",objective:"Prepare for the Warden of the Rotroot. Use your spells, wards, relics, and familiar wisely.",action:"🌑 Approach the shrine"},
 {title:"THE WARDEN OF THE ROTROOT",body:"The Warden steps from the living roots, crowned in briars and lit from within by the Crown's stolen splinter. Unlike the Guardian, it learns from every exchange: its shell breaks, its roots surge, and its final form draws strength from the shrine itself.\n\nThe familiar at your side is no longer just a guide. Every bond you have earned may be the difference between surviving the Wilds and becoming another forgotten name.",objective:"Defeat the Warden and recover the Crown splinter.",action:"🌳 Challenge the Warden"}
];
function chapterTitle(step:number){return step>=7?"*Chapter II: The Blighted Wilds*":"*Chapter I: The Page That Never Was*";}
function sceneEmbed(s:StoryState){
 const scene=scenes[Math.min(s.step,scenes.length-1)];
 const e=new EmbedBuilder().setColor(0x6A0DAD).setTitle("📖 THE SAGA OF THE HOLLOW CROWN").setDescription("**"+scene.title+"**\n\n"+scene.body+"\n\n**Current objective**\n"+scene.objective+"\n\n"+chapterTitle(s.step));
 if(s.step===3)e.addFields({name:"🪄 Your Familiar",value:"**Archive Wisp** • Memory-light familiar\nIt chimes near erased records and begins your familiar-bond journey."});
 if(s.step===2)e.addFields({name:s.encounterCleared?"⚔️ Undercroft secured":"⚔️ Hostile presence detected",value:s.encounterCleared?"The corrupted apprentice has been defeated. The stairwell is clear, and the Chronicle can continue.":"A corrupted apprentice is guarding the sealed stairwell. Defeat it to continue the investigation."});
 if(s.step===4)e.addFields({name:"Choose your lead",value:"**Archive faction:** preserve forbidden knowledge.\n**Veil faction:** protect the Realm from dangerous truths.\nYour choice changes optional quests, not the shared main saga."});
 if(s.step===6)e.addFields({name:s.bossCleared?"👑 The Guardian has fallen":"👑 The Hollow Crown Guardian",value:s.bossCleared?"The Guardian is defeated. The first chapter's threat has been contained; your enhanced chapter rewards are recorded.":"This is your first major test. The Guardian has three phases, but each phase gives you a small recovery window. Defeat it to reveal what is spreading beneath the Realm."});
 if(s.step===8)e.addFields({name:s.chapter2EncounterCleared?"🌿 Trail secured":"🌿 The Stalker is near",value:s.chapter2EncounterCleared?"The Blighted Stalker is defeated. The trail to the Rotroot Shrine is open.":"The Stalker is tougher than the Apprentice and punishes careless turns. Watch for openings after it attacks."});
 if(s.step===10)e.addFields({name:s.chapter2BossCleared?"🌳 The Warden has fallen":"🌳 Warden of the Rotroot",value:s.chapter2BossCleared?"The Crown splinter is secured. The Blighted Wilds begin to settle, but the saga is far from over.":"A three-phase boss guards the Crown splinter. Its attacks are stronger than Chapter I's, so use defensive turns, recovery, and familiar perks."});
 return e;
}
export async function buildStoryView(guildId:string,userId:string){
 const s=await getState(guildId,userId),components:any[]=[];
 if(s.step===2&&!s.encounterCleared)components.push(row(btn("⚔️ Enter the Undercroft",STORY_PREFIX+":encounter:corrupted_apprentice",ButtonStyle.Danger)));
 else if(s.step===6&&!s.bossCleared)components.push(row(btn("👑 Challenge the Guardian",STORY_PREFIX+":encounter:hollow_crown_guardian",ButtonStyle.Danger)));
 else if(s.step===6&&s.bossCleared)components.push(row(btn("🌿 Continue to Chapter II",STORY_PREFIX+":nextchapter",ButtonStyle.Success)));
 else if(s.step===8&&!s.chapter2EncounterCleared)components.push(row(btn("⚔️ Face the Blighted Stalker",STORY_PREFIX+":encounter:blighted_stalker",ButtonStyle.Danger)));
 else if(s.step===10&&!s.chapter2BossCleared)components.push(row(btn("🌳 Challenge the Warden",STORY_PREFIX+":encounter:wilds_keeper",ButtonStyle.Danger)));
 else if(s.step===10&&s.chapter2BossCleared)components.push(row(btn("📖 Return to the Hall", "woa:arcane:open", ButtonStyle.Success)));
 else if(s.step<scenes.length-1)components.push(row(btn(scenes[s.step].action,STORY_PREFIX+":next",ButtonStyle.Primary)));
 components.push(row(btn("◀ Return to Hall","woa:arcane:open",ButtonStyle.Secondary)));
 return {embeds:[sceneEmbed(s)],components};
}
export async function isStoryEncounterAvailable(guildId:string,userId:string,encounterId:string){
 const s=await getState(guildId,userId);
 if(encounterId==="corrupted_apprentice")return s.step===2&&!s.encounterCleared;
 if(encounterId==="hollow_crown_guardian")return s.step===6&&s.encounterCleared&&!s.bossCleared;
 if(encounterId==="blighted_stalker")return s.step===8&&!s.chapter2EncounterCleared&&s.bossCleared;
 if(encounterId==="wilds_keeper")return s.step===10&&s.chapter2EncounterCleared&&!s.chapter2BossCleared;
 return false;
}
export async function completeStoryEncounter(guildId:string,userId:string,encounterId:string){
 const s=await getState(guildId,userId);
 if(encounterId==="corrupted_apprentice"&&s.step===2&&!s.encounterCleared){s.encounterCleared=true;await saveState(guildId,userId,s);return {completed:true,boss:false};}
 if(encounterId==="hollow_crown_guardian"&&s.step===6&&s.encounterCleared&&!s.bossCleared){s.bossCleared=true;if(!s.bossRewardClaimed){const c=await arcaneStore.get(guildId,userId);if(c)await arcaneStore.addXp(c,150);await sigilStore.addTransaction(guildId,userId,35,"Arcane Chronicle: The Hollow Crown",{type:"award"});s.bossRewardClaimed=true;}await saveState(guildId,userId,s);return {completed:true,boss:true,chapter:1};}
 if(encounterId==="blighted_stalker"&&s.step===8&&s.bossCleared&&!s.chapter2EncounterCleared){s.chapter2EncounterCleared=true;await saveState(guildId,userId,s);return {completed:true,boss:false,chapter:2};}
 if(encounterId==="wilds_keeper"&&s.step===10&&s.chapter2EncounterCleared&&!s.chapter2BossCleared){s.chapter2BossCleared=true;if(!s.chapter2RewardClaimed){const c=await arcaneStore.get(guildId,userId);if(c)await arcaneStore.addXp(c,250);await sigilStore.addTransaction(guildId,userId,65,"Arcane Chronicle: The Blighted Wilds",{type:"award"});s.chapter2RewardClaimed=true;}await saveState(guildId,userId,s);return {completed:true,boss:true,chapter:2};}
 return {completed:false,boss:encounterId==="hollow_crown_guardian"||encounterId==="wilds_keeper"};
}
export async function handleArcaneStoryInteraction(i:Interaction){
 if(!("customId" in i)||typeof i.customId!=="string"||!i.customId.startsWith(STORY_PREFIX+":"))return false;
 if(!i.isButton())return true;
 if(!i.guildId){await respondReply(i,{content:"The Chronicle can only be read inside a server.",flags:MessageFlags.Ephemeral});return true;}
 try {
  const c=await arcaneStore.get(i.guildId,i.user.id);
  if(!c){await respondReply(i,{content:"Create your Wizard before beginning the Chronicle.",flags:MessageFlags.Ephemeral});return true;}
  const s=await getState(i.guildId,i.user.id),action=i.customId.slice((STORY_PREFIX+":").length);
  if(action==="restart"){s.step=0;s.route="unselected";s.familiar="archive_wisp";s.claimed=false;s.encounterCleared=false;s.bossCleared=false;s.bossRewardClaimed=false;s.chapter2EncounterCleared=false;s.chapter2BossCleared=false;s.chapter2RewardClaimed=false;await saveState(i.guildId,i.user.id,s);await respondUpdate(i,await buildStoryView(i.guildId,i.user.id));return true;}
  if(action.startsWith("encounter:")){await respondReply(i,{content:"Preparing your encounter…",flags:MessageFlags.Ephemeral});return true;}
  if(action==="nextchapter"){if(s.step!==6||!s.bossCleared){await respondUpdate(i,await buildStoryView(i.guildId,i.user.id));return true;}s.step=7;await saveState(i.guildId,i.user.id,s);await respondUpdate(i,await buildStoryView(i.guildId,i.user.id));return true;}
  if(action.startsWith("route:")){s.route=action.slice(6);await saveState(i.guildId,i.user.id,s);await respondUpdate(i,await buildStoryView(i.guildId,i.user.id));return true;}
  if(action==="next"){
   if((s.step===2&&!s.encounterCleared)||(s.step===6&&!s.bossCleared)||(s.step===8&&!s.chapter2EncounterCleared)||(s.step===10&&!s.chapter2BossCleared)){await respondUpdate(i,await buildStoryView(i.guildId,i.user.id));return true;}
   if(s.step===4&&s.route==="unselected"){await respondUpdate(i,await buildStoryView(i.guildId,i.user.id));return true;}
   if(s.step===3)s.familiar="archive_wisp";
   s.step=Math.min(s.step+1,scenes.length-1);
   await saveState(i.guildId,i.user.id,s);
   await respondUpdate(i,await buildStoryView(i.guildId,i.user.id));
   return true;
  }
  await respondReply(i,{content:"That Chronicle action is no longer available. Reopen the Chronicle from the Hall.",flags:MessageFlags.Ephemeral});
 } catch(error) {
  const message="The Chronicle could not advance: "+(error instanceof Error?error.message:"an unexpected error occurred")+". Please reopen it from the Hall.";
  if(!i.replied&&!i.deferred) await i.reply({content:message,flags:MessageFlags.Ephemeral});
  else await i.followUp({content:message,flags:MessageFlags.Ephemeral});
 }
 return true;
}
