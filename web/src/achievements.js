// Kunci simpanan
const KEY = 'rex.stats';

// Daftar pencapaian
export const achievements = [
  { id: 'langkah', name: 'Langkah Pertama', text: 'Selesaikan Jalan Ruko', test: (s, p) => p.cleared[0] },
  { id: 'penakluk', name: 'Penakluk Kota', text: 'Selesaikan kedelapan distrik', test: (s, p) => p.cleared.every(Boolean) },
  { id: 'bintang15', name: 'Bintang Kota', text: 'Kumpulkan 15 bintang', goal: 15, value: (s, p) => p.stars.flat().filter(Boolean).length },
  { id: 'bintang24', name: 'Langit Penuh Bintang', text: 'Kumpulkan semua 24 bintang', goal: 24, value: (s, p) => p.stars.flat().filter(Boolean).length },
  { id: 'robot', name: 'Besi Tua', text: 'Kalahkan Robot Penjaga', test: s => s.robot > 0 },
  { id: 'bangunan', name: 'Tukang Gusur', text: 'Runtuhkan 200 bangunan', goal: 200, value: s => s.buildings },
  { id: 'tentara', name: 'Teror Barak', text: 'Kalahkan 500 tentara', goal: 500, value: s => s.soldiers },
  { id: 'warga', name: 'Kota Sepi', text: 'Kalahkan 300 warga', goal: 300, value: s => s.civilians },
  { id: 'angkot', name: 'Pemburu Angkot', text: 'Hancurkan 40 angkot', goal: 40, value: s => s.props.angkot || 0 },
  { id: 'spbu', name: 'Pom Bensin Meledak', text: 'Ledakkan 10 SPBU', goal: 10, value: s => s.props.spbu || 0 },
  { id: 'tank', name: 'Tank Terbalik', text: 'Balikkan 25 tank dengan ekor', goal: 25, value: s => s.tanks },
  { id: 'drone', name: 'Langit Bersih', text: 'Jatuhkan 30 drone', goal: 30, value: s => s.drones },
  { id: 'gagal', name: 'Penggagal Ulti', text: 'Gagalkan 20 ulti pahlawan', goal: 20, value: s => s.cancelled },
  { id: 'kombo', name: 'Kombo Maut', text: 'Capai kombo 60 dalam satu distrik', goal: 60, value: s => s.combo },
  { id: 'tanpaakhir', name: 'Tak Kenal Lelah', text: 'Raih 50.000 skor di Mode Tanpa Akhir', goal: 50000, value: (s, p) => p.endless }
];

// Statistik kosong
function fresh() {
  return { buildings: 0, props: {}, soldiers: 0, civilians: 0, heroes: 0, robot: 0, tanks: 0, drones: 0, cancelled: 0, combo: 0, unlocked: [] };
}

// Baca statistik
export function loadStats(storage = globalThis.localStorage) {
  try {
    const data = JSON.parse(storage.getItem(KEY)) || {};
    const base = fresh();
    for (const key of Object.keys(base)) if (key in data) base[key] = data[key];
    base.props = typeof base.props === 'object' && base.props ? base.props : {};
    base.unlocked = Array.isArray(base.unlocked) ? base.unlocked : [];
    return base;
  } catch {
    return fresh();
  }
}

// Simpan statistik
export function saveStats(stats, storage = globalThis.localStorage) {
  try { storage.setItem(KEY, JSON.stringify(stats)); } catch {}
}

// Tambah hasil permainan
export function addRun(stats, run) {
  for (const key of ['buildings', 'soldiers', 'civilians', 'heroes', 'robot', 'tanks', 'drones', 'cancelled']) stats[key] += run[key] || 0;
  for (const [type, n] of Object.entries(run.props || {})) stats.props[type] = (stats.props[type] || 0) + n;
  stats.combo = Math.max(stats.combo, run.combo || 0);
  return stats;
}

// Kemajuan pencapaian
export function progressOf(a, stats, progress) {
  if (a.goal) return Math.min(1, a.value(stats, progress) / a.goal);
  return a.test(stats, progress) ? 1 : 0;
}

// Buka pencapaian baru
export function unlock(stats, progress) {
  const fresh = achievements.filter(a => !stats.unlocked.includes(a.id) && progressOf(a, stats, progress) >= 1);
  stats.unlocked.push(...fresh.map(a => a.id));
  return fresh;
}

// Hapus statistik
export function resetStats(storage = globalThis.localStorage) {
  const stats = fresh();
  saveStats(stats, storage);
  return stats;
}
