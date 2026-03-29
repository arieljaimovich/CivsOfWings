import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// GAME DATA
// ═══════════════════════════════════════════════════════════════════════════

const TRIBES = [
  {id:"mudwing",name:"MudWings",emoji:"🏔️",bonuses:{defense:2,production:1},palette:["#8B4513","#D2691E","#DEB887","#A0522D"]},
  {id:"sandwing",name:"SandWings",emoji:"☀️",bonuses:{gold:2,science:1},palette:["#DAA520","#FFD700","#F4A460","#CD853F"]},
  {id:"skywing",name:"SkyWings",emoji:"🔥",bonuses:{military:3},palette:["#DC143C","#FF4500","#FF6347","#B22222"]},
  {id:"seawing",name:"SeaWings",emoji:"🌊",bonuses:{food:2,culture:1},palette:["#006994","#00CED1","#20B2AA","#008B8B"]},
  {id:"rainwing",name:"RainWings",emoji:"🌈",bonuses:{culture:2,food:1},palette:["#32CD32","#FF69B4","#9370DB","#FFD700"]},
  {id:"nightwing",name:"NightWings",emoji:"🌙",bonuses:{science:3},palette:["#7B2FBE","#6A0DAD","#9B30FF","#191970"]},
  {id:"icewing",name:"IceWings",emoji:"❄️",bonuses:{science:1,military:1,defense:1},palette:["#5BA8C8","#87CEEB","#B0E0E6","#4682B4"]},
  {id:"silkwing",name:"SilkWings",emoji:"🦋",bonuses:{culture:3},palette:["#E87BA8","#DDA0DD","#E6E6FA","#FFDAB9"]},
  {id:"hivewing",name:"HiveWings",emoji:"🐝",bonuses:{production:3},palette:["#E8A817","#FFA500","#8B8000","#DAA520"]},
  {id:"leafwing",name:"LeafWings",emoji:"🍃",bonuses:{food:3},palette:["#228B22","#006400","#8FBC8F","#556B2F"]},
];

// ─── TRIBAL DRAGON ABILITIES ────────────────────────────────────────────────
const TRIBE_ABILITIES = {
  mudwing:  {name:"Mud Fire",emoji:"🔥",dmgBonus:4,desc:"Fire breath from swamp heat"},
  sandwing: {name:"Venom Barb",emoji:"🦂",dmgBonus:6,desc:"Venomous tail barb + fire"},
  skywing:  {name:"Sky Fire",emoji:"🔥",dmgBonus:5,desc:"Intense aerial fire breath",canSuperCharge:true},
  seawing:  {name:"Aqua Blast",emoji:"💧",dmgBonus:4,desc:"Pressurized water jet"},
  rainwing: {name:"Venom Spit",emoji:"☠️",dmgBonus:7,desc:"Deadly venom spray"},
  nightwing:{name:"Dark Fire",emoji:"🔥",dmgBonus:5,desc:"Shadow-infused fire breath"},
  icewing:  {name:"Frost Breath",emoji:"🥶",dmgBonus:6,desc:"Freezing ice blast"},
  silkwing: {name:"Silk Trap",emoji:"🕸️",dmgBonus:3,desc:"Entangling flamesilk",defBonus:4},
  hivewing: {name:"Stinger Strike",emoji:"🐝",dmgBonus:5,desc:"Paralyzing wrist stingers"},
  leafwing: {name:"Leafspeak",emoji:"🌿",dmgBonus:3,desc:"Controlling plants to attack",defBonus:3},
};

const RESOURCES = ["food","production","gold","science","culture","military","defense"];
const RES_ICONS = {food:"🌾",production:"⚒️",gold:"💰",science:"🔬",culture:"🎭",military:"⚔️",defense:"🛡️"};
const TERRAIN_TYPES = [
  {id:"plains",name:"Plains",color:"#7CCD7C",emoji:"🌿",yields:{food:2,production:1}},
  {id:"forest",name:"Forest",color:"#2E8B57",emoji:"🌲",yields:{food:1,production:2}},
  {id:"mountain",name:"Mountain",color:"#8B8989",emoji:"⛰️",yields:{production:2,defense:1}},
  {id:"desert",name:"Desert",color:"#EDC9AF",emoji:"🏜️",yields:{gold:2}},
  {id:"ocean",name:"Ocean",color:"#1E6091",emoji:"🌊",yields:{food:1,gold:1}},
  {id:"tundra",name:"Tundra",color:"#B0C4DE",emoji:"🧊",yields:{science:1,production:1}},
  {id:"swamp",name:"Swamp",color:"#556B2F",emoji:"🐊",yields:{food:2}},
  {id:"volcano",name:"Volcano",color:"#8B0000",emoji:"🌋",yields:{production:3,science:1}},
];
const BUILDINGS = [
  {id:"farm",name:"Farm",cost:{production:20},yields:{food:3},emoji:"🌾",desc:"+3 Food"},
  {id:"mine",name:"Mine",cost:{production:25},yields:{production:3},emoji:"⛏️",desc:"+3 Prod"},
  {id:"market",name:"Market",cost:{production:30},yields:{gold:4},emoji:"🏪",desc:"+4 Gold"},
  {id:"library",name:"Library",cost:{production:35},yields:{science:4},emoji:"📚",desc:"+4 Sci"},
  {id:"temple",name:"Temple",cost:{production:40},yields:{culture:4},emoji:"🏛️",desc:"+4 Culture"},
  {id:"barracks",name:"Barracks",cost:{production:30},yields:{military:3},emoji:"⚔️",desc:"+3 Mil"},
  {id:"walls",name:"Walls",cost:{production:45},yields:{defense:5},emoji:"🏰",desc:"+5 Def"},
  {id:"dragon_nest",name:"Dragon Nest",cost:{production:35},yields:{},emoji:"🪺",desc:"Hatch dragons!"},
];
const UNITS = [
  {id:"scout",name:"Scout",cost:{production:15,gold:5},strength:2,movement:3,emoji:"👁️"},
  {id:"warrior",name:"Warrior",cost:{production:25,gold:10},strength:5,movement:2,emoji:"⚔️"},
  {id:"archer",name:"Archer",cost:{production:30,gold:15},strength:4,movement:2,emoji:"🏹"},
  {id:"knight",name:"Knight",cost:{production:50,gold:25},strength:8,movement:3,emoji:"🛡️"},
  {id:"settler",name:"Settler",cost:{production:60,gold:30},strength:0,movement:2,emoji:"🏕️",canSettle:true},
];
const DRAGON_STAGES = [
  {id:"egg",name:"Egg",emoji:"🥚",turnsNeeded:2,strength:0,hp:5,movement:0},
  {id:"hatchling",name:"Hatchling",emoji:"🐣",turnsNeeded:2,strength:4,hp:15,movement:1},
  {id:"juvenile",name:"Juvenile",emoji:"🦎",turnsNeeded:3,strength:10,hp:30,movement:2},
  {id:"adult",name:"Adult",emoji:"🐉",turnsNeeded:4,strength:18,hp:50,movement:3},
  {id:"elder",name:"Elder",emoji:"👑",turnsNeeded:0,strength:30,hp:80,movement:4},
];
const DRAGON_NAMES = ["Blaze","Frostfire","Stormwing","Shadowclaw","Ember","Tsunami","Starflight","Glory","Clay","Peril","Sundew","Cricket","Blue","Luna","Willow","Moonwatcher","Kinkajou","Qibli","Winter","Turtle","Flame","Cliff","Riptide","Deathbringer","Clearsight"];
const HATCH_COST = {food:15,gold:20};
const DRAGON_EQUIPMENT = {
  shield:{name:"Dragon Shield",emoji:"🛡️",bonus:6},weapon:{name:"Fire Claw",emoji:"🗡️",bonus:6},
  armor:{name:"Scale Armor",emoji:"🦺",bonus:15},wings:{name:"Speed Wings",emoji:"🪽",bonus:1},
};
const FLY_BONUS_MOVES = 4;
const QUEEN_BONUS = {strength:12,hp:30,movement:1};
const DIPLO_THRESHOLDS = {enemy:-20,friendly:30,allied:60};
const GIFT_COST = {gold:20};
const GIFT_POINTS = 15;

// ─── DIPLOMACY HELPERS ──────────────────────────────────────────────────────
const diploKey = (a,b) => a<b?`${a}_${b}`:`${b}_${a}`;
function getDiplo(gs,a,b){return gs.diplomacy?.[diploKey(a,b)]||{points:0,relation:"neutral"};}
function getRelation(pts){return pts<=DIPLO_THRESHOLDS.enemy?"enemy":pts>=DIPLO_THRESHOLDS.allied?"allied":pts>=DIPLO_THRESHOLDS.friendly?"friendly":"neutral";}
const REL_COLORS = {enemy:"#ff4444",neutral:"#888",friendly:"#44aaff",allied:"#32CD32"};
const REL_EMOJI = {enemy:"⚔️",neutral:"😐",friendly:"🤝",allied:"💚"};

// ─── MATH RIDDLES ───────────────────────────────────────────────────────────
function generateMathRiddle(hard=false) {
  const types=hard?["multiply","fraction","percent","algebra"]:["multiply","divide","fraction","word","algebra","percent"];
  const type=types[Math.floor(Math.random()*types.length)];let question,answer,choices;
  switch(type){
    case "multiply":{const a=hard?Math.floor(Math.random()*12)+6:Math.floor(Math.random()*9)+3,b=hard?Math.floor(Math.random()*12)+6:Math.floor(Math.random()*9)+3;question=`${a} × ${b} = ?`;answer=a*b;choices=[answer,answer+a,answer-b,answer+Math.floor(Math.random()*10)+1];break;}
    case "divide":{const b2=Math.floor(Math.random()*8)+2,ans=Math.floor(Math.random()*10)+2,a2=b2*ans;question=`${a2} ÷ ${b2} = ?`;answer=ans;choices=[answer,answer+1,answer-1,answer+2];break;}
    case "fraction":{const num=Math.floor(Math.random()*4)+1,den=num*(Math.floor(Math.random()*3)+2),whole=Math.floor(Math.random()*5)+2;question=`${num}/${den} of ${whole*den/num} = ?`;answer=whole;choices=[answer,answer+1,answer*2,answer-1];break;}
    case "word":{const g=Math.floor(Math.random()*5)+3,p=Math.floor(Math.random()*6)+4,l=Math.floor(Math.random()*3)+1;question=`${g} nests × ${p} eggs − ${l} lost = ?`;answer=g*p-l;choices=[answer,g*p,answer+l,answer-1];break;}
    case "algebra":{const x=hard?Math.floor(Math.random()*15)+5:Math.floor(Math.random()*10)+2,a2=Math.floor(Math.random()*8)+1;question=`? + ${a2} = ${x+a2}`;answer=x;choices=[answer,a2,x+a2,answer+1];break;}
    case "percent":{const base=(Math.floor(Math.random()*5)+1)*20,pct=[10,20,25,50][Math.floor(Math.random()*4)];question=`${pct}% of ${base} = ?`;answer=base*pct/100;choices=[answer,answer+10,base-pct,answer*2];break;}
  }
  const unique=[...new Set(choices.map(Math.round))];while(unique.length<4)unique.push(unique[unique.length-1]+Math.floor(Math.random()*5)+1);
  if(!unique.includes(Math.round(answer)))unique[0]=Math.round(answer);
  return {question,answer:Math.round(answer),choices:unique.sort(()=>Math.random()-0.5),type};
}

// ═══════════════════════════════════════════════════════════════════════════
// HEX UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

const HEX_SIZE=32;
const hexToPixel=(q,r)=>({x:HEX_SIZE*(Math.sqrt(3)*q+Math.sqrt(3)/2*r),y:HEX_SIZE*(3/2*r)});
const hexCorner=(cx,cy,i)=>{const a=(Math.PI/180)*(60*i-30);return{x:cx+HEX_SIZE*Math.cos(a),y:cy+HEX_SIZE*Math.sin(a)};};
const hexPoints=(cx,cy)=>Array.from({length:6},(_,i)=>hexCorner(cx,cy,i)).map(p=>`${p.x},${p.y}`).join(" ");
const hexDistance=(a,b)=>(Math.abs(a.q-b.q)+Math.abs(a.q+a.r-b.q-b.r)+Math.abs(a.r-b.r))/2;
const hexNeighbors=(q,r)=>[[1,0],[-1,0],[0,1],[0,-1],[1,-1],[-1,1]].map(([dq,dr])=>({q:q+dq,r:r+dr}));
const hk=(q,r)=>`${q},${r}`;

function getReachableHexes(sQ,sR,range,tiles,curCiv,gs){
  const tm={};tiles.forEach(t=>tm[hk(t.q,t.r)]=t);const vis=new Set([hk(sQ,sR)]);const reach=[];let fr=[{q:sQ,r:sR}];
  for(let s=0;s<range;s++){const nf=[];for(const p of fr)for(const nb of hexNeighbors(p.q,p.r)){const k=hk(nb.q,nb.r);if(vis.has(k))continue;vis.add(k);const t=tm[k];if(!t||t.terrain.id==="ocean")continue;const hasE=gs.civs.some((c,ci)=>ci!==curCiv&&(c.units.some(u=>u.q===nb.q&&u.r===nb.r)||c.dragons.some(d=>d.q===nb.q&&d.r===nb.r&&d.stageIdx>0)));reach.push({q:nb.q,r:nb.r,hasEnemy:hasE});if(!hasE)nf.push(nb);}fr=nf;}
  return reach;
}

function generateMap(size,numCivs){const tiles=[],radius=size;for(let q=-radius;q<=radius;q++)for(let r=-radius;r<=radius;r++)if(Math.abs(q+r)<=radius){const n=Math.random();const terrain=n<0.05?TERRAIN_TYPES[7]:n<0.15?TERRAIN_TYPES[4]:n<0.25?TERRAIN_TYPES[2]:n<0.40?TERRAIN_TYPES[1]:n<0.50?TERRAIN_TYPES[3]:n<0.58?TERRAIN_TYPES[5]:n<0.65?TERRAIN_TYPES[6]:TERRAIN_TYPES[0];tiles.push({q,r,terrain,owner:null,resourceBonus:Math.random()>0.85?RESOURCES[Math.floor(Math.random()*RESOURCES.length)]:null});}const sp=[],vs=tiles.filter(t=>t.terrain.id!=="ocean"&&t.terrain.id!=="volcano"&&hexDistance(t,{q:0,r:0})>radius*0.3);for(let i=0;i<numCivs;i++){let best=null,bd=-1;for(const t of vs){const md=sp.length===0?999:Math.min(...sp.map(s=>hexDistance(t,s)));if(md>bd){bd=md;best=t;}}if(best)sp.push({q:best.q,r:best.r});}return{tiles,startPositions:sp};}

// ═══════════════════════════════════════════════════════════════════════════
// DRAGON HELPERS (with Queen/Heir/Settler)
// ═══════════════════════════════════════════════════════════════════════════

function getDragonStage(d){return DRAGON_STAGES[d.stageIdx];}
function getDragonStrength(d){let s=getDragonStage(d).strength+(d.weaponBonus||0);if(d.isQueen)s+=QUEEN_BONUS.strength;return s;}
function getDragonDefense(d){return(d.shieldBonus||0)+(d.isQueen?4:0);}
function getDragonMaxHp(d){let h=getDragonStage(d).hp+(d.armorBonus||0);if(d.isQueen)h+=QUEEN_BONUS.hp;return h;}
function getDragonMovement(d){let m=getDragonStage(d).movement+(d.speedBonus||0);if(d.isQueen)m+=QUEEN_BONUS.movement;return m;}

function createDragon(civIdx,city,nameIdx,opts={}){
  return{id:`drg_${civIdx}_${Date.now()}_${Math.random()}`,name:DRAGON_NAMES[nameIdx%DRAGON_NAMES.length],stageIdx:opts.stageIdx||0,turnsInStage:0,q:city.q,r:city.r,hp:DRAGON_STAGES[opts.stageIdx||0].hp+(opts.isQueen?QUEEN_BONUS.hp:0),moved:false,weaponBonus:0,shieldBonus:0,armorBonus:0,speedBonus:0,equipment:[],flyMoves:0,isQueen:opts.isQueen||false,isHeir:opts.isHeir||false,isSettler:opts.isSettler||false,superCharged:false};
}

function growDragons(civ){
  civ.dragons.forEach(d=>{const s=getDragonStage(d);if(d.stageIdx<4){d.turnsInStage++;if(d.turnsInStage>=s.turnsNeeded){d.stageIdx++;d.turnsInStage=0;const ns=getDragonStage(d);d.hp=Math.min(d.hp+ns.hp-s.hp,getDragonMaxHp(d));}}d.moved=false;d.flyMoves=0;d.superCharged=false;});
  // Succession: if queen dead and heir exists
  const hasQueen=civ.dragons.some(d=>d.isQueen);
  if(!hasQueen){const heir=civ.dragons.find(d=>d.isHeir&&d.stageIdx>=2);if(heir){heir.isHeir=false;heir.isQueen=true;heir.hp=getDragonMaxHp(heir);}}
}

// ═══════════════════════════════════════════════════════════════════════════
// GAME STATE INIT
// ═══════════════════════════════════════════════════════════════════════════

function initGameState(civConfigs,mapSizeKey="medium"){
  const szMap={small:6,medium:0,large:14};const baseRad=szMap[mapSizeKey]||0;
  const mapSize=baseRad>0?baseRad:Math.max(8,civConfigs.length+5);const{tiles,startPositions}=generateMap(mapSize,civConfigs.length);
  const diplomacy={};
  const civs=civConfigs.map((cfg,i)=>{
    const t1=TRIBES.find(t=>t.id===cfg.tribe1),t2=cfg.isHybrid?TRIBES.find(t=>t.id===cfg.tribe2):null;
    const bonuses={food:0,production:0,gold:0,science:0,culture:0,military:0,defense:0};
    if(t1)Object.entries(t1.bonuses).forEach(([k,v])=>bonuses[k]+=v);if(t2)Object.entries(t2.bonuses).forEach(([k,v])=>bonuses[k]+=Math.floor(v/2));
    const pos=startPositions[i]||{q:0,r:0};const name=cfg.customName||(t2?`${t1?.name}-${t2?.name}`:t1?.name||`Civ ${i+1}`);
    // Create queen dragon (starts as adult)
    const queen=createDragon(i,{q:pos.q-1,r:pos.r+1},i*3,{isQueen:true,stageIdx:3});
    return{id:i,name,isPlayer:cfg.isPlayer,color:cfg.color,tribe1:t1,tribe2:t2,bonuses,
      resources:{food:20,production:15,gold:30,science:0,culture:0,military:5,defense:5},
      cities:[{name:`${name} Capital`,q:pos.q,r:pos.r,population:3,buildings:["dragon_nest"],isCapital:true}],
      units:[{id:`u${i}_0`,type:"scout",q:pos.q+1,r:pos.r,hp:10,maxHp:10,moved:false},{id:`u${i}_1`,type:"warrior",q:pos.q,r:pos.r-1,hp:20,maxHp:20,moved:false}],
      dragons:[queen],score:0,alive:true,dragonNameIdx:i*3+1};
  });
  // Init diplomacy between all pairs
  for(let a=0;a<civs.length;a++)for(let b=a+1;b<civs.length;b++)diplomacy[diploKey(a,b)]={points:0,relation:"neutral"};
  tiles.forEach(tile=>{civs.forEach((civ,ci)=>{civ.cities.forEach(city=>{if(hexDistance(tile,city)<=2)tile.owner=ci;});});});
  const fp=civs.findIndex(c=>c.isPlayer);
  return{civs,tiles,turn:1,currentCivIdx:fp>=0?fp:0,log:["🐉 The age of dragons begins... Each tribe has a Queen!"],selectedTile:null,mapOffset:{x:0,y:0},zoom:1,moveMode:null,diplomacy};
}

// ═══════════════════════════════════════════════════════════════════════════
// AI + RESOURCES
// ═══════════════════════════════════════════════════════════════════════════

function processAITurn(gsIn,civIdx){
  const gs=JSON.parse(JSON.stringify(gsIn));const civ=gs.civs[civIdx];if(!civ.alive)return{gs,actions:[]};const actions=[];
  // Build
  civ.cities.forEach(city=>{const ub=BUILDINGS.filter(b=>!city.buildings.includes(b.id));if(ub.length>0&&civ.resources.production>=ub[0].cost.production){city.buildings.push(ub[0].id);civ.resources.production-=ub[0].cost.production;actions.push(`Built ${ub[0].emoji}`);}});
  // Recruit
  if(civ.units.length<civ.cities.length*3+2&&civ.resources.production>=25&&civ.resources.gold>=10){const city=civ.cities[0];const ut=UNITS.find(u=>u.id==="warrior");if(ut){civ.units.push({id:`ai${civIdx}_${Date.now()}_${Math.random()}`,type:ut.id,q:city.q+(Math.random()>.5?1:-1),r:city.r,hp:ut.strength*4,maxHp:ut.strength*4,moved:false});civ.resources.production-=ut.cost.production;civ.resources.gold-=ut.cost.gold;actions.push("Recruited ⚔️");}}
  // Hatch
  const nc=civ.cities.find(c=>c.buildings.includes("dragon_nest"));
  if(nc&&civ.dragons.length<3&&civ.resources.food>=HATCH_COST.food&&civ.resources.gold>=HATCH_COST.gold){civ.resources.food-=HATCH_COST.food;civ.resources.gold-=HATCH_COST.gold;const hasHeir=civ.dragons.some(d=>d.isHeir);civ.dragons.push(createDragon(civIdx,nc,civ.dragonNameIdx++,{isHeir:!hasHeir}));actions.push("🥚 Hatched dragon!");}
  // Move units
  let mc=0;civ.units.forEach(u=>{const nb=hexNeighbors(u.q,u.r).filter(n=>{const t=gs.tiles.find(tt=>tt.q===n.q&&tt.r===n.r);return t&&t.terrain.id!=="ocean";});if(nb.length>0){const tgt=nb[Math.floor(Math.random()*nb.length)];u.q=tgt.q;u.r=tgt.r;gs.tiles.forEach(t=>{if(t.owner===null&&hexDistance(t,tgt)<=1)t.owner=civIdx;});mc++;}});
  if(mc>0)actions.push(`Moved ${mc} unit${mc>1?"s":""}`);
  // Move dragons
  let dc=0;civ.dragons.filter(d=>d.stageIdx>0&&!d.isSettler).forEach(d=>{const nb=hexNeighbors(d.q,d.r).filter(n=>{const t=gs.tiles.find(tt=>tt.q===n.q&&tt.r===n.r);return t&&t.terrain.id!=="ocean";});if(nb.length>0){const tgt=nb[Math.floor(Math.random()*nb.length)];d.q=tgt.q;d.r=tgt.r;gs.tiles.forEach(t=>{if(t.owner===null&&hexDistance(t,tgt)<=1)t.owner=civIdx;});dc++;}});
  if(dc>0)actions.push(`🐉 Moved ${dc} dragon${dc>1?"s":""}`);
  // AI gifts to random neutral civ (diplomacy)
  if(civ.resources.gold>=40&&Math.random()>0.7){const others=gs.civs.filter((_,ci)=>ci!==civIdx&&getDiplo(gs,civIdx,ci).relation!=="enemy");if(others.length>0){const target=others[Math.floor(Math.random()*others.length)];const dk=diploKey(civIdx,target.id);gs.diplomacy[dk].points+=GIFT_POINTS;gs.diplomacy[dk].relation=getRelation(gs.diplomacy[dk].points);civ.resources.gold-=GIFT_COST.gold;actions.push(`🎁 Gifted ${target.name}`);}}
  return{gs,actions};
}

function processTurnResources(gsIn,civIdx){
  const gs=JSON.parse(JSON.stringify(gsIn));const civ=gs.civs[civIdx];if(!civ.alive)return gs;
  civ.cities.forEach(city=>{civ.resources.food+=city.population*2+civ.bonuses.food;civ.resources.production+=city.population+civ.bonuses.production;civ.resources.gold+=city.population+civ.bonuses.gold;civ.resources.science+=Math.floor(city.population/2)+civ.bonuses.science;civ.resources.culture+=Math.floor(city.population/3)+civ.bonuses.culture;civ.resources.military+=civ.bonuses.military;civ.resources.defense+=civ.bonuses.defense;city.buildings.forEach(bid=>{const b=BUILDINGS.find(bb=>bb.id===bid);if(b)Object.entries(b.yields).forEach(([k,v])=>civ.resources[k]+=v);});if(civ.resources.food>=city.population*10){city.population+=1;civ.resources.food-=city.population*8;}});
  gs.tiles.filter(t=>t.owner===civIdx).forEach(t=>{Object.entries(t.terrain.yields).forEach(([k,v])=>civ.resources[k]+=v*0.2);if(t.resourceBonus)civ.resources[t.resourceBonus]+=0.5;});
  growDragons(civ);
  civ.score=civ.cities.reduce((s,c)=>s+c.population*10,0)+gs.tiles.filter(t=>t.owner===civIdx).length*2+civ.units.length*5+civ.dragons.length*15+civ.dragons.filter(d=>d.isQueen).length*30+Object.values(civ.resources).reduce((s,v)=>s+v,0)*0.1;
  if(civ.cities.length===0)civ.alive=false;civ.units.forEach(u=>u.moved=false);return gs;
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const S={
  app:{width:"100%",height:"100vh",overflow:"hidden",fontFamily:"'Cinzel',serif",background:"#0a0a12",color:"#e8dcc8"},
  title:{background:"radial-gradient(ellipse at 50% 30%,#1a1035 0%,#0a0a12 70%)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",textAlign:"center"},
  btn:(c="#FFD700")=>({padding:"12px 40px",background:"transparent",border:`2px solid ${c}`,color:c,fontSize:"1rem",fontFamily:"'Cinzel',serif",cursor:"pointer",letterSpacing:3,textTransform:"uppercase",borderRadius:2,margin:8}),
  btnFilled:(bg="#FFD700",fg="#0a0a12")=>({padding:"12px 40px",background:bg,border:`2px solid ${bg}`,color:fg,fontSize:"1rem",fontFamily:"'Cinzel',serif",cursor:"pointer",letterSpacing:3,textTransform:"uppercase",borderRadius:2,margin:8,fontWeight:700}),
  panel:{background:"rgba(20,15,35,0.95)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:8,padding:16},
};

// ═══════════════════════════════════════════════════════════════════════════
// TITLE + SETUP
// ═══════════════════════════════════════════════════════════════════════════

function Particles(){const p=useMemo(()=>Array.from({length:25},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,size:Math.random()*3+1,dur:Math.random()*8+6,delay:Math.random()*5,color:["#FFD700","#FF6347","#9B30FF","#00CED1","#32CD32"][i%5]})),[]);return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}><style>{`@keyframes pF{0%,100%{transform:translateY(0) scale(1);opacity:.3}50%{transform:translateY(-30px) scale(1.5);opacity:.8}}`}</style>{p.map(x=><div key={x.id} style={{position:"absolute",left:`${x.x}%`,top:`${x.y}%`,width:x.size,height:x.size,borderRadius:"50%",background:x.color,animation:`pF ${x.dur}s ${x.delay}s infinite ease-in-out`}}/>)}</div>;}

function TitleScreen({onStart,onLoad}){
  const[h,setH]=useState(false);const[saves,setSaves]=useState([]);
  useEffect(()=>{try{const keys=Object.keys(localStorage).filter(k=>k.startsWith("wof-save:"));setSaves(keys);}catch(e){}},[]);
  const loadGame=(key)=>{try{const v=localStorage.getItem(key);if(v)onLoad(JSON.parse(v));}catch(e){alert("Failed to load");}};
  return <div style={S.title}><Particles/><div style={{zIndex:1}}>
    <div style={{fontSize:"0.85rem",color:"#6A5F8A",letterSpacing:12,textTransform:"uppercase",marginBottom:16}}>A Strategy Game Inspired By</div>
    <h1 style={{fontSize:"3.2rem",background:"linear-gradient(135deg,#FFD700,#FF6347,#FFD700)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8,letterSpacing:4}}>Wings of Fire</h1>
    <div style={{fontSize:"1rem",color:"#9B8EC4",letterSpacing:8,textTransform:"uppercase",marginBottom:40}}>Dominion of Scales</div>
    <button style={{...S.btnFilled(),transform:h?"scale(1.05)":"scale(1)",boxShadow:h?"0 0 30px rgba(255,215,0,0.4)":"none"}} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} onClick={onStart}>New Game</button>
    {saves.length>0&&<>
      <div style={{marginTop:20,fontSize:"0.7rem",color:"#666",letterSpacing:2}}>SAVED GAMES</div>
      {saves.map(k=><button key={k} onClick={()=>loadGame(k)} style={{...S.btn("#9B8EC4"),padding:"8px 24px",fontSize:"0.8rem",display:"block",margin:"6px auto"}}>{k.replace("wof-save:","")}</button>)}
    </>}
  </div></div>;
}

function GameSetup({onConfirm}){const[numCivs,setNumCivs]=useState(4);const[mapSz,setMapSz]=useState("medium");const[cfgs,setCfgs]=useState([]);useEffect(()=>{setCfgs(Array.from({length:numCivs},(_,i)=>({id:i,isPlayer:i===0,tribe1:TRIBES[i%TRIBES.length].id,tribe2:null,isHybrid:false,color:TRIBES[i%TRIBES.length].palette[0],customName:""})));},[numCivs]);const upd=(i,u)=>setCfgs(p=>p.map((c,j)=>j===i?{...c,...u}:c));
  const MAP_SIZES={small:{label:"Small",radius:6},medium:{label:"Medium",radius:0},large:{label:"Large",radius:14}};
  return(<div style={{...S.title,justifyContent:"flex-start",paddingTop:40,overflowY:"auto",height:"100vh"}}><Particles/><div style={{zIndex:1,width:"100%",maxWidth:900,padding:"0 20px"}}><h2 style={{fontSize:"2rem",color:"#FFD700",letterSpacing:4,marginBottom:8}}>Forge Your World</h2><div style={{...S.panel,marginBottom:24,display:"flex",alignItems:"center",justifyContent:"center",gap:20,flexWrap:"wrap"}}><span style={{fontSize:"0.9rem",letterSpacing:2}}>CIVILIZATIONS</span><div style={{display:"flex",gap:8}}>{[2,3,4,5,6,7,8,9,10].map(n=><button key={n} onClick={()=>setNumCivs(n)} style={{width:40,height:40,borderRadius:4,border:n===numCivs?"2px solid #FFD700":"1px solid #333",background:n===numCivs?"rgba(255,215,0,0.15)":"transparent",color:n===numCivs?"#FFD700":"#888",fontFamily:"'Cinzel',serif",fontSize:"1rem",cursor:"pointer"}}>{n}</button>)}</div></div>
    <div style={{...S.panel,marginBottom:24,display:"flex",alignItems:"center",justifyContent:"center",gap:20}}><span style={{fontSize:"0.9rem",letterSpacing:2}}>MAP SIZE</span><div style={{display:"flex",gap:8}}>{Object.entries(MAP_SIZES).map(([k,v])=><button key={k} onClick={()=>setMapSz(k)} style={{padding:"8px 20px",borderRadius:4,border:k===mapSz?"2px solid #FFD700":"1px solid #333",background:k===mapSz?"rgba(255,215,0,0.15)":"transparent",color:k===mapSz?"#FFD700":"#888",fontFamily:"'Cinzel',serif",fontSize:"0.9rem",cursor:"pointer",letterSpacing:1}}>{v.label}</button>)}</div></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(400px,1fr))",gap:16,marginBottom:30}}>{cfgs.map((civ,idx)=>{const t1=TRIBES.find(t=>t.id===civ.tribe1),t2=civ.isHybrid?TRIBES.find(t=>t.id===civ.tribe2):null;return(<div key={idx} style={{...S.panel,border:`1px solid ${civ.color}44`}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}><span style={{fontSize:"0.7rem",letterSpacing:3,color:"#6A5F8A"}}>CIV {idx+1}</span><div style={{display:"flex",gap:4}}>{[true,false].map(isP=><button key={String(isP)} onClick={()=>upd(idx,{isPlayer:isP})} style={{padding:"4px 12px",borderRadius:3,border:`1px solid ${civ.isPlayer===isP?(isP?"#32CD32":"#FF6347"):"#444"}`,background:civ.isPlayer===isP?(isP?"rgba(50,205,50,0.15)":"rgba(255,99,71,0.15)"):"transparent",color:civ.isPlayer===isP?(isP?"#32CD32":"#FF6347"):"#666",fontFamily:"'Cinzel',serif",fontSize:"0.7rem",cursor:"pointer"}}>{isP?"PLAYER":"AI"}</button>)}</div></div><input value={civ.customName} placeholder={t1?.name} onChange={e=>upd(idx,{customName:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:4,padding:"8px 12px",color:"#e8dcc8",fontFamily:"'Cinzel',serif",fontSize:"0.9rem",marginBottom:12,boxSizing:"border-box"}}/><div style={{marginBottom:8,fontSize:"0.7rem",color:"#6A5F8A",letterSpacing:2}}>TRIBE</div><div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:12}}>{TRIBES.map(t=><button key={t.id} onClick={()=>upd(idx,{tribe1:t.id,color:t.palette[0]})} title={t.name} style={{width:32,height:32,borderRadius:4,border:civ.tribe1===t.id?`2px solid ${t.palette[0]}`:"1px solid #333",background:civ.tribe1===t.id?`${t.palette[0]}33`:"transparent",fontSize:"0.85rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{t.emoji}</button>)}</div><label style={{display:"flex",alignItems:"center",gap:8,fontSize:"0.8rem",color:"#9B8EC4",marginBottom:8,cursor:"pointer"}}><input type="checkbox" checked={civ.isHybrid} onChange={e=>upd(idx,{isHybrid:e.target.checked,tribe2:e.target.checked?TRIBES[(TRIBES.findIndex(t=>t.id===civ.tribe1)+1)%TRIBES.length].id:null})} style={{accentColor:"#FFD700"}}/>Hybrid</label>{civ.isHybrid&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:12}}>{TRIBES.filter(t=>t.id!==civ.tribe1).map(t=><button key={t.id} onClick={()=>upd(idx,{tribe2:t.id})} style={{width:32,height:32,borderRadius:4,border:civ.tribe2===t.id?`2px solid ${t.palette[0]}`:"1px solid #333",background:civ.tribe2===t.id?`${t.palette[0]}33`:"transparent",fontSize:"0.85rem",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{t.emoji}</button>)}</div>}<div style={{display:"flex",gap:6,marginBottom:8}}>{[...(t1?.palette||[]),"#FFD700","#FF1493","#00FF7F","#FF4500"].slice(0,8).map((c,ci)=><button key={ci} onClick={()=>upd(idx,{color:c})} style={{width:24,height:24,borderRadius:"50%",background:c,border:civ.color===c?"3px solid white":"2px solid #333",cursor:"pointer"}}/>)}</div></div>);})}</div>
    <div style={{textAlign:"center",marginBottom:40}}><button onClick={()=>onConfirm(cfgs,mapSz)} style={S.btnFilled()}>Launch Game</button></div></div></div>);
}

// ═══════════════════════════════════════════════════════════════════════════
// RESOURCE BAR + HEX LEGEND
// ═══════════════════════════════════════════════════════════════════════════

function ResourceBar({civ}){return <div style={{display:"flex",gap:8,flexWrap:"wrap",padding:"6px 16px",background:`linear-gradient(90deg,${civ.color}18,transparent 50%)`,borderBottom:`2px solid ${civ.color}44`}}><span style={{color:civ.color,fontWeight:700,fontSize:"0.8rem",display:"flex",alignItems:"center",gap:6}}><span style={{width:10,height:10,borderRadius:"50%",background:civ.color}}/>{civ.name}</span>{RESOURCES.map(r=><span key={r} style={{fontSize:"0.74rem",color:"#ccc",display:"flex",alignItems:"center",gap:3,padding:"2px 6px",background:"rgba(255,255,255,0.04)",borderRadius:4}}>{RES_ICONS[r]}<strong>{Math.floor(civ.resources[r])}</strong></span>)}</div>;}

// ─── TERRAIN LEGEND (clear color boxes) ──────────────────────────────────
function TerrainLegend(){return <div style={{display:"flex",gap:6,alignItems:"center",padding:"4px 10px",background:"rgba(0,0,0,0.7)",borderRadius:6,flexWrap:"wrap"}}><span style={{fontSize:"0.58rem",color:"#777",letterSpacing:2,marginRight:2}}>TERRAIN:</span>{TERRAIN_TYPES.map(t=><div key={t.id} style={{display:"flex",alignItems:"center",gap:3,padding:"2px 6px",borderRadius:3,background:`${t.color}33`,border:`1px solid ${t.color}55`}}><div style={{width:10,height:10,borderRadius:2,background:t.color}}/><span style={{fontSize:"0.6rem",color:"#ccc"}}>{t.emoji} {t.name}</span></div>)}</div>;}

// ═══════════════════════════════════════════════════════════════════════════
// HEX MAP
// ═══════════════════════════════════════════════════════════════════════════

function HexMap({gs,setGs,onSelectTile,currentCivIdx,moveMode,onMoveToHex}){
  const svgRef=useRef(null);const[drag,setDrag]=useState(null);const[hoverTile,setHoverTile]=useState(null);
  const onDown=e=>{if(e.target.closest('.ht'))return;setDrag({sx:e.clientX,sy:e.clientY,ox:gs.mapOffset.x,oy:gs.mapOffset.y});};
  const onMove=e=>{if(!drag)return;setGs(p=>({...p,mapOffset:{x:drag.ox+(e.clientX-drag.sx)/gs.zoom,y:drag.oy+(e.clientY-drag.sy)/gs.zoom}}));};
  const onUp=()=>setDrag(null);
  const onWheel=e=>{e.preventDefault();setGs(p=>({...p,zoom:Math.max(0.3,Math.min(2.5,p.zoom-e.deltaY*0.001))}));};
  useEffect(()=>{const el=svgRef.current;if(el){el.addEventListener('wheel',onWheel,{passive:false});return()=>el.removeEventListener('wheel',onWheel);}});
  const rSet=useMemo(()=>{if(!moveMode)return{};const m={};moveMode.reachable.forEach(r=>m[hk(r.q,r.r)]=r);return m;},[moveMode]);

  return (
    <svg ref={svgRef} width="100%" height="100%" style={{background:"#080810",cursor:drag?"grabbing":"grab"}} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}>
      <defs>
        <filter id="gl"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="dg"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="ep"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <radialGradient id="fg"><stop offset="65%" stopColor="transparent"/><stop offset="100%" stopColor="#080810"/></radialGradient>
      </defs>
      <style>{`@keyframes ePulse{0%,100%{opacity:.6}50%{opacity:1}}@keyframes rP{0%,100%{opacity:.2}50%{opacity:.45}}@keyframes aP{0%,100%{opacity:.25}50%{opacity:.6}}`}</style>
      <g transform={`translate(${480+gs.mapOffset.x*gs.zoom},${380+gs.mapOffset.y*gs.zoom}) scale(${gs.zoom})`}>
        {gs.tiles.map((tile,ti)=>{
          const{x,y}=hexToPixel(tile.q,tile.r);const owner=tile.owner!==null?gs.civs[tile.owner]:null;
          const isSel=gs.selectedTile&&gs.selectedTile.q===tile.q&&gs.selectedTile.r===tile.r;
          const isHov=hoverTile&&hoverTile.q===tile.q&&hoverTile.r===tile.r;
          const cityHere=gs.civs.reduce((f,c)=>f||c.cities.find(ct=>ct.q===tile.q&&ct.r===tile.r),null);
          const cityOwner=cityHere?gs.civs.find(c=>c.cities.includes(cityHere)):null;
          const ownU=gs.civs[currentCivIdx].units.filter(u=>u.q===tile.q&&u.r===tile.r);
          const enemyU=gs.civs.flatMap((c,ci)=>ci!==currentCivIdx?c.units.filter(u=>u.q===tile.q&&u.r===tile.r).map(u=>({...u,civIdx:ci})):[]);
          const ownD=gs.civs[currentCivIdx].dragons.filter(d=>d.q===tile.q&&d.r===tile.r);
          const enemyD=gs.civs.flatMap((c,ci)=>ci!==currentCivIdx?c.dragons.filter(d=>d.q===tile.q&&d.r===tile.r).map(d=>({...d,civIdx:ci})):[]);
          const ri=rSet[hk(tile.q,tile.r)];const isR=!!ri;const isA=ri?.hasEnemy;
          const isMS=moveMode&&moveMode.entityQ===tile.q&&moveMode.entityR===tile.r;
          const handleClick=e=>{e.stopPropagation();if(isR&&onMoveToHex){onMoveToHex(tile.q,tile.r);return;}onSelectTile(tile);};

          return (
            <g key={ti} className="ht" style={{cursor:"pointer"}} onClick={handleClick} onMouseEnter={()=>setHoverTile(tile)} onMouseLeave={()=>setHoverTile(null)}>
              <polygon points={hexPoints(x,y)} fill={tile.terrain.color} fillOpacity={0.5} stroke={isSel?"#FFD700":isMS?"#00BFFF":owner?owner.color:"rgba(255,255,255,0.06)"} strokeWidth={isSel?2.5:isMS?2.5:isHov?1.5:0.5} filter={isSel||isMS?"url(#gl)":undefined}/>
              {owner&&<polygon points={hexPoints(x,y)} fill={owner.color} fillOpacity={0.3} stroke={owner.color} strokeWidth={1} strokeOpacity={0.5}/>}
              {isR&&!isA&&<polygon points={hexPoints(x,y)} fill="#00BFFF" fillOpacity={isHov?.4:.18} stroke="#00BFFF" strokeWidth={isHov?2.5:1.5} strokeOpacity={isHov?.9:.5} style={{animation:"rP 2s infinite"}}/>}
              {isA&&<polygon points={hexPoints(x,y)} fill="#FF4444" fillOpacity={isHov?.5:.22} stroke="#FF4444" strokeWidth={isHov?2.5:2} style={{animation:"aP 1.2s infinite"}}/>}
              {isR&&isHov&&<text x={x} y={y-HEX_SIZE+4} textAnchor="middle" fontSize="8" fill={isA?"#ff6666":"#00BFFF"} fontWeight="bold">{isA?"⚔️ Attack":"Move"}</text>}
              {isHov&&!isR&&<polygon points={hexPoints(x,y)} fill="white" fillOpacity={0.05}/>}
              {tile.resourceBonus&&<text x={x} y={y-12} textAnchor="middle" fontSize="9" fill="#FFD700" opacity=".7">✦</text>}
              {/* City */}
              {cityHere&&<><circle cx={x} cy={y} r={15} fill={cityOwner?.color||"#fff"} opacity=".35"/><circle cx={x} cy={y} r={15} fill="none" stroke={cityOwner?.color} strokeWidth="1.5" opacity=".7"/><text x={x} y={y+5} textAnchor="middle" fontSize="15">{cityHere.isCapital?"👑":"🏙️"}</text><text x={x} y={y+26} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="bold" style={{textShadow:"0 0 4px black"}}>{cityHere.name.split(" ")[0]}</text></>}
              {/* Own units */}
              {ownU.length>0&&(()=>{const u=ownU[0];const ut=UNITS.find(uu=>uu.id===u.type);const ux=cityHere?x-16:x,uy=cityHere?y-14:y;return <g><circle cx={ux} cy={uy} r={14} fill={gs.civs[currentCivIdx].color} opacity={.6}/><text x={ux} y={uy+5} textAnchor="middle" fontSize="16">{ut?.emoji}</text>{ownU.length>1&&<text x={ux+16} y={uy-6} textAnchor="middle" fontSize="9" fill="#fff" fontWeight="bold">+{ownU.length-1}</text>}</g>;})()}
              {/* Enemy units */}
              {enemyU.length>0&&(()=>{const u=enemyU[0];const ut=UNITS.find(uu=>uu.id===u.type);const col=gs.civs[u.civIdx]?.color;const ex=cityHere?x+16:ownU.length>0?x+18:x,ey=cityHere?y-14:y;return <g filter="url(#ep)"><circle cx={ex} cy={ey} r={14} fill="rgba(255,0,0,0.15)" stroke="#ff4444" strokeWidth="2" strokeDasharray="4,2" style={{animation:"ePulse 1.5s infinite"}}/><circle cx={ex} cy={ey} r={10} fill={col} opacity={.7}/><text x={ex} y={ey+5} textAnchor="middle" fontSize="14">{ut?.emoji}</text><text x={ex} y={ey+20} textAnchor="middle" fontSize="6" fill={col} fontWeight="bold" style={{textShadow:"0 0 3px black"}}>{gs.civs[u.civIdx]?.name?.slice(0,6)}</text></g>;})()}
              {/* Own dragons */}
              {ownD.length>0&&(()=>{const d=ownD[0];const st=getDragonStage(d);const col=gs.civs[currentCivIdx].color;const dx=cityHere?x+16:ownU.length?x-18:x,dy=cityHere?y+6:ownU.length?y+4:y;const r=d.isQueen?18:d.stageIdx>=3?16:13;return <g filter={d.stageIdx>=3||d.isQueen?"url(#dg)":undefined}><circle cx={dx} cy={dy} r={r} fill={col} opacity={.45}/><circle cx={dx} cy={dy} r={r} fill="none" stroke={d.isQueen?"#FFD700":col} strokeWidth={d.isQueen?3:d.stageIdx>=3?2.5:1.5} strokeDasharray={d.stageIdx===0?"3,3":""}/><text x={dx} y={dy+5} textAnchor="middle" fontSize={d.isQueen?20:d.stageIdx>=3?18:14}>{d.isQueen?"👸":st.emoji}</text>{d.isHeir&&<text x={dx+r} y={dy-r+3} textAnchor="middle" fontSize="8" fill="#FFD700">♛</text>}{d.isSettler&&<text x={dx-r} y={dy-r+3} textAnchor="middle" fontSize="8" fill="#32CD32">🏕️</text>}{ownD.length>1&&<text x={dx+14} y={dy-6} textAnchor="middle" fontSize="8" fill="#fff">+{ownD.length-1}</text>}{d.equipment?.length>0&&<text x={dx} y={dy-r-3} textAnchor="middle" fontSize="7" fill="#FFD700">{d.equipment.map(e=>DRAGON_EQUIPMENT[e]?.emoji||"").join("")}</text>}{d.flyMoves>0&&<text x={dx+r} y={dy-r} textAnchor="middle" fontSize="8" fill="#00BFFF">✈{d.flyMoves}</text>}</g>;})()}
              {/* Enemy dragons */}
              {enemyD.length>0&&(()=>{const d=enemyD[0];const st=getDragonStage(d);const col=gs.civs[d.civIdx]?.color;const dx=x+(ownD.length?18:0)+(ownU.length?10:0),dy=y+(ownD.length?0:6);const r=d.stageIdx>=3?16:13;return <g filter="url(#ep)"><circle cx={dx} cy={dy} r={r+2} fill="rgba(255,0,0,0.1)" stroke="#ff4444" strokeWidth="2" strokeDasharray="4,2" style={{animation:"ePulse 1.5s infinite"}}/><circle cx={dx} cy={dy} r={r} fill={col} opacity={.5}/><text x={dx} y={dy+5} textAnchor="middle" fontSize={d.stageIdx>=3?18:14}>{d.isQueen?"👸":st.emoji}</text><text x={dx} y={dy+r+10} textAnchor="middle" fontSize="6" fill={col} fontWeight="bold" style={{textShadow:"0 0 3px black"}}>{gs.civs[d.civIdx]?.name?.slice(0,6)}</text></g>;})()}
            </g>
          );
        })}
      </g>
      <rect width="100%" height="100%" fill="url(#fg)" pointerEvents="none"/>
      {moveMode&&<text x="50%" y="28" textAnchor="middle" fontSize="13" fill="#00BFFF" fontWeight="bold" fontFamily="Cinzel,serif" style={{textShadow:"0 0 8px #00BFFF"}}>Click a highlighted hex to move · ESC to cancel</text>}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RIDDLE MODAL
// ═══════════════════════════════════════════════════════════════════════════

function MathRiddleModal({dragon,onReward,onClose,civColor,mode,tribeId}){
  const hard=mode==="supercharge";
  const[riddle]=useState(()=>generateMathRiddle(hard));const[sel,setSel]=useState(null);const[result,setResult]=useState(null);const[rp,setRp]=useState(false);
  const ha=c=>{if(result)return;setSel(c);if(c===riddle.answer){setResult("correct");setTimeout(()=>setRp(true),800);}else setResult("wrong");};
  const st=getDragonStage(dragon);const ability=TRIBE_ABILITIES[tribeId];
  return (<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,backdropFilter:"blur(3px)"}}><div style={{...S.panel,padding:24,minWidth:400,maxWidth:480,border:`2px solid ${civColor}66`}}><style>{`@keyframes sparkle{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}@keyframes shakeX{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
    {!rp?(<><div style={{textAlign:"center",marginBottom:14}}><span style={{fontSize:"2rem"}}>{st.emoji}</span><div style={{fontSize:"0.9rem",color:civColor,fontWeight:700,marginTop:4}}>{dragon.name} — {mode==="fly"?"Flight!":mode==="supercharge"?`${ability?.emoji} ${ability?.name} Challenge!`:mode==="callAllies"?"📯 Call Allies to War!":"Riddle!"}</div><div style={{fontSize:"0.65rem",color:"#888",marginTop:4}}>{mode==="fly"?`Solve for +${FLY_BONUS_MOVES} flight moves`:mode==="supercharge"?"Solve HARD riddle for super-charged ability!":mode==="callAllies"?"Solve to summon allied dragons to your position!":"Solve for a power-up"}{hard?" (HARD!)":""}</div></div><div style={{background:"rgba(255,215,0,0.08)",borderRadius:8,padding:14,marginBottom:14,textAlign:"center"}}><div style={{fontSize:"1.1rem",color:"#FFD700",fontWeight:600}}>{riddle.question}</div></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>{riddle.choices.map((c,i)=>{const isT=sel===c;const bg=!result?`${civColor}15`:c===riddle.answer?"rgba(50,205,50,0.2)":isT?"rgba(255,60,60,0.2)":"rgba(255,255,255,0.03)";const brd=!result?`1px solid ${civColor}44`:c===riddle.answer?"2px solid #32CD32":isT?"2px solid #f44":"1px solid #333";return <button key={i} onClick={()=>ha(c)} disabled={!!result} style={{padding:12,background:bg,border:brd,borderRadius:8,color:"#e8dcc8",fontFamily:"'Cinzel',serif",fontSize:"1.15rem",fontWeight:700,cursor:result?"default":"pointer",animation:isT&&result==="wrong"?"shakeX 0.4s":""}}>{c}{result&&c===riddle.answer&&" ✅"}{isT&&result==="wrong"&&" ❌"}</button>;})}</div>{result==="wrong"&&<div style={{textAlign:"center"}}><div style={{color:"#f66",fontSize:"0.8rem",marginBottom:8}}>Answer: <strong>{riddle.answer}</strong></div><button onClick={onClose} style={{padding:"6px 20px",background:"rgba(255,255,255,0.05)",border:"1px solid #444",borderRadius:4,color:"#aaa",fontFamily:"'Cinzel',serif",cursor:"pointer"}}>Close</button></div>}{result==="correct"&&!rp&&<div style={{textAlign:"center",color:"#32CD32",fontSize:"1rem",animation:"sparkle 0.6s infinite"}}>🎉 Correct!</div>}</>)
    :(<>{mode==="fly"?<div style={{textAlign:"center"}}><div style={{fontSize:"2rem",animation:"sparkle 1s infinite"}}>🦅</div><div style={{fontSize:"1rem",color:"#00BFFF",fontWeight:700,marginBottom:8}}>Dragon Takes Flight!</div><button onClick={()=>onReward("fly")} style={{padding:"8px 24px",background:"rgba(0,191,255,0.15)",border:"2px solid #00BFFF",borderRadius:6,color:"#00BFFF",fontFamily:"'Cinzel',serif",fontWeight:700,cursor:"pointer"}}>🦅 Activate Flight!</button></div>
    :mode==="supercharge"?<div style={{textAlign:"center"}}><div style={{fontSize:"2rem",animation:"sparkle 1s infinite"}}>{ability?.emoji}</div><div style={{fontSize:"1rem",color:"#FF6347",fontWeight:700,marginBottom:8}}>{ability?.name} Super-Charged!</div><div style={{fontSize:"0.75rem",color:"#888",marginBottom:12}}>Next attack deals massive bonus damage!</div><button onClick={()=>onReward("supercharge")} style={{padding:"8px 24px",background:"rgba(255,99,71,0.15)",border:"2px solid #FF6347",borderRadius:6,color:"#FF6347",fontFamily:"'Cinzel',serif",fontWeight:700,cursor:"pointer"}}>🔥 Activate!</button></div>
    :<div style={{textAlign:"center"}}><div style={{fontSize:"1.5rem",animation:"sparkle 1s infinite"}}>🎉</div><div style={{fontSize:"0.9rem",color:"#32CD32",fontWeight:700,marginBottom:10}}>Choose Reward!</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>{dragon.stageIdx<4&&<button onClick={()=>onReward("accelerate")} style={{padding:8,background:"rgba(255,215,0,0.1)",border:"1px solid #FFD70044",borderRadius:6,color:"#FFD700",fontFamily:"'Cinzel',serif",fontSize:"0.72rem",cursor:"pointer"}}><div style={{fontSize:"1.2rem"}}>⚡</div>Accelerate</button>}{!dragon.equipment?.includes("weapon")&&<button onClick={()=>onReward("weapon")} style={{padding:8,background:"rgba(255,60,60,0.08)",border:"1px solid #f4433644",borderRadius:6,color:"#f44",fontFamily:"'Cinzel',serif",fontSize:"0.72rem",cursor:"pointer"}}><div style={{fontSize:"1.2rem"}}>🗡️</div>Fire Claw</button>}{!dragon.equipment?.includes("shield")&&<button onClick={()=>onReward("shield")} style={{padding:8,background:"rgba(50,130,255,0.08)",border:"1px solid #4488ff44",borderRadius:6,color:"#48f",fontFamily:"'Cinzel',serif",fontSize:"0.72rem",cursor:"pointer"}}><div style={{fontSize:"1.2rem"}}>🛡️</div>Shield</button>}{!dragon.equipment?.includes("armor")&&<button onClick={()=>onReward("armor")} style={{padding:8,background:"rgba(50,205,50,0.08)",border:"1px solid #32CD3244",borderRadius:6,color:"#3c3",fontFamily:"'Cinzel',serif",fontSize:"0.72rem",cursor:"pointer"}}><div style={{fontSize:"1.2rem"}}>🦺</div>Armor</button>}{!dragon.equipment?.includes("wings")&&<button onClick={()=>onReward("wings")} style={{padding:8,background:"rgba(200,100,255,0.08)",border:"1px solid #c864ff44",borderRadius:6,color:"#c8f",fontFamily:"'Cinzel',serif",fontSize:"0.72rem",cursor:"pointer"}}><div style={{fontSize:"1.2rem"}}>🪽</div>Wings</button>}</div></div>}</>)}
  </div></div>);
}

// ═══════════════════════════════════════════════════════════════════════════
// DIPLOMACY PANEL
// ═══════════════════════════════════════════════════════════════════════════

function DiplomacyPanel({gs,setGs,addLog,civIdx}){
  const civ=gs.civs[civIdx];
  const sendGift=(targetIdx)=>{
    if(civ.resources.gold<GIFT_COST.gold){addLog("❌ Need 💰20 to send gift!");return;}
    setGs(p=>{const n=JSON.parse(JSON.stringify(p));n.civs[civIdx].resources.gold-=GIFT_COST.gold;const dk=diploKey(civIdx,targetIdx);n.diplomacy[dk].points+=GIFT_POINTS;n.diplomacy[dk].relation=getRelation(n.diplomacy[dk].points);return n;});
    addLog(`🎁 Sent gift to ${gs.civs[targetIdx].name} (+${GIFT_POINTS} relations)`);
  };
  return (<div style={{padding:8}}>
    <div style={{fontSize:"0.72rem",color:"#FFD700",fontWeight:700,marginBottom:8,letterSpacing:2}}>🤝 DIPLOMACY</div>
    {gs.civs.filter((_,ci)=>ci!==civIdx).map(c=>{
      const d=getDiplo(gs,civIdx,c.id);const rel=d.relation;const col=REL_COLORS[rel];
      return <div key={c.id} style={{padding:"6px 8px",background:"rgba(255,255,255,0.02)",borderRadius:4,marginBottom:4,borderLeft:`3px solid ${col}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:"0.72rem",color:c.color}}>{c.name}</span>
          <span style={{fontSize:"0.68rem",color:col,fontWeight:600}}>{REL_EMOJI[rel]} {rel.toUpperCase()} ({d.points>0?"+":""}{d.points})</span>
        </div>
        <div style={{display:"flex",gap:4,marginTop:4}}>
          <button onClick={()=>sendGift(c.id)} disabled={civ.resources.gold<GIFT_COST.gold} style={{padding:"3px 10px",background:"rgba(255,215,0,0.08)",border:"1px solid #FFD70033",borderRadius:3,color:civ.resources.gold>=GIFT_COST.gold?"#FFD700":"#555",fontFamily:"'Cinzel',serif",fontSize:"0.6rem",cursor:civ.resources.gold>=GIFT_COST.gold?"pointer":"default"}}>🎁 Gift (💰{GIFT_COST.gold})</button>
          <div style={{fontSize:"0.55rem",color:"#666",padding:"3px 0",lineHeight:1.3}}>
            {rel==="allied"&&"Will fight alongside you!"}{rel==="friendly"&&"Gift more to become allies"}{rel==="neutral"&&"Send gifts to befriend"}{rel==="enemy"&&"At war! Gift heavily to make peace"}
          </div>
        </div>
      </div>;
    })}
  </div>);
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAYER ACTION PANEL
// ═══════════════════════════════════════════════════════════════════════════

function PlayerActionPanel({gs,setGs,addLog,onOpenRiddle,onFlyRiddle,onSuperChargeRiddle,onActivateMove,onCallAllies}){
  const[activeTab,setActiveTab]=useState("overview");
  const civ=gs.civs[gs.currentCivIdx];const civIdx=gs.currentCivIdx;
  const sel=gs.selectedTile?gs.tiles.find(t=>t.q===gs.selectedTile.q&&t.r===gs.selectedTile.r):null;
  const selCity=gs.selectedTile?civ.cities.find(c=>c.q===gs.selectedTile.q&&c.r===gs.selectedTile.r):null;
  const selUnit=gs.selectedTile?civ.units.find(u=>u.q===gs.selectedTile.q&&u.r===gs.selectedTile.r):null;
  const selDragon=gs.selectedTile?civ.dragons.find(d=>d.q===gs.selectedTile.q&&d.r===gs.selectedTile.r):null;
  const tribeAbility=TRIBE_ABILITIES[civ.tribe1?.id]||null;

  useEffect(()=>{if(selDragon)setActiveTab("dragon");else if(selCity)setActiveTab("city");else if(selUnit)setActiveTab("unit");else if(sel)setActiveTab("tile");else setActiveTab("overview");},[gs.selectedTile]);

  const canAfford=cost=>Object.entries(cost).every(([k,v])=>civ.resources[k]>=v);
  const build=bid=>{const b=BUILDINGS.find(x=>x.id===bid);if(!b||!selCity)return;if(!canAfford(b.cost)){addLog("❌ Not enough!");return;}setGs(p=>{const n=JSON.parse(JSON.stringify(p));n.civs[civIdx].resources.production-=b.cost.production;n.civs[civIdx].cities.find(c=>c.q===selCity.q&&c.r===selCity.r).buildings.push(b.id);return n;});addLog(`✅ Built ${b.emoji} ${b.name}`);};
  const recruit=uid=>{const u=UNITS.find(x=>x.id===uid);if(!u||!selCity)return;if(!canAfford(u.cost)){addLog("❌ Insufficient!");return;}setGs(p=>{const n=JSON.parse(JSON.stringify(p));const c=n.civs[civIdx];c.resources.production-=u.cost.production;c.resources.gold-=u.cost.gold;c.units.push({id:`u${c.id}_${Date.now()}`,type:u.id,q:selCity.q,r:selCity.r+1,hp:u.strength*4,maxHp:u.strength*4,moved:false});return n;});addLog(`✅ Recruited ${u.emoji}`);};
  const hatchDragon=(opts={})=>{if(!selCity||!selCity.buildings.includes("dragon_nest"))return;const cost=opts.isSettler?{food:25,gold:35}:HATCH_COST;if(!canAfford(cost)){addLog("❌ Not enough resources!");return;}setGs(p=>{const n=JSON.parse(JSON.stringify(p));const c=n.civs[civIdx];c.resources.food-=cost.food;c.resources.gold-=cost.gold;const hasHeir=c.dragons.some(d=>d.isHeir);c.dragons.push(createDragon(c.id,selCity,c.dragonNameIdx++,{isHeir:opts.isHeir&&!hasHeir,isSettler:opts.isSettler}));return n;});addLog(opts.isSettler?"🏕️ Settler dragon hatched!":opts.isHeir?"♛ Heir dragon hatched!":"🥚 Dragon egg laid!");};
  const settleWithDragon=()=>{if(!selDragon||!selDragon.isSettler||selDragon.stageIdx<2)return;if(gs.civs.some(c=>c.cities.some(cc=>hexDistance(cc,selDragon)<3))){addLog("🚫 Too close to a city!");return;}setGs(p=>{const n=JSON.parse(JSON.stringify(p));const c=n.civs[civIdx];c.cities.push({name:`${c.name} ${c.cities.length+1}`,q:selDragon.q,r:selDragon.r,population:1,buildings:[],isCapital:false});c.dragons=c.dragons.filter(d=>d.id!==selDragon.id);n.tiles.forEach(t=>{if(hexDistance(t,selDragon)<=2)t.owner=civIdx;});return n;});addLog("🏙️ Settler dragon founded a new city!");};
  const settleCity=()=>{if(!selUnit)return;const ut=UNITS.find(u=>u.id===selUnit.type);if(!ut?.canSettle)return;if(gs.civs.some(c=>c.cities.some(cc=>hexDistance(cc,selUnit)<3))){addLog("🚫 Too close!");return;}setGs(p=>{const n=JSON.parse(JSON.stringify(p));const c=n.civs[civIdx];c.cities.push({name:`${c.name} ${c.cities.length+1}`,q:selUnit.q,r:selUnit.r,population:1,buildings:[],isCapital:false});c.units=c.units.filter(u=>u.id!==selUnit.id);n.tiles.forEach(t=>{if(hexDistance(t,selUnit)<=2)t.owner=civIdx;});return n;});addLog("🏙️ City founded!");};

  const tabs=[{id:"overview",label:"📋"},{id:"diplo",label:"🤝"},{id:"city",label:"🏙️",off:!selCity},{id:"unit",label:"⚔️",off:!selUnit},{id:"dragon",label:"🐉",off:!selDragon}];
  const sec=t=><div style={{fontSize:"0.62rem",color:"#555",letterSpacing:2,textTransform:"uppercase",marginBottom:5,marginTop:6,borderBottom:"1px solid #1a1a2a",paddingBottom:3}}>{t}</div>;

  const moveStatus=(entity,isDragon)=>{
    if(isDragon&&getDragonStage(entity).movement===0)return <div style={{padding:6,background:"rgba(255,215,0,0.05)",borderRadius:4,fontSize:"0.68rem",color:"#888",textAlign:"center"}}>🥚 Eggs can't move</div>;
    const hasFly=isDragon&&(entity.flyMoves||0)>0;if(entity.moved&&!hasFly)return <div style={{padding:6,background:"rgba(255,150,0,0.08)",borderRadius:4,fontSize:"0.68rem",color:"#f84",textAlign:"center"}}>Already moved</div>;
    const range=isDragon?(getDragonMovement(entity)+(entity.flyMoves||0)):(UNITS.find(u=>u.id===entity.type)?.movement||2);
    return <button onClick={()=>onActivateMove(entity,isDragon)} style={{width:"100%",padding:8,background:"linear-gradient(135deg,rgba(0,191,255,0.12),rgba(0,100,200,0.08))",border:"2px solid rgba(0,191,255,0.3)",borderRadius:6,color:"#00BFFF",fontFamily:"'Cinzel',serif",fontSize:"0.75rem",fontWeight:700,cursor:"pointer"}}>🏃 MOVE (range: {range}{hasFly?" ✈":""})</button>;
  };

  return (
    <div style={{...S.panel,padding:0,display:"flex",flexDirection:"column",overflow:"hidden",flex:1,borderRadius:0,border:"none"}}>
      <div style={{display:"flex",borderBottom:"1px solid #222"}}>{tabs.map(t=><button key={t.id} onClick={()=>!t.off&&setActiveTab(t.id)} style={{flex:1,padding:"5px 2px",background:activeTab===t.id?`${civ.color}22`:"transparent",border:"none",borderBottom:activeTab===t.id?`2px solid ${civ.color}`:"2px solid transparent",color:t.off?"#333":activeTab===t.id?civ.color:"#777",fontFamily:"'Cinzel',serif",fontSize:"0.72rem",cursor:t.off?"default":"pointer",opacity:t.off?0.35:1}}>{t.label}</button>)}</div>
      <div style={{padding:8,overflowY:"auto",flex:1}}>
        {activeTab==="overview"&&<>
          <div style={{fontSize:"0.8rem",color:civ.color,fontWeight:700,marginBottom:4}}>{civ.tribe1?.emoji} {civ.name}</div>
          {tribeAbility&&<div style={{padding:"4px 8px",background:"rgba(255,99,71,0.06)",borderRadius:4,fontSize:"0.65rem",color:"#f84",marginBottom:6}}>{tribeAbility.emoji} <strong>{tribeAbility.name}</strong>: {tribeAbility.desc}</div>}
          {sec("Dragons")}
          {civ.dragons.map((d,i)=>{const st=getDragonStage(d);return <div key={i} onClick={()=>setGs(p=>({...p,selectedTile:{q:d.q,r:d.r}}))} style={{display:"flex",justifyContent:"space-between",padding:"4px 6px",background:"rgba(255,215,0,0.04)",borderRadius:3,marginBottom:2,cursor:"pointer",borderLeft:`3px solid ${d.isQueen?"#FFD700":d.isHeir?"#c8a0ff":d.isSettler?"#32CD32":civ.color+"55"}`}}><span style={{fontSize:"0.68rem"}}>{d.isQueen?"👸":d.isSettler?"🏕️":st.emoji} {d.name}{d.isHeir?" ♛":""}</span><span style={{fontSize:"0.6rem",color:d.moved?"#f84":"#6f6"}}>HP{d.hp}</span></div>;})}
          {sec("Units")}
          {civ.units.map((u,i)=>{const ut=UNITS.find(x=>x.id===u.type);return <div key={i} onClick={()=>setGs(p=>({...p,selectedTile:{q:u.q,r:u.r}}))} style={{display:"flex",justifyContent:"space-between",padding:"3px 6px",background:"rgba(255,255,255,0.02)",borderRadius:3,marginBottom:2,cursor:"pointer"}}><span style={{fontSize:"0.66rem"}}>{ut?.emoji} {ut?.name}</span><span style={{fontSize:"0.6rem",color:u.moved?"#f84":"#6f6"}}>{u.moved?"Done":"Ready"}</span></div>;})}
        </>}

        {activeTab==="diplo"&&<DiplomacyPanel gs={gs} setGs={setGs} addLog={addLog} civIdx={civIdx}/>}

        {activeTab==="city"&&selCity&&<>
          <div style={{fontSize:"0.82rem",fontWeight:700,color:civ.color,marginBottom:4}}>{selCity.isCapital?"👑":"🏙️"} {selCity.name} (Pop {selCity.population})</div>
          {selCity.buildings.includes("dragon_nest")&&<>
            {sec("🥚 Dragon Nest")}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4,marginBottom:6}}>
              <button onClick={()=>hatchDragon()} disabled={!canAfford(HATCH_COST)} style={{padding:6,background:canAfford(HATCH_COST)?"rgba(255,215,0,0.08)":"rgba(0,0,0,0.2)",border:canAfford(HATCH_COST)?`1px solid ${civ.color}44`:"1px solid #222",borderRadius:4,color:canAfford(HATCH_COST)?civ.color:"#444",fontFamily:"'Cinzel',serif",fontSize:"0.65rem",cursor:canAfford(HATCH_COST)?"pointer":"default"}}>🥚 Hatch<br/><span style={{fontSize:"0.55rem"}}>🌾{HATCH_COST.food}💰{HATCH_COST.gold}</span></button>
              <button onClick={()=>hatchDragon({isHeir:true})} disabled={!canAfford(HATCH_COST)||civ.dragons.some(d=>d.isHeir)} style={{padding:6,background:"rgba(155,48,255,0.06)",border:"1px solid #9B30FF33",borderRadius:4,color:!civ.dragons.some(d=>d.isHeir)?"#c8a0ff":"#444",fontFamily:"'Cinzel',serif",fontSize:"0.65rem",cursor:"pointer"}}>♛ Heir<br/><span style={{fontSize:"0.55rem"}}>🌾{HATCH_COST.food}💰{HATCH_COST.gold}</span></button>
              <button onClick={()=>hatchDragon({isSettler:true})} disabled={!canAfford({food:25,gold:35})} style={{padding:6,background:"rgba(50,205,50,0.06)",border:"1px solid #32CD3233",borderRadius:4,color:canAfford({food:25,gold:35})?"#32CD32":"#444",fontFamily:"'Cinzel',serif",fontSize:"0.65rem",cursor:"pointer"}}>🏕️ Settler<br/><span style={{fontSize:"0.55rem"}}>🌾25💰35</span></button>
            </div>
          </>}
          {sec("Build")}
          {BUILDINGS.filter(b=>!selCity.buildings.includes(b.id)).map(b=>{const ok=canAfford(b.cost);return <button key={b.id} onClick={()=>build(b.id)} disabled={!ok} style={{display:"flex",alignItems:"center",gap:4,width:"100%",padding:"4px 6px",marginBottom:2,background:ok?"rgba(255,215,0,0.04)":"rgba(0,0,0,0.2)",border:ok?`1px solid ${civ.color}33`:"1px solid #1a1a2a",borderRadius:3,color:ok?"#e8dcc8":"#444",fontFamily:"'Cinzel',serif",fontSize:"0.65rem",cursor:ok?"pointer":"default",textAlign:"left"}}><span>{b.emoji}</span><div style={{flex:1}}><strong>{b.name}</strong></div><span style={{fontSize:"0.55rem",color:ok?"#6f6":"#f66"}}>⚒️{b.cost.production}</span></button>;})}
          {sec("Recruit")}
          {UNITS.map(u=>{const ok=canAfford(u.cost);return <button key={u.id} onClick={()=>recruit(u.id)} disabled={!ok} style={{display:"flex",alignItems:"center",gap:4,width:"100%",padding:"4px 6px",marginBottom:2,background:ok?"rgba(50,205,50,0.03)":"rgba(0,0,0,0.2)",border:ok?`1px solid ${civ.color}33`:"1px solid #1a1a2a",borderRadius:3,color:ok?"#e8dcc8":"#444",fontFamily:"'Cinzel',serif",fontSize:"0.65rem",cursor:ok?"pointer":"default",textAlign:"left"}}><span>{u.emoji}</span><div style={{flex:1}}><strong>{u.name}</strong></div><span style={{fontSize:"0.55rem",color:"#888"}}>⚒️{u.cost.production}💰{u.cost.gold}</span></button>;})}
        </>}

        {activeTab==="unit"&&selUnit&&(()=>{const ut=UNITS.find(u=>u.id===selUnit.type);return <>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{fontSize:"1.8rem"}}>{ut?.emoji}</span><div><div style={{fontSize:"0.82rem",fontWeight:700,color:civ.color}}>{ut?.name}</div><div style={{fontSize:"0.6rem",color:"#888"}}>STR {ut?.strength} · HP {selUnit.hp}/{selUnit.maxHp}</div></div></div>
          {moveStatus(selUnit,false)}
          {ut?.canSettle&&!selUnit.moved&&<button onClick={settleCity} style={{width:"100%",padding:6,marginTop:4,background:"rgba(50,205,50,0.12)",border:"2px solid rgba(50,205,50,0.4)",borderRadius:4,color:"#32CD32",fontFamily:"'Cinzel',serif",fontSize:"0.72rem",fontWeight:700,cursor:"pointer"}}>🏕️ FOUND CITY</button>}
        </>;})()}

        {activeTab==="dragon"&&selDragon&&(()=>{
          const st=getDragonStage(selDragon);const str=getDragonStrength(selDragon);const def=getDragonDefense(selDragon);const mv=getDragonMovement(selDragon);
          return <>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <div style={{fontSize:"2rem",filter:selDragon.isQueen||selDragon.stageIdx>=3?"drop-shadow(0 0 6px #FFD700)":"none"}}>{selDragon.isQueen?"👸":st.emoji}</div>
              <div><div style={{fontSize:"0.85rem",fontWeight:700,color:civ.color}}>{selDragon.name}{selDragon.isQueen?" 👑 Queen":""}{selDragon.isHeir?" ♛ Heir":""}{selDragon.isSettler?" 🏕️ Settler":""}</div><div style={{fontSize:"0.62rem",color:"#888"}}>{st.name} · {tribeAbility?.emoji} {tribeAbility?.name}: +{tribeAbility?.dmgBonus} in combat</div></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:3,marginBottom:6}}>
              {[["❤️",`${selDragon.hp}/${getDragonMaxHp(selDragon)}`,"HP",selDragon.hp<getDragonMaxHp(selDragon)?"#f84":"#6f6"],["⚔️",str,"STR","#f44"],["🛡️",def,"DEF","#48f"],["🏃",mv+(selDragon.flyMoves||0),"MOV","#c8f"]].map(([e,v,l,c2],i)=>
                <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:3,padding:3,textAlign:"center"}}><div style={{fontSize:"0.72rem",fontWeight:700,color:c2}}>{e}{v}</div><div style={{fontSize:"0.48rem",color:"#666"}}>{l}</div></div>)}
            </div>
            {selDragon.equipment?.length>0&&<div style={{display:"flex",gap:2,flexWrap:"wrap",marginBottom:4}}>{selDragon.equipment.map((e,i)=><span key={i} style={{padding:"1px 5px",background:"rgba(255,215,0,0.08)",borderRadius:3,fontSize:"0.58rem"}}>{DRAGON_EQUIPMENT[e]?.emoji}</span>)}</div>}
            {/* Move */}
            {moveStatus(selDragon,true)}
            {/* Settler dragon settle */}
            {selDragon.isSettler&&selDragon.stageIdx>=2&&!selDragon.moved&&<button onClick={settleWithDragon} style={{width:"100%",padding:6,marginTop:4,background:"rgba(50,205,50,0.12)",border:"2px solid rgba(50,205,50,0.4)",borderRadius:4,color:"#32CD32",fontFamily:"'Cinzel',serif",fontSize:"0.72rem",fontWeight:700,cursor:"pointer"}}>🏕️ FOUND CITY HERE</button>}
            {/* Fly riddle */}
            {selDragon.stageIdx>=2&&!selDragon.moved&&selDragon.flyMoves===0&&<button onClick={()=>onFlyRiddle(selDragon)} style={{width:"100%",padding:6,marginTop:4,background:"rgba(0,191,255,0.1)",border:"1px solid rgba(0,191,255,0.3)",borderRadius:4,color:"#00BFFF",fontFamily:"'Cinzel',serif",fontSize:"0.7rem",fontWeight:700,cursor:"pointer"}}>🦅 FLY (+{FLY_BONUS_MOVES})</button>}
            {selDragon.flyMoves>0&&<div style={{padding:4,background:"rgba(0,191,255,0.06)",borderRadius:3,fontSize:"0.65rem",color:"#00BFFF",textAlign:"center",marginTop:3}}>✈️ +{selDragon.flyMoves} flight</div>}
            {/* Super-charge ability (SkyWings & others) */}
            {tribeAbility?.canSuperCharge&&selDragon.stageIdx>=3&&!selDragon.superCharged&&<button onClick={()=>onSuperChargeRiddle(selDragon)} style={{width:"100%",padding:6,marginTop:4,background:"rgba(255,99,71,0.1)",border:"1px solid rgba(255,99,71,0.3)",borderRadius:4,color:"#FF6347",fontFamily:"'Cinzel',serif",fontSize:"0.7rem",fontWeight:700,cursor:"pointer"}}>{tribeAbility.emoji} SUPER-CHARGE (Hard Riddle!)</button>}
            {selDragon.superCharged&&<div style={{padding:4,background:"rgba(255,99,71,0.08)",borderRadius:3,fontSize:"0.65rem",color:"#FF6347",textAlign:"center",marginTop:3}}>🔥 SUPER-CHARGED! Extra damage on next attack!</div>}
            {/* Call Allies to war */}
            {(()=>{const atWar=gs.civs.some((c,ci)=>ci!==civIdx&&c.alive&&getDiplo(gs,civIdx,ci).relation==="enemy");const allies=gs.civs.filter((c,ci)=>ci!==civIdx&&c.alive&&getDiplo(gs,civIdx,ci).relation==="allied");return atWar&&allies.length>0&&selDragon.stageIdx>=2?<button onClick={()=>onCallAllies(selDragon)} style={{width:"100%",padding:6,marginTop:4,background:"rgba(50,205,50,0.1)",border:"1px solid rgba(50,205,50,0.3)",borderRadius:4,color:"#32CD32",fontFamily:"'Cinzel',serif",fontSize:"0.7rem",fontWeight:700,cursor:"pointer"}}>💚 CALL ALLIES TO WAR (Riddle) — {allies.length} {allies.length===1?"ally":"allies"}</button>:null;})()}
            {/* Power-up riddle */}
            <button onClick={()=>onOpenRiddle(selDragon)} style={{width:"100%",padding:6,marginTop:4,background:"rgba(155,48,255,0.08)",border:"1px solid rgba(155,48,255,0.2)",borderRadius:4,color:"#c8a0ff",fontFamily:"'Cinzel',serif",fontSize:"0.7rem",fontWeight:700,cursor:"pointer"}}>🧮 RIDDLE — Power Up!</button>
          </>;
        })()}
      </div>
    </div>
  );
}

function AITurnOverlay({civName,civColor,actions,progress,total}){return <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50}}><div style={{...S.panel,padding:20,minWidth:320,maxWidth:400,textAlign:"center",border:`1px solid ${civColor}55`}}><style>{`@keyframes ap{0%,100%{opacity:.5}50%{opacity:1}}`}</style><div style={{fontSize:"0.58rem",color:"#555",letterSpacing:3,marginBottom:6}}>AI TURN ({progress}/{total})</div><div style={{fontSize:"1.2rem",color:civColor,fontWeight:700,marginBottom:6,animation:"ap 1.2s infinite"}}>🐉 {civName}</div><div style={{width:"100%",height:4,background:"#1a1a2a",borderRadius:2,marginBottom:10,overflow:"hidden"}}><div style={{width:`${(progress/total)*100}%`,height:"100%",background:civColor,borderRadius:2,transition:"width 0.4s"}}/></div>{actions.length>0?<div style={{textAlign:"left"}}>{actions.map((a,i)=><div key={i} style={{fontSize:"0.64rem",color:"#bbb",padding:"1px 0"}}>{a}</div>)}</div>:<div style={{fontSize:"0.68rem",color:"#555"}}>Thinking...</div>}</div></div>;}

// ═══════════════════════════════════════════════════════════════════════════
// GAME SCREEN
// ═══════════════════════════════════════════════════════════════════════════

function GameScreen({initialGs,initialCivConfigs,mapSize}){
  const[gs,setGs]=useState(()=>initialGs||initGameState(initialCivConfigs,mapSize));
  const[showScore,setShowScore]=useState(false);const[aiTurn,setAiTurn]=useState(null);
  const[riddleDragon,setRiddleDragon]=useState(null);const[riddleMode,setRiddleMode]=useState("powerup");
  const[moveMode,setMoveMode]=useState(null);const aiRef=useRef(false);
  const currentCiv=gs.civs[gs.currentCivIdx];
  const addLog=useCallback(msg=>setGs(p=>({...p,log:[...p.log.slice(-40),msg]})),[]);
  const onSelectTile=tile=>{if(moveMode)return;setGs(p=>({...p,selectedTile:{q:tile.q,r:tile.r}}));};

  useEffect(()=>{const h=e=>{if(e.key==="Escape"&&moveMode)setMoveMode(null);};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[moveMode]);

  const activateMove=(entity,isDragon)=>{
    const range=isDragon?(getDragonMovement(entity)+(entity.flyMoves||0)):(UNITS.find(u=>u.id===entity.type)?.movement||2);
    setMoveMode({entityId:entity.id,isDragon,entityQ:entity.q,entityR:entity.r,reachable:getReachableHexes(entity.q,entity.r,range,gs.tiles,gs.currentCivIdx,gs)});
  };

  const moveToHex=(tq,tr)=>{
    if(!moveMode)return;const{entityId,isDragon}=moveMode;
    setGs(prev=>{
      const n=JSON.parse(JSON.stringify(prev));const c=n.civs[prev.currentCivIdx];
      const ent=isDragon?c.dragons.find(d=>d.id===entityId):c.units.find(u=>u.id===entityId);if(!ent)return prev;
      const tribeId=c.tribe1?.id;const ability=TRIBE_ABILITIES[tribeId];
      const abilityDmg=(ability?.dmgBonus||0)+(ent.superCharged?15:0);

      const eD=n.civs.flatMap((cv,ci)=>ci!==prev.currentCivIdx?cv.dragons.filter(d=>d.q===tq&&d.r===tr&&d.stageIdx>0).map(d=>({...d,civIdx:ci})):[]);
      const eU=n.civs.flatMap((cv,ci)=>ci!==prev.currentCivIdx?cv.units.filter(u=>u.q===tq&&u.r===tr).map(u=>({...u,civIdx:ci})):[]);

      // Set enemy relation on attack
      if(eD.length>0||eU.length>0){const targetCiv=(eD[0]||eU[0]).civIdx;const dk=diploKey(prev.currentCivIdx,targetCiv);if(n.diplomacy[dk]){n.diplomacy[dk].points=Math.min(n.diplomacy[dk].points,-25);n.diplomacy[dk].relation="enemy";}}

      if(isDragon&&(eD.length>0||eU.length>0)){
        const atk=getDragonStrength(ent)+abilityDmg;const defB=getDragonDefense(ent)+(ability?.defBonus||0);
        if(eD.length>0){const ed=eD[0];const dmgOut=Math.max(1,Math.floor((atk-getDragonDefense(ed))*(0.8+Math.random()*0.4)));const dmgIn=Math.max(1,Math.floor((getDragonStrength(ed)-defB)*(0.4+Math.random()*0.3)));const re=n.civs[ed.civIdx].dragons.find(d=>d.id===ed.id);if(re){re.hp-=dmgOut;if(re.hp<=0){n.civs[ed.civIdx].dragons=n.civs[ed.civIdx].dragons.filter(d=>d.id!==ed.id);ent.q=tq;ent.r=tr;addLog(`🐉⚔️ ${ent.name} destroyed ${re.name}!${ent.superCharged?" 🔥SUPER-CHARGED!":""}`);}else addLog(`🐉⚔️ Dealt ${dmgOut}, took ${dmgIn}`);}ent.hp-=dmgIn;if(ent.hp<=0){c.dragons=c.dragons.filter(d=>d.id!==ent.id);addLog(`💀 ${ent.name} fell!`);}}
        else{const eu=eU[0];const ut=UNITS.find(u=>u.id===eu.type);const dmg=Math.max(2,Math.floor(atk*(0.8+Math.random()*0.4)));const re=n.civs[eu.civIdx].units.find(u=>u.id===eu.id);if(re){re.hp-=dmg;if(re.hp<=0){n.civs[eu.civIdx].units=n.civs[eu.civIdx].units.filter(u=>u.id!==eu.id);ent.q=tq;ent.r=tr;addLog(`🐉 ${ent.name} destroyed ${ut?.name}!`);}else addLog(`🐉 Dealt ${dmg}`);}ent.hp-=Math.max(1,Math.floor((ut?.strength||2)*0.3));}
        ent.superCharged=false;
      } else if(!isDragon&&eU.length>0){
        const a=UNITS.find(u=>u.id===ent.type),e=eU[0],d=UNITS.find(u=>u.id===e.type);const dp=Math.max(1,Math.floor(((a?.strength||3)+(c.bonuses.military||0))*(0.8+Math.random()*0.4)));const ds=Math.max(1,Math.floor(((d?.strength||3))*(0.5+Math.random()*0.3)));const eu=n.civs[e.civIdx].units.find(u=>u.id===e.id);if(eu){eu.hp-=dp;if(eu.hp<=0){n.civs[e.civIdx].units=n.civs[e.civIdx].units.filter(u=>u.id!==e.id);ent.q=tq;ent.r=tr;addLog(`⚔️ Destroyed ${d?.name}!`);}else addLog(`⚔️ Dealt ${dp}`);}ent.hp-=ds;if(ent.hp<=0)c.units=c.units.filter(u=>u.id!==ent.id);
      } else { ent.q=tq;ent.r=tr; }

      // Conquer enemy cities
      const conqueredCity=n.civs.reduce((f,cv,ci)=>{if(ci===prev.currentCivIdx)return f;const cc=cv.cities.find(ct=>ct.q===tq&&ct.r===tr);return cc?{city:cc,civIdx:ci}:f;},null);
      if(conqueredCity&&(eU.length===0||eU[0]&&n.civs[conqueredCity.civIdx].units.filter(u=>u.q===tq&&u.r===tr).length===0)){
        const cc=conqueredCity.city;const cqi=conqueredCity.civIdx;n.civs[cqi].cities=n.civs[cqi].cities.filter(ct=>ct!==cc);
        cc.isCapital=false;c.cities.push(cc);n.tiles.forEach(t=>{if(hexDistance(t,{q:tq,r:tr})<=2)t.owner=prev.currentCivIdx;});
        addLog(`🏙️ Conquered ${cc.name}!`);
        // ELIMINATION: if that was their last city, they cease to exist
        if(n.civs[cqi].cities.length===0){
          n.civs[cqi].alive=false;
          n.civs[cqi].units=[];n.civs[cqi].dragons=[];
          n.tiles.forEach(t=>{if(t.owner===cqi)t.owner=prev.currentCivIdx;}); // absorb all territory
          addLog(`💀☠️ ${n.civs[cqi].name} has been completely destroyed!`);
        }
      }

      ent.moved=true;ent.flyMoves=0;
      n.tiles.forEach(t=>{if(t.owner===null&&hexDistance(t,{q:ent.q,r:ent.r})<=1)t.owner=prev.currentCivIdx;});
      n.selectedTile={q:ent.q,r:ent.r};return n;
    });
    setMoveMode(null);
  };

  const handleRiddleReward=rt=>{if(!riddleDragon)return;setGs(prev=>{const n=JSON.parse(JSON.stringify(prev));const c=n.civs[prev.currentCivIdx];const d=c.dragons.find(x=>x.id===riddleDragon.id);if(!d)return prev;if(rt==="fly"){d.flyMoves=FLY_BONUS_MOVES;addLog(`🦅 ${d.name} takes flight!`);}else if(rt==="supercharge"){d.superCharged=true;addLog(`🔥 ${d.name} super-charged!`);}else if(rt==="accelerate"&&d.stageIdx<4){d.turnsInStage=Math.min(d.turnsInStage+1,getDragonStage(d).turnsNeeded-1);addLog(`⚡ Growth accelerated!`);}else if(rt==="weapon"){d.weaponBonus+=6;d.equipment=[...(d.equipment||[]),"weapon"];}else if(rt==="shield"){d.shieldBonus+=6;d.equipment=[...(d.equipment||[]),"shield"];}else if(rt==="armor"){d.armorBonus+=15;d.hp+=15;d.equipment=[...(d.equipment||[]),"armor"];}else if(rt==="wings"){d.speedBonus+=1;d.equipment=[...(d.equipment||[]),"wings"];}return n;});setRiddleDragon(null);};

  const saveGame=()=>{try{const name=`Turn${gs.turn}-${currentCiv.name}`;localStorage.setItem(`wof-save:${name}`,JSON.stringify(gs));addLog(`💾 Game saved: ${name}`);}catch(e){addLog("❌ Save failed");}};

  const endTurn=useCallback(()=>{if(aiRef.current)return;aiRef.current=true;setMoveMode(null);let state=processTurnResources(JSON.parse(JSON.stringify(gs)),gs.currentCivIdx);const aiOrder=[];for(let i=1;i<state.civs.length;i++){const idx=(gs.currentCivIdx+i)%state.civs.length;if(!state.civs[idx].isPlayer&&state.civs[idx].alive)aiOrder.push(idx);}let nextPlayer=-1;for(let i=1;i<state.civs.length;i++){const idx=(gs.currentCivIdx+i)%state.civs.length;if(state.civs[idx].isPlayer&&state.civs[idx].alive){nextPlayer=idx;break;}}const wraps=nextPlayer<=gs.currentCivIdx||nextPlayer===-1;if(aiOrder.length===0){state.turn=wraps?state.turn+1:state.turn;state.currentCivIdx=nextPlayer>=0?nextPlayer:gs.currentCivIdx;state.selectedTile=null;state=processTurnResources(state,state.currentCivIdx);state.log=[...state.log,`── Turn ${state.turn}: Your turn! ──`];setGs(state);aiRef.current=false;return;}let cur=state,step=0;const next=()=>{if(step>=aiOrder.length){cur.turn=wraps?cur.turn+1:cur.turn;cur.currentCivIdx=nextPlayer>=0?nextPlayer:gs.currentCivIdx;cur.selectedTile=null;cur=processTurnResources(cur,cur.currentCivIdx);cur.log=[...cur.log,`── Turn ${cur.turn}: Your turn! ──`];setAiTurn(null);setGs(cur);aiRef.current=false;return;}const ai=aiOrder[step],ac=cur.civs[ai];setAiTurn({civName:ac.name,civColor:ac.color,actions:[],progress:step+1,total:aiOrder.length});setTimeout(()=>{cur=processTurnResources(cur,ai);const{gs:ns,actions}=processAITurn(cur,ai);cur=ns;cur.log=[...cur.log,...actions.map(a=>`[${ac.name}] ${a}`)];setAiTurn(p=>p?{...p,actions}:null);setGs(cur);setTimeout(()=>{step++;next();},500);},300);};next();},[gs]);

  const aliveCivs=gs.civs.filter(c=>c.alive);
  const winner=aliveCivs.length===1?aliveCivs[0]:null;
  const isPlayerTurn=currentCiv.isPlayer&&!aiTurn;

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap" rel="stylesheet"/>
      {/* Top bar */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 12px",background:"rgba(0,0,0,0.75)",borderBottom:`2px solid ${isPlayerTurn?currentCiv.color:"#333"}44`,zIndex:10,position:"relative"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{padding:"2px 8px",background:"rgba(255,215,0,0.1)",borderRadius:4,color:"#FFD700",fontWeight:700,fontSize:"0.78rem"}}>T{gs.turn}</span>
          {isPlayerTurn&&!moveMode&&<span style={{padding:"2px 8px",background:`${currentCiv.color}22`,borderRadius:4,color:currentCiv.color,fontSize:"0.75rem"}}>{currentCiv.name}</span>}
          {moveMode&&<span style={{padding:"2px 8px",background:"rgba(0,191,255,0.15)",borderRadius:4,color:"#00BFFF",fontSize:"0.72rem"}}>🏃 Click blue hex <button onClick={()=>setMoveMode(null)} style={{marginLeft:6,padding:"1px 8px",background:"rgba(255,255,255,0.1)",border:"1px solid #555",borderRadius:3,color:"#aaa",fontFamily:"'Cinzel',serif",fontSize:"0.6rem",cursor:"pointer"}}>Cancel</button></span>}
          {aiTurn&&<span style={{padding:"2px 8px",background:"rgba(255,100,0,0.12)",borderRadius:4,color:"#f84",fontSize:"0.72rem"}}>🤖 AI...</span>}
        </div>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          <button onClick={saveGame} style={{padding:"3px 8px",background:"rgba(255,255,255,0.05)",border:"1px solid #444",borderRadius:3,color:"#aaa",fontFamily:"'Cinzel',serif",fontSize:"0.62rem",cursor:"pointer"}}>💾</button>
          <button onClick={()=>setShowScore(s=>!s)} style={{padding:"3px 8px",background:"rgba(255,255,255,0.05)",border:"1px solid #444",borderRadius:3,color:"#aaa",fontFamily:"'Cinzel',serif",fontSize:"0.62rem",cursor:"pointer"}}>📊</button>
          {isPlayerTurn&&<button onClick={endTurn} style={{padding:"4px 16px",background:currentCiv.color,border:`2px solid ${currentCiv.color}`,borderRadius:4,color:"#0a0a12",fontFamily:"'Cinzel',serif",fontSize:"0.72rem",fontWeight:700,cursor:"pointer",letterSpacing:2}}>END TURN →</button>}
        </div>
      </div>
      {isPlayerTurn&&<ResourceBar civ={currentCiv}/>}
      <div style={{display:"flex",height:`calc(100vh - ${isPlayerTurn?"112":"68"}px)`,position:"relative"}}>
        <div style={{flex:1,position:"relative"}}><HexMap gs={gs} setGs={setGs} onSelectTile={onSelectTile} currentCivIdx={gs.currentCivIdx} moveMode={moveMode} onMoveToHex={moveToHex}/>{aiTurn&&<AITurnOverlay{...aiTurn}/>}</div>
        {isPlayerTurn&&<div style={{width:280,background:"rgba(10,10,18,0.97)",borderLeft:`1px solid ${currentCiv.color}22`,display:"flex",flexDirection:"column"}}>
          <PlayerActionPanel gs={gs} setGs={setGs} addLog={addLog} onOpenRiddle={d=>{setRiddleDragon(d);setRiddleMode("powerup");}} onFlyRiddle={d=>{setRiddleDragon(d);setRiddleMode("fly");}} onSuperChargeRiddle={d=>{setRiddleDragon(d);setRiddleMode("supercharge");}} onActivateMove={activateMove}/>
          <div style={{padding:"5px 8px",borderTop:"1px solid #1a1a2a",maxHeight:80,overflowY:"auto",fontSize:"0.58rem"}}><div style={{fontWeight:700,color:"#444",letterSpacing:2,marginBottom:2,fontSize:"0.5rem"}}>LOG</div>{gs.log.slice(-6).reverse().map((m,i)=><div key={i} style={{padding:"1px 0",color:i===0?"#ccc":"#444"}}>{m}</div>)}</div>
        </div>}
      </div>
      {/* Bottom: Civ legend + Terrain legend */}
      <div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 10px",background:"rgba(0,0,0,0.88)",borderTop:"1px solid rgba(255,215,0,0.1)",flexWrap:"wrap",minHeight:30}}>
        {gs.civs.map(c=>{const rel=isPlayerTurn?getDiplo(gs,gs.currentCivIdx,c.id):null;const relCol=rel?REL_COLORS[rel.relation]:null;return <div key={c.id} style={{display:"flex",alignItems:"center",gap:3,padding:"2px 6px",borderRadius:3,background:`${c.color}18`,border:`1px solid ${c.color}44`,opacity:c.alive?1:0.35}}>
          <div style={{width:8,height:8,borderRadius:2,background:c.color}}/><span style={{fontSize:"0.6rem",color:c.color,fontWeight:600}}>{c.name}</span>{c.id!==gs.currentCivIdx&&rel&&<span style={{fontSize:"0.5rem",color:relCol}}>{REL_EMOJI[rel.relation]}</span>}<span style={{fontSize:"0.5rem",color:"#666"}}>🏙️{c.cities.length}🐉{c.dragons.length}</span>
        </div>;})}
        <div style={{marginLeft:"auto"}}><TerrainLegend/></div>
      </div>

      {riddleDragon&&<MathRiddleModal dragon={riddleDragon} civColor={currentCiv.color} mode={riddleMode} tribeId={currentCiv.tribe1?.id} onReward={handleRiddleReward} onClose={()=>setRiddleDragon(null)}/>}
      {showScore&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100}} onClick={()=>setShowScore(false)}><div style={{...S.panel,padding:20,minWidth:440,maxWidth:540}} onClick={e=>e.stopPropagation()}><h3 style={{color:"#FFD700",marginBottom:10,letterSpacing:3}}>📊 SCOREBOARD</h3>{[...gs.civs].sort((a,b)=>b.score-a.score).map((c,i)=><div key={c.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 10px",borderRadius:4,marginBottom:2,borderLeft:`4px solid ${c.color}`,background:i===0?"rgba(255,215,0,0.06)":"transparent"}}><span style={{color:c.color,fontWeight:600}}>{c.name}{c.dragons.some(d=>d.isQueen)?" 👸":""}</span><span style={{color:"#FFD700",fontWeight:700}}>{Math.floor(c.score)}pt</span></div>)}<div style={{textAlign:"center",marginTop:10}}><button onClick={()=>setShowScore(false)} style={{...S.btn(),padding:"5px 20px",fontSize:"0.75rem"}}>Close</button></div></div></div>}
      {winner&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}><div style={{textAlign:"center"}}><div style={{fontSize:"4rem",marginBottom:16}}>🏆</div><h2 style={{fontSize:"2.5rem",color:winner.color,marginBottom:8}}>{winner.name} Conquers All!</h2><p style={{color:"#9B8EC4",fontSize:"1.2rem"}}>Last tribe standing after {gs.turn} turns!</p><p style={{color:"#888",fontSize:"0.9rem",marginTop:8}}>Score: {Math.floor(winner.score)} · Cities: {winner.cities.length} · Dragons: {winner.dragons.length}</p></div></div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function App(){
  const[screen,setScreen]=useState("title");const[cfgs,setCfgs]=useState(null);const[loadedGs,setLoadedGs]=useState(null);const[mapSz,setMapSz]=useState("medium");
  return <div><link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&display=swap" rel="stylesheet"/>
    {screen==="title"&&<TitleScreen onStart={()=>setScreen("setup")} onLoad={gs=>{setLoadedGs(gs);setScreen("game");}}/>}
    {screen==="setup"&&<GameSetup onConfirm={(c,sz)=>{setCfgs(c);setMapSz(sz||"medium");setLoadedGs(null);setScreen("game");}}/>}
    {screen==="game"&&<GameScreen initialGs={loadedGs} initialCivConfigs={cfgs} mapSize={mapSz}/>}
  </div>;
}
