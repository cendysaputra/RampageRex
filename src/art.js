import { clamp, moduleState } from './world.js';
import { attackPose, smooth } from './motion.js';
import { rexFramePath, rexPose } from './rex-animation.js';

const propWidths={'electric-pole':410,angkot:235,tree:150,'food-cart':145,'tent-stall':218,billboard:180};
// Two samples per logical pixel cover the renderer's capped backing store.
const drawnWidths=[['buildings/',560],['characters/civilians/bakso-vendor/',150],['characters/civilians/',85],
  ['characters/soldiers/jeep',240],['characters/soldiers/helicopter',285],['characters/soldiers/',97],
  ['fx/dust/',155],['fx/explosion/',130],['fx/debris/',65],['fx/projectiles/',72],['fx/steel-net',235],
  ...Object.entries(propWidths).map(([name,width])=>['props/'+name,width])];
const heroWidths={head:57,torso:67,'near-upper-arm':35,'near-forearm':41,'far-upper-arm':32,'far-forearm':34,
  'near-thigh':31,'far-thigh':31,'near-shin':38,'far-shin':38,cape:61,shield:57,jetpack:66,'tool-belt':59,'net-launcher':87};
function bitmapWidth(path,source){
  if(path.startsWith('characters/heroes/'))return Math.min(source,2*(heroWidths[path.split('/').pop()]||source));
  const match=drawnWidths.find(([prefix])=>path.startsWith(prefix));
  return match?Math.min(source,Math.ceil(match[1]*2)):source;
}
function cropRect(meta,path){
  if(path.startsWith('backgrounds/')||!meta.alpha||!meta.bounds)return {x:0,y:0,width:meta.width,height:meta.height};
  const b=meta.bounds,x=Math.max(0,b.x-2),y=Math.max(0,b.y-2);
  return {x,y,width:Math.min(meta.width,b.x+b.width+2)-x,height:Math.min(meta.height,b.y+b.height+2)-y};
}

export class Art {
  constructor(manifest){
    this.meta={...manifest.assets};this.extension=manifest.imageFormat||'png';this.images=new Map();this.loading=new Map();
    this.rexAnimations=manifest.rexAnimations;
    this.crops=new Map(Object.entries(this.meta).map(([path,m])=>[path.slice(0,-4),cropRect(m,path)]));
  }
  load(path){
    if(this.loading.has(path))return this.loading.get(path);
    const task=this.decode(path);this.loading.set(path,task);return task;
  }
  // Decoding up front keeps the first draw of a sprite from stalling a frame mid-game.
  async decode(path){
    const url='./assets/'+path+'.'+this.extension,m=this.meta[path+'.png'],crop=this.crops.get(path);
    const scale=bitmapWidth(path,m.width)/m.width,width=Math.max(1,Math.ceil(crop.width*scale)),height=Math.max(1,Math.ceil(crop.height*scale));
    let picture;
    if(typeof createImageBitmap==='function'){
      try{
        const response=await fetch(url);if(!response.ok)throw new Error(path);
        picture=await createImageBitmap(await response.blob(),crop.x,crop.y,crop.width,crop.height,
          {resizeWidth:width,resizeHeight:height,resizeQuality:'high'});
      }catch{}
    }
    // Fallback for browsers without ImageBitmap; also reports a missing file by its path.
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
  async preload(level){
    const heroes=level.bosses.map(b=>'characters/heroes/'+b.type+'/parts/');
    const paths=Object.keys(this.meta).map(k=>k.slice(0,-4)).filter(k=>
      k.startsWith('backgrounds/')||k.startsWith('buildings/')||k.startsWith('props/')
      ||k.startsWith(this.rexAnimations?'characters/rex/animations/':'characters/rex/parts/')
      ||heroes.some(h=>k.startsWith(h))||(k.includes('/frames/')&&!k.startsWith('ui/'))||['characters/soldiers/helicopter','characters/soldiers/jeep','fx/steel-net'].includes(k));
    let cursor=0;
    await Promise.all(Array.from({length:8},async()=>{while(cursor<paths.length)await this.load(paths[cursor++])}));
    if(this.rexAnimations)await(this.rexFramesReady??=this.prepareRexFrames());
  }
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
      // The sheet is only needed for slicing; dropping it frees about 6 MB per atlas.
      this.images.delete(definition.path);source.close?.();
    }
  }
  part(c,path,x,y,width,angle=0){
    const im=this.images.get(path);if(!im)return;
    const m=this.meta[path+'.png'],crop=this.crops.get(path),s=width/m.width*(m.scale||1);
    c.save();c.translate(x,y);c.rotate(angle);c.drawImage(im,(crop.x-m.pivot[0])*s,(crop.y-m.pivot[1])*s,crop.width*s,crop.height*s);c.restore();
  }
  sprite(c,path,x,y,width,dir=1,angle=0){
    const im=this.images.get(path);if(!im)return;
    c.save();c.translate(x,y);c.scale(dir,1);this.part(c,path,0,0,width,angle);c.restore();
  }
  blend(c,from,to,mix,x,y,width,dir=1,angle=0){
    if(from===to||mix<=0){this.sprite(c,from,x,y,width,dir,angle);return}
    if(mix>=1){this.sprite(c,to,x,y,width,dir,angle);return}
    const rect=path=>{
      const m=this.meta[path+'.png'],b=this.crops.get(path),scale=2*width/m.width*(m.scale||1);
      return {x:(b.x-m.pivot[0])*scale,y:(b.y-m.pivot[1])*scale,w:b.width*scale,h:b.height*scale};
    };
    const a=rect(from),b=rect(to),left=Math.floor(Math.min(a.x,b.x))-1,top=Math.floor(Math.min(a.y,b.y))-1;
    const w=Math.ceil(Math.max(a.x+a.w,b.x+b.w)-left)+1,h=Math.ceil(Math.max(a.y+a.h,b.y+b.h)-top)+1;
    this.blendCanvas??=document.createElement('canvas');const canvas=this.blendCanvas;
    if(canvas.width<w)canvas.width=w;if(canvas.height<h)canvas.height=h;
    const buffer=canvas.getContext('2d');buffer.clearRect(0,0,canvas.width,canvas.height);
    buffer.imageSmoothingEnabled=true;buffer.imageSmoothingQuality='low';
    // Add premultiplied colours so overlapping poses retain their original opacity.
    buffer.globalCompositeOperation='source-over';buffer.globalAlpha=1-mix;
    buffer.drawImage(this.images.get(from),a.x-left,a.y-top,a.w,a.h);
    buffer.globalCompositeOperation='lighter';buffer.globalAlpha=mix;
    buffer.drawImage(this.images.get(to),b.x-left,b.y-top,b.w,b.h);
    c.save();c.translate(x,y);c.scale(dir,1);c.rotate(angle);
    c.drawImage(canvas,0,0,w,h,left/2,top/2,w/2,h/2);c.restore();
  }
}

function rexRig(c,a,p,t,reduced){
  if(a.rexAnimations){
    const pose=rexPose(p,a.rexAnimations),roar=p.attack?.key==='roar'?attackPose(p.attack):0;
    c.save();c.translate(p.x,reduced||p.attack?0:-Math.sin(t*2)*1.5);c.scale(p.dir,1);
    a.blend(c,pose.from,pose.to,pose.mix,0,0,a.rexAnimations.width);
    if(p.slow>0)a.sprite(c,'fx/steel-net',2,-20,235);
    if(roar>.2){
      c.strokeStyle='#ffe69f';c.lineWidth=4;c.globalAlpha=roar*.8;
      for(let i=0;i<3;i++){c.beginPath();c.arc(270,-280,75+i*44+p.attack.age/p.attack.duration*65,-.75,.75);c.stroke()}
    }
    c.restore();return;
  }
  const action=p.attack,progress=action?clamp(action.age/action.duration,0,1):0;
  const swing=attackPose(action),bite=action?.key==='bite'?swing:0,tail=action?.key==='tail'?swing:0,
    stomp=action?.key==='stomp'?swing:0,roar=action?.key==='roar'?swing:0;
  const step=Math.sin(p.walk)*p.stride;
  const lift=stomp&&action.age<action.impact?Math.sin(Math.PI*action.age/action.impact)**2*12:0;
  const idle=reduced?0:Math.sin(t*2)*2,bob=Math.sin(p.walk)**2*p.stride*5;
  c.save();c.translate(p.x,0);c.scale(p.dir,1);c.translate(0,-idle-bob-lift);
  const part=(name,x,y,w,r=0)=>a.part(c,'characters/rex/parts/'+name,x,y,w,r);
  function leg(side,x,phase){
    c.save();c.translate(x,-146);c.rotate(phase*.23);
    part(side+'-leg',0,0,side==='far'?136:163);
    part(side+'-foot',-5,101-Math.max(0,phase)**2*10,side==='far'?113:125,-phase*.18);c.restore();
  }
  leg('far',45,-step);part('far-arm',101,-226,77,-bite*.2);
  c.save();c.translate(-90,-165);c.rotate(.11+(reduced?0:Math.sin(t*2.5)*.04)+tail*.62);
  c.save();c.translate(-137,16);c.rotate(.025+(reduced?0:Math.sin(t*2.5-.6)*.025)+tail*.12);
  part('tail-tip',-95,7,131,.025);part('tail-middle',0,0,151);c.restore();part('tail-base',0,0,214);c.restore();
  part('torso',0,-177,318,-roar*.08+bite*.045);leg('near',-37,step);
  part('near-arm',87,-218,86,step*.12-bite*.4);
  c.save();c.translate(125+bite*34,-287+20*bite-27*roar);c.rotate(.03+bite*.18-roar*.2);
  part('lower-jaw',24,11,207,.07+.42*bite+.55*roar);part('upper-skull',0,0,311,-.13*bite-.12*roar);c.restore();
  if(p.slow>0)a.sprite(c,'fx/steel-net',2,-20,235);
  if(roar>.2){c.strokeStyle='#ffe69f';c.lineWidth=4;c.globalAlpha=swing*.8;
    for(let i=0;i<3;i++){c.beginPath();c.arc(270,-280,75+i*44+progress*65,-.75,.75);c.stroke()}}
  c.restore();
}
function heroRig(c,a,e){
  c.save();c.translate(e.x,e.y);c.scale(e.dir,1);
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
export class Renderer {
  constructor(canvas,art){
    this.canvas=canvas;this.c=canvas.getContext('2d',{alpha:false});this.art=art;this.stale=true;
    this.motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
    const mark=()=>{this.stale=true};addEventListener('resize',mark);
    if(typeof ResizeObserver==='function')new ResizeObserver(mark).observe(canvas);
  }
  // Layout is only read when the canvas actually changes size, not every frame.
  measure(){
    const canvas=this.canvas,w=canvas.clientWidth,h=canvas.clientHeight;this.w=w;this.h=h;if(!w||!h)return;
    // Cap the backing store near 2560x1440 so 4K and high-density screens stay fast.
    let dpr=Math.min(2,devicePixelRatio||1);const over=w*h*dpr*dpr/3.7e6;if(over>1)dpr/=Math.sqrt(over);
    const bw=Math.max(1,Math.round(w*dpr)),bh=Math.max(1,Math.round(h*dpr));
    if(canvas.width!==bw||canvas.height!==bh){canvas.width=bw;canvas.height=bh}
    // High quality resizing happens once; bilinear sampling keeps moving sprites cheap.
    this.c.imageSmoothingEnabled=true;this.c.imageSmoothingQuality='low';
    this.bw=bw;this.bh=bh;this.scale=Math.min(w/1000,h/1080);
    const view=w/this.scale,logicalH=h/this.scale,floor=Math.min(logicalH*.82,logicalH*.55+285);
    const sx=bw/w*this.scale,sy=bh/h*this.scale;
    const surface=(width,height)=>{
      const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.ceil(width*sx));canvas.height=Math.max(1,Math.ceil(height*sy));
      const c=canvas.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';return {canvas,c};
    };
    const sky=this.art.images.get('backgrounds/sky'),skyScale=Math.max(view/sky.width,(floor+5)/sky.height);
    const skyW=view/skyScale,skyH=(floor+5)/skyScale,backdrop=surface(view,floor+5);
    backdrop.c.drawImage(sky,(sky.width-skyW)/2,sky.height-skyH,skyW,skyH,0,0,backdrop.canvas.width,backdrop.canvas.height);
    this.sky=backdrop.canvas;this.backgrounds=new Map();
    for(const [name,width,height] of [['far-city',1750,323],['mid-city',1800,269],['street',1750,235]]){
      const layer=surface(width,height);layer.c.drawImage(this.art.images.get('backgrounds/'+name),0,0,layer.canvas.width,layer.canvas.height);
      this.backgrounds.set(name,layer.canvas);
    }
    this.stale=false;
  }
  render(g){
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
    tile('far-city',.16,-485,323,1750);districtScenery(c,g.level.setting,cam,view);
    tile('mid-city',.48,-334,269,1800);
    if(g.index){c.fillStyle='rgba(43,23,64,'+g.index*.105+')';c.fillRect(-20,-floor-20,view+40,floor+30)}
    c.fillStyle='#232e31';c.fillRect(-30,-64,view+60,logicalH-floor+130);
    tile('street',1,-66,235,1750);
    // Continue the asphalt into tall viewports without stretching the curb artwork.
    const roadFade=c.createLinearGradient(0,125,0,170);
    roadFade.addColorStop(0,'#232e3100');roadFade.addColorStop(1,'#232e31');
    c.fillStyle=roadFade;c.fillRect(-30,125,view+60,Math.max(45,logicalH-floor-125));
    c.translate(-cam,0);const visible=(x,pad=450)=>x>=cam-pad&&x<=cam+view+pad;
    for(const b of g.buildings){
      if(!visible(b.x,b.width))continue;
      for(const [i,m] of b.modules.entries()){
        const state=moduleState(m),path='buildings/ruko-01/'+(state==='intact'?'colors/'+m.type+'-'+b.color:'damage/'+m.type+'-'+state);
        let y=m.y;if(!m.hp){const support=b.modules.slice(0,i).filter(v=>!v.hp).reduce((n,v)=>n+v.h,0);y+=support*(1-(m.fall/.6)**2)-i*5}
        a.part(c,path,b.x,y,b.width*984/960);
      }
    }
    for(const prop of g.level.props){if(visible(prop.x))a.sprite(c,'props/'+prop.type,prop.x,-46,propWidths[prop.type])}
    const shadow=(x,y,w)=>{c.fillStyle='#0c211e51';c.beginPath();c.ellipse(x,y,w,Math.max(5,w*.07),0,0,Math.PI*2);c.fill()};
    for(const e of g.enemies){if(!visible(e.x))continue;
      shadow(e.x,0,e.hero?67:50);c.save();
      if(e.hit>0&&!reduced)c.translate(-e.dir*Math.sin(clamp(e.hit/.2,0,1)*Math.PI)*4,0);
      if(e.hero)heroRig(c,a,e);
      else if(e.type==='turret'){
        c.save();c.translate(e.x,0);c.fillStyle='#172d2a';c.beginPath();c.moveTo(-38,0);c.lineTo(0,-54);c.lineTo(38,0);c.fill();
        a.sprite(c,'characters/heroes/jaring/parts/net-launcher',0,-39,87,e.dir);c.restore();
      }else if(e.type==='jeep'||e.type==='helicopter'){
        a.sprite(c,'characters/soldiers/'+e.type,e.x,e.y-e.lift,e.type==='jeep'?240:285,e.dir,e.lift*.003);
      }else{
        const base='characters/soldiers/'+e.type+'/frames/',frame=e.frame||(e.type==='infantry'?'aim':'kneeling-fire');
        const bob=Math.sin(e.walk)**2*e.stride*2;
        a.blend(c,base+(e.fromFrame||frame),base+frame,e.frameMix??1,e.x,-e.lift-bob,97,e.dir);
      }c.restore();
      if(e.mode==='aim'||e.mode==='recover'){c.fillStyle=e.mode==='aim'?'#ffd477':'#a8f2d7';c.font='bold 26px monospace';c.fillText(e.mode==='aim'?'!':'…',e.x-7,e.y-180)}
    }
    shadow(g.rex.x-15,2,212);c.save();
    if(g.rex.hit>0&&!reduced)c.translate(-g.rex.dir*Math.sin(clamp(g.rex.hit/.18,0,1)*Math.PI)*5,0);
    rexRig(c,a,g.rex,t,reduced);c.restore();
    for(const civ of g.civilians){
      if(!visible(civ.x,180))continue;
      const base='characters/civilians/'+civ.type+'/frames/',frame=civ.frame||'run-a';
      a.blend(c,base+(civ.fromFrame||frame),base+frame,civ.frameMix??1,civ.x,civ.lane-Math.sin(civ.walk)**2*3,civ.type==='bakso-vendor'?150:85,civ.dir);
    }
    for(const s of g.shots){const path=s.type==='net'?'net-capsule':s.type;a.sprite(c,'fx/projectiles/frames/'+path,s.x,s.y,s.type==='bullet'?37:72,1,Math.atan2(s.vy,s.vx))}
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
    }c.restore();
  }
}
