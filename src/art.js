import { clamp, moduleState } from './world.js';

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
    this.meta=manifest.assets;this.extension=manifest.imageFormat||'png';this.images=new Map();this.loading=new Map();
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
      const img=new Image();img.src=url;await img.decode();
      picture=document.createElement('canvas');picture.width=width;picture.height=height;
      const c=picture.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
      c.drawImage(img,crop.x,crop.y,crop.width,crop.height,0,0,width,height);
    }
    this.images.set(path,picture);
  }
  async preload(level){
    const heroes=level.bosses.map(b=>'characters/heroes/'+b.type+'/parts/');
    const paths=Object.keys(this.meta).map(k=>k.slice(0,-4)).filter(k=>
      k.startsWith('backgrounds/')||k.startsWith('buildings/')||k.startsWith('props/')||k.startsWith('characters/rex/parts/')
      ||heroes.some(h=>k.startsWith(h))||(k.includes('/frames/')&&!k.startsWith('ui/'))||['characters/soldiers/helicopter','characters/soldiers/jeep','fx/steel-net'].includes(k));
    let cursor=0;
    await Promise.all(Array.from({length:8},async()=>{while(cursor<paths.length)await this.load(paths[cursor++])}));
  }
  part(c,path,x,y,width,angle=0){
    const im=this.images.get(path);if(!im)return;
    const m=this.meta[path+'.png'],crop=this.crops.get(path),s=width/m.width;
    c.save();c.translate(x,y);c.rotate(angle);c.drawImage(im,(crop.x-m.pivot[0])*s,(crop.y-m.pivot[1])*s,crop.width*s,crop.height*s);c.restore();
  }
  sprite(c,path,x,y,width,dir=1,angle=0){
    const im=this.images.get(path);if(!im)return;
    c.save();c.translate(x,y);c.scale(dir,1);this.part(c,path,0,0,width,angle);c.restore();
  }
}

function rexRig(c,a,p,t){
  const action=p.attack,progress=action?clamp(action.age/action.duration,0,1):0;
  const swing=Math.sin(progress*Math.PI),bite=action?.key==='bite'?swing:0,tail=action?.key==='tail'?swing:0,
    stomp=action?.key==='stomp'?swing:0,roar=action?.key==='roar'?swing:0;
  const step=Math.sin(p.walk)*p.stride;
  c.save();c.translate(p.x,0);c.scale(p.dir,1);c.translate(0,-3*Math.sin(t*2)-Math.abs(step)*5-stomp*12);
  const part=(name,x,y,w,r=0)=>a.part(c,'characters/rex/parts/'+name,x,y,w,r);
  function leg(side,x,phase){
    c.save();c.translate(x,-146);c.rotate(phase*.23);
    part(side+'-leg',0,0,163);part(side+'-foot',-5,101,125,-phase*.18);c.restore();
  }
  leg('far',45,-step);part('far-arm',101,-226,77,-bite*.2);
  c.save();c.translate(-90,-165);c.rotate(.11+Math.sin(t*2.5)*.04+tail*.62);
  c.save();c.translate(-137,16);c.rotate(.025+Math.sin(t*2.5-.6)*.025);
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
function heroRig(c,a,e,t){
  c.save();c.translate(e.x,e.y);c.scale(e.dir,1);
  const stride=e.mode==='charge'?Math.sin(t*22):e.mode==='approach'?Math.sin(t*6)*.45:0;
  const part=(name,x,y,w,r=0)=>a.part(c,'characters/heroes/'+e.type+'/parts/'+name,x,y,w,r);
  c.rotate(e.mode==='charge'?.18:e.mode==='recover'?-.14:e.mode==='dive'?.45:0);
  if(e.type==='perisai')part('cape',-10,-125,61,.08*stride);
  if(e.type==='rajawali')part('jetpack',-19,-107,66);
  function leg(side,x,s){c.save();c.translate(x,-67);c.rotate(s*.29);part(side+'-thigh',0,0,31);part(side+'-shin',-2,27,38,-s*.22);c.restore()}
  leg('far',12,-stride);leg('near',-10,stride);part('far-upper-arm',12,-129,32);part('far-forearm',16,-103,34);
  part('torso',0,-87,67);if(e.type==='jaring')part('tool-belt',2,-80,59);
  part('head',2,-135,57,-.04*stride);part('near-upper-arm',-12,-127,35,-stride*.18);
  part('near-forearm',-13,-99,41,-.28);
  if(e.type==='perisai')part('shield',21,-94,57,e.mode==='recover'?.7:0);
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
    this.c.imageSmoothingEnabled=true;this.c.imageSmoothingQuality='high';
    this.bw=bw;this.bh=bh;this.scale=Math.min(w/1000,h/1080);this.stale=false;
  }
  render(g){
    if(this.stale)this.measure();
    const c=this.c,a=this.art,{w,h,bw,bh,scale}=this;if(!w||!h)return;
    const view=w/scale,logicalH=h/scale;
    g.view=view;c.setTransform(bw/w*scale,0,0,bh/h*scale,0,0);
    const cam=g.camera,t=g.time,floor=Math.min(logicalH*.82,logicalH*.55+285);
    c.fillStyle='#c97461';c.fillRect(0,0,view,logicalH);
    c.drawImage(a.images.get('backgrounds/sky'),0,0,view,floor+5);
    c.save();c.translate(0,floor);if(g.shake>0)c.translate(Math.sin(t*66)*g.shake,Math.cos(t*78)*g.shake*.55);
    const tile=(name,ratio,top,height,width)=>{
      const im=a.images.get('backgrounds/'+name);for(let x=-(cam*ratio%width)-width;x<view+width;x+=width)c.drawImage(im,x,top,width+1,height)
    };
    tile('far-city',.16,-485,323,1750);districtScenery(c,g.level.setting,cam,view);
    tile('mid-city',.48,-334,269,1800);
    if(g.index){c.fillStyle='rgba(43,23,64,'+g.index*.105+')';c.fillRect(-20,-floor-20,view+40,floor+30)}
    c.fillStyle='#232e31';c.fillRect(-30,-64,view+60,logicalH-floor+130);
    tile('street',1,-66,Math.max(235,logicalH-floor+80),1750);
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
      shadow(e.x,0,e.hero?67:50);c.save();if(e.hit>0)c.globalAlpha=.7;
      if(e.hero)heroRig(c,a,e,t);
      else if(e.type==='turret'){
        c.save();c.translate(e.x,0);c.fillStyle='#172d2a';c.beginPath();c.moveTo(-38,0);c.lineTo(0,-54);c.lineTo(38,0);c.fill();
        a.sprite(c,'characters/heroes/jaring/parts/net-launcher',0,-39,87,e.dir);c.restore();
      }else if(e.type==='jeep'||e.type==='helicopter'){
        a.sprite(c,'characters/soldiers/'+e.type,e.x,e.y-e.lift,e.type==='jeep'?240:285,e.dir,e.lift*.003);
      }else{
        const dist=Math.abs(e.x-g.rex.x);const moving=Math.abs(dist-(e.type==='bazooka'?510:350))>85;
        const frame=e.stun>0?'knockback':!moving?(e.type==='infantry'?'aim':'kneeling-fire'):Math.sin(t*13+e.phase)>0?'run-a':'run-b';
        a.sprite(c,'characters/soldiers/'+e.type+'/frames/'+frame,e.x,-e.lift,97,e.dir);
      }c.restore();
      if(e.mode==='aim'||e.mode==='recover'){c.fillStyle=e.mode==='aim'?'#ffd477':'#a8f2d7';c.font='bold 26px monospace';c.fillText(e.mode==='aim'?'!':'…',e.x-7,e.y-180)}
    }
    shadow(g.rex.x-15,2,212);c.save();if(g.rex.hit>.13)c.globalAlpha=.83;rexRig(c,a,g.rex,t);c.restore();
    for(const civ of g.civilians){
      const phase=Math.floor((t+civ.phase)*7)%12,frame=phase===6?'look-back':phase===11?'stumble':phase%2?'run-a':'run-b';
      a.sprite(c,'characters/civilians/'+civ.type+'/frames/'+frame,civ.x,civ.lane+Math.sin(t*15+civ.phase)*2,civ.type==='bakso-vendor'?150:85,civ.dir);
    }
    for(const s of g.shots){const path=s.type==='net'?'net-capsule':s.type;a.sprite(c,'fx/projectiles/frames/'+path,s.x,s.y,s.type==='bullet'?37:72,1,Math.atan2(s.vy,s.vx))}
    for(const f of g.effects){
      const key=f.kind==='dust'?'dust/frames/'+(f.life>.3?'puff':'expanding'):f.kind==='explosion'?'explosion/frames/'+(f.life>.27?'burst':'embers'):'debris/frames/'+(f.kind==='decor'?'shutter':f.seed>.5?'brick':'plaster');
      c.save();c.globalAlpha=clamp(f.life*3,0,1);a.sprite(c,'fx/'+key,f.x,f.y,f.size,1,f.kind==='dust'?0:f.spin*(f.max-f.life));c.restore();
    }c.restore();
  }
}
