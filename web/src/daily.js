// Kunci simpanan
const KEY = 'rex.daily';

// Jenis tantangan
const challenges = [
  { text: 'Ratakan {name} dalam {n} menit', pick: r => 5 + Math.floor(r() * 2), test: (w, n) => w.time <= n * 60 },
  { text: 'Ratakan {name} dengan kombo {n}', pick: r => 30 + 5 * Math.floor(r() * 4), test: (w, n) => w.maxCombo >= n },
  { text: 'Ratakan {name} dan kalahkan {n} tentara', pick: r => 20 + 5 * Math.floor(r() * 3), test: (w, n) => w.runStats().soldiers >= n },
  { text: 'Ratakan {name} dengan darah ≥ {n}%', pick: r => 50 + 10 * Math.floor(r() * 2), test: (w, n) => w.rex.hp >= w.rex.max * n / 100 },
  { text: 'Ratakan {name} tanpa ulti', pick: () => 0, test: w => !w.usedUlti },
  { text: 'Ratakan {name} dan kalahkan {n} warga', pick: r => 25 + 5 * Math.floor(r() * 3), test: (w, n) => w.civiliansDown >= n }
];

// Tanggal lokal
export function dayKey(date = new Date()) {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

// Acak dari tanggal
function seeded(text) {
  let h = 2166136261;
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
}

// Misi hari ini
export function todayMission(unlocked, date = new Date()) {
  const r = seeded(dayKey(date));
  const district = Math.floor(r() * Math.max(1, unlocked));
  const kind = Math.floor(r() * challenges.length);
  return { day: dayKey(date), district, kind, n: challenges[kind].pick(r) };
}

// Teks misi
export function missionTemplate(mission) {
  return challenges[mission.kind].text;
}

// Misi berhasil
export function passed(mission, world) {
  return world.status === 'won' && challenges[mission.kind].test(world, mission.n);
}

// Baca catatan
export function loadDaily(storage = globalThis.localStorage) {
  try {
    const d = JSON.parse(storage.getItem(KEY)) || {};
    return { last: typeof d.last === 'string' ? d.last : '', streak: Math.max(0, Math.floor(Number(d.streak)) || 0), total: Math.max(0, Math.floor(Number(d.total)) || 0) };
  } catch {
    return { last: '', streak: 0, total: 0 };
  }
}

// Catat berhasil
export function completeDaily(record, date = new Date(), storage = globalThis.localStorage) {
  const today = dayKey(date);
  if (record.last === today) return record;
  const yesterday = new Date(date); yesterday.setDate(date.getDate() - 1);
  record.streak = record.last === dayKey(yesterday) ? record.streak + 1 : 1;
  record.last = today; record.total++;
  try { storage.setItem(KEY, JSON.stringify(record)); } catch {}
  return record;
}
