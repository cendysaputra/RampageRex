import {World,heroNames,cooldowns,difficulties} from './world.js';
import {Art,Renderer} from './art.js';
import {Sound} from './audio.js';
import {playOpening} from './opening.js';
import {playCredit} from './credit.js';
import {loadProgress,saveProgress,recordDistrict,resetProgress,totalStars} from './progress.js';
import {loadSettings,saveSettings,buzz,padSizes,skins,graphics,useLite,weakDevice} from './settings.js';
import {Tutorial} from './tutorial.js';
import {missions,earned,starText,missionText} from './missions.js';
import {t,num,setLang,deviceLang,translatePage,languages} from './i18n.js';
import {makeEndless} from './endless.js';
import {upgrades,offer} from './upgrades.js';
import {todayMission,missionTemplate,passed,loadDaily,completeDaily} from './daily.js';
import {achievements,loadStats,saveStats,addRun,unlock,progressOf,resetStats} from './achievements.js';
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
function soundLabel(){const btn=document.querySelector('.audio');btn.querySelector('span').textContent=t(snd.enabled?'Suara nyala':'Suara mati');btn.setAttribute('aria-pressed',String(snd.enabled))}
// Ganti suara
function toggleSound(){snd.enabled=!snd.enabled;save('rex.sound',snd.enabled?'on':'off');soundLabel();if(snd.enabled){snd.unlock();snd.play('step')}}
// Label rekor
function recordLabel(){el('record').textContent=record?t('Rekor {n}',{n:num(record)}):t('Belum ada rekor')}
// Mode developer
const devParam=new URLSearchParams(location.search).get('dev');
if(devParam==='1')save('rex.dev','1');else if(devParam==='0')save('rex.dev','');
const dev=getSaved('rex.dev','')==='1';
let progress=loadProgress(),settings=loadSettings(),guide=null,guideUntil=0,picked=[],stats=loadStats(),daily=null,dailyRecord=loadDaily();
// Skin aktif
// Skin langka
function hasThunder(){return getSaved('rex.thunder','')==='1'}
// Boleh dipakai
function skinOpen(s){return dev||(s.rare?hasThunder():totalStars(progress)>=s.stars)}
function activeSkin(){const s=skins[settings.skin];return s&&skinOpen(s)&&art?.hasSkin(s.folder)?s.folder:''}
// Efek petir aktif
function thunderOn(){return settings.skin==='thunder'&&(dev||hasThunder())}
// Terapkan bahasa
function applyLang(){setLang(settings.lang);translatePage();soundLabel();recordLabel();trophyLabel()}
// Terapkan pengaturan
function applySettings(){snd.volume=settings.sfx/100;document.documentElement.dataset.pad=settings.pad}
applySettings();setLang(settings.lang);translatePage();
// Teks misi harian
function dailyText(mission,levels){return t(missionTemplate(mission),{name:t(levels[mission.district].name),n:num(mission.n)})}
// Label pencapaian
function trophyLabel(){el('trophies').textContent=t('Pencapaian {n}/{total}',{n:stats.unlocked.length,total:achievements.length})}
// Daftar pencapaian
function showTrophies(){
  if(screen!=='menu')return;screen='trophies';
  modal(t('Pencapaian'),'<ul class="trophies">'+achievements.map(a=>{
    const done=stats.unlocked.includes(a.id),k=progressOf(a,stats,progress),value=a.goal?Math.min(a.goal,Math.floor(a.value(stats,progress))):0;
    return '<li'+(done?' class="done"':'')+'><b>'+(done?'★ ':'☆ ')+t(a.name)+'</b><small>'+t(a.text)+(a.goal&&!done?' · '+num(value)+'/'+num(a.goal):'')+'</small><i style="transform:scaleX('+k.toFixed(3)+')"></i></li>';
  }).join('')+'</ul>',[[t('Kembali'),menu]]);
}
// Catat pencapaian
function recordTrophies(){
  if(dev)return '';
  addRun(stats,world.runStats());const fresh=unlock(stats,progress);saveStats(stats);trophyLabel();
  return fresh.length?' · '+t('Pencapaian baru: {names}',{names:fresh.map(a=>t(a.name)).join(', ')}):'';
}
// Tombol distrik
function districtLabel(){el('districts').hidden=!dev&&progress.unlocked<2}
soundLabel();recordLabel();districtLabel();trophyLabel();
// Ambil JSON
async function json(path){const r=await fetch(path);if(!r.ok)throw Error(path);return r.json()}
// Data level
function levelData(){boot??=Promise.all([json('./assets/manifest.json'),Promise.all([1,2,3,4,5,6,7,8].map(n=>json('./data/levels/level-0'+n+'.json')))]).then(([manifest,levels])=>[manifest,[...levels,makeEndless(levels)]]);return boot}
// Indeks tanpa akhir
const ENDLESS=8;
// Reset input
function clearInput(){controls.clear();taps.clear();prior=0}
// Buka dialog
function modal(title,html,buttons){
  clearInput();el('panel-title').textContent=title;el('panel-copy').innerHTML=html;
  const row=el('panel-actions');row.replaceChildren();row.hidden=!buttons.length;
  for(const [i,[text,fn]] of buttons.entries()){
    const b=document.createElement('button');b.className=i?'secondary':'primary';b.textContent=text;b.onclick=fn;row.append(b);
  }
  if(!panel.open)panel.showModal();row.firstElementChild?.focus();
}
// Tutup dialog
function close(){if(panel.open)panel.close()}
// Menu utama
function menu(){
  close();clearInput();screen='menu';world=null;guide=null;showGuide();el('hud').hidden=true;el('menu').hidden=false;el('start').focus();
}
// Daftar kontrol
function showControls(){
  screen='controls';
  const touch=matchMedia('(pointer:coarse)').matches;
  const rows=touch
    ?[['◀ ▶',t('Jalan')],[t('Gigit'),t('Gigit bangunan dan musuh di depan')],[t('Ekor'),t('Sabet ke belakang, melempar tentara')],[t('Injak'),t('Rusak lantai dasar di sekitar kaki')],[t('Raung'),t('Bikin tentara terpaku, jatuhkan drone')],[t('Lompat'),t('Kebal di udara, musuh terpaku saat mendarat')],[t('Ulti'),t('Amukan Rex, guncang seluruh layar')],['⏸',t('Jeda')]]
    :[['A D / ← →',t('Jalan')],[t('W / klik kiri'),t('Gigit bangunan dan musuh di depan')],[t('Q / klik kanan'),t('Sabet ke belakang, melempar tentara')],['S',t('Rusak lantai dasar di sekitar kaki')],['E',t('Raung: tentara terpaku, drone jatuh')],[t('Spasi'),t('Lompat: kebal di udara, musuh terpaku saat mendarat')],['R',t('Ulti Amukan Rex, guncang seluruh layar')],['Esc / P',t('Jeda')]];
  const tips=[t('Runtuhkan lantai dasar untuk menjatuhkan seluruh bangunan.'),t('Raung atau lompat saat panel ulti penjaga muncul untuk menggagalkannya.'),t('Ekor membalikkan tank dan melempar jeep serta truk pemadam.')];
  modal(t('Kontrol'),'<dl class="keys">'+rows.map(([k,v])=>'<dt>'+k+'</dt><dd>'+v+'</dd>').join('')+'</dl><ul class="tips">'+tips.map(t=>'<li>'+t+'</li>').join('')+'</ul>',
    [[t('Kembali'),()=>{screen='playing';pause()}]]);
}
// Pilih distrik
async function chooseDistrict(){
  if(screen!=='menu')return;screen='select';
  let levels;try{[,levels]=await levelData()}catch{boot=null;menu();el('load-status').textContent=t('Data distrik gagal dimuat.');return}
  modal(t('Pilih distrik'),'<div class="districts"></div>',[[t('Kembali'),menu]]);
  const list=el('panel-copy').querySelector('.districts');
  // Misi harian
  const mission=todayMission(progress.unlocked),done=dailyRecord.last===mission.day;
  {
    const b=document.createElement('button'),name=document.createElement('b'),note=document.createElement('small');
    b.type='button';b.className='district daily';name.textContent=t('Misi harian')+(done?' ✓':'');
    note.textContent=dailyText(mission,levels)+(dailyRecord.streak?' · '+t('{n} hari beruntun',{n:dailyRecord.streak}):'');
    b.append(name,note);b.onclick=()=>{daily=mission;start(mission.district)};list.append(b);
  }
  for(const [i,level] of levels.entries()){
    const endless=i===ENDLESS,open=dev||(endless?progress.cleared[0]:i<progress.unlocked),b=document.createElement('button'),name=document.createElement('b'),note=document.createElement('small');
    b.type='button';b.className='district';b.disabled=!open;
    name.textContent=(endless?'∞':i+1)+' · '+t(level.name);
    note.textContent=endless?(open?(progress.endless?t('Rekor {n}',{n:num(progress.endless)}):t('Bertahan selama mungkin')):t('Terbuka setelah Jalan Ruko selesai'))
      :!open?t('Terkunci'):starText(progress.stars[i])+' · '+(progress.cleared[i]?t('skor terbaik {n}',{n:num(progress.best[i])}):t('belum selesai'));
    b.append(name,note);b.onclick=()=>{daily=null;start(i)};list.append(b);
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
  modal(t('Pengaturan'),'<form class="settings" onsubmit="return false"></form>',[[t('Kembali'),back]]);
  const form=el('panel-copy').querySelector('.settings');
  // Pilihan tombol
  const group=(label,options,value,onPick,note='')=>{
    const box=document.createElement('fieldset'),title=document.createElement('legend'),row=document.createElement('div');
    title.textContent=t(label);row.className='choices';box.append(title,row);
    for(const [key,text] of Object.entries(options)){
      const b=document.createElement('button');b.type='button';b.textContent=t(text);b.setAttribute('aria-pressed',String(key===value));
      b.onclick=()=>{onPick(key);for(const x of row.children)x.setAttribute('aria-pressed',String(x===b))};row.append(b);
    }
    if(note){const small=document.createElement('small');small.textContent=t(note);box.append(small)}
    form.append(box);
  };
  // Bahasa
  group('Bahasa',languages,settings.lang,key=>{settings.lang=key;saveSettings(settings);applyLang();openSettings(paused)});
  group('Tingkat kesulitan',Object.fromEntries(Object.entries(difficulties).map(([k,d])=>[k,d.label])),settings.difficulty,
    key=>{settings.difficulty=key;saveSettings(settings)},paused?'Berlaku mulai distrik berikutnya.':'Santai: musuh lebih sedikit dan tidak terlalu sakit.');
  // Mode grafis
  group('Grafis',graphics,settings.graphics,key=>{settings.graphics=key;saveSettings(settings);if(art){art.setLite(useLite(settings));if(renderer)renderer.stale=true}},
    (weakDevice()?'Perangkat ini disarankan memakai Ringan.':'Ringan: resolusi lebih rendah dan efek lebih sedikit untuk HP lama.'));
  // Skin Rex
  const stars=totalStars(progress);
  group('Skin Rex',Object.fromEntries(Object.entries(skins).map(([k,s])=>[k,skinOpen(s)?s.label:s.rare?'??? · '+t('langka'):t(s.label)+' · '+s.stars+'★'])),settings.skin,
    key=>{settings.skin=key;saveSettings(settings)},t('Bintang terkumpul: {n} dari {total}.',{n:stars,total:missions.length*3})+(paused?' '+t('Berlaku mulai distrik berikutnya.'):''));
  for(const [i,s] of Object.values(skins).entries())form.lastChild.querySelector('.choices').children[i].disabled=!skinOpen(s);
  // Volume efek
  const sound=document.createElement('label'),range=document.createElement('input'),value=document.createElement('output');
  sound.className='slider';sound.textContent=t('Efek suara');range.type='range';range.min=0;range.max=100;range.step=5;range.value=settings.sfx;value.textContent=settings.sfx+'%';
  range.oninput=()=>{settings.sfx=+range.value;value.textContent=range.value+'%';applySettings();saveSettings(settings)};
  range.onchange=()=>{snd.unlock();snd.play('bite')};
  sound.append(range,value);form.append(sound);
  const touch=matchMedia('(pointer:coarse)').matches;
  if(touch&&'vibrate' in navigator)group('Getaran',{on:'Nyala',off:'Mati'},settings.vibrate?'on':'off',key=>{settings.vibrate=key==='on';saveSettings(settings);if(settings.vibrate)buzz(settings,'stomp')});
  if(touch||matchMedia('(max-width:720px)').matches)group('Ukuran tombol sentuh',padSizes,settings.pad,key=>{settings.pad=key;applySettings();saveSettings(settings)});
  // Ulangi tutorial
  if(!paused){
    const replay=document.createElement('button');replay.type='button';replay.className='plain';
    const replayDone=getSaved('rex.tutorial','')==='done';replay.textContent=t(replayDone?'Ulangi tutorial di distrik 1':'Tutorial aktif di distrik 1');replay.disabled=!replayDone;
    replay.onclick=()=>{save('rex.tutorial','');replay.textContent=t('Tutorial aktif di distrik 1');replay.disabled=true};form.append(replay);
  }
  // Hapus progres
  if(!paused){
    const wipe=document.createElement('button');wipe.type='button';wipe.className='danger';wipe.textContent=t('Hapus progres');
    wipe.onclick=()=>{
      if(!wipe.dataset.armed){wipe.dataset.armed='1';wipe.textContent=t('Yakin? Tekan lagi untuk menghapus');return}
      progress=resetProgress();stats=resetStats();trophyLabel();record=0;save('rex.best',0);recordLabel();districtLabel();wipe.textContent=t('Progres dihapus');wipe.disabled=true;
    };
    form.append(wipe);
  }
}
// Kartu distrik
function stageCard(index,manifest,level){
  const card=el('stage');card.hidden=false;card.classList.remove('leaving');
  const endless=index===ENDLESS;
  text('stage-number',endless?t('Mode'):t('Distrik {n}',{n:index+1}));text('stage-name',level?t(level.name):endless?t('Tanpa Akhir'):'');
  text('stage-goal',!level?'':endless?t('Bertahan dan hancurkan sebanyak mungkin'):t('Target destruksi {n}%',{n:level.target}));
  text('stage-missions',daily&&level?'★ '+t('Misi harian')+': '+t(missionTemplate(daily),{name:t(level.name),n:num(daily.n)}):level&&!endless?missions[index].map((m,i)=>(progress.stars[index][i]?'★ ':'☆ ')+missionText(m)).join('  ·  '):'');
  if(manifest&&level){
    const layer=name=>{const own='backgrounds/'+level.setting+'/'+name;return './assets/'+(manifest.assets[own+'.png']?own:'backgrounds/'+name)+'.webp'};
    card.style.setProperty('--far','url('+layer('far-city')+')');card.style.setProperty('--sky','url('+layer('sky')+')');
  }
}
// Tutup kartu
function stageOut(){const card=el('stage');card.classList.add('leaving');setTimeout(()=>{if(card.classList.contains('leaving'))card.hidden=true},320)}
// Mulai level
async function start(index=0,carried=0,result='',kept=[]){
  if(screen==='loading')return;
  close();clearInput();screen='loading';el('menu').hidden=true;el('hud').hidden=true;
  el('start').disabled=el('districts').disabled=el('settings').disabled=true;el('load-status').textContent='';text('stage-status',t('Memuat distrik…'));snd.unlock();
  picked=index===ENDLESS?[]:kept;
  const shownAt=performance.now();text('stage-result',result);stageCard(index);
  try{
    const [manifest,levels]=await levelData();stageCard(index,manifest,levels[index]);art??=new Art(manifest);art.useSkin(activeSkin());art.setLite(useLite(settings));if(renderer)renderer.stale=true;
    await art.preload(levels[index],ratio=>{el('stage-bar').style.transform='scaleX('+ratio.toFixed(3)+')';text('stage-status',t('Memuat distrik… {n}%',{n:Math.round(ratio*100)}))});
    renderer??=new Renderer(el('world'),art);levelIndex=index;previousScore=carried;world=new World(levels[index],Math.min(index,ENDLESS-1),{difficulty:settings.difficulty,lite:useLite(settings),upgrades:picked,events:true,thunder:thunderOn()});
    guide=index===0&&getSaved('rex.tutorial','')!=='done'?new Tutorial(world):null;guideUntil=0;showGuide();
    renderer.render(world);updateHud();text('stage-status',t('Siap mengamuk!'));
    await new Promise(r=>setTimeout(r,Math.max(0,(result?2600:1400)-(performance.now()-shownAt))));
    stageOut();el('hud').hidden=false;screen='playing';el('pause').focus({preventScroll:true});clearInput();
    // Tab tersembunyi
    if(document.hidden)pause();
  }catch(err){
    boot=null;art=null;renderer=null;el('stage').hidden=true;el('menu').hidden=false;screen='menu';el('load-status').textContent=t('Aset gagal dimuat. Tekan Mulai main untuk mencoba lagi.');console.error(err);
  }finally{el('start').disabled=el('districts').disabled=el('settings').disabled=false}
}
// Lanjut main
function resume(){close();clearInput();screen='playing';el('pause').focus({preventScroll:true})}
// Jeda
function pause(){if(screen!=='playing')return;screen='paused';modal(t('Jeda'),
  (levelIndex===ENDLESS?'<p>'+t('Mode Tanpa Akhir · skor {score} · rekor {best} · kombo terbaik {combo}',{score:num(world.score),best:num(progress.endless),combo:world.maxCombo})+'</p>'
    :'<p>'+t('Distrik {n}, {name} · {pct}% hancur · kombo terbaik {combo}',{n:levelIndex+1,name:t(world.level.name),pct:Math.floor(world.percent),combo:world.maxCombo})+'</p>'+missionList(progress.stars[levelIndex])+upgradeList()),
  [[t('Lanjut main'),resume],[t('Kontrol'),showControls],[t('Pengaturan'),()=>openSettings(true)],[t('Menu utama'),menu]])}
// Daftar misi
function missionList(stars){
  return '<ul class="missions">'+missions[levelIndex].map((m,i)=>'<li'+(stars[i]?' class="done"':'')+'>'+(stars[i]?'★':'☆')+' '+missionText(m)+'</li>').join('')+'</ul>';
}
// Hasil level
// Pilih upgrade
function chooseUpgrade(next,score,result){
  screen='upgrade';const choices=offer(picked);
  const go=key=>start(next,score,result+(key?' · +'+t(upgrades[key].name):''),key?[...picked,key]:picked);
  if(!choices.length){go('');return}
  modal(t('Pilih upgrade'),'<p>'+t('Upgrade berlaku sampai kampanye selesai.')+'</p><div class="upgrades"></div>'+upgradeList(),[]);
  const list=el('panel-copy').querySelector('.upgrades');
  for(const key of choices){
    const b=document.createElement('button'),name=document.createElement('b'),note=document.createElement('small'),have=picked.filter(p=>p===key).length;
    b.type='button';b.className='upgrade';name.textContent=t(upgrades[key].name)+(have?' '+'★'.repeat(have+1):'');note.textContent=t(upgrades[key].text);
    b.append(name,note);b.onclick=()=>go(key);list.append(b);
  }
  el('panel-actions').hidden=true;list.firstChild.focus();
}
// Daftar upgrade aktif
function upgradeList(){
  if(!picked.length)return '';
  const count={};for(const k of picked)count[k]=(count[k]||0)+1;
  return '<p class="owned">'+t('Upgrade aktif')+': '+Object.entries(count).map(([k,n])=>t(upgrades[k].name)+(n>1?' ×'+n:'')).join(', ')+'</p>';
}
function finish(){
  screen='result';
  // Akhir tanpa akhir
  if(levelIndex===ENDLESS){
    const best=world.score>progress.endless&&!dev;if(best){progress.endless=world.score;saveProgress(progress)}
    const trophy=recordTrophies();
    modal(t(best?'Rekor baru!':'Rex tumbang'),'<p>'+t('Mode Tanpa Akhir · skor {score} · rekor {best} · kombo terbaik {combo}',{score:num(world.score),best:num(progress.endless),combo:world.maxCombo})+'</p>'+(trophy?'<p class="trophy-new">'+trophy.slice(3)+'</p>':''),
      [[t('Coba lagi'),()=>start(ENDLESS)],[t('Menu utama'),menu]]);
    return;
  }
  const win=world.status==='won',score=previousScore+world.score;
  // Simpan progres
  const stars=earned(world,levelIndex);if(!dev){recordDistrict(progress,levelIndex,world.score,win,stars);saveProgress(progress)}districtLabel();
  if(score>record&&!dev){record=score;save('rex.best',record);recordLabel()}
  const trophy=recordTrophies();
  // Hasil misi harian
  if(daily){
    const ok=passed(daily,world);if(ok&&!dev)completeDaily(dailyRecord);const mission=daily;daily=null;
    modal(t(ok?'Misi harian berhasil!':win?'Misi harian gagal':'Rex tumbang'),
      '<p>'+t('{name} · destruksi {pct}% · Skor {score}',{name:t(world.level.name),pct:Math.floor(world.percent),score:num(score)})+'</p><p>'+t('Misi harian')+': '+t(missionTemplate(mission),{name:t(world.level.name),n:num(mission.n)})+'</p>'
      +(ok?'<p class="trophy-new">'+t('{n} hari beruntun',{n:dailyRecord.streak})+'</p>':'')+(trophy?'<p class="trophy-new">'+trophy.slice(3)+'</p>':''),
      [[ok?t('Menu utama'):t('Coba lagi'),ok?menu:()=>{daily=mission;start(mission.district)}],...(ok?[]:[[t('Menu utama'),menu]])]);
    return;
  }
  const more=win&&levelIndex<ENDLESS-1;
  // Lanjut distrik
  if(more){el('hud').hidden=true;chooseUpgrade(levelIndex+1,score,t('{name} rata {stars} · Skor {score}',{name:t(world.level.name),stars:starText(stars),score:num(score)})+trophy);return}
  modal(t(win?(more?'Distrik runtuh!':'Kota ditaklukkan!'):'Rex tumbang'),
    '<p>'+t('{name} · destruksi {pct}% · Skor {score}',{name:t(world.level.name),pct:Math.floor(world.percent),score:num(score)})+'</p>'+missionList(stars)+(trophy?'<p class="trophy-new">'+trophy.slice(3)+'</p>':''),
    [[more?t('Lanjut ke distrik {n}',{n:levelIndex+2}):t(win?'Main dari awal':'Coba lagi'),()=>more?start(levelIndex+1,score,'',picked):win?start():start(levelIndex,previousScore,'',picked)],[t('Menu utama'),menu]]);
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
  fill('rage',p.fury>0?p.fury/8:p.rage/100);text('rage-text',p.fury>0?t('{n} dtk',{n:Math.ceil(p.fury)}):Math.floor(p.rage));
  const endless=levelIndex===ENDLESS;
  text('district',endless?t('Mode Tanpa Akhir'):t('Distrik {n}',{n:levelIndex+1})+' · '+t(world.level.name));
  text('destruction',endless?num(world.score):Math.floor(world.percent+.0001)+'% / '+world.level.target+'%');
  fill('destroyed',Math.min(1,world.percent/100));el('destroyed').parentElement.hidden=endless;
  const goal=world.level.target+'%';if(shown.get('goal')!==goal){shown.set('goal',goal);el('goal').style.left=goal}
  // Kombo
  const combo=world.combo>=10?world.combo:0;el('combo').hidden=!combo;
  if(combo){text('combo-mult','×'+num(world.multiplier));text('combo-count',t('{n} kombo',{n:combo}))}
  const fury=p.fury>0;if(shown.get('fury')!==fury){shown.set('fury',fury);el('hp').closest('.player-card').toggleAttribute('data-fury',fury)}
  let next='',names='';
  for(const e of world.enemies)if(e.hero){next+=e.type+Math.ceil(e.hp)+'|';names+=(names?', ':'')+t(heroNames[e.type])}
  text('objective',world.phase!=='fight'?t('Jalan ke ujung distrik →'):names?t('Kalahkan {names}',{names}):t(world.triggered.size?'Penuhi target destruksi':'Hancurkan bangunan'));
  if(next!==bossKey){bossKey=next;el('bosses').replaceChildren(...world.enemies.filter(e=>e.hero).map(e=>{
    const card=document.createElement('div');card.innerHTML='<img src="./assets/characters/heroes/'+e.type+'/'+(e.type==='robot'?'master':'portrait')+'.webp" alt="" width="40" height="40"><strong>'+t(heroNames[e.type])+'</strong><div class="meter segmented"><i style="width:'+Math.ceil(100*e.hp/e.max)+'%"></i></div>';return card;
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
    // Simpan ThunderRex
    if(world.thunderUnlocked&&!hasThunder()&&!dev){save('rex.thunder','1');buzz(settings,'ulti')}
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
panel.addEventListener('cancel',e=>{e.preventDefault();if(screen==='paused')resume();else if(screen==='select'||screen==='settings'||screen==='trophies')menu();else if(screen==='settings-paused'||screen==='controls'){screen='playing';pause()}});
// Jeda otomatis
window.addEventListener('blur',()=>{clearInput();pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();pause()}});
// Tombol menu
el('start').onclick=async()=>{
  if(screen!=='menu')return;daily=null;
  screen='opening';snd.unlock();el('menu').hidden=true;
  await playCredit(el('credit'));
  await playOpening(el('opening'),snd);
  await start();
};
el('tutorial-skip').onclick=skipGuide;el('districts').onclick=chooseDistrict;el('trophies').onclick=showTrophies;el('settings').onclick=()=>{if(screen==='menu')openSettings()};el('pause').onclick=pause;document.querySelector('.audio').onclick=toggleSound;
requestAnimationFrame(frame);
// Panel developer
if(dev){
  document.documentElement.dataset.dev='1';
  const actions=[['win','Menang instan'],['end','Ratakan & ke ujung'],['flatten','Ratakan kota'],['heroes','Panggil 3 penjaga'],['robot','Panggil robot'],
    ['lose','Kalah'],['god','Kebal'],['heal','Darah penuh'],['cooldown','Cooldown nol'],['rage','Rage penuh'],['rain','Hujan'],['strike','Sambar petir'],
    ['infantry','+ Infanteri'],['bazooka','+ Bazooka'],['jeep','+ Jeep'],['helicopter','+ Helikopter'],['tank','+ Tank'],['firetruck','+ Truk pemadam'],['firefighter','+ Pemadam'],['drone','+ Drone']];
  const box=document.createElement('details');box.id='dev';
  box.innerHTML='<summary>DEV</summary><div></div>';
  for(const [key,label] of actions){
    const b=document.createElement('button');b.type='button';b.textContent=label;
    b.onclick=()=>{if(screen!=='playing'||!world)return;const note=world.devAction(key);if(note)world.say(note,1.6)};
    box.lastChild.append(b);
  }
  el('hud').append(box);
  const badge=document.createElement('span');badge.className='dev-badge';badge.textContent='MODE DEVELOPER · progres tidak disimpan';el('menu').append(badge);
}
// Debug lokal
if(location.hostname==='localhost'||location.hostname==='127.0.0.1')window.rexDebug={get world(){return world}};
// Mode offline
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'))
  addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
