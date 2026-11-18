import {World,heroNames} from './world.js';
import {Art,Renderer} from './art.js';
import {Sound} from './audio.js';
const el=id=>document.getElementById(id);
const keys={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',KeyJ:'bite',KeyK:'tail',KeyS:'stomp',KeyL:'roar'};
const controls=new Map(),taps=new Set(),snd=new Sound(),panel=el('panel');
let world=null,art=null,renderer=null,screen='menu',prior=0,acc=0,previousScore=0,levelIndex=0,boot;
function getSaved(key,def){try{return localStorage.getItem(key)??def}catch{return def}}
function save(key,value){try{localStorage.setItem(key,value)}catch{}}
let record=Number(getSaved('rex.best',0))||0;snd.enabled=getSaved('rex.sound','on')==='on';
function soundLabel(){const btn=document.querySelector('.audio');btn.textContent=snd.enabled?'Suara aktif':'Suara mati';btn.setAttribute('aria-pressed',String(snd.enabled))}
function toggleSound(){snd.enabled=!snd.enabled;save('rex.sound',snd.enabled?'on':'off');soundLabel();if(snd.enabled){snd.unlock();snd.play('step')}}
function recordLabel(){el('record').textContent='REKOR  '+String(record).padStart(6,'0')}
soundLabel();recordLabel();
async function json(path){const r=await fetch(path);if(!r.ok)throw Error(path);return r.json()}
function clearInput(){controls.clear();taps.clear();acc=0;prior=0}
function modal(label,title,html,buttons){
  clearInput();el('panel-label').textContent=label;el('panel-title').textContent=title;el('panel-copy').innerHTML=html;
  const row=el('panel-actions');row.replaceChildren();
  for(const [i,[text,fn]] of buttons.entries()){
    const b=document.createElement('button');b.className=i?'secondary':'primary';b.textContent=text;b.onclick=fn;row.append(b);
  }
  if(!panel.open)panel.showModal();row.firstElementChild.focus();
}
function close(){if(panel.open)panel.close()}
function menu(){
  close();clearInput();screen='menu';world=null;el('hud').hidden=true;el('menu').hidden=false;el('start').focus();
}
function help(){screen='help';modal('KONTROL','Cara main',
  '<dl><dt>A / D atau ← →</dt><dd>Jalan kiri dan kanan</dd><dt>J</dt><dd>Gigit di depan Rex</dd><dt>K</dt><dd>Sabet dengan ekor di belakang</dd><dt>S</dt><dd>Injak tanah di sekitar kaki</dd><dt>L</dt><dd>Raung · perlu 25 Rage</dd><dt>Esc / P</dt><dd>Jeda</dd></dl><p>Runtuhkan lantai dasar untuk menjatuhkan seluruh bangunan. Penuhi target destruksi dan kalahkan pahlawan distrik. Saat Rage penuh, serangan Rex dua kali lebih kuat selama 8 detik.</p>',
  [['Kembali',menu]]);
}
async function start(index=0,carried=0){
  if(screen==='loading')return;
  close();clearInput();screen='loading';el('menu').hidden=false;el('hud').hidden=true;
  el('start').disabled=el('help').disabled=true;el('load-status').textContent='Memuat distrik…';snd.unlock();
  try{
    boot??=Promise.all([json('./assets/manifest.json'),Promise.all([1,2,3,4].map(n=>json('./data/levels/level-0'+n+'.json')))]);
    const [manifest,levels]=await boot;art??=new Art(manifest);await art.preload(levels[index]);
    renderer??=new Renderer(el('world'),art);levelIndex=index;previousScore=carried;world=new World(levels[index],index);
    renderer.render(world);updateHud();el('menu').hidden=true;el('hud').hidden=false;el('load-status').textContent='';screen='playing';el('pause').focus({preventScroll:true});clearInput();
  }catch(err){
    boot=null;art=null;renderer=null;screen='menu';el('load-status').textContent='Aset gagal dimuat. Tekan Mulai main untuk mencoba lagi.';console.error(err);
  }finally{el('start').disabled=el('help').disabled=false}
}
function resume(){close();clearInput();screen='playing';el('pause').focus({preventScroll:true})}
function pause(){if(screen!=='playing')return;screen='paused';modal('DISTRIK 0'+(levelIndex+1),'Jeda',
  '<p>'+world.level.name+' · '+Math.floor(world.percent)+'% hancur</p>',
  [['Lanjut main',resume],[snd.enabled?'Matikan suara':'Aktifkan suara',()=>{toggleSound();screen='playing';pause()}],['Menu utama',menu]])}
function finish(){
  screen='result';const win=world.status==='won',score=previousScore+world.score;
  if(score>record){record=score;save('rex.best',record);recordLabel()}
  const more=win&&levelIndex<3;
  modal(world.level.name.toUpperCase(),win?(more?'Distrik runtuh!':'Kota ditaklukkan!'):'Rex tumbang',
    '<p>Destruksi '+Math.floor(world.percent)+'% · Skor '+score.toLocaleString('id-ID')+'</p>',
    [[more?'Lanjut ke distrik '+(levelIndex+2):win?'Main dari awal':'Coba lagi',()=>more?start(levelIndex+1,score):win?start():start(levelIndex,previousScore)],['Menu utama',menu]]);
}
let bossKey='';
function updateHud(){
  const p=world.rex;el('hp-text').textContent=Math.ceil(p.hp)+' / 1000';el('hp').style.transform='scaleX('+p.hp/1000+')';
  el('rage').style.transform='scaleX('+(p.fury>0?p.fury/8:p.rage/100)+')';el('rage-text').textContent=p.fury>0?Math.ceil(p.fury)+' dtk':Math.floor(p.rage);
  el('district').textContent='0'+(levelIndex+1)+' / '+world.level.name.toUpperCase();
  el('destruction').textContent=Math.floor(world.percent)+'% / '+world.level.target+'%';
  const heroes=world.enemies.filter(e=>e.hero);
  el('objective').textContent=heroes.length?'Kalahkan '+heroes.map(e=>heroNames[e.type]).join(', '):world.triggered.size?'Penuhi target destruksi':'Hancurkan bangunan';
  const next=heroes.map(e=>e.type+Math.ceil(e.hp)).join('|');
  if(next!==bossKey){bossKey=next;el('bosses').replaceChildren(...heroes.map(e=>{
    const card=document.createElement('div');card.innerHTML='<strong>'+heroNames[e.type]+'</strong><div class="meter"><i style="width:'+Math.ceil(100*e.hp/e.max)+'%"></i></div>';return card;
  }))}
  el('notice').textContent=world.time<world.messageUntil?world.message:'';
}
const step=1/60;
function frame(now){
  if(screen==='playing'){
    if(prior)acc+=Math.min(.12,(now-prior)/1000);prior=now;
    while(acc>=step&&world.status==='playing'){
      world.update(step,new Set([...controls.values(),...taps]));taps.clear();acc-=step;
    }
    for(const name of world.events.splice(0))snd.play(name);
    renderer.render(world);updateHud();if(world.status!=='playing')finish();
  }
  requestAnimationFrame(frame);
}
function press(id,action){controls.set(id,action);if(action!=='left'&&action!=='right')taps.add(action)}
document.addEventListener('keydown',e=>{
  if((e.code==='Escape'||e.code==='KeyP')&&['playing','paused'].includes(screen)){
    e.preventDefault();if(!e.repeat)(screen==='paused'?resume:pause)();return}
  if(screen==='playing'&&keys[e.code]){e.preventDefault();if(!e.repeat)press(e.code,keys[e.code])}
});
document.addEventListener('keyup',e=>controls.delete(e.code));
document.querySelectorAll('[data-action]').forEach(b=>{
  b.addEventListener('pointerdown',e=>{if(screen!=='playing')return;e.preventDefault();b.setPointerCapture(e.pointerId);press(e.pointerId,b.dataset.action)});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,e=>controls.delete(e.pointerId));
});
panel.addEventListener('cancel',e=>{e.preventDefault();if(screen==='paused')resume();else if(screen==='help')menu()});
window.addEventListener('blur',()=>{clearInput();pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();pause()}});
el('start').onclick=()=>start();el('help').onclick=help;el('pause').onclick=pause;document.querySelector('.audio').onclick=toggleSound;
requestAnimationFrame(frame);
