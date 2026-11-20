import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { World, cooldowns } from '../src/world.js';
import { attackPose, damp, spritePose } from '../src/motion.js';
import { rexFramePath, rexPose } from '../src/rex-animation.js';

const levels = await Promise.all([1, 2, 3, 4].map(async n =>
  JSON.parse(await readFile(new URL(`../data/levels/level-0${n}.json`, import.meta.url), 'utf8'))));
const empty = new Set();
const manifest = JSON.parse(await readFile(new URL('../assets/manifest.json', import.meta.url), 'utf8'));
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

console.log(JSON.stringify({ attackTiming: 'pass', spriteTransitions: 'pass', landing: 'pass', distances }, null, 2));
