import { randomUUID } from "node:crypto";
import { prisma } from "../database/prisma.js";
import { arcaneStore,type ArcaneCharacterRecord } from "./store.js";
import { getClass,getItem } from "./catalog.js";
export type BattleState={hp:number;mana:number;shield:number;weakened:number;defended:boolean;relicUsed:boolean;log:string[]};
export type BattleRecord={id:string;guildId:string;challengerId:string;opponentId:string;turnUserId:string;status:string;round:number;state:any;messageId?:string|null};
const stats=(c:ArcaneCharacterRecord)=>{const cls=getClass(c.classId)!;const ar=getItem(c.armorId),fo=getItem(c.focusId);return {maxHp:cls.base.maxHp+(ar?.stats?.maxHp||0),maxMana:cls.base.maxMana+(ar?.stats?.maxMana||0),power:cls.base.power+(ar?.stats?.power||0),defense:cls.base.defense+(ar?.stats?.defense||0),speed:cls.base.speed+(ar?.stats?.speed||0)};};
const state=(c:ArcaneCharacterRecord):BattleState=>({hp:stats(c).maxHp,mana:stats(c).maxMana,shield:0,weakened:0,defended:false,relicUsed:false,log:[]});
class BattleStore {
async get(id:string){return prisma.arcaneBattle.findUnique({where:{id}}) as any;}
async active(guildId:string,userId:string){return prisma.arcaneBattle.findFirst({where:{guildId,status:"active",OR:[{challengerId:userId},{opponentId:userId}]},orderBy:{createdAt:"desc"}}) as any;}
async create(guildId:string,a:string,b:string){const ca=await arcaneStore.get(guildId,a),cb=await arcaneStore.get(guildId,b);if(!ca||!cb)throw new Error("Both wizards need characters.");const first=stats(ca).speed>=stats(cb).speed?a:b;return this.get((await prisma.arcaneBattle.create({data:{id:randomUUID(),guildId,challengerId:a,opponentId:b,turnUserId:first,status:"active",round:1,state:{[a]:state(ca),[b]:state(cb)}}})).id);}
async setMessage(id:string,messageId:string){await prisma.arcaneBattle.update({where:{id},data:{messageId}});}
async act(id:string,userId:string,action:string,itemId?:string){
const b:any=await this.get(id);if(!b||b.status!=="active")throw new Error("That trial is closed.");if(b.turnUserId!==userId)throw new Error("It is not your turn.");
const targetId=b.challengerId===userId?b.opponentId:b.challengerId;const actor=await arcaneStore.get(b.guildId,userId),target=await arcaneStore.get(b.guildId,targetId);if(!actor||!target)throw new Error("Wizard data is missing.");
const s:any=b.state,me:BattleState=s[userId],foe:BattleState=s[targetId],as=stats(actor),ts=stats(target);let text="";me.defended=false;
const hit=(raw:number)=>{let dmg=Math.max(1,raw+as.power-ts.defense-(foe.defended?6:0)-foe.weakened);const blocked=Math.min(foe.shield,dmg);foe.shield-=blocked;dmg-=blocked;foe.hp=Math.max(0,foe.hp-dmg);return {dmg,blocked};};
if(action==="attack"){const h=hit(Math.floor(Math.random()*7)+7);text="⚔️ "+actor.name+" struck for **"+h.dmg+"** damage."+(h.blocked?" "+h.blocked+" was warded.":"");}
else if(action==="defend"){me.defended=true;me.shield=Math.min(35,me.shield+12);text="🛡️ "+actor.name+" raised a ward.";}
else if(action==="focus"){me.mana=Math.min(as.maxMana,me.mana+18);text="🔮 "+actor.name+" recovered **18 Mana**.";}
else if(action==="spell"){const item=getItem(itemId||"");if(!item||item.kind!=="spell"||!actor.equippedSpellIds.includes(item.id))throw new Error("That spell is not equipped.");if(me.mana<8)throw new Error("Not enough Mana.");me.mana-=8;const v=item.effect?.value||10;switch(item.effect?.type){case"heal":me.hp=Math.min(as.maxHp,me.hp+v);text="✨ "+actor.name+" restored **"+v+" HP**.";break;case"shield":case"guard":me.shield=Math.min(35,me.shield+v);text="🛡️ "+actor.name+" raised a **"+v+"** ward.";break;case"mana":me.mana=Math.min(as.maxMana,me.mana+v);text="🔮 "+actor.name+" restored **"+v+" Mana**.";break;case"weaken":foe.weakened=Math.min(8,Math.ceil(v/2));text="🌑 "+actor.name+" weakened the enemy.";break;case"drain":{const h=hit(v);me.hp=Math.min(as.maxHp,me.hp+Math.floor(h.dmg/2));text="🌑 "+actor.name+" drained **"+h.dmg+" HP**.";break;}default:{const h=hit(v);text=item.emoji+" "+actor.name+" cast **"+item.name+"** for **"+h.dmg+"** damage.";}}}
else if(action==="relic"){const item=getItem(itemId||"");if(!item||item.kind!=="relic"||!actor.relicIds.includes(item.id))throw new Error("That relic is not equipped.");if(me.relicUsed)throw new Error("Your relic has already been used.");me.relicUsed=true;if(item.effect?.type==="shield"){me.shield=Math.min(35,me.shield+item.effect.value);text="🔶 "+actor.name+" invoked "+item.name+".";}else{text="🔶 "+actor.name+" invoked "+item.name+".";} }
else throw new Error("Unknown battle action.");
me.weakened=Math.max(0,me.weakened-1);foe.weakened=Math.max(0,foe.weakened-1);me.log=[...(me.log||[]),text].slice(-6);
if(foe.hp<=0){b.status="finished";await prisma.arcaneBattle.update({where:{id},data:{status:"finished",state:s}});await arcaneStore.addXp(actor,50);await arcaneStore.addXp(target,15);return {battle:b,message:text,winnerId:userId};}
b.turnUserId=targetId;b.round++;await prisma.arcaneBattle.update({where:{id},data:{turnUserId:targetId,round:b.round,state:s}});return {battle:b,message:text,winnerId:null};
}
}
export const battleStore=new BattleStore();