import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { World } from '../src/world.js';
import { attackPose, damp, spritePose } from '../src/motion.js';
import { rexFramePath, rexPose } from '../src/rex-animation.js';

const levels = await Promise.all([1, 2, 3, 4].map(async n =>
  JSON.parse(await readFile(new URL(`../data/levels/level-0${n}.json`, import.meta.url), 'utf8'))));
const empty = new Set();
const manifest = JSON.parse(await readFile(new URL('../assets/manifest.json', import.meta.url), 'utf8'));
const animation = manifest.rexAnimations;
assert.equal(Object.values(animation.atlases).reduce((sum, atlas) => sum + atlas.frames.length, 0), 32);
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
  // Match the browser loop's maximum 1/60 s simulation steps.
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

console.log(JSON.stringify({ attackTiming: 'pass', spriteTransitions: 'pass', landing: 'pass', distances }, null, 2));
