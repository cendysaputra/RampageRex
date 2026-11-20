// Kunci simpanan
const KEY = 'rex.progress';
export const DISTRICTS = 8;
// Versi simpanan
const VERSION = 2;
// Distrik lama
const OLD = [0, 2, 4, 7];

// Progres kosong
function fresh() {
  return { version: VERSION, unlocked: 1, cleared: Array(DISTRICTS).fill(false), best: Array(DISTRICTS).fill(0), stars: Array.from({ length: DISTRICTS }, () => [false, false, false]), endless: 0 };
}

// Baca progres
export function loadProgress(storage = globalThis.localStorage) {
  try {
    const data = JSON.parse(storage.getItem(KEY));
    if (!data) return fresh();
    const base = fresh();
    // Pindahkan simpanan lama
    if (data.version !== VERSION) {
      const move = list => base.cleared.map((_, i) => list?.[OLD.indexOf(i)]);
      const opened = Math.max(1, Math.floor(Number(data.unlocked)) || 1);
      return loadProgress({ getItem: () => JSON.stringify({ version: VERSION, unlocked: OLD[Math.min(opened, 4) - 1] + 1,
        cleared: move(data.cleared), best: move(data.best), stars: move(data.stars), endless: data.endless }) });
    }
    return {
      version: VERSION,
      unlocked: Math.max(1, Math.min(DISTRICTS, Math.floor(Number(data.unlocked)) || 1)),
      cleared: base.cleared.map((_, i) => data.cleared?.[i] === true),
      best: base.best.map((_, i) => Math.max(0, Math.floor(Number(data.best?.[i])) || 0)),
      stars: base.stars.map((row, i) => row.map((_, j) => data.stars?.[i]?.[j] === true)),
      endless: Math.max(0, Math.floor(Number(data.endless)) || 0)
    };
  } catch {
    return fresh();
  }
}

// Simpan progres
export function saveProgress(progress, storage = globalThis.localStorage) {
  try { storage.setItem(KEY, JSON.stringify(progress)); } catch {}
}

// Catat hasil
export function recordDistrict(progress, index, score, won, stars = []) {
  progress.best[index] = Math.max(progress.best[index], Math.floor(score));
  progress.stars[index] = progress.stars[index].map((had, i) => had || stars[i] === true);
  if (won) {
    progress.cleared[index] = true;
    progress.unlocked = Math.max(progress.unlocked, Math.min(DISTRICTS, index + 2));
  }
  return progress;
}

// Total bintang
export function totalStars(progress) {
  return progress.stars.flat().filter(Boolean).length;
}

// Hapus progres
export function resetProgress(storage = globalThis.localStorage) {
  const progress = fresh();
  saveProgress(progress, storage);
  return progress;
}
