import {World,heroNames,cooldowns} from './world.js';
import {Art,Renderer} from './art.js';
import {Sound} from './audio.js';
import {playOpening} from './opening.js';
import {playCredit} from './credit.js';
const nodes={},el=id=>nodes[id]??=document.getElementById(id);
// Peta tombol
const keys={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',KeyW:'bite',KeyQ:'tail',KeyS:'stomp',KeyE:'roar',KeyR:'ulti',Space:'jump',
  KeyJ:'bite',KeyK:'tail',KeyL:'roar'};
const mouseButtons=['bite',null,'tail'];
const controls=new Map(),taps=new Set(),input=new Set(),shown=new Map(),snd=new Sound(),panel=el('panel');
let world=null,art=null,renderer=null,screen='menu',prior=0,previousScore=0,levelIndex=0,boot;
// Baca simpanan
function getSaved(key,def){try{return localStorage.getItem(key)??def}catch{return def}}
// Simpan data
function save(key,value){try{localStorage.setItem(key,value)}catch{}}
let record=Number(getSaved('rex.best',0))||0;snd.enabled=getSaved('rex.sound','on')==='on';
// Label suara
function soundLabel(){const btn=document.querySelector('.audio');btn.querySelector('span').textContent=snd.enabled?'Suara nyala':'Suara mati';btn.setAttribute('aria-pressed',String(snd.enabled))}
// Ganti suara
function toggleSound(){snd.enabled=!snd.enabled;save('rex.sound',snd.enabled?'on':'off');soundLabel();if(snd.enabled){snd.unlock();snd.play('step')}}
// Label rekor
function recordLabel(){el('record').textContent=record?'Rekor '+record.toLocaleString('id-ID'):'Belum ada rekor'}
soundLabel();recordLabel();
// Ambil JSON
async function json(path){const r=await fetch(path);if(!r.ok)throw Error(path);return r.json()}
// Reset input
function clearInput(){controls.clear();taps.clear();prior=0}
// Buka dialog
function modal(title,html,buttons){
  clearInput();el('panel-title').textContent=title;el('panel-copy').innerHTML=html;
  const row=el('panel-actions');row.replaceChildren();
  for(const [i,[text,fn]] of buttons.entries()){
    const b=document.createElement('button');b.className=i?'secondary':'primary';b.textContent=text;b.onclick=fn;row.append(b);
  }
  if(!panel.open)panel.showModal();row.firstElementChild.focus();
}
// Tutup dialog
function close(){if(panel.open)panel.close()}
// Menu utama
function menu(){
  close();clearInput();screen='menu';world=null;el('hud').hidden=true;el('menu').hidden=false;el('start').focus();
}
// Cara main
function help(){screen='help';modal('Cara main',
  '<dl><dt>A / D atau ← →</dt><dd>Jalan kiri dan kanan</dd><dt>W atau klik kiri</dt><dd>Gigit di depan Rex</dd><dt>Q atau klik kanan</dt><dd>Sabet dengan ekor di belakang</dd><dt>S</dt><dd>Injak tanah di sekitar kaki</dd><dt>E</dt><dd>Raung, membuat tentara di layar terpaku</dd><dt>Spasi</dt><dd>Lompat gertakan: saat mendarat, semua di layar terpaku lebih lama dari raungan</dd><dt>R</dt><dd>Ulti Amukan Rex, mengguncang semua yang ada di layar</dd><dt>Esc / P</dt><dd>Jeda</dd></dl><p>Runtuhkan lantai dasar untuk menjatuhkan seluruh bangunan. Ratakan 100% bangunan dan kalahkan pahlawan distrik. Warga juga bisa dikalahkan. Setiap serangan punya cooldown sebelum bisa dipakai lagi, dan cooldown Ulti paling lama. Mengalahkan musuh memulihkan sedikit darah Rex. Saat Rage penuh, serangan Rex dua kali lebih kuat selama 8 detik.</p><p>Tiga penjaga selalu datang bersama. Saat panel ulti mereka muncul, raung untuk menggagalkannya.</p>',
  [['Kembali',menu]]);
}
// Kartu distrik
function stageCard(index,manifest,level){
  const card=el('stage');card.hidden=false;card.classList.remove('leaving');
  text('stage-number','Distrik '+(index+1));text('stage-name',level?.name??'');
  text('stage-goal',level?'Target destruksi '+level.target+'%':'');
  if(manifest&&level){
    const layer=name=>{const own='backgrounds/'+level.setting+'/'+name;return './assets/'+(manifest.assets[own+'.png']?own:'backgrounds/'+name)+'.webp'};
    card.style.setProperty('--far','url('+layer('far-city')+')');card.style.setProperty('--sky','url('+layer('sky')+')');
  }
}
// Tutup kartu
function stageOut(){const card=el('stage');card.classList.add('leaving');setTimeout(()=>{if(card.classList.contains('leaving'))card.hidden=true},320)}
// Mulai level
async function start(index=0,carried=0,result=''){
  if(screen==='loading')return;
  close();clearInput();screen='loading';el('menu').hidden=true;el('hud').hidden=true;
  el('start').disabled=el('help').disabled=true;el('load-status').textContent='';text('stage-status','Memuat distrik…');snd.unlock();
  const shownAt=performance.now();text('stage-result',result);stageCard(index);
  try{
    boot??=Promise.all([json('./assets/manifest.json'),Promise.all([1,2,3,4].map(n=>json('./data/levels/level-0'+n+'.json')))]);
    const [manifest,levels]=await boot;stageCard(index,manifest,levels[index]);art??=new Art(manifest);await art.preload(levels[index]);
    renderer??=new Renderer(el('world'),art);levelIndex=index;previousScore=carried;world=new World(levels[index],index);
    renderer.render(world);updateHud();text('stage-status','Siap mengamuk!');
    await new Promise(r=>setTimeout(r,Math.max(0,(result?2600:1400)-(performance.now()-shownAt))));
    stageOut();el('hud').hidden=false;screen='playing';el('pause').focus({preventScroll:true});clearInput();
  }catch(err){
    boot=null;art=null;renderer=null;el('stage').hidden=true;el('menu').hidden=false;screen='menu';el('load-status').textContent='Aset gagal dimuat. Tekan Mulai main untuk mencoba lagi.';console.error(err);
  }finally{el('start').disabled=el('help').disabled=false}
}
// Lanjut main
function resume(){close();clearInput();screen='playing';el('pause').focus({preventScroll:true})}
// Jeda
function pause(){if(screen!=='playing')return;screen='paused';modal('Jeda',
  '<p>Distrik '+(levelIndex+1)+', '+world.level.name+' · '+Math.floor(world.percent)+'% hancur</p>',
  [['Lanjut main',resume],[snd.enabled?'Matikan suara':'Aktifkan suara',()=>{toggleSound();screen='playing';pause()}],['Menu utama',menu]])}
// Hasil level
function finish(){
  screen='result';const win=world.status==='won',score=previousScore+world.score;
  if(score>record){record=score;save('rex.best',record);recordLabel()}
  const more=win&&levelIndex<3;
  // Lanjut distrik
  if(more){el('hud').hidden=true;start(levelIndex+1,score,world.level.name+' rata · Skor '+score.toLocaleString('id-ID'));return}
  modal(win?(more?'Distrik runtuh!':'Kota ditaklukkan!'):'Rex tumbang',
    '<p>'+world.level.name+' · destruksi '+Math.floor(world.percent)+'% · Skor '+score.toLocaleString('id-ID')+'</p>',
    [[more?'Lanjut ke distrik '+(levelIndex+2):win?'Main dari awal':'Coba lagi',()=>more?start(levelIndex+1,score):win?start():start(levelIndex,previousScore)],['Menu utama',menu]]);
}
let bossKey='';
const skillNodes=document.querySelectorAll('[data-skill]');
// Perbarui teks
function text(id,value){value=String(value);if(shown.get(id)!==value){shown.set(id,value);el(id).textContent=value}}
// Perbarui meter
function fill(id,ratio){const value='scaleX('+ratio.toFixed(3)+')';if(shown.get(id)!==value){shown.set(id,value);el(id).style.transform=value}}
// Perbarui HUD
function updateHud(){
  const p=world.rex;text('hp-text',Math.ceil(p.hp)+' / '+p.max);fill('hp',p.hp/p.max);
  fill('rage',p.fury>0?p.fury/8:p.rage/100);text('rage-text',p.fury>0?Math.ceil(p.fury)+' dtk':Math.floor(p.rage));
  text('district','Distrik '+(levelIndex+1)+' · '+world.level.name);
  text('destruction',Math.floor(world.percent+.0001)+'% / '+world.level.target+'%');
  fill('destroyed',Math.min(1,world.percent/100));
  const goal=world.level.target+'%';if(shown.get('goal')!==goal){shown.set('goal',goal);el('goal').style.left=goal}
  const fury=p.fury>0;if(shown.get('fury')!==fury){shown.set('fury',fury);el('hp').closest('.player-card').toggleAttribute('data-fury',fury)}
  let next='',names='';
  for(const e of world.enemies)if(e.hero){next+=e.type+Math.ceil(e.hp)+'|';names+=(names?', ':'')+heroNames[e.type]}
  text('objective',world.phase!=='fight'?'Jalan ke ujung distrik →':names?'Kalahkan '+names:world.triggered.size?'Penuhi target destruksi':'Hancurkan bangunan');
  if(next!==bossKey){bossKey=next;el('bosses').replaceChildren(...world.enemies.filter(e=>e.hero).map(e=>{
    const card=document.createElement('div');card.innerHTML='<img src="./assets/characters/heroes/'+e.type+'/portrait.webp" alt="" width="40" height="40"><strong>'+heroNames[e.type]+'</strong><div class="meter segmented"><i style="width:'+Math.ceil(100*e.hp/e.max)+'%"></i></div>';return card;
  }))}
  text('notice',world.time<world.messageUntil?world.message:'');
  // Indikator cooldown
  for(const node of skillNodes){
    const key=node.dataset.skill,left=p.cd[key],value=(Math.ceil(left/cooldowns[key]*50)/50).toFixed(2);
    if(shown.get(node)!==value){shown.set(node,value);node.style.setProperty('--cd',value);node.toggleAttribute('data-cooling',left>0)}
    const seconds=left>0?String(Math.ceil(left)):'';if(node.dataset.left!==seconds)node.dataset.left=seconds;
  }
}
// Loop utama
function frame(now){
  if(screen==='playing'){
    // Langkah simulasi
    const elapsed=prior?Math.min(.1,(now-prior)/1000):0;prior=now;
    const steps=Math.max(1,Math.ceil(elapsed*60-.01));
    for(let i=0;i<steps&&elapsed>0&&world.status==='playing';i++){
      input.clear();for(const action of controls.values())input.add(action);for(const action of taps)input.add(action);
      world.update(elapsed/steps,input);taps.clear();
    }
    for(const name of world.events.splice(0))snd.play(name);
    renderer.render(world);updateHud();if(world.status!=='playing')finish();
  }
  requestAnimationFrame(frame);
}
// Catat input
function press(id,action){controls.set(id,action);if(action!=='left'&&action!=='right')taps.add(action)}
// Input keyboard
document.addEventListener('keydown',e=>{
  if((e.code==='Escape'||e.code==='KeyP')&&['playing','paused'].includes(screen)){
    e.preventDefault();if(!e.repeat)(screen==='paused'?resume:pause)();return}
  if(screen==='playing'&&keys[e.code]){e.preventDefault();if(!e.repeat)press(e.code,keys[e.code])}
});
document.addEventListener('keyup',e=>{if(screen==='playing'&&e.code==='Space')e.preventDefault();controls.delete(e.code)});
// Input mouse
const game=el('game');
game.addEventListener('pointerdown',e=>{
  const action=mouseButtons[e.button];
  if(e.pointerType!=='mouse'||screen!=='playing'||!action||e.target.closest('button'))return;
  e.preventDefault();press('mouse'+e.button,action);
});
for(const type of ['pointerup','pointercancel'])addEventListener(type,e=>{if(e.pointerType==='mouse')controls.delete('mouse'+e.button)});
game.addEventListener('contextmenu',e=>{if(screen==='playing')e.preventDefault()});
// Input sentuh
document.querySelectorAll('[data-action]').forEach(b=>{
  b.addEventListener('pointerdown',e=>{if(screen!=='playing')return;e.preventDefault();b.setPointerCapture(e.pointerId);press(e.pointerId,b.dataset.action)});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,e=>controls.delete(e.pointerId));
});
// Batal dialog
panel.addEventListener('cancel',e=>{e.preventDefault();if(screen==='paused')resume();else if(screen==='help')menu()});
// Jeda otomatis
window.addEventListener('blur',()=>{clearInput();pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();pause()}});
// Tombol menu
el('start').onclick=async()=>{
  if(screen!=='menu')return;
  screen='opening';snd.unlock();el('menu').hidden=true;
  await playCredit(el('credit'));
  await playOpening(el('opening'),snd);
  await start();
};
el('help').onclick=help;el('pause').onclick=pause;document.querySelector('.audio').onclick=toggleSound;
requestAnimationFrame(frame);
