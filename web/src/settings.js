import { difficulties } from './world.js';

// Kunci simpanan
const KEY = 'rex.settings';
export const padSizes = { s: 'Kecil', m: 'Sedang', l: 'Besar' };
export const defaults = { sfx: 80, vibrate: true, pad: 'm', difficulty: 'normal' };

// Baca pengaturan
export function loadSettings(storage = globalThis.localStorage) {
  let data = {};
  try { data = JSON.parse(storage.getItem(KEY)) || {}; } catch {}
  const sfx = Number(data.sfx);
  return {
    sfx: Number.isFinite(sfx) ? Math.max(0, Math.min(100, Math.round(sfx))) : defaults.sfx,
    vibrate: typeof data.vibrate === 'boolean' ? data.vibrate : defaults.vibrate,
    pad: data.pad in padSizes ? data.pad : defaults.pad,
    difficulty: data.difficulty in difficulties ? data.difficulty : defaults.difficulty
  };
}

// Simpan pengaturan
export function saveSettings(settings, storage = globalThis.localStorage) {
  try { storage.setItem(KEY, JSON.stringify(settings)); } catch {}
}

// Pola getaran
const patterns = { hurt: 20, collapse: 35, stomp: 25, ulti: [40, 30, 90], heroUlti: 60 };
let lastBuzz = 0;
// Getarkan perangkat
export function buzz(settings, event) {
  const pattern = patterns[event];
  if (!pattern || !settings.vibrate || typeof navigator === 'undefined' || !navigator.vibrate) return;
  const now = performance.now();
  if (now - lastBuzz < 120) return;
  lastBuzz = now;
  try { navigator.vibrate(pattern); } catch {}
}
