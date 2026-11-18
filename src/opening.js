// Daftar adegan
const scenes = [
  ['Suatu malam, sesuatu jatuh dari langit.', ['meteor']],
  ['Benda itu menghantam hutan di pinggir kota.', ['stomp', 'collapse']],
  ['Di dasar kawah itu bukan batu. Sebutir telur.', ['steam', 'step', 'step']],
  ['Lalu ia menetas.', ['crack', 'chirp']],
  ['Hutan menjadi rumahnya. Ia belajar berburu.', ['chirp', 'chirp', 'roar']],
  ['Ia tumbuh besar. Hutan tidak lagi cukup.', ['stomp', 'stomp', 'roar', 'panic']],
  ['Dan di kejauhan, ia melihat kota.', ['steam', 'growl']]
];
// Durasi adegan
const HOLD = 3600;
// Akhir halaman
const TURN = 3;

// Putar pembuka
export function playOpening(section, sound) {
  const page = section.querySelector('.comic-page');
  const caption = section.querySelector('.comic-caption');
  const skip = section.querySelector('button');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const timers = [];
  let index = 0;
  let ended = false;
  let current = null;
  // Muat berurutan
  const loads = [];
  scenes.forEach((_, i) => {
    loads.push((loads[i - 1] || Promise.resolve()).then(() => {
      const image = new Image();
      image.decoding = 'async';
      image.src = './assets/story/opening-0' + (i + 1) + '.webp';
      return image.decode().then(() => image, () => null);
    }));
  });
  const later = (run, delay) => timers.push(setTimeout(run, delay));
  // Arah kamera
  function focus(frame) {
    current = frame;
    if (calm || !frame) {
      page.style.transform = '';
      return;
    }
    const scale = Math.min(section.clientWidth * .94 / frame.offsetWidth, section.clientHeight * .74 / frame.offsetHeight, 2.4);
    const x = page.offsetWidth / 2 - frame.offsetLeft - frame.offsetWidth / 2;
    const y = page.offsetHeight / 2 - frame.offsetTop - frame.offsetHeight / 2;
    page.style.transform = `translate(${x * scale}px,${y * scale}px) scale(${scale})`;
  }
  const refit = () => focus(current);
  page.replaceChildren();
  page.classList.remove('turning');
  page.style.transform = '';
  caption.textContent = '';
  section.hidden = false;
  skip.focus();
  addEventListener('resize', refit);
  return new Promise(resolve => {
    // Tutup pembuka
    function finish() {
      if (ended) return;
      ended = true;
      timers.forEach(clearTimeout);
      removeEventListener('resize', refit);
      section.classList.add('closing');
      setTimeout(() => {
        section.hidden = true;
        section.classList.remove('closing');
        page.replaceChildren();
        page.style.transform = '';
        skip.onclick = null;
        resolve();
      }, 1000);
    }
    // Ganti halaman
    function turn() {
      focus(null);
      later(() => {
        page.classList.add('turning');
        if (!calm) page.style.transform = 'translateX(-8%) scale(.94)';
        later(() => {
          page.replaceChildren();
          next();
        }, 450);
      }, 1500);
    }
    // Tampilkan panel
    function show(image) {
      const [line, cues] = scenes[index++];
      const frame = document.createElement('figure');
      const cel = document.createElement('span');
      image.alt = line;
      cel.className = 'cel';
      cel.append(image);
      frame.dataset.scene = index;
      frame.append(cel);
      page.classList.remove('turning');
      page.append(frame);
      focus(frame);
      caption.textContent = line;
      if (!calm) caption.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'ease-out' });
      cues.forEach((cue, i) => later(() => sound.play(cue), i * 520));
      later(index === TURN ? turn : next, HOLD);
    }
    // Panel berikut
    function next() {
      if (index === scenes.length) return finish();
      loads[index].then(image => {
        if (ended) return;
        if (image) return show(image);
        index++;
        next();
      });
    }
    skip.onclick = finish;
    next();
  });
}
