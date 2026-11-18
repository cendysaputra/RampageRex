# Pemeriksaan gambar dan animasi

Tanggal: 18 November 2026. Cakupan: render gambar dan animasi gameplay.

Arah visual mengikuti Ruko Senja di `image-prompts.md`: ilustrasi kota Indonesia saat senja, Rex sebagai fokus, dan gerakan arcade untuk menunjukkan langkah, serangan, serta kerusakan. Tingkat ENERGY 3 / RHYTHM 2 / MOTION 3 mengikuti permainan yang sudah ada. Transisi pose membantu membaca perubahan gerakan; gradasi aspal menyambungkan jalan ke bagian bawah layar portrait.

## Hasil

- **PASS, aset:** 138 gambar runtime dari empat distrik berhasil didekode. Jalur cadangan tanpa `createImageBitmap` menghasilkan canvas yang valid. Latar tetap menggunakan dimensi sumber lengkap; crop sprite mempertahankan pivot.
- **PASS, gerakan:** setiap jenis serangan menghasilkan tepat satu benturan pada simulasi 30, 60, 120, dan 144 Hz. Kurva pose mencapai puncak pada waktu benturan, lalu kembali ke posisi awal tanpa lonjakan pada batas animasi.
- **PASS, langkah:** berjalan dua detik lalu berhenti satu detik menghasilkan jarak 722,220–722,266 piksel logis pada empat frekuensi uji. Kecepatan berhenti dan amplitudo langkah mereda.
- **PASS, pendaratan:** raungan menurunkan Rajawali bertahap. Pengujian memeriksa posisi pada frame pertama dan kedekatan dengan tanah setelah satu detik, di seluruh distrik.
- **PASS, render:** empat distrik, tiga pahlawan, infanteri, bazooka, kendaraan, lima tipe warga, bangunan runtuh, debu, ledakan, dan puing dirender di Chromium tanpa error JavaScript atau respons HTTP gagal.
- **PASS, tampilan:** screenshot desktop 1440 × 900 serta layar sentuh 390 × 844 dan 844 × 390 diperiksa. Langit, trotoar, dan karakter mempertahankan proporsi; enam kontrol sentuh berada di dalam layar dan dokumen tidak meluber secara horizontal.
- **PASS, pengurangan gerakan:** renderer mengikuti perubahan `prefers-reduced-motion` secara langsung. Getaran layar, recoil, serta gerak diam dekoratif Rex dinonaktifkan; kontrol jeda tetap tersedia.
- **PASS, biaya gambar:** crop dan downsampling disiapkan saat memuat aset. Latar yang sudah diskalakan digunakan kembali sampai viewport berubah. Bilinear sampling digunakan selama pergerakan, sementara resize berkualitas tinggi dilakukan pada tahap persiapan.

## Interaksi yang dijalankan

| Kontrol | Hasil |
| --- | --- |
| Cara main, Escape | Petunjuk terbuka, lalu kembali ke menu |
| Suara aktif/mati | Status dan `aria-pressed` berubah |
| Mulai main | Aset selesai dimuat dan HUD tampil |
| D, J, K, S, L | Rex bergerak dan menjalankan empat serangan; destruksi bertambah |
| Jeda, Lanjut main, P | Dialog jeda terbuka dan permainan berlanjut |
| Suara dalam dialog jeda | Pengaturan suara berubah dan dialog tetap tersedia |
| Enam tombol sentuh | Input pointer melalui emulasi sentuh Chromium diterima pada kedua orientasi |
| Menu utama | HUD ditutup dan menu ditampilkan kembali |

Pemeriksaan browser memakai Chromium headless dengan skala perangkat 2. Angka waktu skrip dalam `results.json` berasal dari batch render sintetis, bukan pengukuran FPS layar atau jaminan performa perangkat fisik. Simulasi frekuensi tinggi memeriksa konsistensi waktu permainan; pengujian pada monitor fisik 120/144 Hz belum dilakukan.
