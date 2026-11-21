// Nada ke frekuensi
const steps={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
export function noteFreq(name){
  const m=/^([A-G])(#|b)?(\d)$/.exec(name);if(!m)return 0;
  const midi=12*(+m[3]+1)+steps[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0);
  return 440*2**((midi-69)/12);
}
// Baca baris nada
export function parseBar(text){
  const tokens=text.trim().split(/\s+/),notes=[];
  tokens.forEach((token,i)=>{
    if(token==='.'||token==='-')return;
    let len=1;while(tokens[i+len]==='-')len++;
    notes.push({step:i,note:token,len});
  });
  return notes;
}

// Lagu menu
export const songs={
  menu:{
    bpm:138,
    // Akor per birama
    chords:[['A2','A','C','E'],['F2','F','A','C'],['C3','C','E','G'],['G2','G','B','D'],['A2','A','C','E'],['F2','F','A','C'],['G2','G','B','D'],['E2','E','G#','B']],
    lead:[
      'A4 . C5 . E5 . A5 - - - G5 . E5 . C5 .',
      'D5 . C5 . A4 - - - . . F4 . A4 . C5 .',
      'E5 . G5 . E5 . C5 - - - D5 . E5 . G5 .',
      'B5 - - - A5 . G5 . D5 - - - . . . .',
      'A5 . A5 . G5 . E5 . A5 - - - C6 . B5 .',
      'A5 . F5 . C5 - - - F5 . A5 . C6 . A5 .',
      'B5 . G5 . D5 . G5 . B5 - - - D6 . B5 .',
      'G#5 - - - E5 . B4 . E5 - - - . . . .'
    ],
    // Pola drum
    kick:[0,8,11],snare:[4,12],hat:[0,2,4,6,8,10,12,14],fill:[12,13,14,15]
  },
  // Lagu bertarung
  battle:{
    bpm:160,
    chords:[['D2','D','F','A'],['D2','D','F','A'],['Bb1','Bb','D','F'],['C2','C','E','G'],['D2','D','F','A'],['D2','D','F','A'],['Bb1','Bb','D','F'],['A1','A','C#','E'],
      ['G1','G','Bb','D'],['G1','G','Bb','D'],['D2','D','F','A'],['D2','D','F','A'],['Bb1','Bb','D','F'],['C2','C','E','G'],['A1','A','C#','E'],['A1','A','C#','E']],
    lead:[
      'D5 . D5 . F5 . D5 . A5 - G5 . F5 . E5 .',
      'D5 . D5 . F5 . A5 . D6 - - - C6 . A5 .',
      'Bb5 . A5 . F5 . D5 . Bb4 - - - D5 . F5 .',
      'E5 . G5 . C6 . G5 . E5 - - - . . . .',
      'D5 . D5 . F5 . D5 . A5 - G5 . F5 . E5 .',
      'D5 . D5 . F5 . A5 . D6 - - - F6 . E6 .',
      'D6 . Bb5 . F5 . Bb5 . D6 - C6 . Bb5 . A5 .',
      'C#6 - - - A5 . E5 . C#5 - - - . . . .',
      'G5 - - - Bb5 - - - D6 - - - Bb5 . G5 .',
      'A5 . Bb5 . A5 . G5 . F5 - - - G5 . A5 .',
      'D6 - - - A5 - - - F5 - - - A5 . D6 .',
      'C6 . A5 . F5 . D5 . E5 . F5 . A5 - - -',
      'Bb5 . Bb5 . A5 . F5 . D5 . F5 . Bb5 . D6 .',
      'C6 . C6 . G5 . E5 . C5 . E5 . G5 . C6 .',
      'C#6 . E6 . C#6 . A5 . E5 . A5 . C#6 . E6 .',
      'A5 - - - . . . . E5 . E5 . A4 . . .'
    ],
    kick:[0,3,8,10],snare:[4,12],hat:[0,2,4,6,8,10,12,14],fill:[12,13,14,15]
  },
  // Lagu bos
  boss:{
    bpm:128,
    chords:[['E2','E','G','B'],['E2','E','G','B'],['F2','F','A','C'],['E2','E','G','B'],['E2','E','G','B'],['E2','E','G','B'],['C2','C','E','G'],['B1','B','D#','F#']],
    lead:[
      'E5 - - - . . E5 . G5 - - - F#5 - - -',
      'E5 - - - . . B4 . E5 . F5 . E5 - - -',
      'F5 - - - . . F5 . Ab5 - - - G5 - - -',
      'E5 - - - - - - - . . . . B4 . E5 .',
      'B5 . B5 . A5 . G5 . F#5 . G5 . A5 . B5 .',
      'C6 - - - B5 - - - G5 - - - E5 - - -',
      'C6 . B5 . A5 . G5 . E5 . G5 . C6 . E6 .',
      'D#6 - - - B5 - - - F#5 - - - D#5 - - -'
    ],
    kick:[0,2,8,10],snare:[4,12],hat:[0,2,4,6,8,10,12,14],fill:[8,10,12,13,14,15]
  }
};

// Pemutar musik
export class Music {
  constructor(sound){this.sound=sound;this.volume=.6;this.duck=1;this.tempo=1;this.song=null;this.timer=0;this.step=0;this.next=0}
  // Lagu yang diminta
  want(name){
    const ctx=this.sound.ctx,on=name&&this.sound.enabled&&this.volume>0&&ctx?.state==='running'&&!document.hidden;
    if(on&&this.song!==songs[name])this.start(songs[name]);
    else if(!on&&this.song)this.stop();
    const level=this.volume*this.duck;if(this.bus&&this.level!==level){this.level=level;this.bus.gain.setTargetAtTime(level*.8,ctx.currentTime,.05)}
  }
  // Mulai lagu
  start(song){
    const ctx=this.sound.ctx;this.stop();
    this.song=song;this.step=0;this.next=ctx.currentTime+.08;
    this.level=this.volume*this.duck;this.bus=ctx.createGain();this.bus.gain.value=this.level*.8;
    const tone=ctx.createBiquadFilter();tone.type='lowpass';tone.frequency.value=5200;this.bus.connect(tone).connect(ctx.destination);this.tone=tone;
    this.noise??=this.makeNoise(ctx);
    this.timer=setInterval(()=>this.tick(),25);this.tick();
  }
  // Hentikan lagu
  stop(){
    clearInterval(this.timer);this.timer=0;this.song=null;
    const bus=this.bus,tone=this.tone,ctx=this.sound.ctx;this.bus=this.tone=null;
    if(bus&&ctx){bus.gain.setTargetAtTime(0,ctx.currentTime,.08);setTimeout(()=>{bus.disconnect();tone.disconnect()},600)}
  }
  // Jadwalkan nada
  tick(){
    const ctx=this.sound.ctx,song=this.song;if(!song||!ctx)return;
    const step=60/(song.bpm*this.tempo)/4;
    // Kejar ketinggalan
    if(this.next<ctx.currentTime-.05)this.next=ctx.currentTime+.05;
    while(this.next<ctx.currentTime+.15){this.play(song,this.step,this.next,step);this.step=(this.step+1)%(song.lead.length*16);this.next+=step}
  }
  // Satu langkah
  play(song,index,t,step){
    const bar=Math.floor(index/16),s=index%16,[root,...chord]=song.chords[bar];
    song.parsed??=song.lead.map(parseBar);
    for(const n of song.parsed[bar])if(n.step===s)this.voice('square',noteFreq(n.note),t,n.len*step*.92,.05,true);
    // Bas melompat
    if(s%2===0){const low=noteFreq(root),up=s%4===2;this.voice('triangle',up?low*2:low,t,step*1.7,.11)}
    // Arpeggio
    const octave=bar%2?5:4,arp=chord[(s%4===3?1:s%4)%chord.length];
    this.voice('square',noteFreq(arp+octave),t,step*.5,.018);
    // Drum
    const last=bar===song.chords.length-1;
    if(song.kick.includes(s))this.kick(t);
    if(song.snare.includes(s)||last&&song.fill.includes(s))this.snare(t,last&&s>12?.7:1);
    if(song.hat.includes(s))this.hat(t,s%4===2?.05:.03);
  }
  // Suara nada
  voice(type,freq,t,dur,vol,lead=false){
    const ctx=this.sound.ctx,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);
    // Vibrato panjang
    if(lead&&dur>.3){const lfo=ctx.createOscillator(),depth=ctx.createGain();lfo.frequency.value=5.5;depth.gain.setValueAtTime(0,t);depth.gain.linearRampToValueAtTime(freq*.012,t+dur);lfo.connect(depth).connect(o.frequency);lfo.start(t);lfo.stop(t+dur+.05)}
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.006);g.gain.exponentialRampToValueAtTime(vol*.6,t+Math.min(dur,.12));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g).connect(this.bus);o.start(t);o.stop(t+dur+.02);o.onended=()=>{o.disconnect();g.disconnect()};
  }
  // Drum kick
  kick(t){
    const ctx=this.sound.ctx,o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';
    o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);
    g.gain.setValueAtTime(.22,t);g.gain.exponentialRampToValueAtTime(.0001,t+.16);
    o.connect(g).connect(this.bus);o.start(t);o.stop(t+.18);o.onended=()=>{o.disconnect();g.disconnect()};
  }
  // Drum snare
  snare(t,level=1){this.hiss(t,.12,1900,'bandpass',.09*level);const ctx=this.sound.ctx,o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.setValueAtTime(190,t);g.gain.setValueAtTime(.06*level,t);g.gain.exponentialRampToValueAtTime(.0001,t+.08);o.connect(g).connect(this.bus);o.start(t);o.stop(t+.1);o.onended=()=>{o.disconnect();g.disconnect()}}
  // Hi-hat
  hat(t,vol){this.hiss(t,.035,7500,'highpass',vol)}
  // Desis noise
  hiss(t,dur,freq,type,vol){
    const ctx=this.sound.ctx,src=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
    src.buffer=this.noise;f.type=type;f.frequency.value=freq;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    src.connect(f).connect(g).connect(this.bus);src.start(t,Math.random()*.5);src.stop(t+dur+.01);src.onended=()=>{src.disconnect();f.disconnect();g.disconnect()};
  }
  // Render rekaman
  async render(name,loops=1){
    const song=songs[name],step=60/song.bpm/4,total=song.lead.length*16*loops,ctx=new OfflineAudioContext(2,Math.ceil((total*step+1)*44100),44100);
    const real=this.sound;this.sound={ctx};this.bus=ctx.createGain();this.bus.gain.value=.8;const tone=ctx.createBiquadFilter();tone.type='lowpass';tone.frequency.value=5200;this.bus.connect(tone).connect(ctx.destination);
    this.noise=this.makeNoise(ctx);for(let i=0;i<total;i++)this.play(song,i%(song.lead.length*16),.05+i*step,step);
    const buffer=await ctx.startRendering();this.sound=real;this.bus=null;this.noise=null;return buffer;
  }
  // Buffer noise
  makeNoise(ctx){const buffer=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;return buffer}
}
