# Rampage Rex untuk Mobile

Rencana membawa game dari `web/` ke Android (Google Play). iOS menyusul kalau Android sudah jalan. Desktop dikerjakan lebih dulu (lihat `DESKTOP.md`), jadi dokumen ini menunggu giliran.

## Keputusan teknis

**Pembungkus: Capacitor.** Capacitor membungkus folder `web/` menjadi proyek Android Studio. Di dalamnya game berjalan di Android System WebView, yang juga berbasis Chromium, jadi perilakunya dekat dengan yang sudah dites di browser HP.

| Pilihan | Kelebihan | Kekurangan |
| --- | --- | --- |
| **Capacitor** (dipilih) | Langsung pakai `web/`, plugin resmi (getar, simpanan, status bar), jalur ke iOS sama | Perlu Android Studio untuk build |
| TWA (Trusted Web Activity) | Paling ringan, langsung memuat website | Butuh website publik, padahal situs sedang dikunci. Tidak jalan offline sebelum pertama dibuka |

## Struktur folder

```
mobile/
  package.json          Capacitor dan plugin
  capacitor.config.json appId, webDir ke ../web
  android/              proyek Android Studio, dibuat oleh Capacitor
```

- **appId:** `com.cendysaputra.rampagerex`. Tidak bisa diganti setelah rilis di Play, jadi pastikan dulu sebelum upload pertama.
- `middleware.js`, `vercel.json`, dan `web/sw.js` tidak dipakai di aplikasi.

## Penyesuaian game sebelum build

| No | Pekerjaan | Status |
| --- | --- | --- |
| 1 | Kunci layar landscape dan mode layar penuh imersif (status bar dan tombol navigasi disembunyikan) | Belum |
| 2 | Tombol **Kembali** Android: saat main, buka jeda. Di menu, tanya dulu sebelum keluar | Belum |
| 3 | Jeda otomatis dan suara berhenti saat aplikasi ke latar belakang. Sudah ada lewat `blur` dan `visibilitychange`, tinggal dites di HP | Dites |
| 4 | Getaran lewat plugin Haptics Capacitor, karena `navigator.vibrate` tidak selalu jalan di WebView | Belum |
| 5 | **Simpanan** dipindah ke plugin Preferences, dengan migrasi dari `localStorage`. Android bisa membersihkan data WebView saat memori penuh | Belum |
| 6 | Area aman untuk layar berponi (`env(safe-area-inset-*)`) pada HUD dan tombol sentuh | Belum |
| 7 | Mode grafik Otomatis dan resolusi adaptif sudah ada. Tes di 1 HP murah (RAM 3–4 GB) dan 1 HP menengah | Belum |
| 8 | Ukuran unduhan: aset sekarang sekitar 29 MB, aman di bawah batas AAB | Aman |
| 9 | Ikon, ikon adaptif, feature graphic (lihat `image-prompts.md` bagian 18) | Menunggu Codex |
| 10 | Musik dari Suno | Menunggu musik |

## Google Play

- **Akun Play Console:** biaya sekali bayar USD 25.
- **Uji tertutup wajib** untuk akun pribadi baru, sebelum boleh rilis ke publik. Syarat saat dokumen ini ditulis: minimal 12 penguji aktif selama 14 hari. Kumpulkan teman dari sekarang.
- **Format:** Android App Bundle (`.aab`) dengan Play App Signing.
  - Kunci upload (`.jks`) disimpan di luar repo dan dibackup. Kalau hilang, harus mengurus reset ke Google.
  - Target API mengikuti syarat terbaru Play. Capacitor versi terbaru biasanya sudah sesuai.
- **Isian toko:**
  - **Data safety:** game tidak mengumpulkan data dan tidak online, jadi isian ini singkat.
  - **Kebijakan privasi:** tetap siapkan satu halaman URL sederhana yang menyatakan game tidak mengumpulkan data.
  - **Rating konten (IARC):** kekerasan kartun; bangunan, tentara, dan warga bisa dikalahkan. Jawab apa adanya.
  - **Kategori:** Game → Action atau Arcade.
  - **Aset:**
    - ikon 512×512
    - feature graphic 1024×500
    - minimal 2 screenshot landscape, ambil dari HP asli
- **Konten sensitif:** game memakai nama program pemerintah yang nyata (Kopdes Merah Putih, SPPG). Jangan pakai logo resmi. Pertimbangkan nama plesetan sebelum masuk Play.

Cek ulang biaya dan syarat di Play Console saat mendaftar, karena kebijakan Google bisa berubah.

## Build

1. `npx cap sync android` menyalin `web/` ke proyek Android.
2. Buka `mobile/android` di Android Studio, lalu Build → Generate Signed App Bundle.
3. Tes di HP asli lewat USB atau internal testing di Play Console.

Nanti build `.aab` bisa diotomatiskan lewat GitHub Actions. Kunci upload disimpan sebagai secret, tidak pernah di repo.

## Versi

- `versionName` sama dengan versi desktop (misal `1.0.0`).
- `versionCode` naik 1 setiap upload ke Play, tidak boleh mundur.

## Urutan kerja

1. Desktop rilis dulu (lihat `DESKTOP.md`).
2. Penyesuaian game no. 1–6.
3. Folder `mobile/`, build debug, tes di HP sendiri.
4. Daftar Play Console, upload ke internal testing.
5. Uji tertutup 14 hari dengan minimal 12 penguji.
6. Rilis produksi.
7. iOS menyusul: perlu Mac, Xcode, dan Apple Developer Program (USD 99 per tahun). Akunnya bisa sama dengan yang dipakai untuk notarisasi macOS.
