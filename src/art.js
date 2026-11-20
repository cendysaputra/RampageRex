import { clamp, moduleState, exitTime } from './world.js';
import { attackPose, smooth } from './motion.js';
import { rexFramePath, rexPose } from './rex-animation.js';

const propWidths={'mobil-sppg':313,'street-lamp':136,'electric-pole':410,angkot:235,tree:150,'food-cart':145,'tent-stall':218,billboard:180};
// Ukuran sprite
const people={civilian:85,infantry:86,bazooka:94},vehicles={jeep:180,helicopter:285},heroScale=.64,samples=1.6;
const drawnWidths=[['buildings/',560],['characters/civilians/',people.civilian],
  ['characters/soldiers/jeep',vehicles.jeep],['characters/soldiers/helicopter',vehicles.helicopter],['characters/soldiers/',people.bazooka],
  ['fx/dust/',155],['fx/explosion/',130],['fx/debris/',65],['fx/projectiles/',72],['fx/steel-net',235],['fx/ulti-cutin',760],
  ...Object.entries(propWidths).map(([name,width])=>['props/'+name,width])];
// Warna ulti pahlawan
const castColors={perisai:['#4f7bd0','#1b2a55','#f2b33d'],rajawali:['#f0574d','#8e1f3a','#8ff4ff'],jaring:['#8a5fd0','#2d2058','#7be3a4']};
const backdropLayers=['sky','far-city','mid-city','street'];
const heroWidths={head:57,torso:67,'near-upper-arm':35,'near-forearm':41,'far-upper-arm':32,'far-forearm':34,
  'near-thigh':31,'far-thigh':31,'near-shin':38,'far-shin':38,cape:61,shield:57,jetpack:66,'tool-belt':59,'net-launcher':87};
// Lebar bitmap
function bitmapWidth(path,source,scale=1){
  if(path.startsWith('characters/heroes/'))return Math.min(source,Math.ceil(samples*heroScale*(heroWidths[path.split('/').pop()]||source)));
  const match=drawnWidths.find(([prefix])=>path.startsWith(prefix));
  return match?Math.min(source,Math.ceil(match[1]*samples*scale)):source;
}
// Area potong
function cropRect(meta,path){
  if(path.startsWith('backgrounds/')||!meta.alpha||!meta.bounds)return {x:0,y:0,width:meta.width,height:meta.height};
  const b=meta.bounds,x=Math.max(0,b.x-2),y=Math.max(0,b.y-2);
  return {x,y,width:Math.min(meta.width,b.x+b.width+2)-x,height:Math.min(meta.height,b.y+b.height+2)-y};
}

// Pemuat gambar
export class Art {
  constructor(manifest){
    this.meta={...manifest.assets};this.extension=manifest.imageFormat||'png';this.images=new Map();this.loading=new Map();
    this.rexAnimations=manifest.rexAnimations;
    this.crops=new Map(Object.entries(this.meta).map(([path,m])=>[path.slice(0,-4),cropRect(m,path)]));
  }
  // Muat gambar
  load(path){
    if(this.loading.has(path))return this.loading.get(path);
    const task=this.decode(path);this.loading.set(path,task);return task;
  }
  // Dekode gambar
  async decode(path){
    const url='./assets/'+path+'.'+this.extension,m=this.meta[path+'.png'],crop=this.crops.get(path);
    const scale=bitmapWidth(path,m.width,m.scale||1)/m.width,width=Math.max(1,Math.ceil(crop.width*scale)),height=Math.max(1,Math.ceil(crop.height*scale));
    let picture;
    if(typeof createImageBitmap==='function'){
      try{
        const response=await fetch(url);if(!response.ok)throw new Error(path);
        picture=await createImageBitmap(await response.blob(),crop.x,crop.y,crop.width,crop.height,
          {resizeWidth:width,resizeHeight:height,resizeQuality:'high'});
      }catch{}
    }
    // Jalur cadangan
    if(!picture){
      const img=await new Promise((resolve,reject)=>{
        const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error(path));img.src=url;
      });
      picture=document.createElement('canvas');picture.width=width;picture.height=height;
      const c=picture.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
      c.drawImage(img,crop.x,crop.y,crop.width,crop.height,0,0,width,height);
    }
    this.images.set(path,picture);
  }
  // Latar distrik
  backdrop(setting,name){
    const own='backgrounds/'+setting+'/'+name;
    return this.meta[own+'.png']?own:'backgrounds/'+name;
  }
  // Punya latar
  hasBackdrop(setting){return !!this.meta['backgrounds/'+setting+'/sky.png']}
  // Pramuat level
  async preload(level){
    const heroes=level.bosses.flatMap(b=>['characters/heroes/'+b.type+'/parts/','characters/heroes/'+b.type+'/portrait']);
    const backdrops=backdropLayers.map(name=>this.backdrop(level.setting,name));
    // Lepas latar
    for(const [path,image] of this.images)if(path.startsWith('backgrounds/')&&!backdrops.includes(path)){
      image.close?.();this.images.delete(path);this.loading.delete(path);
    }
    const paths=Object.keys(this.meta).map(k=>k.slice(0,-4)).filter(k=>
      backdrops.includes(k)||k.startsWith('buildings/')||k.startsWith('props/')
      ||k.startsWith('characters/rex/animations/')
      ||heroes.some(h=>k.startsWith(h))||(k.includes('/frames/')&&!k.startsWith('ui/'))||(k.startsWith('characters/civilians/')&&k.endsWith('/master'))||['characters/soldiers/helicopter','characters/soldiers/jeep','fx/steel-net','fx/ulti-cutin'].includes(k));
    let cursor=0;
    await Promise.all(Array.from({length:8},async()=>{while(cursor<paths.length)await this.load(paths[cursor++])}));
    await(this.rexFramesReady??=this.prepareRexFrames());
  }
  // Potong atlas
  async prepareRexFrames(){
    for(const [atlas,definition] of Object.entries(this.rexAnimations.atlases)){
      const source=this.images.get(definition.path);
      for(const [index,[x,y,width,height,px,py]] of definition.frames.entries()){
        let picture;
        if(typeof createImageBitmap==='function'){
          try{picture=await createImageBitmap(source,x,y,width,height)}catch{}
        }
        if(!picture){
          picture=document.createElement('canvas');picture.width=width;picture.height=height;
          picture.getContext('2d').drawImage(source,x,y,width,height,0,0,width,height);
        }
        const path=rexFramePath(atlas,index);
        this.meta[path+'.png']={width,height,pivot:[px,py],scale:definition.scale||1,alpha:true};
        this.crops.set(path,{x:0,y:0,width,height});this.images.set(path,picture);
      }
      // Lepas atlas
      this.images.delete(definition.path);source.close?.();
    }
  }
  // Gambar bagian
  part(c,path,x,y,width,angle=0){
    const im=this.images.get(path);if(!im)return;
    const m=this.meta[path+'.png'],crop=this.crops.get(path),s=width/m.width*(m.scale||1);
    c.save();c.translate(x,y);c.rotate(angle);c.drawImage(im,(crop.x-m.pivot[0])*s,(crop.y-m.pivot[1])*s,crop.width*s,crop.height*s);c.restore();
  }
  // Gambar sprite
  sprite(c,path,x,y,width,dir=1,angle=0){
    const im=this.images.get(path);if(!im)return;
    c.save();c.translate(x,y);c.scale(dir,1);this.part(c,path,0,0,width,angle);c.restore();
  }
  // Lebar pose berdiri warga agar tingginya sejalan dengan frame lari
  standingWidth(type){
    this.standing??=new Map();
    if(!this.standing.has(type)){
      const run=this.meta['characters/civilians/'+type+'/frames/run-a.png'],stand=this.meta['characters/civilians/'+type+'/master.png'];
      const height=1.08*run.bounds.height*people.civilian/run.width;
      this.standing.set(type,height/stand.bounds.height*stand.width);
    }
    return this.standing.get(type);
  }
  // Baur pose
  blend(c,from,to,mix,x,y,width,dir=1,angle=0){
    if(from===to||mix<=0){this.sprite(c,from,x,y,width,dir,angle);return}
    if(mix>=1){this.sprite(c,to,x,y,width,dir,angle);return}
    const rect=path=>{
      const m=this.meta[path+'.png'],b=this.crops.get(path),scale=samples*width/m.width*(m.scale||1);
      return {x:(b.x-m.pivot[0])*scale,y:(b.y-m.pivot[1])*scale,w:b.width*scale,h:b.height*scale};
    };
    const a=rect(from),b=rect(to),left=Math.floor(Math.min(a.x,b.x))-1,top=Math.floor(Math.min(a.y,b.y))-1;
    const w=Math.ceil(Math.max(a.x+a.w,b.x+b.w)-left)+1,h=Math.ceil(Math.max(a.y+a.h,b.y+b.h)-top)+1;
    this.blendCanvas??=document.createElement('canvas');const canvas=this.blendCanvas;
    if(canvas.width<w)canvas.width=w;if(canvas.height<h)canvas.height=h;
    const buffer=canvas.getContext('2d');buffer.clearRect(0,0,canvas.width,canvas.height);
    buffer.imageSmoothingEnabled=true;buffer.imageSmoothingQuality='low';
    // Campur warna
    buffer.globalCompositeOperation='source-over';buffer.globalAlpha=1-mix;
    buffer.drawImage(this.images.get(from),a.x-left,a.y-top,a.w,a.h);
    buffer.globalCompositeOperation='lighter';buffer.globalAlpha=mix;
    buffer.drawImage(this.images.get(to),b.x-left,b.y-top,b.w,b.h);
    c.save();c.translate(x,y);c.scale(dir,1);c.rotate(angle);
    c.drawImage(canvas,0,0,w,h,left/samples,top/samples,w/samples,h/samples);c.restore();
  }
}

// Gambar Rex
function rexRig(c,a,p,t,reduced,down=-1){
  const pose=rexPose(p,a.rexAnimations,down),roar=p.attack?.key==='roar'?attackPose(p.attack):0;
  c.save();c.translate(p.x,reduced||p.attack||down>=0?0:-Math.sin(t*2)*1.5);c.scale(p.dir,1);
  // Lompat: jongkok, melar di udara, gepeng saat mendarat
  if(p.attack?.key==='jump'){
    const age=p.attack.age,crouch=age<.18?Math.sin(age/.18*Math.PI):0,land=age>.95?Math.max(0,1-(age-.95)/.2):0;
    const squash=reduced||a.rexAnimations.clips.jump?0:.1*crouch+.14*land-(p.lift>0?.05:0);
    c.translate(0,-p.lift);c.scale(1+squash*.6,1-squash);
  }
  c.save();
  // Tumbang tanpa atlas: terhuyung, lalu jatuh ke depan bertumpu kaki depan
  if(down>=0&&!a.rexAnimations.clips.defeat&&!reduced){
    const wobble=Math.sin(Math.min(down,.6)*18)*.05*(1-smooth(down/.6));
    const fall=smooth((down-.45)/.4),bounce=down>.85?Math.sin((down-.85)*14)*Math.exp(-(down-.85)*6)*.04:0;
    c.translate(150,0);c.rotate(wobble+fall*.36+bounce);c.translate(-150,fall*38);c.scale(1+fall*.05,1-fall*.08);
  }
  a.blend(c,pose.from,pose.to,pose.mix,0,0,a.rexAnimations.width);
  if(p.bigNet>0)a.sprite(c,'fx/steel-net',10,-8,520,1,Math.sin(t*3)*.03);
  else if(p.slow>0)a.sprite(c,'fx/steel-net',2,-20,235);
  if(roar>.2){
    c.strokeStyle='#ffe69f';c.lineWidth=4;c.globalAlpha=roar*.8;
    for(let i=0;i<3;i++){c.beginPath();c.arc(270,-280,75+i*44+p.attack.age/p.attack.duration*65,-.75,.75);c.stroke()}
  }
  c.restore();
  // Bintang pusing di atas kepala setelah jatuh
  if(down>.9){
    const show=smooth((down-.9)/.3);c.globalAlpha=show;c.fillStyle='#ffd45c';c.strokeStyle='#102321';c.lineWidth=4;c.lineJoin='round';
    for(let i=0;i<3;i++){
      const angle=(reduced?0:t*3)+i*Math.PI*2/3,x=(a.rexAnimations.clips.defeat?270:320)+Math.cos(angle)*70,y=(a.rexAnimations.clips.defeat?-150:-262)+Math.sin(angle)*14;
      c.beginPath();for(let k=0;k<10;k++){const radius=k%2?8:19,q=-Math.PI/2+k*Math.PI/5;c.lineTo(x+Math.cos(q)*radius,y+Math.sin(q)*radius)}
      c.closePath();c.stroke();c.fill();
    }
  }
  c.restore();
}
// Balon obrolan kecil
function speech(c,x,y,t,reduced){
  c.save();c.fillStyle='#fff0ce';c.strokeStyle='#102321';c.lineWidth=3;c.lineJoin='round';
  c.beginPath();c.ellipse(x,y,26,17,0,0,Math.PI*2);c.moveTo(x-12,y+13);c.lineTo(x-20,y+27);c.lineTo(x-2,y+15);c.fill();c.stroke();
  c.fillStyle='#102321';
  for(let i=0;i<3;i++){const lift=reduced?0:Math.max(0,Math.sin(t*6-i*.9))*3;c.beginPath();c.arc(x-11+i*11,y-lift,3,0,Math.PI*2);c.fill()}
  c.restore();
}
// Tanda seru saat mulai panik
function exclaim(c,x,y,k){
  c.save();c.globalAlpha=clamp(k*2,0,1);c.font='42px Bangers,Impact,sans-serif';c.textAlign='center';c.textBaseline='bottom';
  c.lineJoin='round';c.lineWidth=7;c.strokeStyle='#102321';c.strokeText('!',x,y-(1-k)*12);c.fillStyle='#ffd45c';c.fillText('!',x,y-(1-k)*12);c.restore();
}
// Gambar pahlawan
function heroRig(c,a,e){
  c.save();c.translate(e.x,e.y);c.scale(e.dir*heroScale,heroScale);
  const stride=Math.sin(e.walk)*e.stride;
  const part=(name,x,y,w,r=0)=>a.part(c,'characters/heroes/'+e.type+'/parts/'+name,x,y,w,r);
  c.rotate(e.lean);
  if(e.type==='perisai')part('cape',-10,-125,61,.08*stride);
  if(e.type==='rajawali')part('jetpack',-19,-107,66);
  function leg(side,x,s){c.save();c.translate(x,-67);c.rotate(s*.29);part(side+'-thigh',0,0,31);part(side+'-shin',-2,27,38,-s*.22);c.restore()}
  leg('far',12,-stride);leg('near',-10,stride);part('far-upper-arm',12,-129,32);part('far-forearm',16,-103,34);
  part('torso',0,-87,67);if(e.type==='jaring')part('tool-belt',2,-80,59);
  part('head',2,-135,57,-.04*stride);part('near-upper-arm',-12,-127,35,-stride*.18);
  part('near-forearm',-13,-99,41,-.28);
  if(e.type==='perisai')part('shield',21,-94,57,e.guard*.7);
  if(e.type==='jaring')part('net-launcher',13,-99,75);
  c.restore();
}
// Latar distrik
function districtScenery(c,setting,cam,w){
  if(setting==='ruko')return;
  c.save();c.translate(-(cam*.42%870),0);c.fillStyle='#3e3f40';c.strokeStyle='#4d4244';c.lineWidth=9;
  for(let x=-80;x<w+870;x+=870){
    if(setting==='port'){
      c.beginPath();c.moveTo(x+50,-170);c.lineTo(x+50,-500);c.lineTo(x+320,-463);c.lineTo(x+50,-435);c.stroke();
      c.lineWidth=3;c.beginPath();c.moveTo(x+202,-474);c.lineTo(x+202,-340);c.stroke();c.lineWidth=9;
      for(let n=0;n<5;n++){c.fillStyle=['#7a5148','#515b58','#a86948'][n%3];c.fillRect(x+n*90,-225,88,43);c.fillRect(x+n*90+22,-183,88,43)}
    }else if(setting==='office'){
      for(let i=0;i<3;i++){const y=-430-(i%2)*110;c.fillStyle='#5a5256';c.fillRect(x+i*150,y,125,-y-160);
        c.fillStyle='#c68b70';for(let j=0;j<7;j++)for(let k=0;k<4;k++)c.fillRect(x+i*150+10+k*29,y+14+j*29,18,9)}
    }else{
      c.fillStyle='#6a5753';c.fillRect(x+100,-251,140,39);c.fillRect(x+140,-330,60,110);
      c.beginPath();c.moveTo(x+148,-330);c.lineTo(x+170,-540);c.lineTo(x+193,-330);c.fill();
    }
  }c.restore();
}
// Renderer
export class Renderer {
  constructor(canvas,art){
    this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.art=art;this.stale=true;
    this.motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
    const mark=()=>{this.stale=true};addEventListener('resize',mark);
    if(typeof ResizeObserver==='function')new ResizeObserver(mark).observe(canvas);
  }
  // Ukur canvas
  measure(){
    const canvas=this.canvas,w=canvas.clientWidth,h=canvas.clientHeight;this.w=w;this.h=h;if(!w||!h)return;
    // Batas resolusi
    let dpr=Math.min(2,devicePixelRatio||1);const over=w*h*dpr*dpr/3.7e6;if(over>1)dpr/=Math.sqrt(over);
    const bw=Math.max(1,Math.round(w*dpr)),bh=Math.max(1,Math.round(h*dpr));
    if(canvas.width!==bw||canvas.height!==bh){canvas.width=bw;canvas.height=bh}
    // Kualitas sampling
    this.c.imageSmoothingEnabled=true;this.c.imageSmoothingQuality='low';
    this.bw=bw;this.bh=bh;this.scale=Math.min(w/1000,h/1080);
    const view=w/this.scale,logicalH=h/this.scale,floor=Math.min(logicalH*.82,logicalH*.55+285);
    const sx=bw/w*this.scale,sy=bh/h*this.scale;
    const surface=(width,height)=>{
      const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.ceil(width*sx));canvas.height=Math.max(1,Math.ceil(height*sy));
      const c=canvas.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';return {canvas,c};
    };
    const place=name=>this.art.backdrop(this.setting,name);
    const sky=this.art.images.get(place('sky')),skyScale=Math.max(view/sky.width,(floor+5)/sky.height);
    const skyW=view/skyScale,skyH=(floor+5)/skyScale,backdrop=surface(view,floor+5);
    backdrop.c.drawImage(sky,(sky.width-skyW)/2,sky.height-skyH,skyW,skyH,0,0,backdrop.canvas.width,backdrop.canvas.height);
    this.sky=backdrop.canvas;this.backgrounds=new Map();
    for(const [name,width,height] of [['far-city',1750,323],['mid-city',1800,269],['street',1750,235]]){
      const layer=surface(width,height);layer.c.drawImage(this.art.images.get(place(name)),0,0,layer.canvas.width,layer.canvas.height);
      this.backgrounds.set(name,layer.canvas);
    }
    this.ground=this.art.meta[place('street')+'.png'].ground||'#232e31';
    this.stale=false;
  }
  // Gambar frame
  render(g){
    if(this.setting!==g.level.setting){this.setting=g.level.setting;this.stale=true}
    if(this.stale)this.measure();
    const c=this.c,a=this.art,{w,h,bw,bh,scale}=this;if(!w||!h)return;
    const view=w/scale,logicalH=h/scale;
    g.view=view;c.setTransform(bw/w*scale,0,0,bh/h*scale,0,0);
    const cam=g.camera,t=g.time,floor=Math.min(logicalH*.82,logicalH*.55+285),reduced=this.motionPreference.matches;
    c.fillStyle='#c97461';c.fillRect(0,0,view,logicalH);
    c.drawImage(this.sky,0,0,view,floor+5);
    c.save();c.translate(0,floor);if(g.shake>0&&!reduced)c.translate(Math.sin(t*34)*g.shake*.7,Math.cos(t*41)*g.shake*.4);
    const tile=(name,ratio,top,height,width)=>{
      const im=this.backgrounds.get(name);for(let x=-(cam*ratio%width);x<view;x+=width)c.drawImage(im,x,top,width+1,height)
    };
    // Latar
    const own=a.hasBackdrop(g.level.setting);
    tile('far-city',.16,-485,323,1750);if(!own)districtScenery(c,g.level.setting,cam,view);
    tile('mid-city',.48,-334,269,1800);
    if(g.index&&!own){c.fillStyle='rgba(43,23,64,'+g.index*.105+')';c.fillRect(-20,-floor-20,view+40,floor+30)}
    c.fillStyle=this.ground;c.fillRect(-30,-64,view+60,logicalH-floor+130);
    tile('street',1,-66,235,1750);
    // Sambungan aspal
    const roadFade=c.createLinearGradient(0,125,0,170);
    roadFade.addColorStop(0,this.ground+'00');roadFade.addColorStop(1,this.ground);
    c.fillStyle=roadFade;c.fillRect(-30,125,view+60,Math.max(45,logicalH-floor-125));
    c.translate(-cam,0);const visible=(x,pad=450)=>x>=cam-pad&&x<=cam+view+pad;
    // Bangunan
    for(const b of g.buildings){
      if(!visible(b.x,b.width))continue;
      for(const [i,m] of b.modules.entries()){
        const state=moduleState(m),path='buildings/ruko-01/'+(state==='intact'?'colors/'+m.type+'-'+b.color:'damage/'+m.type+'-'+state);
        let y=m.y;if(!m.hp){const support=b.modules.slice(0,i).filter(v=>!v.hp).reduce((n,v)=>n+v.h,0);y+=support*(1-(m.fall/.6)**2)-i*5}
        a.part(c,path,b.x,y,b.width*984/960);
      }
    }
    for(const prop of g.props){
      if(!visible(prop.x))continue;
      const suffix=prop.hp===0?'-wreck':prop.hp<150?'-damaged':'';
      a.sprite(c,'props/'+prop.type+suffix,prop.x,-46,propWidths[prop.type]);
    }
    const shadow=(x,y,w)=>{c.fillStyle='#0c211e51';c.beginPath();c.ellipse(x,y,w,Math.max(5,w*.07),0,0,Math.PI*2);c.fill()};
    // Musuh
    for(const e of g.enemies){if(!visible(e.x))continue;
      shadow(e.x,0,e.hero?44:e.type==='jeep'?78:e.type==='helicopter'?90:40);c.save();
      if(e.hit>0&&!reduced)c.translate(-e.dir*Math.sin(clamp(e.hit/.2,0,1)*Math.PI)*4,0);
      if(e.hero){
        // Aura saat mengumpulkan ulti
        if(g.cast?.hero===e&&!g.cast.done){
          const k=g.cast.age/g.cast.windup,[light,,glow]=castColors[e.type];
          c.save();c.globalAlpha=.35+.35*Math.sin(t*22)**2;c.fillStyle=glow;
          c.beginPath();c.ellipse(e.x,e.y-70,70+k*40,95+k*40,0,0,Math.PI*2);c.fill();
          c.globalAlpha=.9;c.strokeStyle=light;c.lineWidth=5;c.beginPath();c.ellipse(e.x,e.y-70,90+k*60,115+k*60,0,0,Math.PI*2);c.stroke();c.restore();
        }
        heroRig(c,a,e);
        // Darah pahlawan
        const top=e.y-140,ratio=clamp(e.hp/e.max,0,1);
        c.fillStyle='#102321';c.fillRect(e.x-48,top-4,96,18);
        c.fillStyle='#e8536d';c.fillRect(e.x-44,top,88*ratio,10);
      }
      else if(e.type==='turret'){
        c.save();c.translate(e.x,0);c.fillStyle='#172d2a';c.beginPath();c.moveTo(-27,0);c.lineTo(0,-38);c.lineTo(27,0);c.fill();
        a.sprite(c,'characters/heroes/jaring/parts/net-launcher',0,-27,61,e.dir);c.restore();
      }else if(e.type==='jeep'||e.type==='helicopter'){
        a.sprite(c,'characters/soldiers/'+e.type,e.x,e.y-e.lift,vehicles[e.type],e.dir,e.lift*.003);
      }else{
        const base='characters/soldiers/'+e.type+'/frames/',frame=e.frame||(e.type==='infantry'?'aim':'kneeling-fire');
        const bob=Math.sin(e.walk)**2*e.stride*2;
        a.blend(c,base+(e.fromFrame||frame),base+frame,e.frameMix??1,e.x,-e.lift-bob,people[e.type],e.dir);
      }c.restore();
      // Darah tentara
      if(!e.hero&&e.hp<e.max){const top=e.y-e.lift-(e.type==='helicopter'?95:e.type==='jeep'?80:96),ratio=clamp(e.hp/e.max,0,1);
        c.fillStyle='#102321';c.fillRect(e.x-31,top-3,62,11);c.fillStyle=ratio>.5?'#ffd477':'#e8536d';c.fillRect(e.x-28,top,56*ratio,5)}
      if(e.mode==='aim'||e.mode==='recover'){c.fillStyle=e.mode==='aim'?'#ffd477':'#a8f2d7';c.font='30px Bangers,Impact,sans-serif';c.fillText(e.mode==='aim'?'!':'…',e.x-7,e.y-152)}
    }
    // Penanda ujung distrik
    if(g.phase!=='fight'&&visible(g.exitX,300)){
      const pulse=reduced?.5:.5+.5*Math.sin(t*6);
      c.save();c.lineJoin='round';c.lineWidth=14;
      for(let i=0;i<3;i++){
        const x=g.exitX+i*62+(reduced?0:((t*90)%62));c.globalAlpha=.45+.55*((i+pulse)%1.2/1.2);
        c.strokeStyle='#102321';c.lineWidth=20;c.beginPath();c.moveTo(x,40);c.lineTo(x+34,80);c.lineTo(x,120);c.stroke();
        c.strokeStyle='#ff9b40';c.lineWidth=12;c.beginPath();c.moveTo(x,40);c.lineTo(x+34,80);c.lineTo(x,120);c.stroke();
      }c.restore();
    }
    shadow(g.rex.x-15,2,212*(1-g.rex.lift/700));c.save();
    if(g.rex.hit>0&&!reduced)c.translate(-g.rex.dir*Math.sin(clamp(g.rex.hit/.18,0,1)*Math.PI)*5,0);
    rexRig(c,a,g.rex,t,reduced,g.phase==='dying'?t-g.dieAt:-1);c.restore();
    // Warga
    for(const civ of g.civilians){
      if(!visible(civ.x,180))continue;
      const base='characters/civilians/'+civ.type+'/frames/',frame=civ.frame||'run-a';
      if(civ.down){
        // Berputar di sekitar badan, bukan di kaki
        c.save();c.globalAlpha=clamp(civ.life/.35,0,1);c.translate(civ.x,civ.lane+civ.y-42);if(!reduced)c.rotate(civ.angle);
        a.blend(c,base+(civ.fromFrame||frame),base+frame,civ.frameMix??1,0,42,people.civilian,civ.dir);c.restore();continue}
      if(civ.calm){
        // Beraktivitas: pose berdiri, napas pelan, balon obrolan bila berdua
        const breathe=reduced?0:Math.sin(t*2.2+civ.phase)*1.2;
        a.sprite(c,'characters/civilians/'+civ.type+'/master',civ.x,civ.lane+breathe*.3,a.standingWidth(civ.type),civ.dir);
        if(civ.chat&&civ.dir>0&&(t+civ.phase)%4<2.4)speech(c,civ.x+30,civ.lane-118,t,reduced);
        continue;
      }
      const recoil=civ.hit>0&&!reduced?-civ.dir*Math.sin(clamp(civ.hit/.2,0,1)*Math.PI)*4:0;
      if(civ.alarm>0)exclaim(c,civ.x,civ.lane-112,civ.alarm/.7);
      a.blend(c,base+(civ.fromFrame||frame),base+frame,civ.frameMix??1,civ.x+recoil,civ.lane-(civ.stun>0?0:Math.sin(civ.walk)**2*3),people.civilian,civ.dir);
    }
    // Proyektil
    for(const s of g.shots){const path=s.type==='net'?'net-capsule':s.type;a.sprite(c,'fx/projectiles/frames/'+path,s.x,s.y,s.type==='bullet'?37:72,1,Math.atan2(s.vy,s.vx))}
    // Efek
    for(const f of g.effects){
      if(!visible(f.x,f.size))continue;
      const age=clamp(1-f.life/f.max,0,1);c.save();
      if(f.kind==='dust'||f.kind==='explosion'){
        const frames=f.kind==='dust'?['puff','expanding','wide','dissipating']:['flash','burst','embers','wisps'];
        const position=age*3,index=Math.min(2,Math.floor(position)),base='fx/'+f.kind+'/frames/';
        c.globalAlpha=smooth(age/.08)*(1-smooth((age-.55)/.45));
        a.blend(c,base+frames[index],base+frames[index+1],smooth(position-index),f.x,f.y,f.size*(.9+age*.25));
      }else{
        const key=f.kind==='decor'?'shutter':f.seed>.5?'brick':'plaster';
        c.globalAlpha=1-smooth((age-.6)/.4);a.sprite(c,'fx/debris/frames/'+key,f.x,f.y,f.size,1,f.spin*(f.max-f.life));
      }c.restore();
    }
    // Gelombang kejut
    const wave=(t-g.quakeAt)/.7;
    if(wave>=0&&wave<1){
      c.save();c.lineWidth=14*(1-wave)+2;
      for(const [delay,colour] of [[0,'#fff3c4'],[.18,'#ff9b40']]){
        const k=clamp((wave-delay)/(1-delay),0,1);if(!k)continue;
        c.globalAlpha=(1-k)*.9;c.strokeStyle=colour;c.beginPath();c.ellipse(g.rex.x,-4,80+smooth(k)*view*.75,14+smooth(k)*46,0,0,Math.PI*2);c.stroke();
      }c.restore();
    }
    // Gelombang pendaratan lompat
    const slam=(t-g.jumpAt)/.8;
    if(slam>=0&&slam<1){
      c.save();c.lineWidth=18*(1-slam)+3;
      for(const [delay,colour] of [[0,'#fff3c4'],[.12,'#3fa39a'],[.24,'#fff3c4']]){
        const k=clamp((slam-delay)/(1-delay),0,1);if(!k)continue;
        c.globalAlpha=(1-k)*.85;c.strokeStyle=colour;c.beginPath();c.ellipse(g.rex.x,-4,90+smooth(k)*view*.85,16+smooth(k)*56,0,0,Math.PI*2);c.stroke();
      }c.restore();
    }
    // Gelombang Perisai
    const shield=g.heroWave&&(t-g.heroWave.at)/.75;
    if(shield>=0&&shield<1){
      c.save();c.lineWidth=16*(1-shield)+3;
      for(const [delay,colour] of [[0,'#f2b33d'],[.15,'#4f7bd0']]){
        const k=clamp((shield-delay)/(1-delay),0,1);if(!k)continue;
        c.globalAlpha=(1-k)*.95;c.strokeStyle=colour;c.beginPath();c.ellipse(g.heroWave.x,-4,60+smooth(k)*950,12+smooth(k)*50,0,0,Math.PI*2);c.stroke();
      }c.restore();
    }
    c.restore();
    this.ultimateOverlay(c,g,view,logicalH,reduced);
    this.heroOverlay(c,g,view,logicalH,reduced);
    this.exitOverlay(c,g,view,logicalH,reduced,floor);
  }
  // Efek ulti
  ultimateOverlay(c,g,view,logicalH,reduced){
    const action=g.rex.attack?.key==='ulti'?g.rex.attack:null,flash=1-(g.time-g.quakeAt)/.3;
    if(action&&action.age<action.impact){
      const age=action.age,left=action.impact-age,show=smooth(age/.16)*smooth(left/.14);
      c.fillStyle='rgba(14,8,26,'+.5*show+')';c.fillRect(0,0,view,logicalH);
      const width=Math.min(view*.52,820),height=Math.min(logicalH*.5,470,width*.58),top=logicalH*.2,lean=height*.22;
      const slide=reduced?0:(1-smooth(age/.2))*-(width+lean)+(1-smooth(left/.14))*-(width+lean);
      c.save();c.translate(slide,top);c.globalAlpha=reduced?show:1;
      const outline=()=>{c.beginPath();c.moveTo(0,0);c.lineTo(width+lean,0);c.lineTo(width,height);c.lineTo(0,height);c.closePath()};
      outline();c.save();c.clip();
      const paint=c.createLinearGradient(0,0,width,height);paint.addColorStop(0,'#ff9b40');paint.addColorStop(1,'#c2314f');
      c.fillStyle=paint;c.fillRect(0,0,width+lean,height);
      // Garis kecepatan
      c.strokeStyle='#fff0ce55';c.lineWidth=5;
      for(let i=0;i<9;i++){const y=(i+.5)*height/9,x=((i*173-(reduced?0:age*900))%(width+300)+width+300)%(width+300)-150;
        c.beginPath();c.moveTo(x,y);c.lineTo(x+150+i%3*60,y);c.stroke()}
      const m=this.art.meta['fx/ulti-cutin.png'],scale=Math.max((width+lean)/m.width,height/m.height),bump=reduced?0:(1-smooth(age/.3))*40;
      c.drawImage(this.art.images.get('fx/ulti-cutin'),(width+lean-m.width*scale)/2-bump,(height-m.height*scale)/2,m.width*scale,m.height*scale);
      c.restore();outline();
      c.strokeStyle='#fff0ce';c.lineWidth=7;c.stroke();
      c.font=Math.round(height*.22)+'px Bangers,Impact,sans-serif';c.textBaseline='bottom';
      c.lineWidth=10;c.strokeStyle='#102321';c.lineJoin='round';c.strokeText('AMUKAN REX!',28,height-18);
      c.fillStyle='#fff0ce';c.fillText('AMUKAN REX!',28,height-18);
      c.restore();
    }
    if(flash>0&&!reduced){c.fillStyle='rgba(255,243,196,'+flash*.75+')';c.fillRect(0,0,view,logicalH)}
  }
  // Ulti pahlawan: panel yang sama dengan Amukan Rex, masuk dari kanan
  heroOverlay(c,g,view,logicalH,reduced){
    const cast=g.cast,flash=1-(g.time-g.castAt)/.3;
    if(cast&&!cast.done){
      const age=cast.age,left=cast.windup-age,show=smooth(age/.16)*smooth(left/.14),[light,dark,glow]=castColors[cast.type];
      c.fillStyle='rgba(14,8,26,'+.5*show+')';c.fillRect(0,0,view,logicalH);
      const width=Math.min(view*.52,820),height=Math.min(logicalH*.5,470,width*.58),top=logicalH*.24,lean=height*.22;
      const slide=reduced?0:(1-smooth(age/.2))*(width+lean)+(1-smooth(left/.14))*(width+lean);
      c.save();c.translate(view-width-lean+slide,top);c.globalAlpha=reduced?show:1;
      const outline=()=>{c.beginPath();c.moveTo(lean,0);c.lineTo(width+lean,0);c.lineTo(width+lean,height);c.lineTo(0,height);c.closePath()};
      outline();c.save();c.clip();
      const paint=c.createLinearGradient(width+lean,0,0,height);paint.addColorStop(0,light);paint.addColorStop(1,dark);
      c.fillStyle=paint;c.fillRect(0,0,width+lean,height);
      // Garis kecepatan
      c.strokeStyle=glow+'66';c.lineWidth=5;
      for(let i=0;i<9;i++){const y=(i+.5)*height/9,x=((i*173+(reduced?0:age*900))%(width+300)+width+300)%(width+300)-150;
        c.beginPath();c.moveTo(x,y);c.lineTo(x+150+i%3*60,y);c.stroke()}
      // Potret menghadap ke kiri, ke arah Rex
      const path='characters/heroes/'+cast.type+'/portrait',im=this.art.images.get(path);
      if(im){const size=height*1.12,bump=reduced?0:(1-smooth(age/.3))*40;
        c.save();c.translate(width+lean-size*.12+bump,height*.02);c.scale(-1,1);c.drawImage(im,0,0,size,size*im.height/im.width);c.restore()}
      c.restore();outline();
      c.strokeStyle='#fff0ce';c.lineWidth=7;c.stroke();
      c.font=Math.round(height*.2)+'px Bangers,Impact,sans-serif';c.textBaseline='bottom';c.lineJoin='round';
      c.lineWidth=10;c.strokeStyle='#102321';c.strokeText(cast.name,28,height-18);
      c.fillStyle='#fff0ce';c.fillText(cast.name,28,height-18);
      c.font='700 '+Math.round(height*.075)+'px "Baloo 2",sans-serif';c.lineWidth=6;
      const tip='Raung untuk menggagalkan!';c.strokeText(tip,lean+24,height*.12+Math.round(height*.075));c.fillStyle=glow;c.fillText(tip,lean+24,height*.12+Math.round(height*.075));
      c.restore();
    }
    if(flash>0&&!reduced&&g.cast){c.fillStyle=castColors[g.cast.type][2]+Math.round(flash*150).toString(16).padStart(2,'0');c.fillRect(0,0,view,logicalH)}
  }
  // Arah ke ujung distrik dan layar meredup saat Rex keluar
  exitOverlay(c,g,view,logicalH,reduced,floor){
    if(g.phase==='clear'&&g.exitX>g.camera+view-60){
      const bob=reduced?0:Math.sin(g.time*5)*8,x=view-46+bob,y=floor-260;
      c.save();c.lineJoin='round';
      c.fillStyle='#ff9b40';c.strokeStyle='#102321';c.lineWidth=6;
      c.beginPath();c.moveTo(x+28,y);c.lineTo(x-14,y-34);c.lineTo(x-14,y+34);c.closePath();c.stroke();c.fill();
      c.font='700 22px "Baloo 2",sans-serif';c.textAlign='right';c.textBaseline='middle';c.lineWidth=6;
      const label=Math.ceil((g.exitX-g.rex.x)/100)+' m';c.strokeText(label,x-26,y);c.fillStyle='#fff0ce';c.fillText(label,x-26,y);
      c.restore();
    }
    if(g.phase==='dying'){
      const down=g.time-g.dieAt,k=smooth((down-1.2)/1.2);
      if(k>0){
        c.fillStyle='rgba(11,23,25,'+k*.6+')';c.fillRect(0,0,view,logicalH);
        c.save();c.globalAlpha=k;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
        c.font=Math.round(Math.min(view*.12,150))+'px Bangers,Impact,sans-serif';c.lineWidth=14;c.strokeStyle='#102321';
        const y=logicalH*.32-(reduced?0:(1-k)*30);c.strokeText('REX TUMBANG',view/2,y);c.fillStyle='#e8536d';c.fillText('REX TUMBANG',view/2,y);c.restore();
      }
    }
    if(g.phase==='exit'){
      const k=smooth((g.time-g.exitAt-(exitTime-.9))/.9);
      if(k>0){c.fillStyle='rgba(11,23,25,'+k+')';c.fillRect(0,0,view,logicalH)}
    }
  }
}
