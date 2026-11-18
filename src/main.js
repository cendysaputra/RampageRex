import {World,heroNames,cooldowns} from './world.js';
import {Art,Renderer} from './art.js';
import {Sound} from './audio.js';
const nodes={},el=id=>nodes[id]??=document.getElementById(id);
// Peta tombol
const keys={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',KeyW:'bite',KeyQ:'tail',KeyS:'stomp',KeyE:'roar',KeyR:'ulti',
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
function soundLabel(){const btn=document.querySelector('.audio');btn.textContent=snd.enabled?'Suara aktif':'Suara mati';btn.setAttribute('aria-pressed',String(snd.enabled))}
// Ganti suara
function toggleSound(){snd.enabled=!snd.enabled;save('rex.sound',snd.enabled?'on':'off');soundLabel();if(snd.enabled){snd.unlock();snd.play('step')}}
// Label rekor
function recordLabel(){el('record').textContent='REKOR  '+String(record).padStart(6,'0')}
soundLabel();recordLabel();
// Ambil JSON
async function json(path){const r=await fetch(path);if(!r.ok)throw Error(path);return r.json()}
// Reset input
function clearInput(){controls.clear();taps.clear();prior=0}
// Buka dialog
function modal(label,title,html,buttons){
  clearInput();el('panel-label').textContent=label;el('panel-title').textContent=title;el('panel-copy').innerHTML=html;
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
function help(){screen='help';modal('KONTROL','Cara main',
  '<dl><dt>A / D atau ← →</dt><dd>Jalan kiri dan kanan</dd><dt>W atau klik kiri</dt><dd>Gigit di depan Rex</dd><dt>Q atau klik kanan</dt><dd>Sabet dengan ekor di belakang</dd><dt>S</dt><dd>Injak tanah di sekitar kaki</dd><dt>E</dt><dd>Raung · membuat tentara di layar terpaku</dd><dt>R</dt><dd>Ulti Amukan Rex · mengguncang semua yang ada di layar</dd><dt>Esc / P</dt><dd>Jeda</dd></dl><p>Runtuhkan lantai dasar untuk menjatuhkan seluruh bangunan. Penuhi target destruksi dan kalahkan pahlawan distrik. Setiap serangan punya jeda (cooldown) sebelum bisa dipakai lagi; Ulti jedanya paling lama. Saat Rage penuh, serangan Rex dua kali lebih kuat selama 8 detik.</p>',
  [['Kembali',menu]]);
}
// Mulai level
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
// Lanjut main
function resume(){close();clearInput();screen='playing';el('pause').focus({preventScroll:true})}
// Jeda
function pause(){if(screen!=='playing')return;screen='paused';modal('DISTRIK 0'+(levelIndex+1),'Jeda',
  '<p>'+world.level.name+' · '+Math.floor(world.percent)+'% hancur</p>',
  [['Lanjut main',resume],[snd.enabled?'Matikan suara':'Aktifkan suara',()=>{toggleSound();screen='playing';pause()}],['Menu utama',menu]])}
// Hasil level
function finish(){
  screen='result';const win=world.status==='won',score=previousScore+world.score;
  if(score>record){record=score;save('rex.best',record);recordLabel()}
  const more=win&&levelIndex<3;
  modal(world.level.name.toUpperCase(),win?(more?'Distrik runtuh!':'Kota ditaklukkan!'):'Rex tumbang',
    '<p>Destruksi '+Math.floor(world.percent)+'% · Skor '+score.toLocaleString('id-ID')+'</p>',
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
  const p=world.rex;text('hp-text',Math.ceil(p.hp)+' / 1000');fill('hp',p.hp/1000);
  fill('rage',p.fury>0?p.fury/8:p.rage/100);text('rage-text',p.fury>0?Math.ceil(p.fury)+' dtk':Math.floor(p.rage));
  text('district','0'+(levelIndex+1)+' / '+world.level.name.toUpperCase());
  text('destruction',Math.floor(world.percent)+'% / '+world.level.target+'%');
  let next='',names='';
  for(const e of world.enemies)if(e.hero){next+=e.type+Math.ceil(e.hp)+'|';names+=(names?', ':'')+heroNames[e.type]}
  text('objective',names?'Kalahkan '+names:world.triggered.size?'Penuhi target destruksi':'Hancurkan bangunan');
  if(next!==bossKey){bossKey=next;el('bosses').replaceChildren(...world.enemies.filter(e=>e.hero).map(e=>{
    const card=document.createElement('div');card.innerHTML='<strong>'+heroNames[e.type]+'</strong><div class="meter"><i style="width:'+Math.ceil(100*e.hp/e.max)+'%"></i></div>';return card;
  }))}
  text('notice',world.time<world.messageUntil?world.message:'');
  // Indikator cooldown
  for(const node of skillNodes){
    const key=node.dataset.skill,left=p.cd[key],value=(Math.ceil(left/cooldowns[key]*50)/50).toFixed(2);
    if(shown.get(node)!==value){shown.set(node,value);node.style.setProperty('--cd',value);node.toggleAttribute('data-cooling',left>0)}
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
document.addEventListener('keyup',e=>controls.delete(e.code));
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
el('start').onclick=()=>start();el('help').onclick=help;el('pause').onclick=pause;document.querySelector('.audio').onclick=toggleSound;
requestAnimationFrame(frame);
