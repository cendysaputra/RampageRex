import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const { chromium } = await import(process.env.PLAYWRIGHT_PATH
  ? pathToFileURL(process.env.PLAYWRIGHT_PATH).href : 'playwright');
const output = process.env.REX_PREVIEW_DIR || join(tmpdir(), 'rampage-rex-preview');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [], interactions = [];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.goto(process.env.REX_URL || 'http://127.0.0.1:8000');
  await page.locator('#help').click();
  assert.equal(await page.locator('#panel-title').textContent(), 'Cara main');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#panel').isVisible(), false);
  interactions.push('Cara main opens; Escape returns to menu');
  const audio = page.locator('.audio'), previousSound = await audio.getAttribute('aria-pressed');
  await audio.click();
  assert.notEqual(await audio.getAttribute('aria-pressed'), previousSound);
  await audio.click();
  interactions.push('Sound toggles off and on');
  const cover = await page.locator('.cover-rex').evaluate(image => ({ width: image.clientWidth, height: image.clientHeight, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight }));
  assert.ok(Math.abs(cover.width / cover.height - cover.naturalWidth / cover.naturalHeight) < .02);
  await page.locator('#start').click();
  await page.locator('#hud').waitFor({ state: 'visible' });
  await page.screenshot({ path: join(output, 'desktop.png') });
  await page.keyboard.down('d');await page.waitForTimeout(650);await page.keyboard.up('d');
  for (const key of ['j', 'k', 's', 'l']) {
    await page.keyboard.press(key);
    await page.waitForTimeout(950);
  }
  assert.ok(parseInt(await page.locator('#destruction').textContent()) > 0);
  interactions.push('Walk and four keyboard attacks damage buildings');
  await page.locator('#pause').click();
  assert.equal(await page.locator('#panel-title').textContent(), 'Jeda');
  await page.getByRole('button', { name: 'Lanjut main', exact: true }).click();
  await page.keyboard.press('p');
  assert.equal(await page.locator('#panel').isVisible(), true);
  await page.getByRole('button', { name: /Matikan suara|Aktifkan suara/ }).click();
  assert.equal(await page.locator('#panel-title').textContent(), 'Jeda');
  interactions.push('Pause button, resume, P and paused sound toggle work');
  const assets = await page.evaluate(async () => {
    const { Art } = await import('./src/art.js');
    const manifest = await (await fetch('./assets/manifest.json')).json();
    const art = new Art(manifest);
    for (let n = 1; n <= 4; n++) await art.preload(await (await fetch(`./data/levels/level-0${n}.json`)).json());
    let decodedPixels = 0, originalPixels = 0;
    for (const [path, image] of art.images) {
      const meta = art.meta[path + '.png'];
      if (!image.width || !image.height) throw Error(`Empty asset: ${path}`);
      if (path.startsWith('backgrounds/') && (image.width !== meta.width || image.height !== meta.height)) throw Error(`Background cropped: ${path}`);
      decodedPixels += image.width * image.height;
      originalPixels += meta.width * meta.height;
    }
    const nativeBitmap = window.createImageBitmap;
    let fallback;
    try {
      window.createImageBitmap = undefined;
      const alternate = new Art(manifest);
      for (const atlas of Object.values(manifest.rexAnimations.atlases)) await alternate.load(atlas.path);
      await alternate.prepareRexFrames();
      const frames = [...alternate.images.entries()].filter(([path]) => path.startsWith('characters/rex/animation-frames/'));
      fallback = frames.length === 24 && frames.every(([, image]) => image instanceof HTMLCanvasElement && image.width > 0);
    } finally { window.createImageBitmap = nativeBitmap; }
    const count = art.images.size;
    const generatedFrames = [...art.images.keys()].filter(path => path.startsWith('characters/rex/animation-frames/')).length;
    window.previewArt = art;
    return { count, generatedFrames, decodedPixels, originalPixels, fallback };
  });
  assert.equal(assets.fallback, true);
  assert.equal(assets.generatedFrames, 24);
  // Exercise every district and sprite family, including partial pose blends.
  const scenes = [];
  for (let district = 1; district <= 4; district++) {
    scenes.push(await page.evaluate(async district => {
      const { World, people } = await import('./src/world.js');
      const { Renderer } = await import('./src/art.js');
      const level = await (await fetch(`./data/levels/level-0${district}.json`)).json();
      const world = new World(level, district - 1);
      const renderer = new Renderer(document.querySelector('#world'), window.previewArt);
      document.querySelector('#panel').close();
      document.querySelector('#hud').hidden = true;
      renderer.render(world);
      world.rex.x = 700;world.camera = 260;world.spawnTime = Infinity;
      for (const [index, type] of ['infantry', 'bazooka', 'perisai', 'rajawali', 'jaring', 'jeep', 'helicopter'].entries()) {
        const e = world.spawn(type, 900 + index * 110);
        if (type === 'perisai') e.mode = 'charge';
        if (type === 'rajawali') e.mode = 'dive';
      }
      world.civilians = people.map((type, index) => ({ type, x: 800 + index * 130, dir: 1, speed: 280, phase: index, walk: index, lane: 15 }));
      for (const kind of ['dust', 'explosion', 'debris', 'decor']) world.fx(kind, 900, -70, 3);
      world.damageModule(world.buildings[0], 0, 220);
      const started = performance.now();
      for (let frame = 0; frame < 36; frame++) {
        world.update(1 / 120, new Set(['right', 'bite']));
        renderer.render(world);
      }
      for (const e of [world.rex, ...world.enemies, ...world.civilians]) {
        if (!Number.isFinite(e.x) || !Number.isFinite(e.walk)) throw Error('Invalid animation coordinates');
      }
      window.previewWorld = world;window.previewRenderer = renderer;
      return { district, renderedFrames: 36, scriptMs: Math.round(performance.now() - started) };
    }, district));
    await page.screenshot({ path: join(output, `district-${district}.png`) });
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reduced = await page.evaluate(() => {
    window.previewRenderer.render(window.previewWorld);
    return window.previewRenderer.motionPreference.matches;
  });
  assert.equal(reduced, true);
  await page.evaluate(async () => {
    const { World } = await import('./src/world.js');
    const { rexPose } = await import('./src/rex-animation.js');
    const art = window.previewArt, canvas = document.createElement('canvas');
    canvas.id = 'sprite-review';canvas.width = 1440;canvas.height = 760;
    canvas.style.cssText = 'position:fixed;inset:0;z-index:10;width:1440px;height:760px';
    document.body.append(canvas);
    const c = canvas.getContext('2d');c.fillStyle = '#d28865';c.fillRect(0, 0, 1440, 760);
    for (const [index, key] of ['idle', 'walk', 'bite', 'tail', 'stomp', 'roar'].entries()) {
      const world = new World(window.previewWorld.level, 0);
      if (key === 'walk') { world.rex.walk = Math.PI * .8;world.rex.stride = 1; }
      else if (key !== 'idle') { world.startAttack(key);world.rex.attack.age = world.rex.attack.impact; }
      const pose = rexPose(world.rex, art.rexAnimations), x = (index % 3) * 480, y = Math.floor(index / 3) * 380;
      c.fillStyle = '#102321';c.font = 'bold 22px Arial';c.fillText(key.toUpperCase(), x + 24, y + 38);
      art.blend(c, pose.from, pose.to, pose.mix, x + 270, y + 325, 470);
    }
  });
  await page.locator('#sprite-review').screenshot({ path: join(output, 'rex-generated-poses.png') });
  await page.locator('#sprite-review').evaluate(canvas => canvas.remove());
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const touch = await page.context().newCDPSession(page);
  await touch.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 2 });
  for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    await page.reload();
    await page.locator('#start').click();
    await page.locator('#hud').waitFor({ state: 'visible' });
    for (const action of ['left', 'right', 'bite', 'tail', 'stomp', 'roar']) {
      const button = page.locator(`[data-action="${action}"]`), box = await button.boundingBox();
      assert.ok(box && box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width && box.y + box.height <= viewport.height);
      await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }] });
      await page.waitForTimeout(80);
      await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(overflow, false);
    await page.screenshot({ path: join(output, `mobile-${viewport.width}.png`) });
    await page.locator('#pause').click();
    await page.getByRole('button', { name: 'Menu utama', exact: true }).click();
    assert.equal(await page.locator('#menu').isVisible(), true);
  }
  interactions.push('Six touch controls fit portrait and landscape; pause returns to menu');
  assert.deepEqual(errors, []);
  await writeFile(join(output, 'results.json'), JSON.stringify({ assets, scenes, reduced, interactions, errors }, null, 2));
  console.log(JSON.stringify(assets));
  console.log(`Browser checks passed. Screenshots: ${output}`);
} finally {
  await browser.close();
}
