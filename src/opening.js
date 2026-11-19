// Daftar adegan
// cam: [x%, y%, zoom] awal dan akhir; layers: kedalaman parallax tiap lapis, move = geser sendiri (%)
const scenes = [
  { line: 'Suatu malam, sesuatu jatuh dari langit.', cues: ['meteor'], enter: 'fade',
    cam: [[-3, 1, 1], [3, -1, 1.05]], layers: { bg: .25, mid: .6, fg: { depth: 1, move: [16, 12] } } },
  { line: 'Benda itu menghantam hutan di pinggir kota.', cues: ['stomp', 'collapse'], enter: 'flash', quake: [0],
    cam: [[0, 0, 1.14], [0, 0, 1]], layers: { bg: .3, mid: .7, fg: 1.3 } },
  { line: 'Di dasar kawah itu bukan batu. Sebutir telur.', cues: ['steam', 'step', 'step'], enter: 'fade', glow: true,
    cam: [[0, -2, 1], [0, 1, 1.1]], layers: { bg: .25, mid: .6, fg: 1 } },
  { line: 'Lalu ia menetas.', cues: ['crack', 'chirp'], enter: 'pop',
    cam: [[0, 0, 1.08], [0, 0, 1]], layers: { bg: .3, mid: .8, fg: { depth: 1.2, move: [0, -3] } } },
  { line: 'Hutan menjadi rumahnya. Ia belajar berburu.', cues: ['chirp', 'chirp', 'roar'], enter: 'fade',
    cam: [[-5, 0, 1.03], [5, 0, 1.03]], layers: { bg: .2, mid: .6, fg: 1.1 } },
  { line: 'Ia tumbuh besar. Hutan tidak lagi cukup.', cues: ['stomp', 'stomp', 'roar', 'panic'], enter: 'cut', quake: [0, 520],
    cam: [[0, 3, 1], [0, -1, 1.07]], layers: { bg: .2, mid: .6, fg: 1.1 } },
  { line: 'Dan di kejauhan, ia melihat kota.', cues: ['steam', 'growl'], enter: 'fade',
    cam: [[-3, 1, 1], [3, -1, 1.12]], layers: { bg: .3, mid: .6, fg: 1 } }
];
// Durasi adegan
const HOLD = 3800;
// Lebih besar dari layar
const OVERSCAN = 1.1;
const STORY = './assets/story/';

// Muat gambar
function load(src) {
  const image = new Image();
  image.decoding = 'async';
  image.src = src;
  return image.decode().then(() => image, () => null);
}
// Daftar lapis
let layered=null;
// Muat adegan
async function loadScene(i) {
  layered ??= fetch(STORY + 'layers.json').then(r => r.ok ? r.json() : {}, () => ({})).then(d => new Set(d.layered || []));
  if ((await layered).has(i + 1)) {
    const dir = STORY + 'scene-0' + (i + 1) + '/';
    const [bg, mid, fg] = await Promise.all(['bg', 'mid', 'fg'].map(name => load(dir + name + '.webp')));
    if (bg) return { layered: true, images: { bg, mid, fg } };
  }
  const flat = await load(STORY + 'opening-0' + (i + 1) + '.webp');
  return flat && { layered: false, images: { flat } };
}

// Putar pembuka
export function playOpening(section, sound) {
  const stage = section.querySelector('.story');
  const caption = section.querySelector('.story-caption');
  const skip = section.querySelector('button');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const timers = [];
  let index = 0;
  let ended = false;
  // Muat berurutan
  const loads = [];
  scenes.forEach((_, i) => loads.push((loads[i - 1] || Promise.resolve()).then(() => loadScene(i))));
  const later = (run, delay) => timers.push(setTimeout(run, delay));
  stage.replaceChildren();
  caption.textContent = '';
  section.hidden = false;
  skip.focus();
  return new Promise(resolve => {
    // Tutup pembuka
    function finish() {
      if (ended) return;
      ended = true;
      timers.forEach(clearTimeout);
      section.classList.add('closing');
      setTimeout(() => {
        section.hidden = true;
        section.classList.remove('closing');
        stage.replaceChildren();
        skip.onclick = null;
        resolve();
      }, 1000);
    }
    // Gerak lapis
    function drift(node, depth, move = [0, 0], scene) {
      const span = HOLD + 900;
      if (calm) {
        node.style.transform = `scale(${OVERSCAN})`;
        return;
      }
      const [from, to] = scene.cam;
      const frame = ([x, y, z], t) => ({
        transform: `translate(${x * depth + move[0] * t}%,${y * depth + move[1] * t}%) scale(${OVERSCAN * (1 + (z - 1) * depth)})`
      });
      node.animate([frame(from, 0), frame(to, 1)], { duration: span, easing: 'cubic-bezier(.35,.1,.35,1)', fill: 'both' });
    }
    // Susun lapis
    function build(scene, loaded) {
      const shot = document.createElement('figure');
      shot.className = 'shot';
      shot.dataset.scene = index + 1;
      if (loaded.layered) {
        for (const [name, setting] of Object.entries(scene.layers)) {
          const image = loaded.images[name];
          if (!image) continue;
          const { depth, move } = typeof setting === 'number' ? { depth: setting } : setting;
          image.className = 'layer';
          image.alt = '';
          shot.append(image);
          drift(image, depth, move, scene);
        }
      } else {
        // Gambar tunggal
        const flat = loaded.images.flat, back = flat.cloneNode();
        back.className = 'layer backdrop';
        back.alt = '';
        flat.className = 'layer flat';
        flat.alt = '';
        shot.append(back, flat);
        drift(back, .3, undefined, scene);
        drift(flat, .7, undefined, scene);
      }
      if (scene.glow) shot.append(Object.assign(document.createElement('span'), { className: 'glow' }));
      shot.setAttribute('aria-label', scene.line);
      return shot;
    }
    // Masuk adegan
    function enter(shot, scene) {
      const old = [...stage.children];
      stage.append(shot);
      const drop = () => old.forEach(node => node.remove());
      if (calm || scene.enter === 'cut') {
        if (calm) shot.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400 }).finished.then(drop, drop);
        else drop();
      } else if (scene.enter === 'pop') {
        shot.animate([{ opacity: 0, transform: 'scale(1.06)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' }).finished.then(drop, drop);
      } else {
        shot.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, easing: 'ease-in-out' }).finished.then(drop, drop);
      }
      if (calm) return;
      if (scene.enter === 'flash') {
        const flash = Object.assign(document.createElement('span'), { className: 'flash' });
        shot.append(flash);
        flash.animate([{ opacity: .95 }, { opacity: 0 }], { duration: 700, delay: 60, easing: 'ease-out', fill: 'both' });
      }
      for (const at of scene.quake || []) later(() => stage.animate([
        { transform: 'translate(-1.4%,.8%)' }, { transform: 'translate(1.2%,-.9%)' }, { transform: 'translate(-.8%,.5%)' }, { transform: 'none' }
      ], { duration: 360 }), at + 120);
    }
    // Tampilkan adegan
    function show(loaded) {
      const scene = scenes[index];
      enter(build(scene, loaded), scene);
      index++;
      caption.textContent = scene.line;
      if (!calm) caption.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'ease-out' });
      scene.cues.forEach((cue, i) => later(() => sound.play(cue), i * 520));
      later(next, HOLD);
    }
    // Adegan berikut
    function next() {
      if (index === scenes.length) return finish();
      loads[index].then(loaded => {
        if (ended) return;
        if (loaded) return show(loaded);
        index++;
        next();
      });
    }
    skip.onclick = finish;
    next();
  });
}
