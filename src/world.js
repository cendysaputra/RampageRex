import { damp as ease, spritePose } from './motion.js';
// Batasi nilai
export const clamp = (n, low, high) => Math.max(low, Math.min(n, high));
export const people = ['office-worker','shopper','schoolkid','elder','bakso-vendor'];
export const heroNames = {perisai:'Perisai',rajawali:'Rajawali',jaring:'Jaring'};
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
  // Ulti
  ulti: {duration:1.9, impact:1.05, damage:150}
};
// Darah Rex
const rexHp=400;
// Pulih darah
const HEAL={soldier:6,vehicle:10,hero:60};
// Jeda serangan
export const cooldowns = {bite:.7, tail:2.2, stomp:3.5, roar:9, ulti:40};
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
const groundRise={ground:433,upper:337,roof:269};
// Formasi pahlawan: Perisai di depan, Rajawali di udara, Jaring memotong jalan mundur
const flank={perisai:520,rajawali:780,jaring:-600};
const delays={perisai:0,rajawali:.9,jaring:1.8};
// Dunia permainan
export class World {
  constructor(level,index){
    this.level=level;this.index=index;this.time=0;this.score=0;this.lost=0;this.total=0;
    this.rex={x:level.start,dir:1,hp:rexHp,max:rexHp,rage:30,fury:0,stun:0,slow:0,hit:0,attack:null,walk:0,moving:false,vx:0,stride:0,queued:null,queuedUntil:0,
      cd:{bite:0,tail:0,stomp:0,roar:0,ulti:15}};
    this.buildings=level.buildings.map(b=>{
      let y=-65;
      const modules=['ground',...Array(b.upper).fill('upper'),'roof'].map(type=>{
        const h=groundRise[type]*b.width/960;
        const max=type==='ground'?215:type==='upper'?150:85;this.total+=max;
        const m={type,y,h,max,hp:max,fall:0};y-=h;return m;
      });
      return {...b,modules,evacuated:false};
    });
    this.enemies=[];this.civilians=[];this.shots=[];this.effects=[];this.events=[];
    this.triggered=new Set();this.spawnTime=3;this.enemyCount=0;this.camera=0;this.look=1;this.quakeAt=-9;this.view=1920;this.stepTime=0;this.shake=0;this.status='playing';
    this.say(level.name+' · Hancurkan '+level.target+'% kota',3.2);
  }
  // Persen hancur
  get percent(){return 100*this.lost/this.total}
  // Tampilkan pesan
  say(text,seconds=3){this.message=text;this.messageUntil=this.time+seconds}
  // Antre suara
  sound(name){this.events.push(name)}
  // Buat efek
  fx(kind,x,y,count=1){
    for(let i=0;i<count;i++){
      const debris=kind==='debris'||kind==='decor';
      this.effects.push({kind,x,y,vx:debris?range(-200,200):range(-30,30),vy:debris?range(-430,-160):-40,
        life:debris?.85:.5,max:debris?.85:.5,size:kind==='dust'?range(80,155):kind==='decor'?65:kind==='explosion'?130:range(18,40),spin:range(-4,4),seed:Math.random()});
    }
  }
  // Rusak modul
  damageModule(b,i,damage){
    const m=b.modules[i];if(m.hp<=0)return;
    const before=moduleState(m),delta=Math.min(m.hp,damage);m.hp-=delta;this.lost+=delta;this.score+=Math.round(delta);
    this.rex.rage=clamp(this.rex.rage+delta*.065,0,100);
    if(!b.evacuated){
      b.evacuated=true;this.sound('panic');
      for(let n=0;n<2+Math.floor(this.percent/22);n++){
        const x=b.x+range(-b.width*.35,b.width*.35);
        this.civilians.push({type:people[(this.buildings.indexOf(b)+n)%people.length],x,dir:x>=this.rex.x?1:-1,speed:range(250,350),phase:Math.random()*5,walk:0,lane:range(6,28)});
      }
    }
    if(before!==moduleState(m)){
      this.fx('dust',b.x,m.y-m.h*.36,2);this.fx('debris',b.x,m.y-m.h*.7,5);
      if(before==='intact')this.fx('decor',b.x+b.width*.24,m.y-m.h*.72);
      this.shake=Math.max(this.shake,7);this.sound(m.hp===0?'collapse':'crack');
      if(!m.hp){m.fall=.6;if(i+1<b.modules.length)this.damageModule(b,i+1,Infinity)}
    }
  }
  // Munculkan musuh
  spawn(type,x){
    const hero=type in heroNames;
    // Pahlawan lebih tipis di distrik awal karena selalu datang bertiga
    const max={perisai:620,rajawali:500,jaring:470,infantry:75,bazooka:100,jeep:150,helicopter:90,turret:75}[type]*(hero?.7+this.index*.1:1);
    const e={type,x:clamp(x,70,this.level.length-70),y:type==='rajawali'?-440:type==='helicopter'?-410:0,dir:-1,hp:max,max,hero,
      mode:'approach',timer:type==='perisai'?1.3:2.1,shot:1.4,burst:0,stun:0,hit:0,vx:0,lift:0,vy:0,phase:range(0,6),walk:0,stride:0,lean:0,guard:0,owner:null};
    this.enemies.push(e);return e;
  }
  // Mulai serangan
  startAttack(key){
    const p=this.rex;if(!abilities[key]||p.attack||p.stun>0||this.status!=='playing')return;
    if(p.cd[key]>0){if(key==='ulti'||key==='roar')this.say((key==='ulti'?'Ulti':'Raung')+' siap dalam '+Math.ceil(p.cd[key])+' dtk.',.9);return}
    p.cd[key]=cooldowns[key];
    p.attack={key,age:0,...abilities[key],done:false};
    if(key==='ulti'){this.messageUntil=0;this.sound('ulti')}
  }
  // Hantam target
  strike(a){
    const p=this.rex;this.sound(a.key);this.shake=Math.max(this.shake,a.key==='bite'?4:9);
    if(a.key==='ulti'){this.quake(a.damage*(p.fury>0?2:1));return}
    if(a.key==='roar'){
      for(const e of this.enemies.filter(e=>e.x>=this.camera-40&&e.x<=this.camera+this.view+40)){
        if(!e.hero)e.stun=2.6;
        if(e.type==='rajawali'){e.mode='ground';e.timer=3.4}
      }
      for(const c of this.civilians)c.speed=Math.min(500,c.speed+80);
      return;
    }
    const [u,v]=a.range.map(n=>p.x+n*p.dir);
    const hitbox={l:Math.min(u,v),r:Math.max(u,v),t:a.height[0],b:a.height[1]};
    const damage=a.damage*(p.fury>0?2:1);
    for(const b of this.buildings){
      if(b.x+b.width/2<hitbox.l||b.x-b.width/2>hitbox.r)continue;
      // Pilih lantai
      const indices=b.modules.map((_,i)=>i);if(a.key==='bite')indices.reverse();
      const i=indices.find(i=>b.modules[i].hp>0&&overlap(hitbox,box(b.x,b.modules[i].y,b.width,b.modules[i].h)));
      if(i!==undefined)this.damageModule(b,i,damage);
    }
    for(const e of this.enemies){
      if(e.hp<=0||!overlap(hitbox,box(e.x,e.y-e.lift,e.hero?80:e.type==='jeep'?170:e.type==='turret'?60:84,e.hero?112:e.type==='turret'?60:96)))continue;
      if(e.type==='helicopter'&&(a.key!=='bite'||e.y< -395))continue;
      if(e.type==='rajawali'&&e.mode!=='ground'&&e.mode!=='dive')continue;
      if(e.type==='perisai'&&a.key==='bite'&&e.mode!=='recover'&&Math.sign(p.x-e.x)===e.dir){this.say('Perisai memblokir gigitan.',1);continue}
      if(e.type==='jaring'&&this.enemies.some(t=>t.owner===e&&t.hp>0)){this.say('Hancurkan turret Jaring dulu.',1.1);continue}
      const counter=(e.type==='perisai'&&a.key==='tail'&&e.mode==='recover')||(e.type==='jaring'&&a.key==='stomp')||(e.type==='rajawali'&&e.mode==='ground'&&a.key==='bite');
      e.hp-=damage*(counter?2:1);e.hit=.2;
      if(a.key==='tail'&&!e.hero){e.vx=-p.dir*(e.type==='jeep'?920:420);e.stun=.65;if(e.type==='jeep'){e.lift=1;e.vy=370}}
      if(e.hp<=0)this.defeat(e);
    }
    if(a.key==='stomp')this.fx('dust',p.x,0,3);
  }
  // Gempa ulti
  quake(damage){
    const p=this.rex,left=this.camera-60,right=this.camera+this.view+60;
    this.shake=24;this.sound('collapse');this.quakeAt=this.time;
    for(const b of this.buildings){
      if(b.x+b.width/2<left||b.x-b.width/2>right)continue;
      for(let i=b.modules.length-1;i>=0;i--)this.damageModule(b,i,damage);
      this.fx('dust',b.x,0,2);
    }
    for(const e of this.enemies){
      if(e.hp<=0||e.x<left||e.x>right)continue;
      if(e.type==='rajawali'){e.mode='ground';e.timer=3.4}
      e.hp-=e.hero?damage*.8:damage*2;e.hit=.2;e.stun=Math.max(e.stun,e.hero?1.6:2.6);
      if(e.hp<=0)this.defeat(e);
    }
    this.shots.length=0;for(const c of this.civilians)c.speed=Math.min(500,c.speed+120);
    this.fx('dust',p.x,0,4);
  }
  // Musuh tumbang
  defeat(e){
    const p=this.rex,big=e.type==='jeep'||e.type==='helicopter';
    this.score+=e.hero?1200:100;p.rage=Math.min(100,p.rage+(e.hero?20:6));
    if(e.type!=='turret')p.hp=Math.min(p.max,p.hp+(e.hero?HEAL.hero:big?HEAL.vehicle:HEAL.soldier));
    this.fx('explosion',e.x,e.y-45);if(e.hero)this.say(heroNames[e.type]+' tumbang!',2.5);
  }
  // Lukai Rex
  hurt(amount,stun=0){const p=this.rex;if(p.attack?.key==='ulti')return;p.hp=Math.max(0,p.hp-amount);p.hit=.18;if(p.fury<=0)p.stun=Math.max(p.stun,stun)}
  // Tembak
  shoot(e,type){
    const x=e.x, y=e.y-(e.hero?68:e.type==='turret'?34:62), dx=this.rex.x-x,dy=-145-y;
    const dist=Math.hypot(dx,dy)||1;const speed={bullet:760,rocket:380,laser:860,net:470}[type];
    this.shots.push({x,y,type,vx:dx/dist*speed,vy:dy/dist*speed,life:3.2});
    this.sound(type==='bullet'?'shot':'launch');
  }
  // AI pahlawan
  tickHero(e,dt,dist,dir){
    const p=this.rex;e.timer-=dt;
    if(e.type==='perisai'){
      if(e.mode==='approach'){e.dir=dir;if(dist>205)e.x+=dir*240*dt;
        if(e.timer<=0&&dist<730){e.mode='aim';e.timer=.85;e.dir=dir;e.connected=false}}
      else if(e.mode==='aim'&&e.timer<=0){e.mode='charge';e.timer=.62}
      else if(e.mode==='charge'){e.x+=e.dir*840*dt;if(Math.abs(e.x-p.x)<94&&!e.connected){this.hurt(26,.4);e.connected=true}
        if(e.timer<=0){e.mode='recover';e.timer=1.9}}
      else if(e.mode==='recover'&&e.timer<=0){e.mode='approach';e.timer=1.5}
    }else if(e.type==='rajawali'){
      e.dir=dir;
      if(e.mode==='ground'){e.y+=(0-e.y)*ease(10,dt);if(e.timer<=0){e.mode='approach';e.timer=3.6}}
      else if(e.mode==='dive'){e.y+=(-40-e.y)*ease(5,dt);e.x+=dir*360*dt;
        if(dist<105&&!e.connected){this.hurt(24);e.connected=true}
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
    const frame=e.stun>0?'knockback':e.stride<.12?(e.type==='bazooka'?'kneeling-fire':'aim'):
      Math.sin(e.walk+e.phase)>=0?'run-a':'run-b';
    spritePose(e,frame,dt);
  }
  // Perbarui dunia
  update(dt,input){
    if(this.status!=='playing'||dt<=0)return;
    this.time+=dt;const p=this.rex;
    // Pewaktu
    for(const k of ['stun','slow','fury','hit'])p[k]=Math.max(0,p[k]-dt);
    for(const k in p.cd){const before=p.cd[k];p.cd[k]=Math.max(0,before-dt);if(k==='ulti'&&before>0&&!p.cd[k]){this.say('Ulti siap! Tekan R.',2);this.sound('alarm')}}
    if(p.rage>=100&&p.fury<=0){p.fury=8;p.stun=0;p.rage=0;this.say('Rage penuh! Damage 2× selama 8 detik.',2.4);this.sound('roar')}
    const move=Number(input.has('right'))-Number(input.has('left'));
    p.moving=!!move&&p.stun<=0&&(!p.attack||p.attack.key==='bite');
    if(p.moving)p.dir=move;
    // Gerak Rex
    p.vx+=((p.moving?move*(p.slow>0?155:365):0)-p.vx)*ease(p.moving?12:16,dt);
    if(!p.moving&&Math.abs(p.vx)<3)p.vx=0;
    if(p.vx){
      const x=clamp(p.x+p.vx*dt,115,this.level.length-120);if(x===p.x)p.vx=0;p.x=x;
      const pace=Math.abs(p.vx)/365;p.walk+=dt*8*pace;this.stepTime+=dt*pace;
      if(this.stepTime>.44){this.stepTime=0;this.shake=Math.max(this.shake,2);this.sound('step')}
    }
    p.stride+=(clamp(Math.abs(p.vx)/240,0,1)-p.stride)*ease(12,dt);
    // Antre serangan
    for(const key of ['ulti','bite','tail','stomp','roar'])if(input.has(key)){p.queued=key;p.queuedUntil=this.time+.25;break}
    if(p.queued){
      if(this.time>p.queuedUntil)p.queued=null;
      else if(!p.attack&&p.stun<=0){this.startAttack(p.queued);p.queued=null}
    }
    if(p.attack){const a=p.attack;a.age+=dt;if(!a.done&&a.age>=a.impact){a.done=true;this.strike(a)}if(a.age>=a.duration)p.attack=null}
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
        const e=this.spawn(type,p.x+side*flank[type]);e.timer+=delays[type];
      }
      this.say(arrivals.length>1?'Para penjaga mengepung Rex! Pecah formasi mereka satu per satu.':heroNames[arrivals[0]]+' datang! '+hints[arrivals[0]],4);
      this.sound('alarm');
    }
    // Tentara baru
    this.spawnTime-=dt;
    if(this.spawnTime<=0&&this.enemies.reduce((n,e)=>n+(!e.hero&&e.type!=='turret'),0)<8){
      const pool=['infantry'];if(this.percent>=30)pool.push('bazooka');if(this.percent>=50)pool.push('jeep');if(this.percent>=70)pool.push('helicopter');
      const side=(this.enemyCount%3===2?-1:1);const target=p.x+side*(this.view*.49);
      const spawn=this.level.spawns.reduce((a,b)=>Math.abs(b-target)<Math.abs(a-target)?b:a);
      const e=this.spawn(pool[this.enemyCount++%pool.length],spawn);e.dir=e.x>p.x?-1:1;
      this.spawnTime=Math.max(1.9,3.8-this.percent*.017);
    }
    // Musuh
    for(const e of this.enemies){
      if(e.hp<=0)continue;const previousX=e.x;e.shot-=dt;e.hit=Math.max(0,e.hit-dt);
      e.x+=e.vx*dt;e.vx*=Math.pow(.05,dt);
      if(e.lift>0){e.lift=Math.max(0,e.lift+e.vy*dt);e.vy-=850*dt}
      if(e.stun>0){e.stun=Math.max(0,e.stun-dt);this.animateEnemy(e,dt,previousX);continue}
      const dist=Math.abs(p.x-e.x),dir=p.x>=e.x?1:-1;
      if(e.hero)this.tickHero(e,dt,dist,dir);
      else if(e.type==='turret'){if(!e.owner||e.owner.hp<=0){e.hp=0;continue}if(dist<900&&e.shot<=0){this.shoot(e,'bullet');e.shot=1.7}}
      else{
        if(e.type==='jeep'){e.x+=e.dir*445*dt;if(dist<85&&e.shot<=0)this.hurt(12)}
        else{e.dir=dir;e.x+=dir*clamp(dist-(e.type==='bazooka'?510:350),-130,185)*dt}
        if(e.type==='helicopter')e.y=-420+Math.sin(this.time*1.5+e.phase)*135;
        if(dist<940&&e.shot<=0){const rocket=e.type==='bazooka'||e.type==='helicopter';
          this.shoot(e,rocket?'rocket':'bullet');e.shot=rocket?3.8:e.type==='infantry'&&++e.burst%3?.19:2.5}
      }
      if(e.hero)e.x=clamp(e.x,60,this.level.length-60);
      this.animateEnemy(e,dt,previousX);
    }
    keep(this.enemies,e=>e.hp>0&&(e.hero||e.owner||Math.abs(e.x-p.x)<this.view+100));
    // Proyektil
    for(const s of this.shots){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
      if(overlap(box(s.x,s.y,10,10),box(p.x,-12,141,290))){s.life=0;this.hurt({bullet:2,rocket:16,laser:10,net:5}[s.type]);
        if(s.type==='net')p.slow=2.3;if(s.type==='rocket')this.fx('explosion',s.x,s.y)}}
    keep(this.shots,s=>s.life>0);
    // Warga
    for(const c of this.civilians){
      c.x+=c.dir*c.speed*dt;c.walk+=c.speed*dt/28;
      const glance=(this.time+c.phase)%5>4.6,stumble=(this.time+c.phase)%8>7.8;
      spritePose(c,stumble?'stumble':glance?'look-back':Math.sin(c.walk)>=0?'run-a':'run-b',dt);
    }
    keep(this.civilians,c=>c.x>this.camera-170&&c.x<this.camera+this.view+170);
    // Efek
    for(const f of this.effects){f.life-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.kind==='debris'||f.kind==='decor')f.vy+=880*dt}
    keep(this.effects,f=>f.life>0);this.shake=Math.max(0,this.shake-dt*25);
    for(const b of this.buildings)for(const m of b.modules)m.fall=Math.max(0,m.fall-dt);
    // Menang kalah
    if(p.hp<=0)this.status='lost';
    else if(this.percent+.0001>=this.level.target&&this.triggered.size===this.level.bosses.length&&!this.enemies.some(e=>e.hero))this.status='won';
  }
}
