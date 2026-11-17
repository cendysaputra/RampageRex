/* Engine-independent, lossless placement of the original PNG assets. */
(function (root) {
  'use strict';
  async function loadKit(manifest, assetRoot) {
    const images = {};
    await Promise.all(Object.entries(manifest.assets).map(async ([id, asset]) => {
      const img = new Image();
      img.src = new URL(assetRoot + asset.file, document.baseURI).href;
      await img.decode();
      images[id] = img;
    }));
    return {manifest, images};
  }
  function drawPart(ctx, kit, id, x, bottom, width) {
    const part = kit.manifest.assets[id];
    const [left, top, right, base] = part.connection;
    const scale = width / (right - left);
    ctx.drawImage(kit.images[id], x - left * scale,
      bottom - base * scale, part.width * scale, part.height * scale);
    return {top: bottom - (base - top) * scale, bottom, x, width};
  }
  function drawDecoration(ctx, kit, id, x, bottom, width) {
    const part = kit.manifest.assets[id];
    const [left, top, right, base] = part.bounds;
    const height = (base - top) * width / (right - left);
    ctx.drawImage(kit.images[id], left, top, right - left, base - top,
      x, bottom - height, width, height);
  }
  function drawBuilding(ctx, kit, options = {}) {
    const {x = 0, bottom = 0, width = 512, floors = 2, details = true} = options;
    const count = Math.max(0, Math.min(6, Math.round(floors)));
    const base = drawPart(ctx, kit, 'ground-floor', x, bottom, width);
    const levels = [];
    let seam = base.top;
    for (let i = 0; i < count; i++) {
      // Small controlled overlap removes hairline gaps at fractional zoom levels.
      const floor = drawPart(ctx, kit, 'upper-floor', x, seam + width * .006, width);
      levels.push(floor);
      seam = floor.top;
    }
    const roof = drawPart(ctx, kit, 'roof', x, seam + width * .006, width);
    if (details) {
      drawDecoration(ctx, kit, 'planter', x + width * .87, bottom, width * .17);
      drawDecoration(ctx, kit, 'shop-sign', x + width * .93,
        base.top + (bottom - base.top) * .5, width * .19);
      for (const level of levels) {
        drawDecoration(ctx, kit, 'balcony', x + width * .13,
          level.top + (level.bottom - level.top) * .86, width * .32);
      }
    }
    return {base, levels, roof};
  }
  function drawScene(ctx, kit, options = {}) {
    const floors = Math.max(0, Math.min(3, Math.round(options.floors ?? 2)));
    const details = options.details ?? true;
    ctx.clearRect(0, 0, 1920, 1080);
    ctx.fillStyle = '#bde3dc'; ctx.fillRect(0, 0, 1920, 1080);
    // Simple display backdrop; it is not part of the transparent asset kit.
    ctx.fillStyle = '#cdebe0';
    ctx.beginPath(); ctx.arc(1520, 200, 98, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#add5ca'; ctx.fillRect(0, 870, 1920, 70);
    ctx.fillStyle = '#a6b791'; ctx.fillRect(0, 940, 1920, 140);
    ctx.fillStyle = '#d7d2b5'; ctx.fillRect(0, 940, 1920, 22);
    ctx.fillStyle = '#b6b298'; ctx.fillRect(0, 962, 1920, 4);
    const centerWidth = floors === 3 ? 380 : 470;
    return [
      {x: 205, width: 390, floors: Math.max(0, floors - 1)},
      {x: 960 - centerWidth / 2, width: centerWidth, floors},
      {x: 1345, width: 350, floors: Math.min(3, floors + 1)}
    ].map(config => drawBuilding(ctx, kit, {...config, bottom: 940, details}));
  }
  root.RexCityKit = {loadKit, drawBuilding, drawPart, drawDecoration, drawScene};
})(window);
