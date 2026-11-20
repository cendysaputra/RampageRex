// Daftar suara
const sounds={
  meteor:[180,1650,1.8,.055,'triangle'],steam:[520,90,1.3,.025,'sawtooth'],
  chirp:[760,1450,.18,.045,'sine'],growl:[82,28,1.7,.09,'sawtooth'],
  step:[49,26,.08,.055,'sine'],bite:[160,49,.14,.085,'sawtooth'],
  tail:[190,52,.16,.07,'triangle'],stomp:[94,28,.25,.16,'sine'],roar:[113,33,.64,.13,'sawtooth'],
  collapse:[110,23,.42,.09,'sawtooth'],crack:[142,41,.085,.07,'square'],
  panic:[480,830,.13,.027,'triangle'],shot:[335,68,.055,.035,'square'],
  launch:[240,52,.18,.05,'triangle'],alarm:[270,410,.23,.075,'square'],
  ulti:[62,180,1.02,.16,'sawtooth'],heroUlti:[330,880,.9,.12,'square']
};
// Pemutar suara
export class Sound {
  constructor(){this.enabled=true;this.volume=1;this.last=new Map()}
  // Aktifkan audio
  unlock(){try{this.ctx??=new (window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{})}catch{}}
  // Putar suara
  play(key){
    if(!this.enabled||this.volume<=0||!this.ctx||this.ctx.state!=='running'||!sounds[key])return;
    const t=this.ctx.currentTime;if(t-(this.last.get(key)??-1)<.055)return;this.last.set(key,t);
    const [f,end,dur,vol,type]=sounds[key],o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;
    o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(end,t+dur);
    g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(Math.max(.001,vol*this.volume),t+.009);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    o.connect(g).connect(this.ctx.destination);o.start(t);o.stop(t+dur+.02);o.onended=()=>{o.disconnect();g.disconnect()};
  }
}
