import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { World, cooldowns } from '../web/src/world.js';
import { attackPose, damp, spritePose } from '../web/src/motion.js';
import { rexFramePath, rexPose } from '../web/src/rex-animation.js';
import { loadProgress, saveProgress, recordDistrict, resetProgress } from '../web/src/progress.js';
import { loadSettings, saveSettings, defaults } from '../web/src/settings.js';
import { Tutorial, steps as tutorialSteps } from '../web/src/tutorial.js';
import { missions, earned, starText } from '../web/src/missions.js';
import { totalStars } from '../web/src/progress.js';

const levels = await Promise.all([1, 2, 3, 4].map(async n =>
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
  assert.deepEqual([progress.unlocked, progress.cleared, progress.best], [1, [false, false, false, false], [0, 0, 0, 0]]);
  recordDistrict(progress, 0, 900, false);
  assert.equal(progress.unlocked, 1, 'a loss must not unlock the next district');
  recordDistrict(progress, 0, 1500, true);
  recordDistrict(progress, 0, 700, true);
  saveProgress(progress, storage);
  progress = loadProgress(storage);
  assert.deepEqual([progress.unlocked, progress.cleared[0], progress.best[0]], [2, true, 1500]);
  recordDistrict(progress, 3, 10, true);
  assert.equal(progress.unlocked, 4, 'unlocks never pass the last district');
  store.set('rex.progress', '{broken');
  assert.equal(loadProgress(storage).unlocked, 1, 'corrupt saves fall back to a fresh start');
  assert.equal(resetProgress(storage).unlocked, 1);
}

// Pengaturan dan kesulitan
{
  const store = new Map(), storage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  assert.deepEqual(loadSettings(storage), defaults);
  saveSettings({ sfx: 140, vibrate: false, pad: 'xl', difficulty: 'ngamuk' }, storage);
  assert.deepEqual(loadSettings(storage), { sfx: 100, vibrate: false, pad: 'm', difficulty: 'ngamuk', skin: 'merah' }, 'invalid values fall back');
  saveSettings({ skin: 'emas' }, storage);
  assert.equal(loadSettings(storage).skin, 'emas');
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
  assert.equal(missions.length, 4);
  for (const row of missions) assert.equal(row.length, 3);
  const world = makeWorld();
  assert.deepEqual(earned(world, 0), [false, false, false]);
  world.status = 'won'; world.time = 300; world.maxCombo = 30;
  assert.deepEqual(earned(world, 0), [true, true, true]);
  world.time = 500;
  assert.deepEqual(earned(world, 0), [true, false, true], 'the time mission needs a fast clear');
  const ultis = new World(levels[1], 1);
  ultis.status = 'won'; ultis.cancelled = 2;
  assert.equal(earned(ultis, 1)[2], true);
  const props = new World(levels[2], 2);
  for (const p of props.props) props.damageProp(p, Infinity);
  assert.equal(earned(props, 2)[2], true, 'wrecking every prop earns the district 3 star');
  const hp = new World(levels[3], 3);
  hp.status = 'won'; hp.rex.hp = hp.rex.max / 2 - 1;
  assert.equal(earned(hp, 3)[2], false);
  const store = new Map(), storage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
  const progress = loadProgress(storage);
  recordDistrict(progress, 0, 10, true, [true, false, true]);
  recordDistrict(progress, 0, 10, true, [true, true, false]);
  assert.deepEqual(progress.stars[0], [true, true, true], 'stars from different runs add up');
  saveProgress(progress, storage);
  assert.equal(totalStars(loadProgress(storage)), 3);
  assert.equal(starText([true, false, true]), '★☆★');
}

console.log(JSON.stringify({ attackTiming: 'pass', spriteTransitions: 'pass', landing: 'pass', distances }, null, 2));
