// Ulangan distrik
const LOOPS = 1;
// Gelombang penjaga
const WAVE_START = 8, WAVE_STEP = 12;

// Susun jalan
export function makeEndless(levels) {
  const level = { name: 'Tanpa Akhir', setting: 'ruko', target: 101, endless: true, start: levels[0].start, buildings: [], props: [], spawns: [], bosses: [] };
  let offset = 0;
  for (let loop = 0; loop < LOOPS; loop++) {
    for (const source of levels) {
      for (const b of source.buildings) level.buildings.push({ ...b, x: b.x + offset });
      for (const p of source.props || []) level.props.push({ ...p, x: p.x + offset });
      for (const s of source.spawns) level.spawns.push(s + offset);
      offset += source.length;
    }
  }
  level.length = offset;
  for (let at = WAVE_START; at < 100; at += WAVE_STEP) {
    for (const type of ['perisai', 'rajawali', 'jaring']) level.bosses.push({ at, type });
  }
  return level;
}
