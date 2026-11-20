// Layar kredit: hitam, teks muncul pelan, lalu memudar sebelum opening
const SHOW = 2300, FADE = 700;

// Tunggu sampai waktu habis atau pemain melewati
function wait(ms, skip) {
  return new Promise(resolve => {
    const timer = setTimeout(done, ms);
    function done() { clearTimeout(timer); skip.signal.removeEventListener('abort', done); resolve(); }
    skip.signal.addEventListener('abort', done, { once: true });
  });
}

// Putar kredit
export async function playCredit(node) {
  const skip = new AbortController();
  const pass = event => { if (event.type === 'pointerdown' || ['Escape', 'Enter', 'Space'].includes(event.code)) skip.abort(); };
  node.hidden = false;node.classList.remove('leaving');
  void node.offsetWidth;node.classList.add('showing');
  node.addEventListener('pointerdown', pass);document.addEventListener('keydown', pass);
  await wait(SHOW, skip);
  node.classList.replace('showing', 'leaving');
  await wait(FADE, new AbortController());
  node.removeEventListener('pointerdown', pass);document.removeEventListener('keydown', pass);
  node.hidden = true;node.classList.remove('leaving');
}
