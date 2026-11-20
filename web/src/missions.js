import { t } from './i18n.js';

// Misi tiap distrik
const clear = { text: 'Ratakan distrik', test: w => w.status === 'won' };
const within = minutes => ({ text: 'Selesai dalam {n} menit', vars: { n: minutes }, test: w => w.status === 'won' && w.time <= minutes * 60 });
export const missions = [
  [clear, within(7), { text: 'Capai kombo {n}', vars: { n: 25 }, test: w => w.maxCombo >= 25 }],
  [clear, within(7), { text: 'Kalahkan {n} warga', vars: { n: 25 }, test: w => w.civiliansDown >= 25 }],
  [clear, within(8), { text: 'Gagalkan 2 ulti pahlawan', test: w => w.cancelled >= 2 }],
  [clear, within(8), { text: 'Hancurkan semua gerbong', test: w => w.props.filter(p => p.type === 'gerbong').every(p => p.hp <= 0) }],
  [clear, within(8), { text: 'Hancurkan semua properti jalan', test: w => w.props.every(p => p.hp <= 0) }],
  [clear, within(8), { text: 'Kalahkan {n} tentara', vars: { n: 15 }, test: w => Object.entries(w.kills).filter(([t]) => !['perisai', 'rajawali', 'jaring', 'turret', 'robot'].includes(t)).reduce((n, [, k]) => n + k, 0) >= 15 }],
  [clear, within(9), { text: 'Capai kombo {n}', vars: { n: 40 }, test: w => w.maxCombo >= 40 }],
  [clear, within(10), { text: 'Selesai dengan darah ≥ 50%', test: w => w.status === 'won' && w.rex.hp >= w.rex.max / 2 }]
];

// Misi tercapai
export function earned(world, index) {
  return (missions[index] || []).map(m => Boolean(m.test(world)));
}

// Tulis bintang
export function starText(stars) {
  return stars.map(s => (s ? '★' : '☆')).join('');
}

// Teks misi
export function missionText(m) {
  return t(m.text, m.vars);
}
