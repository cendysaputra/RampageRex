import { t } from './i18n.js';

// Langkah tutorial
export const steps = [
  { key: 'Tekan D atau → untuk berjalan.', touch: 'Tekan ▶ untuk berjalan.',
    done: (w, t) => w.rex.x - t.startX > 300 },
  { key: 'Gigit bangunan: tekan W atau klik kiri.', touch: 'Gigit bangunan: tekan Gigit.',
    done: (w, t) => t.used.has('bite') && w.lost > 0 },
  { key: 'Runtuhkan lantai dasar dengan Injak: tekan S.', touch: 'Runtuhkan lantai dasar dengan Injak.',
    done: w => w.buildings.some(b => b.modules[0].hp <= 0) },
  { key: 'Tentara datang! Lempar mereka dengan ekor: Q atau klik kanan.', touch: 'Tentara datang! Lempar mereka dengan Ekor.',
    enter: w => { w.spawnTime = Math.min(w.spawnTime, .2); },
    done: (w, t) => t.used.has('tail') },
  { key: 'Terkepung? Tekan Spasi untuk lompat: kebal di udara, musuh terpaku saat mendarat.',
    touch: 'Terkepung? Tekan Lompat: kebal di udara, musuh terpaku saat mendarat.',
    enter: w => { w.rex.cd.jump = 0; },
    done: (w, t) => t.landed },
  { key: 'Ulti siap! Tekan R untuk Amukan Rex.', touch: 'Ulti siap! Tekan Ulti untuk Amukan Rex.',
    enter: w => { w.rex.cd.ulti = 0; },
    done: (w, t) => t.used.has('ulti') }
];
// Langkah tanpa tentara
const CALM = 3;

// Pemandu tutorial
export class Tutorial {
  constructor(world) {
    this.step = 0; this.startX = world.rex.x; this.used = new Set(); this.landed = false; this.finished = false;
  }
  // Perbarui langkah
  update(world) {
    if (this.finished) return;
    const action = world.rex.attack;
    if (action) {
      this.used.add(action.key);
      if (action.key === 'jump' && action.done) this.landed = true;
    }
    // Tahan tentara
    if (this.step < CALM) world.spawnTime = Math.max(world.spawnTime, .5);
    if (!steps[this.step].done(world, this)) return;
    this.step++;
    if (this.step >= steps.length) { this.finished = true; return; }
    steps[this.step].enter?.(world);
  }
  // Teks langkah
  text(touch) {
    return t(this.finished ? 'Tutorial selesai! Ratakan 100% kota.' : steps[this.step][touch ? 'touch' : 'key']);
  }
  // Nomor langkah
  label() {
    return this.finished ? t('Selesai') : (this.step + 1) + '/' + steps.length;
  }
}
