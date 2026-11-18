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
