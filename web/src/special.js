// Daftar misi spesial
export const MISSIONS = ['merdeka', 'salju', 'halloween'];
// Data misi
export const missionInfo = {
  merdeka: { name: 'Kemerdekaan', boss: 'tikus', skin: 'sayap', song: 'pawai', need: 'Selesaikan kedelapan distrik' },
  salju: { name: 'Salju', boss: 'boneka-salju', skin: 'es', song: 'salju', need: 'Selesaikan Misi Kemerdekaan dan kumpulkan 15 bintang' },
  halloween: { name: 'Halloween', boss: 'penyihir', skin: 'tulang', song: 'halloween', need: 'Selesaikan Misi Salju dan runtuhkan 200 bangunan' }
};
// Nama bos
export const bossNames = { tikus: 'Tikus Raksasa', 'boneka-salju': 'Boneka Salju Raksasa', penyihir: 'Penyihir' };
// Skill per skin
export const skinSkill = { sayap: 'terbang', es: 'duri', tulang: 'bangkit' };
// Jeda skill
export const skillCooldown = { terbang: 18, duri: 16, bangkit: 0 };
// Darah Rex di misi
export const missionHp = 900;

// Progres kosong
export function freshSpecial() {
  return Object.fromEntries(MISSIONS.map(key => [key, { cleared: false, best: 0 }]));
}
// Baca progres misi
export function readSpecial(data) {
  const base = freshSpecial();
  for (const key of MISSIONS) {
    base[key].cleared = data?.[key]?.cleared === true;
    base[key].best = Math.max(0, Math.floor(Number(data?.[key]?.best)) || 0);
  }
  return base;
}
// Menu terbuka
export function specialOpen(progress) {
  return progress.cleared.every(Boolean);
}
// Misi terbuka
export function missionOpen(key, progress, stats) {
  const has = id => stats.unlocked.includes(id), done = k => progress.special[k].cleared;
  if (!specialOpen(progress)) return false;
  if (key === 'merdeka') return true;
  if (key === 'salju') return done('merdeka') && (has('bintang15') || progress.stars.flat().filter(Boolean).length >= 15);
  return done('salju') && has('bangunan');
}
// Semua misi selesai
export function allMissions(progress) {
  return MISSIONS.every(key => progress.special[key].cleared);
}
