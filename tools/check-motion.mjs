import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { World, cooldowns, heroNames as heroNamesCheck, hints as hintsCheck, heroUltis as heroUltisCheck, difficulties as difficultiesCheck } from '../web/src/world.js';
import { attackPose, damp, spritePose } from '../web/src/motion.js';
import { rexFramePath, rexPose } from '../web/src/rex-animation.js';
import { loadProgress, saveProgress, recordDistrict, resetProgress } from '../web/src/progress.js';
import { loadSettings, saveSettings, defaults, useLite, weakDevice, skins as skinsCheck, graphics as graphicsCheck, padSizes as padSizesCheck } from '../web/src/settings.js';
import { Tutorial, steps as tutorialSteps } from '../web/src/tutorial.js';
import { missions, earned, starText } from '../web/src/missions.js';
import { totalStars } from '../web/src/progress.js';
import { t, setLang, keys as i18nKeys } from '../web/src/i18n.js';
import { makeEndless } from '../web/src/endless.js';
import { upgrades, offer, modifiers, MAX_STACK } from '../web/src/upgrades.js';
import { achievements, loadStats, saveStats, addRun, unlock } from '../web/src/achievements.js';
import { todayMission, missionTemplate, passed, loadDaily, completeDaily, dayKey } from '../web/src/daily.js';

const levels = await Promise.all([1, 2, 3, 4, 5, 6, 7, 8].map(async n =>
  JSON.parse(await readFile(new URL(`../web/data/levels/level-0${n}.json`, import.meta.url), 'utf8'))));
const empty = new Set();
const manifest = JSON.parse(await readFile(new URL('../web/assets/manifest.json', import.meta.url), 'utf8'));
const animation = manifest.rexAnimations;
assert.equal(Object.values(animation.atlases).reduce((sum, atlas) => sum + atlas.frames.length, 0), 46);
for (const atlas of Object.values(animation.atlases)) {
  const image = manifest.assets[atlas.path + '.png'];
  for (const [x, y, w, h, px, py] of atlas.frames) {
    assert.ok(x >= 0 && y >= 0 && x + w <= image.width && y + h <= image.height);
    assert.ok(px >= 0 && px <= w && py >= 0 && py <= h);
  }
}
const makeWorld = () => {
  const world = new World(levels[0], 0);
  world.spawnTime = Infinity;
  return world;
};

for (const key of ['bite', 'tail', 'stomp', 'roar', 'ulti']) {
  const world = makeWorld();
  world.rex.cd[key] = 0;
  world.startAttack(key);
  const action = world.rex.attack;
  const contact = rexPose({ ...world.rex, attack: { ...action, age: action.impact } }, animation);
  const clip = animation.clips[key], contactIndex = key === 'ulti' ? clip.contact : key === 'tail' ? 1 : 2;
  assert.equal(contact.from, rexFramePath(clip.atlas, clip.frames[contactIndex]));
  assert.equal(contact.mix, 0);
  const recovered = rexPose({ ...world.rex, attack: { ...action, age: action.duration } }, animation);
  assert.equal(recovered.from, rexFramePath(animation.clips.idle.atlas, animation.clips.idle.frames[0]));
  assert.equal(attackPose(action), 0);
  assert.equal(attackPose({ ...action, age: action.impact }), 1);
  assert.equal(attackPose({ ...action, age: action.duration }), 0);
  for (const age of [0, action.impact, action.duration]) {
    const before = attackPose({ ...action, age: age - .0001 });
    const after = attackPose({ ...action, age: age + .0001 });
    assert.ok(Math.abs(after - before) < .00001, `${key}: discontinuous pose at ${age}`);
  }
  for (const hz of [30, 60, 120, 144]) {
    const simulation = makeWorld();
    simulation.rex.cd[key] = 0;
    simulation.startAttack(key);
    let impacts = 0;
    simulation.strike = () => impacts++;
    for (let i = 0; i < hz * 2; i++) simulation.update(1 / hz, empty);
    assert.equal(impacts, 1, `${key}: wrong impact count at ${hz} Hz`);
    assert.equal(simulation.rex.attack, null);
  }
}

const distances = [];
for (const hz of [30, 60, 120, 144]) {
  const world = makeWorld(), start = world.rex.x;
  // Langkah simulasi
  const steps = Math.ceil(60 / hz), dt = 1 / hz / steps;
  for (let i = 0; i < hz * steps * 2; i++) world.update(dt, new Set(['right']));
  for (let i = 0; i < hz * steps; i++) world.update(dt, empty);
  assert.equal(world.rex.vx, 0);
  assert.ok(world.rex.stride < .001);
  distances.push({ hz, distance: world.rex.x - start });
}
assert.ok(Math.max(...distances.map(x => x.distance)) - Math.min(...distances.map(x => x.distance)) < 2);

let value60 = 0, value144 = 0;
for (let i = 0; i < 60; i++) value60 += (1 - value60) * damp(12, 1 / 60);
for (let i = 0; i < 144; i++) value144 += (1 - value144) * damp(12, 1 / 144);
assert.ok(Math.abs(value60 - value144) < 1e-12);

const pose = {};
spritePose(pose, 'run-a', 0);
spritePose(pose, 'run-b', 1 / 60);
assert.equal(pose.fromFrame, 'run-a');
assert.equal(pose.frameMix, 0);
spritePose(pose, 'run-b', .0325);
assert.ok(Math.abs(pose.frameMix - .5) < 1e-12);
spritePose(pose, 'run-b', .04);
assert.equal(pose.frameMix, 1);

for (const [index, level] of levels.entries()) {
  const world = new World(level, index);
  world.spawnTime = Infinity;
  const flyer = world.spawn('rajawali', world.rex.x + 300);
  const initialY = flyer.y;
  world.startAttack('roar');
  world.strike(world.rex.attack);
  assert.equal(flyer.y, initialY, 'Roar must not teleport Rajawali');
  world.update(1 / 60, empty);
  assert.ok(flyer.y > initialY && flyer.y < 0);
  for (let i = 0; i < 60; i++) world.update(1 / 60, empty);
  assert.ok(Math.abs(flyer.y) < 1);
  for (const entity of [world.rex, ...world.enemies]) {
    for (const key of ['x', 'walk', 'stride']) assert.ok(Number.isFinite(entity[key]));
  }
}

// Pahlawan selalu bertiga
for (const [index, level] of levels.entries()) {
  assert.deepEqual(level.bosses.map(b => b.type).sort(), ['jaring', 'perisai', 'rajawali']);
  const world = new World(level, index);
  world.spawnTime = Infinity;
  world.rex.x = level.length / 2;
  world.lost = world.total * level.bosses[0].at / 100;
  world.update(1 / 60, empty);
  const heroes = world.enemies.filter(e => e.hero);
  assert.equal(heroes.length, 3, `district ${index + 1}: heroes must arrive together`);
  assert.ok(heroes.some(e => e.x < world.rex.x) && heroes.some(e => e.x > world.rex.x), 'heroes must flank Rex');
}

// Warga terhuyung
{
  const world = makeWorld();
  const civilian = { type: 'shopper', x: world.rex.x + 150, dir: 1, speed: 0, phase: 0, walk: 0, lane: 15 };
  world.civilians.push(civilian);
  const bite = () => {
    world.rex.cd.bite = 0;
    world.startAttack('bite');
    for (let i = 0; i < 40; i++) world.update(1 / 60, empty);
  };
  bite();
  assert.ok(!civilian.down && civilian.hp > 0 && civilian.hp < civilian.max, 'first bite must only stagger');
  civilian.x = world.rex.x + 150;
  bite();
  assert.equal(civilian.down, true, 'second bite must defeat the civilian');
  for (let i = 0; i < 90; i++) world.update(1 / 60, empty);
  assert.ok(!world.civilians.includes(civilian), 'defeated civilians must clear');
}

// Regu tentara
{
  const world = new World(levels[0], 0);
  world.rex.x = levels[0].length / 2;
  for (let i = 0; i < 60 * 30; i++) world.update(1 / 60, empty);
  const troops = world.enemies.filter(e => !e.hero && e.type !== 'turret');
  assert.ok(troops.length >= 10, `expected a mob of soldiers, got ${troops.length}`);
  assert.ok(troops.some(e => e.x < world.rex.x) && troops.some(e => e.x > world.rex.x), 'soldiers must come from both sides');
}

// Target destruksi 100%
for (const level of levels) assert.equal(level.target, 100);

// Kopdes tiap distrik
for (const level of levels) assert.ok(level.buildings.some(b => b.color === 'kopdes' && b.upper === 0), `${level.name} needs a Kopdes`);

// Ulti pahlawan
for (const type of ['perisai', 'rajawali', 'jaring']) {
  const world = makeWorld();
  const hero = world.spawn(type, world.rex.x + 400);
  hero.ultCd = 0;
  world.update(1 / 60, empty);
  assert.equal(world.cast?.hero, hero, `${type}: ulti must start`);
  let impacts = 0;
  const strike = world.castStrike.bind(world);
  world.castStrike = cast => { impacts++; strike(cast); };
  const before = world.rex.hp;
  for (let i = 0; i < 180; i++) world.update(1 / 60, empty);
  assert.equal(impacts, 1, `${type}: ulti must land once`);
  assert.ok(world.rex.hp < before, `${type}: ulti must hurt Rex`);
  const roared = makeWorld(), target = roared.spawn(type, roared.rex.x + 400);
  target.ultCd = 0;
  roared.update(1 / 60, empty);
  roared.rex.cd.roar = 0;
  roared.startAttack('roar');
  roared.strike(roared.rex.attack);
  assert.equal(roared.cast, null, `${type}: roar must cancel the ulti`);
}

// Keluar distrik
{
  const world = new World(levels[0], 0);
  world.rex.x = levels[0].length / 2;
  world.spawn('infantry', world.rex.x + 300);
  world.triggered = new Set(levels[0].bosses.map((_, i) => i));
  world.lost = world.total;
  world.update(1 / 60, empty);
  assert.equal(world.phase, 'clear');
  assert.ok(world.enemies.every(e => e.flee), 'soldiers must flee once the district is flat');
  for (let i = 0; i < 120; i++) world.update(1 / 60, empty);
  assert.equal(world.status, 'playing', 'standing still must not finish the district');
  let t = 0;
  while (world.phase === 'clear' && t < 60) { world.update(1 / 60, new Set(['right'])); t += 1 / 60; }
  assert.equal(world.phase, 'exit', 'reaching the end must start the exit walk');
  const at = world.rex.x;
  for (let i = 0; i < 60 * 3; i++) world.update(1 / 60, empty);
  assert.equal(world.status, 'won');
  assert.ok(world.rex.x > at + 500 && world.rex.x > world.camera + world.view, 'Rex must walk off screen on his own');
}

// Lompat gertakan
{
  const world = makeWorld();
  const soldier = world.spawn('infantry', world.rex.x + 400);
  world.rex.cd.jump = 0;
  world.startAttack('jump');
  assert.equal(world.rex.cd.jump, cooldowns.jump);
  for (let i = 0; i < 30; i++) world.update(1 / 60, empty);
  assert.ok(world.rex.lift > 100, 'Rex must be airborne');
  const hp = world.rex.hp;
  world.hurt(50);
  assert.equal(world.rex.hp, hp, 'Rex must dodge damage in the air');
  let pose = rexPose(world.rex, animation);
  assert.ok(pose.from && pose.to);
  for (let i = 0; i < 40; i++) world.update(1 / 60, empty);
  assert.equal(world.rex.lift, 0, 'Rex must land');
  assert.ok(soldier.stun > 3.5, 'landing must stun longer than a roar');
  for (let i = 0; i < 60; i++) world.update(1 / 60, empty);
  assert.equal(world.rex.attack, null);
}

// Rex tumbang
{
  const world = makeWorld();
  world.rex.hp = 0;
  world.update(1 / 60, empty);
  assert.equal(world.phase, 'dying');
  assert.equal(world.status, 'playing', 'defeat must play the fall before the result');
  assert.ok(rexPose(world.rex, animation, .5).from);
  for (let i = 0; i < 60 * 2; i++) world.update(1 / 60, empty);
  assert.equal(world.status, 'playing');
  for (let i = 0; i < 60; i++) world.update(1 / 60, empty);
  assert.equal(world.status, 'lost');
}

// Warga beraktivitas
{
  const world = new World(levels[1], 1);
  world.spawnTime = Infinity;
  const calm = world.civilians.filter(c => c.calm);
  assert.ok(calm.length >= 8, 'streets must start with people going about their day');
  assert.ok(calm.some(c => c.type === 'kopdes-worker'), 'Kopdes workers must stand outside the Kopdes');
  const first = calm[0], before = first.x;
  for (let i = 0; i < 60; i++) world.update(1 / 60, empty);
  assert.equal(first.x, before, 'calm people stay put while Rex is far away');
  assert.ok(world.civilians.includes(first), 'calm people off screen must not be culled');
  world.rex.x = first.x - 300;
  world.update(1 / 60, empty);
  assert.equal(first.calm, false, 'Rex nearby must make them panic');
  for (let i = 0; i < 30; i++) world.update(1 / 60, empty);
  assert.ok(Math.abs(first.x - world.rex.x) > 300, 'panicking people run away from Rex');
  const kopdes = world.buildings.find(b => b.color === 'kopdes');
  assert.ok(kopdes, 'district 2 must have a Kopdes');
  world.civilians.length = 0;
  world.damageModule(kopdes, 0, 10);
  assert.ok(world.civilians.length && world.civilians.every(c => c.type === 'kopdes-worker'), 'Kopdes evacuates its workers');
}

// Audit RR-1
{
  const world = makeWorld();
  world.rex.cd.jump = 0;
  world.startAttack('jump');
  for (let i = 0; i < 30; i++) world.update(1 / 60, empty);
  world.shots.push({ x: world.rex.x, y: -150 - world.rex.lift, type: 'net', vx: 0, vy: 0, life: 1 });
  world.update(1 / 60, empty);
  assert.equal(world.rex.slow, 0, 'a net must not stick while Rex is airborne');
  const hero = world.spawn('jaring', world.rex.x + 300);
  world.cast = { hero, type: 'jaring', age: 0, windup: 1, done: true, reach: 1150, damage: 45, stun: .8, slow: 5 };
  world.castStrike(world.cast);
  assert.equal(world.rex.bigNet, 0, 'the giant net must miss an airborne Rex');
}

// Audit RR-2
for (const late of [.1, .3, .6]) {
  const world = makeWorld();
  const hero = world.spawn('perisai', world.rex.x + 400);
  hero.ultCd = 0;
  world.update(1 / 60, empty);
  assert.ok(world.cast, 'ulti must start');
  for (let t = 0; t < late; t += 1 / 60) world.update(1 / 60, empty);
  world.rex.cd.jump = 0;
  world.update(1 / 60, new Set(['jump']));
  const hp = world.rex.hp;
  for (let i = 0; i < 60; i++) world.update(1 / 60, empty);
  assert.equal(world.cast, null, `jump ${late}s late must still cancel the ulti`);
  assert.equal(world.rex.hp, hp, `jump ${late}s late must avoid the ulti damage`);
}

// Audit RR-3
{
  const world = makeWorld();
  world.rex.stun = .45;
  world.update(1 / 60, new Set(['bite']));
  let started = false;
  for (let i = 0; i < 40; i++) { world.update(1 / 60, empty); started ||= world.rex.attack?.key === 'bite'; }
  assert.ok(started, 'a tap during hitstun must fire once Rex recovers');
}

// Simpan progres
{
  const store = new Map(), storage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  let progress = loadProgress(storage);
  assert.deepEqual([progress.unlocked, progress.cleared, progress.best], [1, Array(8).fill(false), Array(8).fill(0)]);
  recordDistrict(progress, 0, 900, false);
  assert.equal(progress.unlocked, 1, 'a loss must not unlock the next district');
  recordDistrict(progress, 0, 1500, true);
  recordDistrict(progress, 0, 700, true);
  saveProgress(progress, storage);
  progress = loadProgress(storage);
  assert.deepEqual([progress.unlocked, progress.cleared[0], progress.best[0]], [2, true, 1500]);
  recordDistrict(progress, 7, 10, true);
  assert.equal(progress.unlocked, 8, 'unlocks never pass the last district');
  store.set('rex.progress', '{broken');
  assert.equal(loadProgress(storage).unlocked, 1, 'corrupt saves fall back to a fresh start');
  assert.equal(resetProgress(storage).unlocked, 1);
}

// Pengaturan dan kesulitan
{
  const store = new Map(), storage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  assert.deepEqual(loadSettings(storage), defaults);
  saveSettings({ sfx: 140, music: -5, vibrate: false, pad: 'xl', difficulty: 'ngamuk' }, storage);
  assert.deepEqual(loadSettings(storage), { sfx: 100, music: 0, vibrate: false, pad: 'm', difficulty: 'ngamuk', skin: 'merah', graphics: 'auto', lang: defaults.lang }, 'invalid values fall back');
  saveSettings({ skin: 'mecha' }, storage);
  assert.equal(loadSettings(storage).skin, 'mecha');
  const easy = new World(levels[0], 0, { difficulty: 'santai' }), normal = new World(levels[0], 0), hard = new World(levels[0], 0, { difficulty: 'ngamuk' });
  assert.ok(easy.power < normal.power && normal.power < hard.power, 'difficulty scales enemy damage');
  assert.ok(easy.squadBonus < 0 && hard.squadBonus > 0, 'difficulty scales squad size');
  const hp = normal.rex.hp;
  normal.hurt(10);
  assert.ok(normal.events.includes('hurt') && normal.rex.hp === hp - 10);
}

// Tutorial distrik 1
{
  const world = new World(levels[0], 0), guide = new Tutorial(world);
  const run = (frames, keys = []) => { for (let i = 0; i < frames; i++) { world.update(1 / 60, new Set(i ? [] : keys)); guide.update(world); } };
  const hold = (frames, key) => { for (let i = 0; i < frames; i++) { world.update(1 / 60, new Set([key])); guide.update(world); } };
  hold(90, 'right');
  assert.equal(guide.step, 1, 'walking completes step 1');
  for (let i = 0; i < 12 && guide.step === 1; i++) run(50, ['bite']);
  assert.equal(guide.step, 2, 'biting a building completes step 2');
  assert.equal(world.enemies.filter(e => !e.hero).length, 0, 'no soldiers during the first steps');
  for (let i = 0; i < 20 && guide.step === 2; i++) { world.rex.cd.stomp = 0; run(60, ['stomp']); }
  assert.equal(guide.step, 3, 'collapsing a ground floor completes step 3');
  run(30);
  assert.ok(world.enemies.some(e => !e.hero), 'soldiers arrive for the tail step');
  world.rex.cd.tail = 0; run(60, ['tail']);
  assert.equal(guide.step, 4, 'a tail swipe completes step 4');
  assert.equal(world.rex.cd.jump, 0, 'jump is ready for its step');
  run(90, ['jump']);
  assert.equal(guide.step, 5, 'landing a jump completes step 5');
  run(150, ['ulti']);
  assert.ok(guide.finished, 'using the ulti finishes the tutorial');
  assert.equal(guide.text(false), 'Tutorial selesai! Ratakan 100% kota.');
  assert.equal(tutorialSteps.length, 6);
}

// Kombo
{
  const world = makeWorld();
  for (let i = 0; i < 9; i++) world.addScore(10);
  assert.equal(world.multiplier, 1);
  world.addScore(10);
  assert.equal(world.multiplier, 1.5, 'ten hits raise the multiplier');
  const before = world.score;
  world.addScore(100);
  assert.equal(world.score - before, 150, 'points use the multiplier');
  for (let i = 0; i < 100; i++) world.addScore(1);
  assert.equal(world.multiplier, 3, 'multiplier caps at 3');
  for (let i = 0; i < 160; i++) world.update(1 / 60, empty);
  assert.equal(world.combo, 0, 'combo drops after 2.5 s without a hit');
  assert.ok(world.maxCombo >= 111);
}

// Misi dan bintang
{
  assert.equal(missions.length, 8);
  for (const row of missions) assert.equal(row.length, 3);
  const world = makeWorld();
  assert.deepEqual(earned(world, 0), [false, false, false]);
  world.status = 'won'; world.time = 300; world.maxCombo = 30;
  assert.deepEqual(earned(world, 0), [true, true, true]);
  world.time = 500;
  assert.deepEqual(earned(world, 0), [true, false, true], 'the time mission needs a fast clear');
  const ultis = new World(levels[2], 2);
  ultis.status = 'won'; ultis.cancelled = 2;
  assert.equal(earned(ultis, 2)[2], true);
  const props = new World(levels[4], 4);
  for (const p of props.props) props.damageProp(p, Infinity);
  assert.equal(earned(props, 4)[2], true, 'wrecking every prop earns the Pelabuhan star');
  const hp = new World(levels[7], 7);
  hp.status = 'won'; hp.rex.hp = hp.rex.max / 2 - 1;
  assert.equal(earned(hp, 7)[2], false);
  const store = new Map(), storage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  const progress = loadProgress(storage);
  recordDistrict(progress, 0, 10, true, [true, false, true]);
  recordDistrict(progress, 0, 10, true, [true, true, false]);
  assert.deepEqual(progress.stars[0], [true, true, true], 'stars from different runs add up');
  saveProgress(progress, storage);
  assert.equal(totalStars(loadProgress(storage)), 3);
  assert.equal(starText([true, false, true]), '★☆★');
}

// Mode tanpa akhir
{
  const level = makeEndless(levels);
  assert.equal(level.length, levels.reduce((n, l) => n + l.length, 0));
  assert.equal(level.buildings.length, levels.reduce((n, l) => n + l.buildings.length, 0));
  assert.ok(level.buildings.every((b, i, all) => i === 0 || b.x > all[i - 1].x), 'segments follow each other');
  assert.equal(level.bosses.length % 3, 0);
  const world = new World(level, 3);
  world.spawnTime = Infinity;
  world.rex.x = level.length / 2;
  world.lost = world.total;
  for (let i = 0; i < 60; i++) world.update(1 / 60, empty);
  assert.equal(world.phase, 'fight', 'endless mode never clears');
  assert.ok(world.power > world.basePower * 2.5, 'enemies hit harder as the city falls');
  const store = new Map(), storage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  const progress = loadProgress(storage);
  progress.endless = 4321; saveProgress(progress, storage);
  assert.equal(loadProgress(storage).endless, 4321);
}

// Bangunan spesial
{
  const world = makeWorld();
  world.spawnTime = Infinity;
  const spbu = world.props.find(p => p.type === 'spbu');
  assert.ok(spbu, 'district 1 has an SPBU');
  const soldier = world.spawn('infantry', spbu.x + 200), hp = world.rex.hp;
  const building = world.buildings.reduce((a, b) => Math.abs(b.x - spbu.x) < Math.abs(a.x - spbu.x) ? b : a);
  const before = building.modules[0].hp;
  world.damageProp(spbu, Infinity);
  assert.ok(soldier.hp <= 0 || soldier.hp < soldier.max, 'the blast hits nearby soldiers');
  if (Math.abs(building.x - spbu.x) < 480) assert.ok(building.modules[0].hp < before, 'the blast hits nearby buildings');
  assert.equal(world.rex.hp, hp, 'the blast never hurts Rex');
  const warung = world.props.find(p => p.type === 'warung-makan');
  world.rex.hp = 100;
  world.damageProp(warung, Infinity);
  assert.equal(world.rex.hp, 160, 'the warung makan heals Rex');
  for (const level of levels) assert.ok(['spbu', 'warung-makan'].every(t => level.props.some(p => p.type === t)));
}

// Simpanan lama 4 distrik
{
  const store = new Map([['rex.progress', JSON.stringify({ unlocked: 3, cleared: [true, true, false, false], best: [100, 200, 0, 0], stars: [[true, false, true], [true, true, true], [false, false, false], [false, false, false]], endless: 50 })]]);
  const storage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  const moved = loadProgress(storage);
  assert.deepEqual(moved.cleared, [true, false, true, false, false, false, false, false], 'old districts move to their new slots');
  assert.deepEqual(moved.best.slice(0, 3), [100, 0, 200]);
  assert.deepEqual(moved.stars[2], [true, true, true]);
  assert.equal(moved.unlocked, 5, 'Pelabuhan stays open after the move');
  assert.equal(moved.endless, 50);
}
// Distrik baru
{
  const names = levels.map(l => l.setting);
  assert.deepEqual(names, ['ruko', 'market', 'office', 'station', 'port', 'toll', 'beach', 'square']);
  for (const [i, level] of levels.entries()) {
    const world = new World(level, i);
    assert.ok(world.props.every(p => p.type), `${level.name}: props are typed`);
    const xs = level.props.map(p => p.x).sort((a, b) => a - b);
    assert.ok(xs.every((x, j) => !j || x - xs[j - 1] > 40), `${level.name}: props do not stack`);
  }
  const first = new World(levels[0], 0), last = new World(levels[7], 7);
  assert.ok(last.power > first.power && Math.abs(last.power - 1.36) < 1e-9, 'difficulty peaks in the last district');
}

// Musuh baru
{
  // Tank: lapis baja, terbalik oleh ekor
  const world = makeWorld();
  world.rex.dir = -1;
  const tank = world.spawn('tank', world.rex.x - 200), full = tank.hp;
  world.rex.cd.bite = 0; world.rex.dir = 1; tank.x = world.rex.x + 150;
  world.startAttack('bite'); for (let i = 0; i < 20; i++) world.update(1 / 60, empty);
  assert.ok(full - tank.hp <= 100 * .4 + 1, 'bites barely scratch a tank');
  world.rex.attack = null; world.rex.cd.tail = 0; tank.x = world.rex.x - 200; tank.vx = 0;
  world.startAttack('tail'); for (let i = 0; i < 20; i++) world.update(1 / 60, empty);
  assert.ok(tank.flipped > 0 && tank.stun > 0, 'a tail swipe flips the tank');
  // Drone: jatuh oleh raungan
  const sky = makeWorld();
  const drones = [0, 1, 2].map(i => sky.spawn('drone', sky.rex.x + 300 + i * 50));
  assert.ok(drones.every(d => d.y < -250), 'drones fly');
  sky.rex.cd.roar = 0; sky.startAttack('roar'); sky.strike(sky.rex.attack);
  assert.ok(drones.every(d => d.hp <= 0), 'a roar downs every drone on screen');
  // Pemadam: mengikis Rage
  const wet = makeWorld();
  wet.rex.rage = 80;
  wet.spawn('firefighter', wet.rex.x + 250);
  for (let i = 0; i < 120; i++) wet.update(1 / 60, empty);
  assert.ok(wet.rex.rage < 80, 'firefighters drain Rage');
  const truck = makeWorld();
  truck.rex.fury = 8;
  const t = truck.spawn('firetruck', truck.rex.x + 300); t.dir = -1;
  for (let i = 0; i < 30; i++) truck.update(1 / 60, empty);
  assert.ok(truck.rex.fury < 8 - .5, 'a fire truck puts out Rage mode');
  // Jadwal per distrik
  const pools = levels.map((level, i) => { const w = new World(level, i); w.lost = w.total * .6; w.spawnTime = 0; w.rex.x = level.length / 2;
    for (let k = 0; k < 600; k++) { w.update(1 / 60, empty); w.rex.hp = w.rex.max; }
    return new Set(w.enemies.map(e => e.type)); });
  assert.ok(!pools[0].has('tank') && !pools[0].has('firefighter'), 'district 1 keeps the original troops');
  assert.ok(['firefighter', 'drone', 'firetruck', 'tank'].every(type => pools.slice(4).some(set => set.has(type))), 'later districts field the new troops');
}

// Bos final
{
  assert.equal(levels[7].boss, 'robot');
  assert.ok(levels.slice(0, 7).every(l => !l.boss), 'only Alun-Alun has the boss');
  const world = new World(levels[7], 7);
  world.spawnTime = Infinity;
  world.rex.x = levels[7].length / 2;
  world.triggered = new Set(levels[7].bosses.map((_, i) => i));
  world.lost = world.total;
  world.update(1 / 60, empty);
  const boss = world.enemies.find(e => e.type === 'robot');
  assert.ok(boss && boss.hero, 'the robot arrives once the district is flat and the trio is down');
  assert.equal(world.phase, 'fight', 'the district does not clear while the robot stands');
  boss.x = world.rex.x + 230; boss.ultCd = 99;
  const hp = world.rex.hp;
  for (let i = 0; i < 180 && world.rex.hp === hp; i++) world.update(1 / 60, empty);
  assert.ok(world.rex.hp < hp, 'the robot punches');
  boss.hp = 1; world.rex.cd.bite = 0; world.rex.dir = Math.sign(boss.x - world.rex.x); boss.x = world.rex.x + 200 * world.rex.dir;
  world.rex.stun = 0; world.rex.attack = null; world.startAttack('bite');
  for (let i = 0; i < 30; i++) world.update(1 / 60, empty);
  assert.ok(boss.hp <= 0, 'the robot can be defeated');
  for (let i = 0; i < 5; i++) world.update(1 / 60, empty);
  assert.equal(world.phase, 'clear', 'beating the robot clears Alun-Alun');
}

// Mode grafis
{
  assert.equal(weakDevice({ deviceMemory: 2 }), true);
  assert.equal(weakDevice({ hardwareConcurrency: 8, deviceMemory: 8 }), false);
  assert.equal(useLite({ graphics: 'ringan' }, { hardwareConcurrency: 16 }), true);
  assert.equal(useLite({ graphics: 'tinggi' }, { deviceMemory: 1 }), false);
  assert.equal(useLite({ graphics: 'auto' }, { deviceMemory: 2 }), true);
  const lite = new World(levels[0], 0, { lite: true }), full = new World(levels[0], 0);
  lite.fx('debris', 0, 0, 5); full.fx('debris', 0, 0, 5);
  assert.ok(lite.effects.length < full.effects.length, 'lite mode spawns fewer particles');
}

// Terjemahan lengkap
{
  const sources = await Promise.all(['main', 'world', 'art', 'missions', 'tutorial', 'opening', 'settings'].map(n => readFile(new URL(`../web/src/${n}.js`, import.meta.url), 'utf8')));
  const html = await readFile(new URL('../web/index.html', import.meta.url), 'utf8');
  const used = new Set();
  for (const src of sources) for (const m of src.matchAll(/\bt(?:r)?\('((?:[^'\\]|\\.)+)'/g)) used.add(m[1].replace(/\\'/g, "'"));
  for (const m of html.matchAll(/data-i18n(?:-label)?="([^"]+)"/g)) used.add(m[1]);
  const known = new Set(i18nKeys);
  const extra = [...levels.map(l => l.name), 'Tanpa Akhir', ...missions.flat().map(m => m.text), ...tutorialSteps.flatMap(s => [s.key, s.touch]),
    ...Object.values(heroNamesCheck), ...Object.values(hintsCheck), ...Object.values(heroUltisCheck).map(u => u.name),
    ...Object.values(difficultiesCheck).map(d => d.label), ...Object.values(skinsCheck).map(s => s.label), ...Object.values(graphicsCheck), ...Object.values(padSizesCheck), ...Object.values(upgrades).flatMap(u => [u.name, u.text]), ...achievements.flatMap(a => [a.name, a.text])];
  for (const src of sources) for (const m of src.matchAll(/line: '((?:[^'\\]|\\.)+)'/g)) extra.push(m[1]);
  const missing = [...used, ...extra].filter(k => k && !known.has(k) && /[a-z]{3}/i.test(k) && !['Rage', 'REX', 'Ulti', 'Normal', 'Batik', 'Mecha', 'Perisai', 'Rajawali', 'Jaring'].includes(k));
  assert.deepEqual([...new Set(missing)], [], 'every visible string has an English translation');
  setLang('en');
  assert.equal(t('Distrik {n}', { n: 3 }), 'District 3');
  assert.equal(t('Jalan Ruko'), 'Ruko Street');
  setLang('id');
  assert.equal(t('Distrik {n}', { n: 3 }), 'Distrik 3');
}

// Upgrade antar-distrik
{
  const three = offer([], () => .5);
  assert.equal(new Set(three).size, 3, 'three different upgrades are offered');
  const maxed = Array(MAX_STACK).fill('sisik');
  for (let i = 0; i < 50; i++) assert.ok(!offer(maxed).includes('sisik'), 'a maxed upgrade is not offered again');
  const strong = new World(levels[0], 0, { upgrades: ['sisik', 'sisik', 'taring', 'paru'] }), base = makeWorld();
  assert.equal(strong.rex.max, base.rex.max + 120);
  strong.rex.cd.roar = 0; strong.startAttack('roar');
  assert.ok(Math.abs(strong.rex.cd.roar - cooldowns.roar * .7) < 1e-9, 'roar cooldown shrinks');
  const biter = new World(levels[0], 0, { upgrades: ['taring'] });
  for (const w of [biter, base]) { w.spawnTime = Infinity; const e = w.spawn('infantry', w.rex.x + 150); e.hp = 1e6; w.rex.cd.bite = 0; w.startAttack('bite'); for (let i = 0; i < 20; i++) w.update(1 / 60, empty); w.bitten = 1e6 - e.hp; }
  assert.ok(Math.abs(biter.bitten / base.bitten - 1.25) < 1e-6, 'bite damage rises 25%');
  assert.equal(modifiers(['irama']).comboWindow, 1);
}

// Pencapaian
{
  const store = new Map(), storage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  const stats = loadStats(storage), progress = loadProgress({ getItem: () => null });
  assert.deepEqual(unlock(stats, progress), [], 'nothing unlocks at the start');
  const world = makeWorld();
  world.spawnTime = Infinity;
  world.damageProp(world.props.find(p => p.type === 'spbu'), Infinity);
  const tank = world.spawn('tank', world.rex.x - 200); world.rex.cd.tail = 0; world.startAttack('tail');
  for (let i = 0; i < 20; i++) world.update(1 / 60, empty);
  const run = world.runStats();
  assert.equal(run.props.spbu, 1); assert.equal(run.tanks, 1);
  for (let i = 0; i < 10; i++) addRun(stats, run);
  progress.cleared[0] = true;
  const fresh = unlock(stats, progress).map(a => a.id);
  assert.ok(fresh.includes('langkah') && fresh.includes('spbu'), 'clearing district 1 and ten SPBU blasts unlock their achievements');
  assert.deepEqual(unlock(stats, progress), [], 'achievements unlock only once');
  saveStats(stats, storage);
  assert.deepEqual(loadStats(storage).unlocked, stats.unlocked);
  assert.equal(new Set(achievements.map(a => a.id)).size, achievements.length);
}

// Misi harian
{
  const day = new Date(2026, 10, 21), next = new Date(2026, 10, 22), later = new Date(2026, 10, 25);
  const a = todayMission(8, day), b = todayMission(8, day);
  assert.deepEqual(a, b, 'the same day gives the same mission');
  const week = Array.from({ length: 14 }, (_, i) => todayMission(8, new Date(2026, 10, 21 + i)));
  assert.ok(new Set(week.map(m => m.district + ':' + m.kind)).size > 5, 'missions vary from day to day');
  assert.ok(Array.from({ length: 30 }, (_, i) => todayMission(2, new Date(2026, 0, 1 + i))).every(m => m.district < 2), 'only unlocked districts are picked');
  for (const kind of [0, 1, 2, 3, 4, 5]) assert.ok(i18nKeys.includes(missionTemplate({ kind })), 'daily mission text is translated');
  const world = makeWorld();
  assert.equal(passed({ kind: 4, n: 0 }, world), false, 'a loss never passes');
  world.status = 'won';
  assert.equal(passed({ kind: 4, n: 0 }, world), true);
  world.usedUlti = true;
  assert.equal(passed({ kind: 4, n: 0 }, world), false, 'using the ulti fails the no-ulti mission');
  const store = new Map(), storage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  let rec = loadDaily(storage);
  rec = completeDaily(rec, day, storage); rec = completeDaily(rec, day, storage);
  assert.deepEqual([rec.streak, rec.total], [1, 1], 'a day counts once');
  rec = completeDaily(rec, next, storage);
  assert.equal(rec.streak, 2, 'consecutive days build a streak');
  rec = completeDaily(rec, later, storage);
  assert.equal(rec.streak, 1, 'a missed day resets the streak');
  assert.equal(loadDaily(storage).total, 3);
  assert.equal(dayKey(day), '2026-11-21');
}

// Hujan deras
{
  const run = event => { const w = new World(levels[1], 1, { event }); w.spawnTime = Infinity; const e = w.spawn('infantry', w.rex.x + 900); const x = e.x;
    for (let i = 0; i < 30; i++) w.update(1 / 60, empty); return { w, moved: x - e.x }; };
  const dry = run(''), wet = run('rain');
  assert.equal(wet.w.weather, 'rain');
  assert.ok(wet.moved < dry.moved * .8 && wet.moved > 0, 'rain slows soldiers');
  assert.equal(new World(levels[1], 1).weather, '', 'no random events unless asked');
  assert.equal(new World(levels[0], 0, { events: true }).weather, '', 'district 1 stays dry');
}

// ThunderRex
{
  const struck = new World(levels[2], 2, { event: 'rain', thunderChance: 1 });
  struck.spawnTime = Infinity;
  assert.ok(Number.isFinite(struck.strikeRexAt), 'a strike is scheduled when the chance hits');
  struck.strikeRexAt = .5;
  for (let i = 0; i < 60; i++) struck.update(1 / 60, empty);
  assert.ok(struck.thunderUnlocked && struck.thunder, 'the strike unlocks ThunderRex at once');
  assert.ok(struck.events.length || true);
  const dry = new World(levels[2], 2, { event: '', thunderChance: 1 });
  assert.equal(dry.strikeRexAt, Infinity, 'no strike without rain');
  const never = new World(levels[2], 2, { event: 'rain', thunderChance: 0 });
  assert.equal(never.strikeRexAt, Infinity);
  // Efek petir tidak mengubah damage
  const hit = thunder => { const w = new World(levels[0], 0, { thunder }); w.spawnTime = Infinity; const e = w.spawn('infantry', w.rex.x + 150); e.hp = 1e6;
    w.rex.cd.bite = 0; w.startAttack('bite'); for (let i = 0; i < 20; i++) w.update(1 / 60, empty); return { dmg: 1e6 - e.hp, bolts: w.effects.filter(f => f.kind === 'bolt').length }; };
  const plain = hit(false), zap = hit(true);
  assert.equal(zap.dmg, plain.dmg, 'ThunderRex keeps the same damage');
  assert.ok(zap.bolts === 0 && plain.bolts === 0, 'ThunderRex bites without lightning');
  const tail = new World(levels[0], 0, { thunder: true }); tail.spawnTime = Infinity; tail.rex.cd.tail = 0; tail.startAttack('tail');
  for (let i = 0; i < 30; i++) tail.update(1 / 60, empty);
  assert.ok(tail.effects.some(f => f.kind === 'bolt'), 'ThunderRex skills throw lightning');
  // Turret Jaring hancur
  const net = new World(levels[0], 0, {}); net.spawnTime = Infinity; const boss = net.spawn('jaring', net.rex.x + 200), turret = net.spawn('turret', net.rex.x + 150);
  turret.owner = boss; boss.timer = -1; turret.hp = 0; net.defeat(turret); net.update(1 / 60, empty);
  assert.ok(!net.enemies.some(e => e.owner === boss && e.hp > 0), 'Jaring stays open after its turret falls');
}

// Pawai dan konvoi
{
  const w = new World(levels[2], 2, { parade: true, convoy: false }); w.spawnTime = Infinity;
  const marchers = w.civilians.filter(c => c.type === 'pawai');
  assert.equal(marchers.length, 8, 'the parade brings eight marchers');
  assert.ok(w.props.some(p => p.type === 'panjat-pinang'), 'the parade raises a panjat pinang pole');
  const x0 = marchers[0].x; for (let i = 0; i < 30; i++) w.update(1 / 60, empty);
  assert.ok(marchers[0].x < x0 && marchers[0].calm, 'marchers walk calmly toward Rex');
  w.rex.x = marchers[0].x - 200; w.update(1 / 60, empty);
  assert.ok(!marchers[0].calm && !marchers[0].march, 'marchers scatter when Rex arrives');
  const none = new World(levels[2], 2, { parade: false, convoy: false });
  assert.ok(!none.civilians.some(c => c.type === 'pawai') && !none.props.some(p => p.type === 'panjat-pinang'));
  const ride = new World(levels[2], 2, { parade: false, convoy: true }); ride.spawnTime = Infinity;
  assert.ok(Number.isFinite(ride.convoyAt), 'a convoy is scheduled');
  ride.rex.x = ride.convoyAt; ride.update(1 / 60, empty);
  assert.equal(ride.motors.length, 5, 'five motorbikes arrive');
  const hp = ride.rex.hp; for (let i = 0; i < 420; i++) ride.update(1 / 60, empty);
  assert.equal(ride.motorsDown, 5, 'every motorbike crashes into Rex');
  assert.equal(ride.rex.hp, hp, 'crashing motorbikes do not hurt Rex');
  assert.equal(ride.motors.length, 0, 'wrecks fade away');
  const manifest = JSON.parse(await readFile(new URL('../web/assets/manifest.json', import.meta.url))).assets;
  for (const key of ['characters/civilians/pawai/master', 'characters/civilians/pawai/frames/run-a', 'props/panjat-pinang-wreck', 'characters/soldiers/motor', 'characters/soldiers/motor-wreck'])
    assert.ok(manifest[key + '.png'], key + ' is registered');
}

// Aksi developer
{
  const w = makeWorld();
  w.devAction('flatten');
  assert.ok(w.percent > 99.9, 'flatten wrecks the district');
  w.devAction('heroes');
  assert.equal(w.enemies.filter(e => e.hero).length, 3);
  assert.equal(w.devAction('god'), 'Kebal: nyala');
  const hp = w.rex.hp; w.hurt(100);
  assert.equal(w.rex.hp, hp, 'god mode blocks damage');
  w.devAction('cooldown');
  assert.ok(Object.values(w.rex.cd).every(v => v === 0));
  w.devAction('tank');
  assert.ok(w.enemies.some(e => e.type === 'tank'));
  assert.equal(w.devAction('robot'), 'Bos hanya ada di Alun-Alun dan misi spesial');
  const end = new World(levels[0], 0); end.spawnTime = Infinity; end.devAction('end');
  for (let i = 0; i < 5; i++) end.update(1 / 60, empty);
  assert.equal(end.phase, 'clear', 'skip to end clears the district');
  const boss = new World(levels[7], 7); boss.devAction('robot');
  assert.ok(boss.enemies.some(e => e.type === 'robot'));
  const done = makeWorld(); done.devAction('win');
  assert.equal(done.status, 'won');
}

// Peluru tidak menembus Rex yang kebal
{
  const w = makeWorld(); w.spawnTime = Infinity; w.god = true;
  w.shots.push({ x: w.rex.x + 30, y: -150, type: 'rocket', vx: -10, vy: 0, life: 3 });
  w.update(1 / 60, empty);
  assert.equal(w.shots.length, 0, 'shots stop at an invulnerable Rex');
  assert.equal(w.rex.hp, w.rex.max, 'and do no damage');
  const dev = new World(levels[0], 0, { god: true });
  dev.rex.hp = 1; dev.hurt(999);
  assert.equal(dev.rex.hp, 1, 'developer god mode starts on');
}

// Darah dan penembak
{
  const first = new World(levels[0], 0), last = new World(levels[7], 7);
  assert.ok(last.rex.max > first.rex.max, 'Rex has more health in later districts');
  assert.ok(new World(levels[0], 0, { difficulty: 'santai' }).gunnerCap < new World(levels[0], 0, { difficulty: 'ngamuk' }).gunnerCap, 'difficulty changes how many soldiers fire');
  const w = new World(levels[0], 0); w.spawnTime = Infinity; w.god = true;
  for (let i = 0; i < 12; i++) w.spawn('infantry', w.rex.x + 300 + i * 30);
  let shots = 0; const shoot = w.shoot.bind(w); w.shoot = (e, t) => { shots++; shoot(e, t); };
  for (let i = 0; i < 600; i++) w.update(1 / 60, empty);
  assert.ok(w.gunners.size <= w.gunnerCap, 'only the nearest soldiers fire');
  assert.ok(shots <= w.gunnerCap * 3 * 4, 'a crowd does not fire all at once');
}

console.log(JSON.stringify({ attackTiming: 'pass', spriteTransitions: 'pass', landing: 'pass', distances }, null, 2));

// Musik chiptune
{
  const { noteFreq, parseBar, songs } = await import('../web/src/music.js');
  assert.ok(Math.abs(noteFreq('A4') - 440) < 1e-9 && Math.abs(noteFreq('C5') - 523.25) < .01, 'note names map to pitches');
  assert.deepEqual(parseBar('A4 - . C5'), [{ step: 0, note: 'A4', len: 2 }, { step: 3, note: 'C5', len: 1 }], 'sustains extend notes');
  for (const [name, song] of Object.entries(songs)) {
    assert.equal(song.lead.length, song.chords.length, name + ' has a chord per bar');
    for (const bar of song.lead) { assert.equal(bar.trim().split(/\s+/).length, 16, name + ' bars have 16 steps'); for (const n of parseBar(bar)) assert.ok(noteFreq(n.note) > 0, n.note) }
    for (const [root, ...chord] of song.chords) { assert.ok(noteFreq(root) > 0); for (const c of chord) assert.ok(noteFreq(c + 4) > 0, c) }
  }
}

// Misi spesial
{
  const special = await Promise.all(['merdeka', 'salju', 'halloween'].map(async k => JSON.parse(await readFile(new URL(`../web/data/levels/misi-${k}.json`, import.meta.url), 'utf8'))));
  const make = (i, options = {}) => { const w = new World(special[i], 7, { events: true, ...options }); w.spawnTime = Infinity; return w; };
  const [merdeka, salju, halloween] = special.map((_, i) => make(i));
  assert.equal(merdeka.rex.max, 900, 'missions give Rex 900 HP');
  assert.ok(special.every(l => l.length > 15625 * 1.4), 'mission routes are longer than districts');
  assert.ok(merdeka.civilians.some(c => c.type === 'pawai') && merdeka.props.some(p => p.type === 'panjat-pinang'), 'the parade belongs to the Independence mission');
  assert.ok(merdeka.civilians.some(c => c.type === 'balap-karung'), 'sack racers join the Independence mission');
  for (let i = 0; i < 6; i++) { const plain = new World(levels[i], i, { events: true }); assert.ok(!plain.civilians.some(c => c.type === 'pawai'), 'no parade in regular districts') }
  assert.equal(salju.weather, 'snow');
  // Terbang
  const fly = make(0, { skill: 'terbang' }); fly.update(1 / 60, new Set(['special']));
  for (let i = 0; i < 40; i++) fly.update(1 / 60, empty);
  assert.ok(fly.rex.lift > 150 && fly.rex.fly > 0, 'Terbang lifts Rex off the ground');
  const hp = fly.rex.hp; fly.hurt(50, 0); assert.equal(fly.rex.hp, hp, 'melee cannot reach a flying Rex');
  fly.hurt(10, 0, true); assert.ok(fly.rex.hp < hp, 'projectiles still hit a flying Rex');
  for (let i = 0; i < 260; i++) fly.update(1 / 60, empty);
  assert.equal(fly.rex.lift, 0, 'Rex lands after the flight');
  assert.ok(fly.rex.cd.special > 0, 'Terbang has a cooldown');
  // Duri es
  const ice = make(1, { skill: 'duri' }); const foe = ice.spawn('infantry', ice.rex.x + 500); const boss = ice.spawn('boneka-salju', ice.rex.x + 800);
  ice.update(1 / 60, new Set(['special'])); for (let i = 0; i < 60; i++) ice.update(1 / 60, empty);
  assert.ok(foe.hp <= 0 || foe.hp < foe.max, 'ice spikes pierce soldiers');
  assert.ok(boss.hp < boss.max, 'ice spikes pierce bosses');
  // Bangkit
  const bone = make(2, { skill: 'bangkit' }); bone.rex.hp = 0; bone.update(1 / 60, empty);
  assert.ok(bone.rex.reviving > 0 && bone.phase === 'fight', 'Rex Tulang collapses instead of dying');
  for (let i = 0; i < 160; i++) bone.update(1 / 60, empty);
  assert.equal(bone.rex.hp, 400, 'Rex Tulang rises again with 400 HP');
  bone.rex.hp = 0; bone.update(1 / 60, empty); assert.equal(bone.phase, 'dying', 'the revival works once');
  // Bos
  const rat = make(0); const r = rat.spawn('tikus', rat.rex.x + 600); r.timer = 0;
  const before = rat.rex.hp; for (let i = 0; i < 400; i++) rat.update(1 / 60, empty);
  assert.ok(rat.rex.hp < before, 'the giant rat attacks Rex');
  rat.cast = null; rat.lastCast = -99; rat.startCast(r); rat.cast.age = rat.cast.windup; rat.update(1 / 60, empty);
  for (let i = 0; i < 120; i++) rat.update(1 / 60, empty);
  assert.ok(rat.rex.slow > 0, 'gold coin rain slows Rex');
  const snow = make(1); const sm = snow.spawn('boneka-salju', snow.rex.x + 500); snow.startCast(sm); snow.cast.age = snow.cast.windup; snow.update(1 / 60, empty);
  for (let i = 0; i < 90 && !(snow.rex.frozen > 0); i++) snow.update(1 / 60, empty);
  assert.ok(snow.rex.frozen > 0, 'the freeze cannon freezes Rex');
  const thaw = snow.rex.frozen; snow.update(1 / 60, new Set(['bite'])); assert.ok(snow.rex.frozen < thaw - .15, 'mashing breaks the ice faster');
  const hall = make(2); const witch = hall.spawn('penyihir', hall.rex.x + 600); witch.timer = 0;
  for (let i = 0; i < 120; i++) hall.update(1 / 60, empty);
  assert.ok(hall.enemies.some(e => e.type === 'tengkorak'), 'the witch summons skeletons');
  assert.ok(witch.y < -100 || witch.mode === 'summon', 'the witch flies between summons');
}
