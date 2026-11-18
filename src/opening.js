const scenes = [
  ['Suatu malam, sesuatu jatuh dari langit.', ['meteor']],
  ['Benda itu menghantam hutan di pinggir kota.', ['stomp', 'collapse']],
  ['Di dasar kawah itu bukan batu. Sebutir telur.', ['steam', 'step', 'step']],
  ['Lalu ia menetas.', ['crack', 'chirp']],
  ['Hutan menjadi rumahnya. Ia belajar berburu.', ['chirp', 'chirp', 'roar']],
  ['Ia tumbuh besar. Hutan tidak lagi cukup.', ['stomp', 'stomp', 'roar', 'panic']],
  ['Dan di kejauhan, ia melihat kota.', ['steam', 'growl']]
];

export function playOpening(section, sound) {
  const page = section.querySelector('.comic-page');
  let image;
  const caption = section.querySelector('.comic-caption');
  const skip = section.querySelector('button');
  const timers = [];
  let index = 0;
  let ended = false;
  page.replaceChildren();
  caption.textContent = '';
  section.hidden = false;
  skip.focus();
  return new Promise(resolve => {
    function finish() {
      if (ended) return;
      ended = true;
      timers.forEach(clearTimeout);
      image.onload = image.onerror = null;
      section.classList.add('closing');
      setTimeout(() => {
        section.hidden = true;
        section.classList.remove('closing');
        skip.onclick = null;
        resolve();
      }, 1000);
    }
    function next() {
      if (index === scenes.length) return finish();
      const [line, cues] = scenes[index++];
      image = new Image();
      image.alt = line;
      const frame = document.createElement('figure');
      frame.dataset.scene = index;
      frame.append(image);
      image.onload = () => {
        if (index === 4) page.replaceChildren();
        page.append(frame);
        caption.textContent = line;
        cues.forEach((cue, i) => timers.push(setTimeout(() => sound.play(cue), i * 520)));
        timers.push(setTimeout(next, 3600));
      };
      image.onerror = next;
      image.src = './assets/story/opening-0' + index + '.webp';
    }
    skip.onclick = finish;
    next();
  });
}
