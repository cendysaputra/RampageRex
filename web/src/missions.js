// Misi tiap distrik
const clear = { text: 'Ratakan distrik', test: w => w.status === 'won' };
const within = minutes => ({ text: 'Selesai dalam ' + minutes + ' menit', test: w => w.status === 'won' && w.time <= minutes * 60 });
export const missions = [
  [clear, within(7), { text: 'Capai kombo 25', test: w => w.maxCombo >= 25 }],
  [clear, within(8), { text: 'Gagalkan 2 ulti pahlawan', test: w => w.cancelled >= 2 }],
  [clear, within(8), { text: 'Hancurkan semua properti jalan', test: w => w.props.every(p => p.hp <= 0) }],
  [clear, within(9), { text: 'Selesai dengan darah ≥ 50%', test: w => w.status === 'won' && w.rex.hp >= w.rex.max / 2 }]
];

// Misi tercapai
export function earned(world, index) {
  return (missions[index] || []).map(m => Boolean(m.test(world)));
}

// Tulis bintang
export function starText(stars) {
  return stars.map(s => (s ? '★' : '☆')).join('');
}
