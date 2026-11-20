// Daftar upgrade
export const upgrades = {
  taring: { name: 'Taring Baja', text: 'Gigitan +25% damage', mod: m => { m.damage.bite *= 1.25; } },
  ekor: { name: 'Ekor Godam', text: 'Sabetan ekor +30% damage', mod: m => { m.damage.tail *= 1.3; } },
  telapak: { name: 'Telapak Gempa', text: 'Injakan +30% damage', mod: m => { m.damage.stomp *= 1.3; } },
  sisik: { name: 'Sisik Tebal', text: 'Darah maksimal +60', mod: m => { m.hp += 60; } },
  paru: { name: 'Paru-paru Besar', text: 'Cooldown raung −30%', mod: m => { m.cooldown.roar *= .7; } },
  pegas: { name: 'Kaki Pegas', text: 'Cooldown lompat −30%', mod: m => { m.cooldown.jump *= .7; } },
  amarah: { name: 'Amarah Purba', text: 'Cooldown ulti −25%', mod: m => { m.cooldown.ulti *= .75; } },
  rakus: { name: 'Perut Rakus', text: 'Pulih darah dari musuh +50%', mod: m => { m.heal *= 1.5; } },
  murka: { name: 'Murka', text: 'Rage terisi 30% lebih cepat', mod: m => { m.rage *= 1.3; } },
  irama: { name: 'Irama Amuk', text: 'Kombo bertahan 1 detik lebih lama', mod: m => { m.comboWindow += 1; } }
};
// Batas tumpuk
export const MAX_STACK = 3;

// Hitung pengubah
export function modifiers(picked = []) {
  const m = { damage: { bite: 1, tail: 1, stomp: 1, ulti: 1 }, cooldown: { bite: 1, tail: 1, stomp: 1, roar: 1, jump: 1, ulti: 1 }, hp: 0, heal: 1, rage: 1, comboWindow: 0 };
  for (const key of picked) upgrades[key]?.mod(m);
  return m;
}

// Tawarkan tiga
export function offer(picked = [], random = Math.random) {
  const open = Object.keys(upgrades).filter(key => picked.filter(p => p === key).length < MAX_STACK);
  const choices = [];
  while (choices.length < 3 && open.length) choices.push(open.splice(Math.floor(random() * open.length), 1)[0]);
  return choices;
}
