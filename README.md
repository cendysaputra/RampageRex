# Rampage Rex

Game 2D HTML5 Canvas dengan empat distrik Ruko Senja. Kamu bermain sebagai Rex. Hancurkan modul bangunan, penuhi target distrik, dan kalahkan pahlawannya. Warga sipil akan melarikan diri.

## Main lokal

Dari root repo, jalankan `python -m http.server 8000`, lalu buka `http://localhost:8000`. Game membaca modul JavaScript, data level, dan aset lewat HTTP. Tanpa instalasi paket atau build.

| Kontrol | Aksi |
| --- | --- |
| A/D atau ←/→ | Jalan |
| J | Gigit di depan |
| K | Sabet dengan ekor di belakang |
| S | Injak |
| L | Raung (25 Rage) |
| Esc atau P | Jeda |

Di layar sentuh, gunakan tombol arah dan aksi. Rekor tersimpan di browser. Pengaturan empat distrik ada di `data/levels/`.

## Aset

Game memuat salinan WebP dari gambar di `assets/` (lihat `imageFormat` di `assets/manifest.json`). File PNG tetap disimpan sebagai sumber. Setelah menambah atau mengubah PNG, jalankan `python tools/to-webp.py` dari root repo (butuh Pillow) untuk membuat ulang salinan WebP-nya.

Renderer memangkas ruang transparan saat decode berdasarkan `bounds` di manifest, lalu menggambar dengan pivot asli. Perbarui bounds dan pivot jika bentuk aset berubah. Latar disiapkan ulang saat ukuran layar berubah; langit dan jalan mempertahankan proporsinya pada layar portrait.

## Pemeriksaan animasi

Dengan Node.js 22 atau lebih baru, jalankan `node --experimental-default-type=module tools/check-motion.mjs`. Pemeriksaan ini menguji waktu benturan, perpindahan pose, pendaratan Rajawali, serta konsistensi gerak pada simulasi 30, 60, 120, dan 144 Hz.

Untuk pemeriksaan browser, jalankan server lokal lalu `node tools/preview-browser.mjs` dari environment yang menyediakan Playwright dan Chromium. Jika Playwright terpasang di luar repo, arahkan variabel `PLAYWRIGHT_PATH` ke file `index.mjs` paket tersebut. `REX_URL` dapat mengganti alamat server, dan `REX_PREVIEW_DIR` dapat mengganti lokasi hasil. Secara default, screenshot dan `results.json` disimpan dalam folder `rampage-rex-preview` di direktori temporer sistem.

Hasil pemeriksaan perubahan gambar dan animasi dicatat di [docs/animation-checks.md](docs/animation-checks.md).
