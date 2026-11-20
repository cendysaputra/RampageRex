import {World,heroNames,cooldowns,difficulties} from './world.js';
import {Art,Renderer} from './art.js';
import {Sound} from './audio.js';
import {playOpening} from './opening.js';
import {playCredit} from './credit.js';
import {loadProgress,saveProgress,recordDistrict,resetProgress,totalStars} from './progress.js';
import {loadSettings,saveSettings,buzz,padSizes,skins} from './settings.js';
import {Tutorial} from './tutorial.js';
import {missions,earned,starText} from './missions.js';
import {makeEndless} from './endless.js';
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
let progress=loadProgress(),settings=loadSettings(),guide=null,guideUntil=0;
// Skin aktif
function activeSkin(){const s=skins[settings.skin];return s&&totalStars(progress)>=s.stars?s.folder:''}
// Terapkan pengaturan
function applySettings(){snd.volume=settings.sfx/100;document.documentElement.dataset.pad=settings.pad}
applySettings();
// Tombol distrik
function districtLabel(){el('districts').hidden=progress.unlocked<2}
soundLabel();recordLabel();districtLabel();
// Ambil JSON
async function json(path){const r=await fetch(path);if(!r.ok)throw Error(path);return r.json()}
// Data level
function levelData(){boot??=Promise.all([json('./assets/manifest.json'),Promise.all([1,2,3,4].map(n=>json('./data/levels/level-0'+n+'.json')))]).then(([manifest,levels])=>[manifest,[...levels,makeEndless(levels)]]);return boot}
// Indeks tanpa akhir
const ENDLESS=4;
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
  close();clearInput();screen='menu';world=null;guide=null;showGuide();el('hud').hidden=true;el('menu').hidden=false;el('start').focus();
}
// Cara main
function help(){screen='help';modal('Cara main',
  '<dl><dt>A / D atau ← →</dt><dd>Jalan kiri dan kanan</dd><dt>W atau klik kiri</dt><dd>Gigit di depan Rex</dd><dt>Q atau klik kanan</dt><dd>Sabet dengan ekor di belakang</dd><dt>S</dt><dd>Injak tanah di sekitar kaki</dd><dt>E</dt><dd>Raung, membuat tentara di layar terpaku</dd><dt>Spasi</dt><dd>Lompat gertakan: saat mendarat, semua di layar terpaku lebih lama dari raungan</dd><dt>R</dt><dd>Ulti Amukan Rex, mengguncang semua yang ada di layar</dd><dt>Esc / P</dt><dd>Jeda</dd></dl><p>Runtuhkan lantai dasar untuk menjatuhkan seluruh bangunan. Ratakan 100% bangunan dan kalahkan pahlawan distrik. Warga juga bisa dikalahkan. Setiap serangan punya cooldown sebelum bisa dipakai lagi, dan cooldown Ulti paling lama. Mengalahkan musuh memulihkan sedikit darah Rex. Saat Rage penuh, serangan Rex dua kali lebih kuat selama 8 detik.</p><p>Tiga penjaga selalu datang bersama. Saat panel ulti mereka muncul, raung untuk menggagalkannya.</p>',
  [['Kembali',menu]]);
}
// Pilih distrik
async function chooseDistrict(){
  if(screen!=='menu')return;screen='select';
  let levels;try{[,levels]=await levelData()}catch{boot=null;menu();el('load-status').textContent='Data distrik gagal dimuat.';return}
  modal('Pilih distrik','<div class="districts"></div>',[['Kembali',menu]]);
  const list=el('panel-copy').querySelector('.districts');
  for(const [i,level] of levels.entries()){
    const endless=i===ENDLESS,open=endless?progress.cleared[0]:i<progress.unlocked,b=document.createElement('button'),name=document.createElement('b'),note=document.createElement('small');
    b.type='button';b.className='district';b.disabled=!open;
    name.textContent=(endless?'∞':i+1)+' · '+level.name;
    note.textContent=endless?(open?(progress.endless?'Rekor '+progress.endless.toLocaleString('id-ID'):'Bertahan selama mungkin'):'Terbuka setelah Jalan Ruko selesai')
      :!open?'Terkunci':starText(progress.stars[i])+(progress.cleared[i]?' · skor terbaik '+progress.best[i].toLocaleString('id-ID'):' · belum selesai');
    b.append(name,note);b.onclick=()=>start(i);list.append(b);
  }
  list.querySelector('button:not(:disabled)')?.focus();
}
// Tampilkan tutorial
function showGuide(){
  const box=el('tutorial');
  if(!guide){box.hidden=true;return}
  if(guide.finished){
    if(!guideUntil){guideUntil=performance.now()+3500;save('rex.tutorial','done')}
    if(performance.now()>guideUntil){guide=null;box.hidden=true;return}
  }
  box.hidden=false;text('tutorial-step',guide.label());text('tutorial-text',guide.text(matchMedia('(pointer:coarse)').matches));
}
// Lewati tutorial
function skipGuide(){save('rex.tutorial','done');guide=null;showGuide();el('pause').focus({preventScroll:true})}
// Menu pengaturan
function openSettings(paused=false){
  screen=paused?'settings-paused':'settings';
  const back=()=>{if(paused){screen='playing';pause()}else menu()};
  modal('Pengaturan','<form class="settings" onsubmit="return false"></form>',[['Kembali',back]]);
  const form=el('panel-copy').querySelector('.settings');
  // Pilihan tombol
  const group=(label,options,value,onPick,note='')=>{
    const box=document.createElement('fieldset'),title=document.createElement('legend'),row=document.createElement('div');
    title.textContent=label;row.className='choices';box.append(title,row);
    for(const [key,text] of Object.entries(options)){
      const b=document.createElement('button');b.type='button';b.textContent=text;b.setAttribute('aria-pressed',String(key===value));
      b.onclick=()=>{onPick(key);for(const x of row.children)x.setAttribute('aria-pressed',String(x===b))};row.append(b);
    }
    if(note){const small=document.createElement('small');small.textContent=note;box.append(small)}
    form.append(box);
  };
  group('Tingkat kesulitan',Object.fromEntries(Object.entries(difficulties).map(([k,d])=>[k,d.label])),settings.difficulty,
    key=>{settings.difficulty=key;saveSettings(settings)},paused?'Berlaku mulai distrik berikutnya.':'Santai: musuh lebih sedikit dan tidak terlalu sakit.');
  // Skin Rex
  const stars=totalStars(progress);
  group('Skin Rex',Object.fromEntries(Object.entries(skins).map(([k,s])=>[k,stars>=s.stars?s.label:s.label+' · '+s.stars+'★'])),settings.skin,
    key=>{settings.skin=key;saveSettings(settings)},'Bintang terkumpul: '+stars+' dari 12.'+(paused?' Berlaku mulai distrik berikutnya.':''));
  for(const [i,s] of Object.values(skins).entries())form.lastChild.querySelector('.choices').children[i].disabled=stars<s.stars;
  // Volume efek
  const sound=document.createElement('label'),range=document.createElement('input'),value=document.createElement('output');
  sound.className='slider';sound.textContent='Efek suara';range.type='range';range.min=0;range.max=100;range.step=5;range.value=settings.sfx;value.textContent=settings.sfx+'%';
  range.oninput=()=>{settings.sfx=+range.value;value.textContent=range.value+'%';applySettings();saveSettings(settings)};
  range.onchange=()=>{snd.unlock();snd.play('bite')};
  sound.append(range,value);form.append(sound);
  const touch=matchMedia('(pointer:coarse)').matches;
  if(touch&&'vibrate' in navigator)group('Getaran',{on:'Nyala',off:'Mati'},settings.vibrate?'on':'off',key=>{settings.vibrate=key==='on';saveSettings(settings);if(settings.vibrate)buzz(settings,'stomp')});
  if(touch||matchMedia('(max-width:720px)').matches)group('Ukuran tombol sentuh',padSizes,settings.pad,key=>{settings.pad=key;applySettings();saveSettings(settings)});
  // Ulangi tutorial
  if(!paused){
    const replay=document.createElement('button');replay.type='button';replay.className='plain';
    replay.textContent=getSaved('rex.tutorial','')==='done'?'Ulangi tutorial di distrik 1':'Tutorial aktif di distrik 1';replay.disabled=replay.textContent.startsWith('Tutorial aktif');
    replay.onclick=()=>{save('rex.tutorial','');replay.textContent='Tutorial aktif di distrik 1';replay.disabled=true};form.append(replay);
  }
  // Hapus progres
  if(!paused){
    const wipe=document.createElement('button');wipe.type='button';wipe.className='danger';wipe.textContent='Hapus progres';
    wipe.onclick=()=>{
      if(!wipe.dataset.armed){wipe.dataset.armed='1';wipe.textContent='Yakin? Tekan lagi untuk menghapus';return}
      progress=resetProgress();record=0;save('rex.best',0);recordLabel();districtLabel();wipe.textContent='Progres dihapus';wipe.disabled=true;
    };
    form.append(wipe);
  }
}
// Kartu distrik
function stageCard(index,manifest,level){
  const card=el('stage');card.hidden=false;card.classList.remove('leaving');
  const endless=index===ENDLESS;
  text('stage-number',endless?'Mode':'Distrik '+(index+1));text('stage-name',level?.name??(endless?'Tanpa Akhir':''));
  text('stage-goal',!level?'':endless?'Bertahan dan hancurkan sebanyak mungkin':'Target destruksi '+level.target+'%');
  text('stage-missions',level&&!endless?missions[index].map((m,i)=>(progress.stars[index][i]?'★ ':'☆ ')+m.text).join('  ·  '):'');
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
  el('start').disabled=el('help').disabled=el('districts').disabled=el('settings').disabled=true;el('load-status').textContent='';text('stage-status','Memuat distrik…');snd.unlock();
  const shownAt=performance.now();text('stage-result',result);stageCard(index);
  try{
    const [manifest,levels]=await levelData();stageCard(index,manifest,levels[index]);art??=new Art(manifest);art.useSkin(activeSkin());await art.preload(levels[index]);
    renderer??=new Renderer(el('world'),art);levelIndex=index;previousScore=carried;world=new World(levels[index],Math.min(index,3),{difficulty:settings.difficulty});
    guide=index===0&&getSaved('rex.tutorial','')!=='done'?new Tutorial(world):null;guideUntil=0;showGuide();
    renderer.render(world);updateHud();text('stage-status','Siap mengamuk!');
    await new Promise(r=>setTimeout(r,Math.max(0,(result?2600:1400)-(performance.now()-shownAt))));
    stageOut();el('hud').hidden=false;screen='playing';el('pause').focus({preventScroll:true});clearInput();
    // Tab tersembunyi
    if(document.hidden)pause();
  }catch(err){
    boot=null;art=null;renderer=null;el('stage').hidden=true;el('menu').hidden=false;screen='menu';el('load-status').textContent='Aset gagal dimuat. Tekan Mulai main untuk mencoba lagi.';console.error(err);
  }finally{el('start').disabled=el('help').disabled=el('districts').disabled=el('settings').disabled=false}
}
// Lanjut main
function resume(){close();clearInput();screen='playing';el('pause').focus({preventScroll:true})}
// Jeda
function pause(){if(screen!=='playing')return;screen='paused';modal('Jeda',
  (levelIndex===ENDLESS?'<p>Mode Tanpa Akhir · skor '+world.score.toLocaleString('id-ID')+' · rekor '+progress.endless.toLocaleString('id-ID')+' · kombo terbaik '+world.maxCombo+'</p>'
    :'<p>Distrik '+(levelIndex+1)+', '+world.level.name+' · '+Math.floor(world.percent)+'% hancur · kombo terbaik '+world.maxCombo+'</p>'+missionList(progress.stars[levelIndex])),
  [['Lanjut main',resume],[snd.enabled?'Matikan suara':'Aktifkan suara',()=>{toggleSound();screen='playing';pause()}],['Pengaturan',()=>openSettings(true)],['Menu utama',menu]])}
// Daftar misi
function missionList(stars){
  return '<ul class="missions">'+missions[levelIndex].map((m,i)=>'<li'+(stars[i]?' class="done"':'')+'>'+(stars[i]?'★':'☆')+' '+m.text+'</li>').join('')+'</ul>';
}
// Hasil level
function finish(){
  screen='result';
  // Akhir tanpa akhir
  if(levelIndex===ENDLESS){
    const best=world.score>progress.endless;if(best){progress.endless=world.score;saveProgress(progress)}
    modal(best?'Rekor baru!':'Rex tumbang','<p>Mode Tanpa Akhir · Skor '+world.score.toLocaleString('id-ID')+' · Rekor '+progress.endless.toLocaleString('id-ID')+' · kombo terbaik '+world.maxCombo+'</p>',
      [['Coba lagi',()=>start(ENDLESS)],['Menu utama',menu]]);
    return;
  }
  const win=world.status==='won',score=previousScore+world.score;
  // Simpan progres
  const stars=earned(world,levelIndex);recordDistrict(progress,levelIndex,world.score,win,stars);saveProgress(progress);districtLabel();
  if(score>record){record=score;save('rex.best',record);recordLabel()}
  const more=win&&levelIndex<3;
  // Lanjut distrik
  if(more){el('hud').hidden=true;start(levelIndex+1,score,world.level.name+' rata '+starText(stars)+' · Skor '+score.toLocaleString('id-ID'));return}
  modal(win?(more?'Distrik runtuh!':'Kota ditaklukkan!'):'Rex tumbang',
    '<p>'+world.level.name+' · destruksi '+Math.floor(world.percent)+'% · Skor '+score.toLocaleString('id-ID')+'</p>'+missionList(stars),
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
  const endless=levelIndex===ENDLESS;
  text('district',endless?'Mode Tanpa Akhir':'Distrik '+(levelIndex+1)+' · '+world.level.name);
  text('destruction',endless?world.score.toLocaleString('id-ID'):Math.floor(world.percent+.0001)+'% / '+world.level.target+'%');
  fill('destroyed',Math.min(1,world.percent/100));el('destroyed').parentElement.hidden=endless;
  const goal=world.level.target+'%';if(shown.get('goal')!==goal){shown.set('goal',goal);el('goal').style.left=goal}
  // Kombo
  const combo=world.combo>=10?world.combo:0;el('combo').hidden=!combo;
  if(combo){text('combo-mult','×'+world.multiplier.toString().replace('.',','));text('combo-count',combo+' kombo')}
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
    if(guide&&world.status==='playing'){guide.update(world);showGuide()}
    for(const name of world.events.splice(0)){snd.play(name);buzz(settings,name)}
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
panel.addEventListener('cancel',e=>{e.preventDefault();if(screen==='paused')resume();else if(screen==='help'||screen==='select'||screen==='settings')menu();else if(screen==='settings-paused'){screen='playing';pause()}});
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
el('help').onclick=help;el('tutorial-skip').onclick=skipGuide;el('districts').onclick=chooseDistrict;el('settings').onclick=()=>{if(screen==='menu')openSettings()};el('pause').onclick=pause;document.querySelector('.audio').onclick=toggleSound;
requestAnimationFrame(frame);
