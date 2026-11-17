(async function () {
  'use strict';
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const floors = document.getElementById('floors');
  const details = document.getElementById('details');
  const save = document.getElementById('export');
  const status = document.getElementById('status');
  try {
    const kit = await RexCityKit.loadKit(window.RAMPAGE_REX_ASSETS, '../');
    function render() {
      RexCityKit.drawScene(ctx, kit, {floors: Number(floors.value), details: details.checked});
      canvas.dataset.ready = 'true';
      canvas.dataset.floors = floors.value;
    }
    floors.addEventListener('change', render);
    details.addEventListener('change', render);
    save.addEventListener('click', () => {
      try {
        canvas.toBlob(blob => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const link = Object.assign(document.createElement('a'), {href:url, download:'rampagerex-city-kit-preview.png'});
          link.click();setTimeout(() => URL.revokeObjectURL(url), 1000);
        }, 'image/png');
      } catch (error) {
        status.hidden = false;
        status.textContent = 'Untuk ekspor PNG, buka preview melalui server lokal sesuai README.';
      }
    });
    for (const [id, part] of Object.entries(kit.manifest.assets)) {
      const figure = document.createElement('figure');figure.className = 'asset-card';
      const art = document.createElement('div');art.className = 'asset-art';
      const thumb = document.createElement('canvas');thumb.width=640;thumb.height=400;
      thumb.setAttribute('aria-label',part.name);
      const [l,t,r,b] = part.bounds;
      const scale = Math.min(560/(r-l), 320/(b-t));
      thumb.getContext('2d').drawImage(kit.images[id],l,t,r-l,b-t,
        (640-(r-l)*scale)/2,(400-(b-t)*scale)/2,(r-l)*scale,(b-t)*scale);
      art.append(thumb);
      const caption = document.createElement('figcaption');
      const label = document.createElement('div');
      const title = document.createElement('span');title.className='asset-title';title.textContent=part.name;
      const meta = document.createElement('span');meta.className='asset-meta';meta.textContent=`${part.width} × ${part.height} / PNG RGBA`;
      const link = document.createElement('a');link.href='../'+part.file;link.download='';link.textContent='PNG ↗';link.setAttribute('aria-label','Unduh '+part.name);
      label.append(title,meta);caption.append(label,link);figure.append(art,caption);document.getElementById('gallery').append(figure);
    }
    render();save.disabled=false;status.hidden=true;
    window.previewKit = kit;
  } catch (error) {
    status.textContent = 'Aset gagal dimuat. Pastikan seluruh folder assets tersedia.';
    console.error(error);
  }
})();
