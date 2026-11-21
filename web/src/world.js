import { damp as ease, spritePose, smooth } from './motion.js';
import { t } from './i18n.js';
import { modifiers } from './upgrades.js';
import { bossNames, missionHp, skillCooldown } from './special.js';
// Batasi nilai
export const clamp = (n, low, high) => Math.max(low, Math.min(n, high));
export const people = ['office-worker','shopper','schoolkid','elder','bakso-vendor'];
// Pekerja Kopdes
export const kopdesWorker='kopdes-worker';
export const heroNames = {perisai:'Perisai',rajawali:'Rajawali',jaring:'Jaring',robot:'Robot Penjaga',...bossNames};
export const hints = {
  perisai:'Hindari tubrukannya, lalu sabet dengan ekor.',
  rajawali:'Raungkan Rex saat Rajawali mendekat, lalu gigit.',
  jaring:'Hancurkan turret, lalu injak Jaring.'
};
// Data serangan
const abilities = {
  bite: {duration:.48, impact:.18, damage:100, range:[36,365], height:[-565,-36]},
  tail: {duration:.62, impact:.26, damage:88, range:[-530,18], height:[-240,0]},
  stomp:{duration:.72, impact:.31, damage:84, range:[-245,245], height:[-115,5]},
  roar: {duration:.9, impact:.23, damage:0},
  // Lompat gertakan
  jump: {duration:1.25, impact:.95, damage:0},
  // Ulti
  ulti: {duration:1.9, impact:1.05, damage:150}
};
// Tinggi lompatan
export function jumpLift(age){
  const up=.18,land=.95;if(age<=up||age>=land)return 0;
  const k=(age-up)/(land-up);return 300*4*k*(1-k);
}
// Durasi tumbang
export const dieTime=2.8;
// Darah Rex
const rexHp=450,rexGrow=150;
// Penembak serentak
const gunnerBase=4,gunnerGrow=1,gunnerMode={santai:-1,normal:0,ngamuk:2};
const ranged=new Set(['infantry','bazooka','helicopter','tank','drone']);
// Damage ke Rex
const DAMAGE={water:2,bullet:4,rocket:26,laser:16,net:9,ram:20,charge:42,dive:38,bone:8,coin:4,sack:24,snow:16,freeze:26,orb:14};
// Pulih darah
const HEAL={soldier:10,vehicle:16,hero:60};
// Jeda serangan
export const cooldowns = {bite:.7, tail:2.2, stomp:3.5, roar:9, jump:20, ulti:40, special:18};
// Status modul
export function moduleState(m){
  if (m.hp<=0) return 'rubble';
  if (m.hp<=m.max*.36) return 'broken';
  return m.hp<=m.max*.76?'cracked':'intact';
}
// Cek tabrakan
function overlap(a,b){return a.l<=b.r && a.r>=b.l && a.t<=b.b && a.b>=b.t}
// Kotak tabrak
function box(x,y,w,h){return {l:x-w/2,r:x+w/2,t:y-h,b:y}}
// Angka acak
function range(a,b){return a+Math.random()*(b-a)}
// Saring daftar
function keep(list,test){let n=0;for(const v of list)if(test(v))list[n++]=v;list.length=n}
// Kotak properti
const propHitboxes={'lapak-sayur':[208,150],'becak':[140,100],'tumpukan-karung':[188,70],'gerbong':[529,160],'bangku-peron':[135,55],'menara-sinyal':[179,230],'gerbang-tol':[266,210],'truk-kontainer':[332,150],'pembatas-beton':[118,50],'perahu-nelayan':[222,120],'pohon-kelapa':[299,300],'panjat-pinang':[220,400],'warung-pantai':[252,160],'spbu':[353,200],'warung-makan':[336,160],'mobil-sppg':[270,150],'street-lamp':[52,300],angkot:[228,113],'electric-pole':[55,377],'food-cart':[140,108],
  billboard:[174,181],tree:[145,132],'tent-stall':[211,133]};
const groundRise={ground:433,upper:337,roof:269};
// Tingkat kesulitan
export const difficulties={santai:{label:'Santai',power:.6,squad:-4},normal:{label:'Normal',power:1,squad:0},ngamuk:{label:'Ngamuk',power:1.35,squad:4}};
// Formasi pahlawan
const flank={perisai:520,rajawali:780,jaring:-600};
const delays={perisai:0,rajawali:.9,jaring:1.8};
// Ulti pahlawan
export const heroUltis={
  perisai:{name:'BENTENG BAJA!',reach:950,damage:60,stun:1.1},
  rajawali:{name:'HUJAN LASER!',reach:1300,damage:14},
  jaring:{name:'JARING RAKSASA!',reach:1150,damage:45,stun:.8,slow:5},
  robot:{name:'MEGA PENJAGA!',reach:1200,damage:70,stun:1,slow:3},
  tikus:{name:'HUJAN KOIN EMAS!',reach:1400,damage:4},
  'boneka-salju':{name:'MERIAM PEMBEKU!',reach:1400,damage:26,freeze:1.8},
  penyihir:{name:'PASUKAN TULANG!',reach:1400,count:8}
};
// Aturan bos misi
const bossRules={tikus:{reach:260,speed:190,windup:.55,damage:40,shot:'sack',shotEvery:3.8},'boneka-salju':{reach:280,speed:150,windup:.7,damage:50,shot:'snow',shotEvery:2.6},penyihir:{shotEvery:2.8,summonEvery:9}};
// Skill khusus
const flyTime=4,flyHeight=230,spikeCount=9,spikeGap=115,reviveTime=2.4,reviveHp=50,boneCap=12;
// Darah warga
const civilianHp=110;
// Lama terpaku
const slamStun={troop:4.5,hero:1.6};
// Durasi keluar
export const exitTime=2.6;
// Jarak panik
const calmRadius=560;
// Aturan kombo
const comboWindow=2.5,comboStep=10,comboCap=3;
// Efek bangunan spesial
const blastRadius=480,blastDamage=260,warungHeal=60;
// Distrik terakhir
export const lastDistrict=7;
// Ukuran badan
const bodies={tikus:[210,400],'boneka-salju':[220,420],penyihir:[150,260],robot:[170,340],jeep:[170,96],turret:[60,60],tank:[200,130],firetruck:[210,130],drone:[70,50]};
// Musuh berat
const heavy=new Set(['jeep','helicopter','tank','firetruck']);
const vehicleBodies={jeep:1,helicopter:1,tank:1,firetruck:1,drone:1,turret:1};
// Jadwal musuh baru
const newTroops=[['firefighter',1/7,15],['drone',2/7,35],['firetruck',3/7,45],['tank',4/7,55]];
// Semprotan pemadam
const sprayRange=480,rageDrain=14,furyDrain=1.5;
// Aturan robot
const jaringOpen=7;
const robot={reach:240,speed:150,windup:.75,punch:50,netEvery:4.5};
// Hujan deras
const rainChance=.3,rainSlow=.7;
// Event 17 Agustus
const paradeSize=8,marchSpeed=95;
// Konvoi motor
const convoyChance=.35,convoySize=5,convoySpeed=560,convoyBody=[130,110];
// Peluang sambaran ke Rex
export const thunderChance=.01;
// Batas tentara
const squadCap=14;
const firstUlt={perisai:8,rajawali:14,jaring:20,robot:10,tikus:12,'boneka-salju':12,penyihir:16},ultWindup=1.05;
// Dunia permainan
export class World {
  constructor(level,index,options={}){
    this.mission=level.mission||'';this.skill=options.skill||'';this.people=this.mission==='merdeka'?['balap-karung','balap-karung',...people]:people;
    this.lite=!!options.lite;this.god=!!options.god;this.upgrades=options.upgrades||[];this.mods=modifiers(this.upgrades);
    this.level=level;this.index=index;this.time=0;this.score=0;this.combo=0;this.comboTime=0;this.maxCombo=0;this.cancelled=0;this.civiliansDown=0;this.kills={};this.flips=0;this.usedUlti=false;this.lost=0;this.total=0;
    this.rex={x:level.start,dir:1,hp:rexHp+this.mods.hp,max:rexHp+this.mods.hp,rage:30,fury:0,stun:0,slow:0,hit:0,attack:null,walk:0,moving:false,vx:0,stride:0,queued:null,queuedUntil:0,bigNet:0,
      cd:{bite:0,tail:0,stomp:0,roar:0,jump:6,ulti:15,special:0},lift:0,fly:0,frozen:0,reviving:0,revived:false};
    this.buildings=level.buildings.map(b=>{
      let y=-65;
      const modules=['ground',...Array(b.upper).fill('upper'),'roof'].map(type=>{
        const h=groundRise[type]*b.width/960;
        const max=type==='ground'?215:type==='upper'?150:85;this.total+=max;
        const m={type,y,h,max,hp:max,fall:0};y-=h;return m;
      });
      return {...b,modules,evacuated:false};
    });
    this.props=(level.props||[]).map(prop=>({...prop,hp:150}));
    this.enemies=[];this.civilians=[];this.shots=[];this.effects=[];this.events=[];
    this.triggered=new Set();this.spawnTime=2;this.squads=0;this.enemyCount=0;this.camera=0;this.look=1;this.quakeAt=-9;this.jumpAt=-9;this.dieAt=0;this.view=1920;this.stepTime=0;this.shake=0;this.status='playing';
    // Fase akhir
    this.phase='fight';this.exitX=level.length-420;this.exitAt=0;
    // Kekuatan musuh
    const mode=difficulties[options.difficulty]||difficulties.normal;
    // Posisi kampanye
    this.tier=clamp(index/lastDistrict,0,1);
    this.basePower=this.power=(1+this.tier*.36)*mode.power;this.squadBonus=mode.squad;
    // Darah per distrik
    this.rex.max=this.rex.hp=Math.round(rexHp+this.tier*rexGrow)+this.mods.hp;
    if(this.mission)this.rex.max=this.rex.hp=missionHp+this.mods.hp;
    this.gunnerCap=gunnerBase+Math.round(this.tier*gunnerGrow)+(gunnerMode[options.difficulty]||0);this.gunners=new Set();
    this.cast=null;this.castAt=-9;this.lastCast=-9;this.rain=null;this.heroWave=null;
    this.populate();
    // Event jalan
    this.weather=options.event??(this.mission==='salju'?'snow':this.mission?'':options.events&&index>0&&Math.random()<rainChance?'rain':'');
    // Pawai dan konvoi
    this.motors=[];this.motorsDown=0;this.paradeX=0;this.spikes=[];
    // Pawai hanya di misi Kemerdekaan
    if(options.parade??this.mission==='merdeka')this.startParade(level.start+1700);
    const convoy=options.convoy??(this.mission==='merdeka'||(!this.mission&&options.events&&index>0&&Math.random()<convoyChance));
    this.convoyAt=convoy?level.start+range(.25,.55)*(level.length-level.start):Infinity;
    // Petir
    this.thunder=!!options.thunder;this.boltAt=-9;this.boltX=0;this.struckAt=-9;this.thunderUnlocked=false;
    this.nextBolt=range(4,9);this.strikeRexAt=this.weather==='rain'&&Math.random()<(options.thunderChance??thunderChance)?range(15,45):Infinity;
    this.say(this.weather==='rain'?t('Hujan deras! Tentara dan warga melambat.'):t('{name} · Hancurkan {n}% kota',{name:t(level.name),n:level.target}),3.2);
  }
  // Warga beraktivitas
  populate(){
    const start=this.level.start+900;let pick=0;
    for(const [i,b] of this.buildings.entries()){
      if(b.x<start)continue;
      const kopdes=b.color==='kopdes',size=kopdes?2:i%3===2?0:1+(i%2);
      // Susun kelompok
      const centre=b.x+range(-b.width*.25,b.width*.25);
      for(let n=0;n<size;n++){
        const type=kopdes?kopdesWorker:this.people[(pick++)%this.people.length],dir=size===2?(n?-1:1):Math.random()<.5?-1:1;
        this.civilians.push({type,x:centre+(size===2?(n?34:-34):0),dir,speed:range(250,350),phase:Math.random()*5,walk:0,lane:range(8,26),
          hp:civilianHp,max:civilianHp,stun:0,hit:0,vx:0,calm:true,chat:size===2,activity:range(0,9)});
      }
    }
    // Pedagang gerobak
    for(const prop of this.props)if(prop.x>start&&(prop.type==='food-cart'||prop.type==='tent-stall'))
      this.civilians.push({type:prop.type==='food-cart'?'bakso-vendor':this.people[(pick++)%this.people.length],x:prop.x+70,dir:-1,speed:range(250,350),phase:Math.random()*5,walk:0,lane:range(8,20),
        hp:civilianHp,max:civilianHp,stun:0,hit:0,vx:0,calm:true,chat:false,activity:range(0,9)});
  }
  // Mulai pawai
  startParade(x){
    x=clamp(x,this.rex.x+700,this.level.length-900);
    // Tiang panjat pinang
    let pole=x-280,gap=-1;
    for(let at=x-900;at<=x-200;at+=40){const near=Math.min(Infinity,...this.props.map(p=>Math.abs(p.x-at)));if(near>gap){gap=near;pole=at}}
    this.props.push({type:'panjat-pinang',x:pole,hp:150});
    for(let n=0;n<paradeSize;n++)this.civilians.push({type:'pawai',x:x+n*78,dir:-1,speed:range(250,330),phase:Math.random()*5,walk:n*1.3,lane:8+(n%2)*16,
      hp:civilianHp,max:civilianHp,stun:0,hit:0,vx:0,calm:true,march:true,chat:false,activity:0});
    this.paradeX=x;
  }
  // Konvoi datang
  spawnConvoy(){
    const start=Math.max(this.camera+this.view,this.rex.x+900)+220;
    for(let n=0;n<convoySize;n++)this.motors.push({x:start+n*190,lane:range(6,30),dir:-1,speed:convoySpeed*range(.92,1.08),down:false,phase:range(0,6),y:0,vx:0,vy:0,angle:0,spin:0,life:0});
    this.say(t('Konvoi motor lewat!'),1.6);this.sound('panic');
  }
  // Motor terjatuh
  crash(m,from){
    const side=Math.sign(m.x-from)||1;
    m.down=true;m.vx=side*range(300,520);m.vy=-range(480,680);m.y=-1;m.spin=side*range(5,8);m.life=1.3;this.motorsDown++;
    this.addScore(60);this.rex.rage=clamp(this.rex.rage+2*this.mods.rage,0,100);this.fx('dust',m.x,m.lane,1);this.sound('crack');
  }
  // Picu panik
  alarmNear(x,radius){for(const c of this.civilians)if(c.calm&&Math.abs(c.x-x)<radius)this.panic(c)}
  // Warga panik
  panic(c){
    if(!c.calm)return;c.calm=false;c.chat=false;c.march=false;c.alarm=.7;c.dir=c.x>=this.rex.x?1:-1;
    c.frame=c.fromFrame='run-a';c.frameMix=1;
  }
  // Pengali kombo
  get multiplier(){return Math.min(comboCap,1+Math.floor(this.combo/comboStep)*.5)}
  // Tambah skor
  addScore(points){
    this.combo++;this.comboTime=comboWindow+this.mods.comboWindow;this.maxCombo=Math.max(this.maxCombo,this.combo);
    this.score+=Math.round(points*this.multiplier);
  }
  // Statistik permainan
  runStats(){
    const props={};for(const p of this.props)if(p.hp<=0)props[p.type]=(props[p.type]||0)+1;
    const soldiers=Object.entries(this.kills).filter(([k])=>!(k in heroNames)&&k!=='turret').reduce((n,[,v])=>n+v,0);
    return {buildings:this.buildings.filter(b=>b.modules[0].hp<=0).length,props,soldiers,civilians:this.civiliansDown,
      heroes:['perisai','rajawali','jaring'].reduce((n,k)=>n+(this.kills[k]||0),0),robot:this.kills.robot||0,tanks:this.flips,drones:this.kills.drone||0,
      cancelled:this.cancelled,combo:this.maxCombo};
  }
  // Aksi developer
  devAction(name){
    const p=this.rex,near=dx=>p.x+p.dir*dx;
    if(name==='win')this.status='won';
    else if(name==='lose'){this.god=false;p.hp=0}
    else if(name==='flatten'){for(const b of this.buildings)this.damageModule(b,0,Infinity);for(const prop of this.props)this.damageProp(prop,Infinity)}
    else if(name==='heroes'){for(const type of ['perisai','rajawali','jaring']){const e=this.spawn(type,p.x+flank[type]);e.ultCd=firstUlt[type]}this.triggered=new Set(this.level.bosses.map((_,i)=>i))}
    else if(name==='robot'){if(!this.level.boss)return 'Bos hanya ada di Alun-Alun dan misi spesial';const e=this.spawn(this.level.boss,near(700));e.dir=-p.dir;e.timer=2;e.ultCd=firstUlt[this.level.boss];this.bossSpawned=true}
    else if(name==='skill'){p.cd.special=0}
    else if(name==='end'){this.devAction('flatten');this.triggered=new Set(this.level.bosses.map((_,i)=>i));for(const e of this.enemies)if(e.hero){e.hp=0;this.defeat(e)}this.bossSpawned=true;p.x=Math.min(this.exitX-60,this.level.length-200)}
    else if(name==='god'){this.god=!this.god;this.onGod?.(this.god);return this.god?'Kebal: nyala':'Kebal: mati'}
    else if(name==='cooldown'){for(const k in p.cd)p.cd[k]=0}
    else if(name==='rage')p.rage=100;
    else if(name==='heal')p.hp=p.max;
    else if(name==='rain'){this.weather=this.weather==='rain'?'':'rain';return this.weather?'Hujan: nyala':'Hujan: mati'}
    else if(name==='strike'){this.weather='rain';this.strikeRexAt=this.time}
    else if(name==='pawai')this.startParade(p.x+1100);
    else if(name==='motor')this.spawnConvoy();
    else if(['infantry','bazooka','jeep','helicopter','tank','firetruck','firefighter','drone'].includes(name)){const e=this.spawn(name,near(600));e.dir=-p.dir}
    return '';
  }
  // Persen hancur
  get percent(){return 100*this.lost/this.total}
  // Tampilkan pesan
  say(text,seconds=3){this.message=text;this.messageUntil=this.time+seconds}
  // Antre suara
  sound(name){this.events.push(name)}
  // Buat efek
  fx(kind,x,y,count=1){
    if(this.lite)count=Math.ceil(count/2);
    for(let i=0;i<count;i++){
      const debris=kind==='debris'||kind==='decor';
      this.effects.push({kind,x,y,vx:debris?range(-200,200):range(-30,30),vy:debris?range(-430,-160):-40,
        life:debris?.85:.5,max:debris?.85:.5,size:kind==='dust'?range(80,155):kind==='decor'?65:kind==='explosion'?130:range(18,40),spin:range(-4,4),seed:Math.random()});
    }
  }
  // Rusak modul
  damageModule(b,i,damage){
    const m=b.modules[i];if(m.hp<=0)return;
    const before=moduleState(m),delta=Math.min(m.hp,damage);m.hp-=delta;this.lost+=delta;this.addScore(delta);
    this.rex.rage=clamp(this.rex.rage+delta*.065*this.mods.rage,0,100);
    if(!b.evacuated){
      b.evacuated=true;this.sound('panic');this.alarmNear(b.x,b.width/2+520);
      for(let n=0;n<2+Math.floor(this.percent/22);n++){
        const x=b.x+range(-b.width*.35,b.width*.35);
        this.civilians.push({type:b.color==='kopdes'?kopdesWorker:this.people[(this.buildings.indexOf(b)+n)%this.people.length],x,dir:x>=this.rex.x?1:-1,speed:range(250,350),phase:Math.random()*5,walk:0,lane:range(6,28),hp:civilianHp,max:civilianHp,stun:0,hit:0,vx:0});
      }
    }
    if(before!==moduleState(m)){
      this.fx('dust',b.x,m.y-m.h*.36,2);this.fx('debris',b.x,m.y-m.h*.7,5);
      if(before==='intact')this.fx('decor',b.x+b.width*.24,m.y-m.h*.72);
      this.shake=Math.max(this.shake,7);this.sound(m.hp===0?'collapse':'crack');
      if(!m.hp){m.fall=.6;if(i+1<b.modules.length)this.damageModule(b,i+1,Infinity)}
    }
  }
  // Rusak properti
  damageProp(prop,damage){
    if(prop.hp<=0)return;
    prop.hp=Math.max(0,prop.hp-damage);
    this.fx('dust',prop.x,-46,prop.hp?1:2);
    this.sound(prop.hp?'crack':'collapse');
    // Hadiah rusak
    if(!prop.hp){this.fx('debris',prop.x,-90,4);this.addScore(40);this.rex.rage=clamp(this.rex.rage+2*this.mods.rage,0,100);this.propEffect(prop)}
  }
  // Efek properti
  propEffect(prop){
    if(prop.type==='spbu'){
      // SPBU meledak
      this.say(t('SPBU meledak!'),2);this.sound('collapse');this.shake=Math.max(this.shake,22);
      for(let i=0;i<4;i++)this.fx('explosion',prop.x+range(-160,160),-60-range(0,180));
      const near=x=>Math.abs(x-prop.x)<blastRadius;
      for(const b of this.buildings)if(near(b.x))this.damageModule(b,0,blastDamage);
      for(const e of this.enemies)if(e.hp>0&&near(e.x)){e.hp-=e.hero?blastDamage*.5:blastDamage;e.hit=.2;e.stun=Math.max(e.stun,1.2);if(e.hp<=0)this.defeat(e)}
      for(const c of this.civilians)if(!c.down&&near(c.x))this.knock(c,prop.x);
      for(const other of this.props)if(other!==prop&&near(other.x))this.damageProp(other,blastDamage);
    }else if(prop.type==='warung-makan'){
      // Warung makan
      const p=this.rex,heal=Math.min(warungHeal,p.max-p.hp);p.hp+=heal;this.say(heal?t('Rex makan! +{n} darah',{n:Math.round(heal)}):t('Rex sudah kenyang.'),1.8);
    }
  }
  // Munculkan musuh
  spawn(type,x){
    const hero=type in heroNames;
    // Darah pahlawan
    const max={tengkorak:110,tikus:2600,'boneka-salju':2800,penyihir:2200,robot:2600,perisai:620,rajawali:500,jaring:470,infantry:190,bazooka:230,jeep:300,helicopter:200,turret:150,tank:520,firetruck:320,firefighter:170,drone:60}[type]*(hero?.7+this.tier*.3:1)*(hero&&this.level.endless?1+this.percent/80:1);
    const e={type,x:clamp(x,70,this.level.length-70),y:type==='penyihir'?-260:type==='rajawali'?-440:type==='helicopter'?-410:type==='drone'?-330:0,dir:-1,hp:max,max,hero,
      ultCd:hero?14:0,hold:type==='bazooka'?range(420,560):range(270,420),mode:'approach',timer:type==='perisai'?1.3:2.1,shot:1.4,burst:0,stun:0,hit:0,vx:0,lift:0,vy:0,phase:range(0,6),walk:0,stride:0,lean:0,guard:0,owner:null,rise:type==='tengkorak'?.8:0,swing:0,flash:0};
    this.enemies.push(e);return e;
  }
  // Mulai serangan
  startAttack(key){
    const p=this.rex;if(!abilities[key]||p.attack||p.stun>0||this.status!=='playing'||(key==='jump'&&p.fly>0))return;
    if(p.cd[key]>0){if(key==='ulti'||key==='roar'||key==='jump')this.say(t('{skill} siap dalam {n} dtk.',{skill:t(({ulti:'Ulti',roar:'Raung',jump:'Lompat'})[key]),n:Math.ceil(p.cd[key])}),.9);return}
    p.cd[key]=cooldowns[key]*this.mods.cooldown[key];
    p.attack={key,age:0,...abilities[key],done:false};
    if(key==='ulti'){this.usedUlti=true;this.messageUntil=0;this.sound('ulti');if(this.cast&&!this.cast.done)this.cancelCast()}
  }
  // Hantam target
  strike(a){
    const p=this.rex;this.sound(a.key);if(this.thunder&&a.key!=='bite')this.zap(a.key);this.shake=Math.max(this.shake,a.key==='bite'?4:9);
    if(a.key==='ulti'){this.quake(a.damage*(p.fury>0?2:1)*this.mods.damage.ulti);return}
    if(a.key==='jump'){this.slam();return}
    if(a.key==='roar'){
      for(const e of this.enemies.filter(e=>e.x>=this.camera-40&&e.x<=this.camera+this.view+40)){
        if(!e.hero)e.stun=2.6;
        // Drone jatuh
        if(e.type==='drone'&&e.hp>0){e.hp=0;this.defeat(e)}
        if(e.type==='rajawali'){e.mode='ground';e.timer=3.4}
        if(e.type==='penyihir'){e.mode='grounded';e.timer=3.4}
      }
      for(const c of this.civilians){c.speed=Math.min(500,c.speed+80);if(c.calm&&c.x>=this.camera-40&&c.x<=this.camera+this.view+40)this.panic(c)}
      // Batalkan ulti
      if(this.cast&&!this.cast.done&&this.cast.hero.x>=this.camera-40&&this.cast.hero.x<=this.camera+this.view+40)this.cancelCast();
      return;
    }
    const [u,v]=a.range.map(n=>p.x+n*p.dir);
    const hitbox={l:Math.min(u,v),r:Math.max(u,v),t:a.height[0]-p.lift,b:a.height[1]-p.lift};
    const damage=a.damage*(p.fury>0?2:1)*(this.mods.damage[a.key]||1);
    for(const prop of this.props){
      const [width,height]=propHitboxes[prop.type];
      if(overlap(hitbox,box(prop.x,-46,width,height)))this.damageProp(prop,damage);
    }
    for(const b of this.buildings){
      if(b.x+b.width/2<hitbox.l||b.x-b.width/2>hitbox.r)continue;
      // Pilih lantai
      const indices=b.modules.map((_,i)=>i);if(a.key==='bite')indices.reverse();
      const i=indices.find(i=>b.modules[i].hp>0&&overlap(hitbox,box(b.x,b.modules[i].y,b.width,b.modules[i].h)));
      if(i!==undefined)this.damageModule(b,i,damage);
    }
    for(const e of this.enemies){
      const [bw,bh]=bodies[e.type]||(e.hero?[80,112]:[84,96]);
      if(e.hp<=0||!overlap(hitbox,box(e.x,e.y-e.lift,bw,bh)))continue;
      if(e.type==='helicopter'&&(a.key!=='bite'||e.y< -395))continue;
      if(e.type==='rajawali'&&e.mode!=='ground'&&e.mode!=='dive')continue;
      if(e.type==='penyihir'&&e.y<-120)continue;
      if(e.type==='perisai'&&a.key==='bite'&&e.mode!=='recover'&&Math.sign(p.x-e.x)===e.dir){this.say(t('Perisai memblokir gigitan.'),1);continue}
      if(e.type==='jaring'&&this.enemies.some(t=>t.owner===e&&t.hp>0)){this.say(t('Hancurkan turret Jaring dulu.'),1.1);continue}
      const counter=(e.type==='perisai'&&a.key==='tail'&&e.mode==='recover')||(e.type==='jaring'&&a.key==='stomp')||(e.type==='rajawali'&&e.mode==='ground'&&a.key==='bite');
      // Lapis baja tank
      const armour=e.type==='tank'&&!(e.flipped>0)&&a.key!=='tail'?.4:e.flipped>0?1.5:1;
      e.hp-=damage*(counter?2:1)*armour;e.hit=.2;
      if(a.key==='tail'&&e.type==='tank'){if(!(e.flipped>0))this.flips++;e.flipped=4;e.stun=4;e.vx=-p.dir*260;this.say(t('Tank terbalik!'),1.2)}
      else if(a.key==='tail'&&!e.hero){const fling=e.type==='jeep'||e.type==='firetruck';e.vx=-p.dir*(fling?920:420);e.stun=.65;if(fling){e.lift=1;e.vy=370}}
      if(e.hp<=0)this.defeat(e);
      else if(!e.hero&&a.key!=='tail')this.stagger(e,p.x);
    }
    // Warga ikut terlempar
    for(const c of this.civilians)if(!c.down&&overlap(hitbox,box(c.x,c.lane,56,92)))this.hitCivilian(c,damage,p.x);
    for(const m of this.motors)if(!m.down&&overlap(hitbox,box(m.x,m.lane,...convoyBody)))this.crash(m,p.x);
    if(a.key==='stomp')this.fx('dust',p.x,0,3);
  }
  // Lukai warga
  hitCivilian(c,damage,from){
    this.panic(c);
    c.max??=civilianHp;c.hp=(c.hp??c.max)-damage;c.hit=.2;
    if(c.hp<=0){this.knock(c,from);return}
    // Terhuyung seperti tentara
    c.vx=(Math.sign(c.x-from)||1)*280;c.stun=.55;this.fx('dust',c.x,c.lane,1);
  }
  // Warga terlempar
  knock(c,from){
    c.down=true;c.dir=Math.sign(c.x-from)||1;c.vx=c.dir*range(380,640);c.vy=-range(560,820);c.y=0;
    c.spin=c.dir*range(6,10);c.angle=0;c.life=1.15;c.hp=0;this.civiliansDown++;
    this.addScore(40);this.rex.rage=clamp(this.rex.rage+1.5*this.mods.rage,0,100);this.fx('dust',c.x,c.lane,1);this.sound('panic');
  }
  // Pendaratan lompat
  // Efek petir skill
  zap(key){
    const p=this.rex,d=p.dir;this.sound('zap');
    const at={bite:[[260,-260]],tail:[[-300,-120]],stomp:[[-180,0],[180,0]],roar:[[320,-200],[520,-120],[720,-160]],jump:[[-320,0],[0,0],[320,0]],ulti:[[-600,0],[-300,0],[0,0],[300,0],[600,0],[900,0]]}[key]||[];
    for(const [dx,y] of at)this.effects.push({kind:'bolt',x:p.x+dx*d,y,vx:0,vy:0,life:.4,max:.4,size:key==='ulti'?1.5:1.1,spin:0,seed:Math.random()});
  }
  slam(){
    const p=this.rex,left=this.camera-60,right=this.camera+this.view+60;
    this.shake=Math.max(this.shake,18);this.jumpAt=this.time;this.sound('collapse');
    for(const e of this.enemies){
      if(e.hp<=0||e.x<left||e.x>right)continue;
      e.stun=Math.max(e.stun,e.hero?slamStun.hero:slamStun.troop);e.hit=.2;
      if(e.type==='rajawali'){e.mode='ground';e.timer=4.5}
      if(e.type==='penyihir'){e.mode='grounded';e.timer=4}
    }
    if(this.cast&&!this.cast.done&&this.cast.hero.x>=left&&this.cast.hero.x<=right)this.cancelCast();
    for(const c of this.civilians)if(!c.down&&c.x>=left&&c.x<=right){this.panic(c);c.stun=Math.max(c.stun||0,1.2);c.vx=0}
    for(const e of this.enemies)if(e.type==='tengkorak'&&e.x>=left&&e.x<=right)e.rise=0;
    for(const m of this.motors)if(!m.down&&m.x>=left&&m.x<=right)this.crash(m,p.x);
    this.fx('dust',p.x-150,0,2);this.fx('dust',p.x+150,0,2);this.fx('debris',p.x,-20,4);
  }
  // Gempa ulti
  quake(damage){
    const p=this.rex,left=this.camera-60,right=this.camera+this.view+60;
    for(const prop of this.props)if(prop.x>=left&&prop.x<=right)this.damageProp(prop,damage);
    this.shake=24;this.sound('collapse');this.quakeAt=this.time;
    for(const b of this.buildings){
      if(b.x+b.width/2<left||b.x-b.width/2>right)continue;
      for(let i=b.modules.length-1;i>=0;i--)this.damageModule(b,i,damage);
      this.fx('dust',b.x,0,2);
    }
    for(const e of this.enemies){
      if(e.hp<=0||e.x<left||e.x>right)continue;
      if(e.type==='rajawali'){e.mode='ground';e.timer=3.4}
      if(e.type==='penyihir'){e.mode='grounded';e.timer=3.4}
      e.hp-=e.hero?damage*.8:damage*2;e.hit=.2;e.stun=Math.max(e.stun,e.hero?1.6:2.6);
      if(e.hp<=0)this.defeat(e);
    }
    this.shots.length=0;for(const c of this.civilians)if(!c.down&&c.x>=left&&c.x<=right)this.knock(c,p.x);
    for(const m of this.motors)if(!m.down&&m.x>=left&&m.x<=right)this.crash(m,p.x);
    this.fx('dust',p.x,0,4);
  }
  // Tentara terhuyung
  stagger(e,from){
    const away=Math.sign(e.x-from)||1,big=heavy.has(e.type);
    if(e.type==='tank')return;
    e.vx=away*(big?180:300);e.stun=Math.max(e.stun,big?.3:.5);this.fx('dust',e.x,e.y,1);
  }
  // Semprotan air
  douse(dt,strength){
    const p=this.rex;if(this.immune())return;
    p.rage=Math.max(0,p.rage-rageDrain*strength*dt);if(p.fury>0)p.fury=Math.max(0,p.fury-furyDrain*strength*dt);
    this.wet=(this.wet||0)+dt;if(this.wet>.6){this.wet=0;this.hurt(DAMAGE.water)}
  }
  // Musuh tumbang
  defeat(e){
    const p=this.rex,big=heavy.has(e.type);this.kills[e.type]=(this.kills[e.type]||0)+1;
    const giant=e.type==='robot'||e.type in bossNames;this.addScore(giant?5000:e.hero?1200:100);if(giant){for(let i=0;i<5;i++)this.fx('explosion',e.x+range(-120,120),-range(60,320));this.shake=26}p.rage=Math.min(100,p.rage+(e.hero?20:6)*this.mods.rage);
    // Jaring terbuka
    if(e.type==='turret'&&e.owner?.hp>0){e.owner.timer=Math.max(e.owner.timer,jaringOpen);this.say(t('Turret hancur! Injak Jaring sekarang.'),1.6)}
    if(e.type!=='turret')p.hp=Math.min(p.max,p.hp+(e.hero?HEAL.hero:big?HEAL.vehicle:HEAL.soldier)*this.mods.heal);
    this.fx('explosion',e.x,e.y-45);if(e.hero)this.say(t('{name} tumbang!',{name:t(heroNames[e.type])}),2.5);
  }
  // Lukai Rex
  hurt(amount,stun=0,ranged=false){const p=this.rex;if(this.immune()||(p.fly>0&&!ranged))return false;p.hp=Math.max(0,p.hp-amount*this.power);p.hit=.18;this.sound('hurt');if(p.fury<=0)p.stun=Math.max(p.stun,stun);return true}
  // Rex kebal
  immune(){const p=this.rex;return this.god||p.attack?.key==='ulti'||(p.lift>0&&!(p.fly>0))||p.reviving>0||this.phase==='dying'}
  // Mulai ulti pahlawan
  startCast(e){
    this.cast={hero:e,type:e.type,age:0,windup:ultWindup,done:false,...heroUltis[e.type]};
    e.ultCd=24+range(0,6);this.lastCast=this.time;this.messageUntil=0;this.sound('heroUlti');
  }
  // Batalkan ulti
  cancelCast(){
    const e=this.cast.hero;this.cast=null;e.ultCd=Math.max(e.ultCd,10);this.cancelled++;
    this.say(t('Ulti {name} gagal!',{name:t(heroNames[e.type])}),1.6);this.sound('crack');
  }
  // Dampak ulti pahlawan
  castStrike(cast){
    const p=this.rex,e=cast.hero,near=Math.abs(p.x-e.x)<cast.reach;
    this.castAt=this.time;this.shake=Math.max(this.shake,20);
    if(cast.type==='perisai'){
      this.heroWave={x:e.x,at:this.time};this.sound('collapse');
      if(near)this.hurt(cast.damage,cast.stun);
    }else if(cast.type==='robot'){
      this.heroWave={x:e.x,at:this.time};this.sound('collapse');
      if(near&&this.hurt(cast.damage,cast.stun)){p.slow=Math.max(p.slow,cast.slow);p.bigNet=cast.slow}
    }else if(cast.type==='tikus'){
      this.rain={until:this.time+2,next:0,damage:cast.damage,type:'coin'};this.sound('launch');
    }else if(cast.type==='boneka-salju'){
      const s=this.shoot(e,'freeze');s.freeze=cast.freeze;s.damage=cast.damage;s.big=true;
    }else if(cast.type==='penyihir'){
      this.summon(p.x,cast.count,true);this.sound('launch');
    }else if(cast.type==='rajawali'){
      this.rain={until:this.time+1.5,next:0,damage:cast.damage};this.sound('launch');
    }else{
      this.sound('launch');
      if(near&&this.hurt(cast.damage,cast.stun)){p.slow=Math.max(p.slow,cast.slow);p.bigNet=cast.slow}
    }
  }
  // Tembak
  shoot(e,type){
    const x=e.x, y=e.y-(e.hero?68:e.type==='turret'?34:62), dx=this.rex.x-x,dy=-145-y;
    const dist=Math.hypot(dx,dy)||1;const speed={bullet:760,rocket:380,laser:860,net:470,sack:520,snow:640,orb:430,freeze:620}[type];
    const s={x,y,type,vx:dx/dist*speed,vy:dy/dist*speed,life:3.2,g:0};
    // Karung melengkung
    if(type==='sack'){s.vx=Math.sign(dx||1)*clamp(Math.abs(dx)*1.1,300,620);s.vy=-520;s.g=980}
    this.shots.push(s);this.sound(type==='bullet'?'shot':'launch');e.flash=.45;return s;
  }
  // Panggil tengkorak
  summon(x,count,ring=false){
    const alive=this.enemies.filter(e=>e.type==='tengkorak'&&e.hp>0).length;
    for(let i=0;i<Math.min(count,boneCap-alive);i++){
      const side=i%2?-1:1,gap=ring?240+Math.floor(i/2)*150:range(260,620);
      const e=this.spawn('tengkorak',x+side*gap);e.dir=-side;e.rise=.8+i*.08;e.shot=1;
    }
    this.fx('dust',x,0,2);
  }
  // AI bos misi
  tickBoss(e,dt,dist,dir){
    const b=bossRules[e.type];e.flash=Math.max(0,e.flash-dt);
    if(e.type==='penyihir'){
      // Penyihir melayang
      if(e.mode==='grounded'){e.y+=(0-e.y)*ease(8,dt);if(e.timer<=0){e.mode='approach';e.timer=3}return}
      if(e.mode==='summon'){e.y+=(0-e.y)*ease(9,dt);if(!e.connected&&e.timer<=.6){e.connected=true;this.summon(e.x,3+(Math.random()<.5),false)}if(e.timer<=0){e.mode='approach';e.timer=b.summonEvery}return}
      e.dir=dir;e.y+=(-260+Math.sin(this.time*1.8)*28-e.y)*ease(3,dt);e.x+=dir*clamp(dist-420,-160,220)*dt;
      if(e.shot<=0){this.shoot(e,'orb');e.shot=b.shotEvery}
      if(e.timer<=0){e.mode='summon';e.timer=1.3;e.connected=false}
      return;
    }
    // Bos darat
    if(e.mode==='approach'){e.dir=dir;if(dist>b.reach)e.x+=dir*b.speed*dt;
      if(e.timer<=0&&dist<b.reach+80){e.mode='windup';e.timer=b.windup;e.connected=false}
      else if(e.shot<=0&&dist>b.reach+140){this.shoot(e,b.shot);e.shot=b.shotEvery}}
    else if(e.mode==='windup'&&e.timer<=0){e.mode='punch';e.timer=.35;e.x+=e.dir*50}
    else if(e.mode==='punch'){if(!e.connected&&dist<b.reach+90){this.hurt(b.damage,.5);e.connected=true;this.shake=Math.max(this.shake,12)}if(e.timer<=0){e.mode='recover';e.timer=1}}
    else if(e.mode==='recover'&&e.timer<=0){e.mode='approach';e.timer=1.5}
  }
  // Pakai skill khusus
  useSkill(){
    const p=this.rex;if(!skillCooldown[this.skill]||p.cd.special>0||p.stun>0||p.fly>0||p.attack||p.reviving>0)return;
    p.cd.special=skillCooldown[this.skill];
    if(this.skill==='terbang'){p.fly=flyTime;this.say(t('Rex terbang!'),1.2);this.sound('launch');return}
    // Barisan duri
    for(let i=0;i<spikeCount;i++)this.spikes.push({x:p.x+p.dir*(170+i*spikeGap),at:this.time+i*.07,done:false,dir:p.dir});
    this.say(t('Duri es!'),1.2);this.sound('crack');
  }
  // Duri menusuk
  pierce(s){
    const near=x=>Math.abs(x-s.x)<85;
    for(const e of this.enemies)if(e.hp>0&&near(e.x)&&e.y>-340){e.hp-=e.hero?140:230;e.hit=.2;e.stun=Math.max(e.stun,e.hero?.8:1.4);if(!e.hero)e.lift=Math.max(e.lift,1),e.vy=420;if(e.hp<=0)this.defeat(e)}
    for(const c of this.civilians)if(!c.down&&near(c.x))this.knock(c,s.x-s.dir*40);
    for(const prop of this.props)if(near(prop.x))this.damageProp(prop,150);
    this.fx('dust',s.x,0,1);this.shake=Math.max(this.shake,5);
  }
  // AI pahlawan
  tickHero(e,dt,dist,dir){
    const p=this.rex;e.timer-=dt;
    if(e.type in bossNames){this.tickBoss(e,dt,dist,dir);return}
    if(e.type==='robot'){
      // Robot penjaga
      if(e.mode==='approach'){e.dir=dir;if(dist>robot.reach)e.x+=dir*robot.speed*dt;
        if(e.timer<=0&&dist<robot.reach+80){e.mode='windup';e.timer=robot.windup;e.connected=false}
        else if(e.shot<=0&&dist>robot.reach+120){this.shoot(e,'net');e.shot=robot.netEvery;e.mode='net';e.timer=.5}}
      else if(e.mode==='windup'&&e.timer<=0){e.mode='punch';e.timer=.35;e.x+=e.dir*60}
      else if(e.mode==='punch'){if(!e.connected&&dist<robot.reach+90){this.hurt(robot.punch,.6);e.connected=true;this.shake=Math.max(this.shake,12)}
        if(e.timer<=0){e.mode='recover';e.timer=1.1}}
      else if((e.mode==='recover'||e.mode==='net')&&e.timer<=0){e.mode='approach';e.timer=1.6}
      return;
    }
    if(e.type==='perisai'){
      if(e.mode==='approach'){e.dir=dir;if(dist>205)e.x+=dir*240*dt;
        if(e.timer<=0&&dist<730){e.mode='aim';e.timer=.85;e.dir=dir;e.connected=false}}
      else if(e.mode==='aim'&&e.timer<=0){e.mode='charge';e.timer=.62}
      else if(e.mode==='charge'){e.x+=e.dir*840*dt;if(Math.abs(e.x-p.x)<94&&!e.connected){this.hurt(DAMAGE.charge,.45);e.connected=true}
        if(e.timer<=0){e.mode='recover';e.timer=1.9}}
      else if(e.mode==='recover'&&e.timer<=0){e.mode='approach';e.timer=1.5}
    }else if(e.type==='rajawali'){
      e.dir=dir;
      if(e.mode==='ground'){e.y+=(0-e.y)*ease(10,dt);if(e.timer<=0){e.mode='approach';e.timer=3.6}}
      else if(e.mode==='dive'){e.y+=(-40-e.y)*ease(5,dt);e.x+=dir*360*dt;
        if(dist<105&&!e.connected){this.hurt(DAMAGE.dive,.2);e.connected=true}
        if(e.timer<=0){e.mode='approach';e.timer=4}}
      else{e.y+=(-465+Math.sin(this.time*2)*32-e.y)*ease(3,dt);e.x+=dir*clamp(dist-390,-170,245)*dt;
        if(e.shot<=0){this.shoot(e,'laser');e.shot=2.2}
        if(e.timer<=0){e.mode='dive';e.timer=1.4;e.connected=false}}
    }else{
      e.dir=dir;e.x+=dir*clamp(dist-260,-90,195)*dt;
      if(e.shot<=0){this.shoot(e,'net');e.shot=3.2}
      if(e.timer<=0&&!this.enemies.some(t=>t.owner===e&&t.hp>0)){
        const turret=this.spawn('turret',e.x+dir*160);turret.owner=e;e.timer=8;
      }
    }
  }
  // Animasi musuh
  animateEnemy(e,dt,previousX){
    const distance=Math.abs(e.x-previousX),speed=distance/dt;
    e.walk+=distance/(e.hero?26:21);
    e.stride+=(clamp(speed/(e.hero?420:185),0,1)-e.stride)*ease(12,dt);
    const lean=e.mode==='charge'?.18:e.mode==='recover'?-.14:e.mode==='dive'?.45:0;
    e.lean+=(lean-e.lean)*ease(14,dt);e.guard+=((e.mode==='recover'?1:0)-e.guard)*ease(12,dt);
    const frame=e.type==='tengkorak'?(e.rise>0?'rise':e.stun>0?'knockback':e.swing>0?'attack':Math.sin(e.walk+e.phase)>=0?'walk-a':'walk-b'):e.stun>0?'knockback':e.stride<.12?(e.type==='bazooka'?'kneeling-fire':'aim'):
      Math.sin(e.walk+e.phase)>=0?'run-a':'run-b';
    spritePose(e,frame,dt);
  }
  // Perbarui dunia
  update(dt,input){
    if(this.status!=='playing'||dt<=0)return;
    this.time+=dt;const p=this.rex;
    // Tanpa akhir
    if(this.level.endless)this.power=this.basePower*(1+this.percent/50);
    // Petir di langit
    if(this.weather==='rain'&&this.phase==='fight'){
      if(this.time>=this.nextBolt){this.boltAt=this.time;this.boltX=this.camera+range(.1,.9)*this.view;this.nextBolt=this.time+range(5,11);this.sound('thunder')}
      if(this.time>=this.strikeRexAt){
        // Rex tersambar
        this.strikeRexAt=Infinity;this.struckAt=this.boltAt=this.time;this.boltX=this.rex.x;this.thunderUnlocked=true;this.thunder=true;
        this.rex.rage=100;this.shake=26;this.sound('thunder');this.sound('zap');
        this.say(t('Rex tersambar petir! Skin ThunderRex terbuka!'),4.5);
      }
    }
    // Kombo putus
    if(this.combo&&(this.comboTime-=dt)<=0)this.combo=0;
    // Pewaktu
    for(const k of ['stun','slow','fury','hit','bigNet','frozen','coins'])p[k]=Math.max(0,p[k]-dt);
    // Lepas dari es
    if(p.frozen>0){const pressed=['bite','tail','stomp','roar','left','right','jump'].some(k=>input.has(k));if(pressed&&!p.mashed)p.frozen=Math.max(0,p.frozen-.2);p.mashed=pressed;p.stun=Math.max(p.stun,p.frozen)}
    // Bangkit lagi
    if(p.reviving>0){p.reviving-=dt;p.stun=Math.max(p.stun,.1);p.vx=0;if(p.reviving<=0){p.hp=reviveHp;this.say(t('Rex bangkit lagi!'),2);this.sound('roar');this.shake=14}}
    for(const k in p.cd){const before=p.cd[k];p.cd[k]=Math.max(0,before-dt);if(k==='ulti'&&before>0&&!p.cd[k]){this.say(t('Ulti siap! Tekan R.'),2);this.sound('alarm')}}
    if(p.rage>=100&&p.fury<=0){p.fury=8;p.stun=0;p.rage=0;this.say(t('Rage penuh! Damage 2× selama 8 detik.'),2.4);this.sound('roar')}
    const exiting=this.phase==='exit',dying=this.phase==='dying';
    if(exiting){p.stun=0;p.slow=0;p.queued=null}
    if(dying){p.queued=null;p.attack=null}
    const move=exiting?1:dying?0:Number(input.has('right'))-Number(input.has('left'));
    p.moving=!!move&&p.stun<=0&&(!p.attack||p.attack.key==='bite'||p.attack.key==='jump');
    if(p.moving)p.dir=move;
    // Gerak Rex
    p.vx+=((p.moving?move*(p.slow>0?155:365)*(p.fly>0?1.45:1):0)-p.vx)*ease(p.moving?12:16,dt);
    if(!p.moving&&Math.abs(p.vx)<3)p.vx=0;
    if(p.vx){
      const x=clamp(p.x+p.vx*dt,115,this.level.length+(exiting?900:-120));if(x===p.x)p.vx=0;p.x=x;
      const pace=Math.abs(p.vx)/365;p.walk+=dt*8*pace;this.stepTime+=dt*pace;
      if(this.stepTime>.44){this.stepTime=0;this.shake=Math.max(this.shake,2);this.sound('step')}
    }
    p.stride+=(clamp(Math.abs(p.vx)/240,0,1)-p.stride)*ease(12,dt);
    // Antre serangan
    if(!exiting&&!dying)for(const key of ['ulti','jump','bite','tail','stomp','roar'])if(input.has(key)){p.queued=key;p.queuedUntil=this.time+.25;break}
    if(!exiting&&!dying&&input.has('special'))this.useSkill();
    if(p.queued){
      if(p.stun>0)p.queuedUntil=Math.max(p.queuedUntil,this.time+.1);
      if(this.time>p.queuedUntil)p.queued=null;
      else if(!p.attack&&p.stun<=0){this.startAttack(p.queued);p.queued=null}
    }
    if(p.attack){const a=p.attack;a.age+=dt;if(!a.done&&a.age>=a.impact){a.done=true;this.strike(a)}if(a.age>=a.duration)p.attack=null}
    const grounded=!p.lift,flew=p.fly>0;p.fly=Math.max(0,p.fly-dt);
    p.lift=p.attack?.key==='jump'?jumpLift(p.attack.age):p.fly>0?flyHeight*smooth((flyTime-p.fly)/.35)*smooth(p.fly/.4):0;
    // Mendarat dari terbang
    if(flew&&!p.fly){this.shake=Math.max(this.shake,10);this.fx('dust',p.x-120,0,2);this.fx('dust',p.x+120,0,2);this.sound('stomp');
      for(const e of this.enemies)if(!e.hero&&Math.abs(e.x-p.x)<320)e.stun=Math.max(e.stun,.8)}
    // Duri es
    for(const s of this.spikes)if(!s.done&&this.time>=s.at){s.done=true;this.pierce(s)}
    keep(this.spikes,s=>this.time<s.at+.9);
    // Lepas landas
    if(grounded&&p.lift>0&&this.cast&&!this.cast.done&&this.cast.hero.x>=this.camera-40&&this.cast.hero.x<=this.camera+this.view+40)this.cancelCast();
    // Kamera
    this.look+=(p.dir-this.look)*ease(1.6,dt);
    this.camera+=(clamp(p.x-this.view*(.5-.06*this.look),0,Math.max(0,this.level.length-this.view))-this.camera)*ease(6,dt);
    // Jadwal bos
    const arrivals=[];
    for(const [i,w] of this.level.bosses.entries())if(!this.triggered.has(i)&&this.percent+.0001>=w.at){
      this.triggered.add(i);arrivals.push(w.type);
    }
    if(arrivals.length){
      // Formasi kepung
      const side=p.x>this.level.length-900?-1:1;
      for(const type of arrivals){
        const e=this.spawn(type,p.x+side*flank[type]);e.timer+=delays[type];e.ultCd=firstUlt[type];
      }
      this.say(arrivals.length>1?t('Para penjaga mengepung Rex! Pecah formasi mereka satu per satu.'):t('{name} datang! {hint}',{name:t(heroNames[arrivals[0]]),hint:t(hints[arrivals[0]])}),4);
      this.sound('alarm');
    }
    // Tentara baru
    this.spawnTime-=dt;
    const troops=this.enemies.reduce((n,e)=>n+(!e.hero&&e.type!=='turret'),0),cap=squadCap+Math.round(this.tier*6)+this.squadBonus;
    if(this.phase==='fight'&&this.spawnTime<=0&&troops<cap){
      const pool=['infantry'];if(this.mission==='halloween')pool.push('tengkorak','tengkorak');if(this.percent>=30)pool.push('bazooka');if(this.percent>=50)pool.push('jeep');if(this.percent>=70)pool.push('helicopter');
      // Musuh baru
      for(const [type,tier,at] of newTroops)if(this.tier>=tier&&this.percent>=at)pool.push(type);
      // Regu bergantian
      const side=this.squads++%2?-1:1,target=p.x+side*(this.view*.49);
      const spawn=this.level.spawns.reduce((a,b)=>Math.abs(b-target)<Math.abs(a-target)?b:a);
      const size=Math.min(cap-troops,2+Math.floor(this.percent/34)+(Math.random()<.4));
      for(let i=0;i<size;i++){
        const type=pool[this.enemyCount++%pool.length];
        // Kawanan drone
        for(let d=0;d<(type==='drone'?3:1);d++){const e=this.spawn(type,spawn+side*(i*70+d*60));e.dir=e.x>p.x?-1:1;e.shot+=i*.35+d*.3;e.phase+=d*2}
      }
      this.spawnTime=Math.max(1.6,3.2-this.percent*.016);
    }
    // Ulti pahlawan
    if(this.cast){
      const cast=this.cast,e=cast.hero;cast.age+=dt;
      if(!cast.done&&(e.hp<=0||e.stun>0))this.cancelCast();
      else{
        if(!cast.done&&cast.age>=cast.windup){cast.done=true;this.castStrike(cast)}
        if(cast.age>=cast.windup+.6)this.cast=null;
      }
    }
    if(this.rain){
      const rain=this.rain;rain.next-=dt;
      while(rain.next<=0&&this.time<rain.until){
        rain.next+=rain.type==='coin'?.07:.11;const x=p.x+range(-230,230);
        this.shots.push(rain.type==='coin'?{x,y:-1050,type:'coin',vx:range(-40,40),vy:range(820,980),life:1.6,damage:rain.damage,g:0,spin:range(0,4)}:{x,y:-1050,type:'laser',vx:range(-60,60),vy:1350,life:1.2,damage:rain.damage,g:0});
      }
      if(this.time>=rain.until)this.rain=null;
    }
    // Musuh
    // Pilih penembak
    this.gunners=new Set(this.enemies.filter(e=>e.hp>0&&ranged.has(e.type)&&!e.flee).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x)).slice(0,this.gunnerCap));
    for(const e of this.enemies){
      if(e.hp<=0)continue;const previousX=e.x;e.shot-=dt;e.hit=Math.max(0,e.hit-dt);e.flipped=Math.max(0,(e.flipped||0)-dt);
      if(this.phase==='dying'){e.vx*=Math.pow(.05,dt);this.animateEnemy(e,dt,previousX);continue}
      e.x+=e.vx*dt;e.vx*=Math.pow(.05,dt);
      if(e.lift>0){e.lift=Math.max(0,e.lift+e.vy*dt);e.vy-=850*dt}
      if(e.stun>0){e.stun=Math.max(0,e.stun-dt);this.animateEnemy(e,dt,previousX);continue}
      const dist=Math.abs(p.x-e.x),dir=p.x>=e.x?1:-1;
      // Tentara kabur
      if(e.flee){e.dir=-dir;e.x+=e.dir*(e.type==='jeep'?520:320)*dt;if(e.type==='helicopter')e.y-=160*dt;this.animateEnemy(e,dt,previousX);continue}
      if(e.hero){
        e.ultCd-=dt;
        if(this.cast?.hero===e){e.dir=dir}
        else{
          if(e.ultCd<=0&&!this.cast&&dist<1100&&this.time-this.lastCast>5&&p.attack?.key!=='ulti')this.startCast(e);
          else this.tickHero(e,dt,dist,dir);
        }
      }
      else if(e.type==='turret'){if(!e.owner||e.owner.hp<=0){e.hp=0;continue}if(dist<900&&e.shot<=0){this.shoot(e,'bullet');e.shot=1.7}}
      else{
        if(e.type==='jeep'){e.x+=e.dir*445*dt;if(dist<85&&e.shot<=0)this.hurt(DAMAGE.ram,.2)}
        else if(e.type==='firetruck'){
          // Truk pemadam
          e.x+=e.dir*300*dt;e.spraying=dist<sprayRange;
          if(e.spraying)this.douse(dt,1)
        }
        else if(e.type==='tank'){e.dir=dir;e.x+=dir*clamp(dist-560,-60,70)*dt}
        else if(e.type==='drone'){e.dir=dir;e.x+=dir*clamp(dist-260,-150,220)*dt;e.y=-330+Math.sin(this.time*2.4+e.phase)*45}
        else if(e.type==='firefighter'){
          // Petugas pemadam
          e.dir=dir;e.x+=dir*clamp(dist-300,-130,185)*dt;e.spraying=dist<sprayRange*.75&&e.shot<=1.2;
          if(e.spraying)this.douse(dt,.6);
          if(e.shot<=0)e.shot=2.4;
          this.animateEnemy(e,dt,previousX);continue;
        }
        else if(e.type==='tengkorak'){
          // Tengkorak bangkit
          if(e.rise>0){e.rise-=dt;this.animateEnemy(e,dt,previousX);continue}
          e.dir=dir;if(dist>95)e.x+=dir*125*dt;
          if(dist<125&&e.shot<=0&&e.swing<=0){e.swing=.35;e.shot=1.5}
          if(e.swing>0){e.swing-=dt;if(e.swing<=0&&dist<145)this.hurt(DAMAGE.bone,.15)}
        }
        else{e.dir=dir;e.x+=dir*clamp(dist-e.hold,-130,185)*dt}
        if(e.type==='firetruck'){this.animateEnemy(e,dt,previousX);continue}
        if(e.type==='helicopter')e.y=-420+Math.sin(this.time*1.5+e.phase)*135;
        if(dist<940&&e.shot<=0&&this.gunners.has(e)){const rocket=e.type==='bazooka'||e.type==='helicopter'||e.type==='tank';
          this.shoot(e,rocket?'rocket':'bullet');e.shot=e.type==='tank'?3.6:rocket?4.2:e.type==='infantry'&&++e.burst%3?.19:e.type==='drone'?2.2:3}
      }
      // Jalan licin
      if(this.weather==='rain'&&!e.hero)e.x=previousX+(e.x-previousX)*rainSlow;
      // Jalan bersalju
      if(this.weather==='snow'&&!e.hero&&!(e.type in vehicleBodies)){e.x=previousX+(e.x-previousX)*.85;if(Math.random()<dt*.06){e.stun=.6;e.vx=e.dir*170}}
      e.x=e.hero?clamp(e.x,60,this.level.length-60):clamp(e.x,-150,this.level.length+150);
      this.animateEnemy(e,dt,previousX);
    }
    keep(this.enemies,e=>e.hp>0&&(e.hero||e.owner||Math.abs(e.x-p.x)<this.view+100));
    // Proyektil
    for(const s of this.shots){
      // Bola sihir mengejar
      if(s.type==='orb'){const dx=p.x-s.x,dy=-150-p.lift-s.y,d=Math.hypot(dx,dy)||1;s.vx+=(dx/d*430-s.vx)*ease(1.6,dt);s.vy+=(dy/d*430-s.vy)*ease(1.6,dt)}
      s.vy+=(s.g||0)*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
      // Peluru kena Rex
      const size=s.big?60:s.type==='sack'||s.type==='orb'?30:10;
      if(overlap(box(s.x,s.y+size/2,size,size),box(p.x,-12-p.lift,141,290))){s.life=0;const landed=this.hurt(s.damage??DAMAGE[s.type],0,true);
        if(landed&&s.type==='net'){p.slow=2.3;p.coins=0}if(s.type==='rocket')this.fx('explosion',s.x,s.y);
        if(landed&&s.type==='coin'){p.slow=Math.min(4,p.slow+.7);p.coins=p.slow}
        if(landed&&s.type==='freeze'){p.frozen=s.freeze||1.2;p.stun=Math.max(p.stun,p.frozen);p.fly=0;this.say(t('Rex membeku! Tekan tombol berulang untuk lepas.'),1.8);this.sound('crack')}
        if(s.type==='sack'||s.type==='snow'||s.type==='freeze'||s.type==='orb')this.fx('dust',s.x,s.y,1)}}
    keep(this.shots,s=>s.life>0&&s.y<40);
    // Warga
    for(const c of this.civilians){
      if(c.down){c.life-=dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.vy+=1500*dt;c.angle+=c.spin*dt;spritePose(c,'stumble',dt);continue}
      c.hit=Math.max(0,(c.hit||0)-dt);c.alarm=Math.max(0,(c.alarm||0)-dt);
      if(c.calm){
        // Rex mendekat
        if(Math.abs(c.x-p.x)<calmRadius)this.panic(c);
        // Berbaris pawai
        else if(c.march){c.x+=c.dir*marchSpeed*dt;c.walk+=marchSpeed*dt/24;spritePose(c,Math.sin(c.walk)>=0?'run-a':'run-b',dt);continue}
        else{
          // Menoleh sesekali
          c.activity+=dt;if(!c.chat&&c.activity>9){c.activity=0;c.dir*=-1}
          continue;
        }
      }
      if(c.stun>0){c.stun-=dt;c.x+=c.vx*dt;c.vx*=Math.pow(.05,dt);spritePose(c,'stumble',dt);continue}
      const pace=this.weather==='rain'?.8:1;c.x+=c.dir*c.speed*pace*dt;c.walk+=c.speed*pace*dt/28;
      const glance=(this.time+c.phase)%5>4.6,stumble=(this.time+c.phase)%8>7.8;
      spritePose(c,stumble?'stumble':glance?'look-back':Math.sin(c.walk)>=0?'run-a':'run-b',dt);
    }
    // Sambut pawai
    if(this.paradeX&&Math.abs(p.x-this.paradeX)<1300){this.paradeX=0;this.say(t('Pawai 17 Agustus lewat!'),2.2)}
    // Konvoi motor
    if(p.x>=this.convoyAt&&this.phase==='fight'){this.convoyAt=Infinity;this.spawnConvoy()}
    for(const m of this.motors){
      if(m.down){m.life-=dt;m.x+=m.vx*dt;m.vx*=Math.pow(.25,dt);m.y=Math.min(0,m.y+m.vy*dt);m.vy+=1500*dt;if(m.y<0)m.angle+=m.spin*dt;continue}
      m.x+=m.dir*m.speed*(this.weather==='rain'?rainSlow:1)*dt;
      // Tabrak Rex
      if(Math.abs(m.x-p.x)<95&&p.lift<60&&this.phase!=='dying')this.crash(m,p.x);
    }
    keep(this.motors,m=>m.down?m.life>0:m.x>this.camera-400);
    keep(this.civilians,c=>c.calm||(!c.down||c.life>0)&&c.x>this.camera-170&&c.x<this.camera+this.view+170);
    // Efek
    for(const f of this.effects){f.life-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.kind==='debris'||f.kind==='decor')f.vy+=880*dt}
    keep(this.effects,f=>f.life>0);this.shake=Math.max(0,this.shake-dt*25);
    for(const b of this.buildings)for(const m of b.modules)m.fall=Math.max(0,m.fall-dt);
    // Menang kalah
    if(p.hp<=0&&!(p.reviving>0)&&this.skill==='bangkit'&&!p.revived&&this.phase!=='exit'&&this.phase!=='dying'){
      // Tulang rontok
      p.revived=true;p.reviving=reviveTime;p.attack=null;p.vx=0;p.fly=0;this.shots.length=0;this.rain=null;
      this.say(t('Tulang Rex rontok…'),1.6);this.sound('collapse');this.shake=14;
    }
    else if(p.hp<=0&&!(p.reviving>0)&&this.phase!=='exit'&&this.phase!=='dying'){
      // Rex tumbang
      this.phase='dying';this.dieAt=this.time;p.attack=null;p.vx=0;this.shots.length=0;this.rain=null;this.cast=null;
      this.shake=16;this.messageUntil=0;this.sound('roar');
    }
    else if(this.phase==='dying'){
      if(!this.fellAt&&this.time-this.dieAt>=.85){this.fellAt=this.time;this.shake=22;this.sound('collapse');this.fx('dust',p.x-120*p.dir,0,3);this.fx('dust',p.x+160*p.dir,0,3)}
      if(this.time-this.dieAt>=dieTime)this.status='lost';
    }
    else if(this.phase==='fight'&&this.level.boss&&!this.bossSpawned&&this.percent+.0001>=this.level.target&&this.triggered.size===this.level.bosses.length&&!this.enemies.some(e=>e.hero)){
      // Bos final
      this.bossSpawned=true;const side=p.x>this.level.length-1200?-1:1;
      const boss=this.spawn(this.level.boss,p.x+side*760);boss.dir=-side;boss.timer=2;boss.ultCd=firstUlt[this.level.boss];
      this.say(this.level.boss==='robot'?t('Ketiga penjaga bergabung: ROBOT PENJAGA!'):t('{name} muncul!',{name:t(heroNames[this.level.boss])}),4);this.sound('alarm');this.shake=18;
    }
    else if(this.phase==='fight'&&(!this.level.boss||this.bossSpawned)&&this.percent+.0001>=this.level.target&&this.triggered.size===this.level.bosses.length&&!this.enemies.some(e=>e.hero)){
      this.phase='clear';this.shots.length=0;this.rain=null;
      for(const e of this.enemies)e.flee=true;
      this.say(t('Kota rata! Jalan ke ujung distrik →'),4);this.sound('roar');
    }
    else if(this.phase==='clear'&&p.x>=this.exitX){this.phase='exit';this.exitAt=this.time;this.messageUntil=0;p.attack=null;this.sound('alarm')}
    else if(this.phase==='exit'&&this.time-this.exitAt>=exitTime)this.status='won';
  }
}
