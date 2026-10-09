import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags, type Interaction } from "discord.js";
import { prisma } from "../database/prisma.js";
import { arcaneStore } from "./store.js";
import { sigilStore } from "../sigilStore.js";

export const STORY_PREFIX = "woa:arcane:story";
const btn=(label:string,id:string,style:ButtonStyle=ButtonStyle.Primary)=>new ButtonBuilder().setLabel(label).setCustomId(id).setStyle(style);
const row=(...b:ButtonBuilder[])=>new ActionRowBuilder<ButtonBuilder>().addComponents(b);
type StoryState={step:number;route:string;familiar:string;claimed:boolean};
const defaults:StoryState={step:0,route:"unselected",familiar:"archive_wisp",claimed:false};
async function getState(guildId:string,userId:string):Promise<StoryState>{
 const record=await prisma.arcaneQuestProgress.findUnique({where:{guildId_userId:{guildId,userId}}});
 return {...defaults,...(record?.state as Partial<StoryState>|null||{})};
}
async function saveState(guildId:string,userId:string,state:StoryState){
 await prisma.arcaneQuestProgress.upsert({where:{guildId_userId:{guildId,userId}},create:{id:guildId+":"+userId,guildId,userId,chapter:"hollow_crown_1",step:state.step,state:state as any},update:{step:state.step,state:state as any}});
}
const scenes=[
 {title:"I • THE PAGE THAT NEVER WAS",body:"The Hall's lamps burn violet tonight. As you approach the Codex, every page turns at once—except one, which remains blank. Ink crawls across it without a quill. First comes a date older than the Council. Then a name: yours.\n\nThe Archivist slams the book shut. “That page was removed before your birth.” From somewhere beneath the floor, a bell answers. There is no bell beneath the Hall.",objective:"Speak to the Archivist and examine the impossible page.",action:"🔎 Examine the page"},
 {title:"THE ARCHIVIST'S OMISSION",body:"The Archivist insists the page is a forgery, yet refuses to touch its silver seal. Three marks remain in the dust: an open eye, a broken circle, and a crown with its center missing.\n\n“The Veilkeepers guarded a door,” the Archivist admits. “They did not guard what was behind it. They guarded the world from remembering it.”",objective:"Record the three marks in your Chronicle.",action:"📜 Record the sigil"},
 {title:"II • THE UNQUIET SIGIL",body:"A sigil appears in cold light. It does not burn; it remembers. The nearest relic answers with a note too low for ordinary ears. Across the Hall, lamps dim in sequence, pointing toward a door the Council insists has never existed.\n\nBeyond it, each stair bears a different version of the same symbol—carefully scratched away. Something below whispers your name, not as a greeting, but as a correction.",objective:"Follow the sigil into the sealed stairwell.",action:"🜂 Follow the whisper"},
 {title:"A COMPANION IN THE DARK",body:"A small light drifts from a crack in the stone: an Archive Wisp, a familiar made from stray memories and forgotten words. It circles your shoulder, then projects a page that no living scribe remembers writing.\n\nThe wisp chooses you—or recognizes you. It offers no explanation, only a soft chime whenever the missing crown is mentioned.",objective:"Welcome your first familiar and begin earning its trust.",action:"✨ Bond with the Archive Wisp"},
 {title:"III • THE COUNCIL'S SILENCE",body:"The Veiled Regent receives you beneath seven suspended lanterns. At the sight of your sigil, every flame turns blue. The Regent calls it an omen, then orders the guards to leave.\n\n“The Council has buried this truth to prevent panic,” the Regent says. “But silence has become another lock. If you seek answers, choose whose secrets you are willing to carry.”",objective:"Choose which lead to pursue. This affects your optional faction path.",action:"🗝️ Choose a lead"},
 {title:"IV • THE NIGHT BETWEEN STARS",body:"That night, every star above the Realm vanishes for a single breath. Across the Hall, Wizards see the same impossible image: a crown suspended over a bottomless sea, its empty center shaped exactly like the mark on your page.\n\nA voice speaks through every silent mirror: “The Crown was never broken. It was divided. And one of its pieces has begun to remember.”",objective:"Preserve the shared vision in your Chronicle.",action:"🌌 Preserve the vision"},
 {title:"V • THE HOLLOW CROWN",body:"At the stairwell's end lies a door with no handle. Your familiar settles against the lock, and the sigil answers. The door opens only a finger's width. Beyond it, something ancient draws a breath—and the entire Realm remembers a name it has spent centuries forgetting.\n\nThe Unwritten speaks from the dark: “You are not the key. You are the reason the lock was made.”",objective:"Complete the chapter and return to the Hall.",action:"👑 Complete the chapter"}
];
function sceneEmbed(s:StoryState){
 const scene=scenes[Math.min(s.step,scenes.length-1)];
 const e=new EmbedBuilder().setColor(0x6A0DAD).setTitle("📖 THE SAGA OF THE HOLLOW CROWN").setDescription("**"+scene.title+"**\n\n"+scene.body+"\n\n**Current objective**\n"+scene.objective+"\n\n*Chapter I: The Page That Never Was*");
 if(s.step===3)e.addFields({name:"🪄 Your Familiar",value:"**Archive Wisp** • Memory-light familiar\nIt chimes near erased records. Its bond grows as you uncover the Chronicle; it grants no extra combat turn."});
 if(s.step===4)e.addFields({name:"Choose your lead",value:"**Archive faction:** preserve forbidden knowledge.\n**Veil faction:** protect the Realm from dangerous truths.\nYour choice changes optional quests, not the shared main saga."});
 if(s.step>=scenes.length-1)e.addFields({name:"🕯️ Chronicle",value:"Chapter I complete. Your faction choice is recorded; future chapters can build on it."});
 return e;
}
export async function buildStoryView(guildId:string,userId:string){
 const s=await getState(guildId,userId),components:any[]=[];
 if(s.step===4&&s.route==="unselected")components.push(row(btn("📚 Follow the Archive",STORY_PREFIX+":route:archive"),btn("🕯️ Guard the Veil",STORY_PREFIX+":route:veil")));
 else if(s.step<scenes.length-1)components.push(row(btn(scenes[s.step].action,STORY_PREFIX+":next")));
 else components.push(row(btn("📖 Read Chapter Again",STORY_PREFIX+":restart")));
 components.push(row(btn("◀ Return to Hall","woa:arcane:open",ButtonStyle.Secondary)));
 return {embeds:[sceneEmbed(s)],components};
}
export async function handleArcaneStoryInteraction(i:Interaction){
 if(!("customId" in i)||typeof i.customId!=="string"||!i.customId.startsWith(STORY_PREFIX+":"))return false;
 if(!i.isButton())return true;
 if(!i.guildId){await i.reply({content:"The Chronicle can only be read inside a server.",flags:MessageFlags.Ephemeral});return true;}
 const c=await arcaneStore.get(i.guildId,i.user.id);
 if(!c){await i.reply({content:"Create your Wizard before beginning the Chronicle.",flags:MessageFlags.Ephemeral});return true;}
 const s=await getState(i.guildId,i.user.id),action=i.customId.slice((STORY_PREFIX+":").length);
 if(action==="restart"){s.step=0;await saveState(i.guildId,i.user.id,s);await i.update(await buildStoryView(i.guildId,i.user.id));return true;}
 if(action.startsWith("route:")){s.route=action.slice(6);await saveState(i.guildId,i.user.id,s);await i.update(await buildStoryView(i.guildId,i.user.id));return true;}
 if(action==="next"){
  if(s.step===4&&s.route==="unselected"){await i.update(await buildStoryView(i.guildId,i.user.id));return true;}
  if(s.step===3)s.familiar="archive_wisp";
  s.step=Math.min(s.step+1,scenes.length-1);
  if(s.step===scenes.length-1&&!s.claimed){s.claimed=true;await arcaneStore.addXp(c,75);await sigilStore.addTransaction(i.guildId,i.user.id,15,"Arcane Chronicle: The Page That Never Was",{type:"reward"});}
  await saveState(i.guildId,i.user.id,s);await i.update(await buildStoryView(i.guildId,i.user.id));return true;
 }
 return true;
}
