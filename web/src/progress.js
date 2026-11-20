// Kunci simpanan
const KEY = 'rex.progress';
export const DISTRICTS = 4;

// Progres kosong
function fresh() {
  return { unlocked: 1, cleared: Array(DISTRICTS).fill(false), best: Array(DISTRICTS).fill(0) };
}

// Baca progres
export function loadProgress(storage = globalThis.localStorage) {
  try {
    const data = JSON.parse(storage.getItem(KEY));
    if (!data) return fresh();
    const base = fresh();
    return {
      unlocked: Math.max(1, Math.min(DISTRICTS, Math.floor(Number(data.unlocked)) || 1)),
      cleared: base.cleared.map((_, i) => data.cleared?.[i] === true),
      best: base.best.map((_, i) => Math.max(0, Math.floor(Number(data.best?.[i])) || 0))
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
export function recordDistrict(progress, index, score, won) {
  progress.best[index] = Math.max(progress.best[index], Math.floor(score));
  if (won) {
    progress.cleared[index] = true;
    progress.unlocked = Math.max(progress.unlocked, Math.min(DISTRICTS, index + 2));
  }
  return progress;
}

// Hapus progres
export function resetProgress(storage = globalThis.localStorage) {
  const progress = fresh();
  saveProgress(progress, storage);
  return progress;
}
