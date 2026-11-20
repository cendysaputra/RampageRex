import { difficulties } from './world.js';

// Kunci simpanan
const KEY = 'rex.settings';
export const padSizes = { s: 'Kecil', m: 'Sedang', l: 'Besar' };
// Skin Rex
export const skins = {
  merah: { label: 'Merah', stars: 0, folder: '' },
  batik: { label: 'Batik', stars: 4, folder: 'batik' },
  hutan: { label: 'Hutan', stars: 8, folder: 'hutan' },
  mecha: { label: 'Mecha', stars: 12, folder: 'mecha' }
};
// Mode grafis
export const graphics = { auto: 'Otomatis', tinggi: 'Tinggi', ringan: 'Ringan' };
// Perangkat lemah
export function weakDevice(nav = globalThis.navigator) {
  return Boolean(nav && ((nav.deviceMemory && nav.deviceMemory <= 4) || (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4)));
}
// Pakai ringan
export function useLite(settings, nav) {
  return settings.graphics === 'ringan' || (settings.graphics === 'auto' && weakDevice(nav));
}
export const defaults = { sfx: 80, vibrate: true, pad: 'm', difficulty: 'normal', skin: 'merah', graphics: 'auto' };

// Baca pengaturan
export function loadSettings(storage = globalThis.localStorage) {
  let data = {};
  try { data = JSON.parse(storage.getItem(KEY)) || {}; } catch {}
  const sfx = Number(data.sfx);
  return {
    sfx: Number.isFinite(sfx) ? Math.max(0, Math.min(100, Math.round(sfx))) : defaults.sfx,
    vibrate: typeof data.vibrate === 'boolean' ? data.vibrate : defaults.vibrate,
    pad: data.pad in padSizes ? data.pad : defaults.pad,
    difficulty: data.difficulty in difficulties ? data.difficulty : defaults.difficulty,
    skin: data.skin in skins ? data.skin : defaults.skin,
    graphics: data.graphics in graphics ? data.graphics : defaults.graphics
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
