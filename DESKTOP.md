# Rampage Rex untuk Desktop

Rencana membawa game dari `web/` ke Windows dan macOS. Website di Vercel tetap jalan untuk development dan demo. Versi desktop membungkus folder `web/` yang sama, jadi isi game cukup dikerjakan di satu tempat.

## Keputusan teknis

**Pembungkus: Electron.** Game ini dikembangkan dan dites di Chromium. Electron membawa Chromium sendiri, jadi tampilan, suara, dan performa sama persis di Windows dan macOS.

| Pilihan | Kelebihan | Kekurangan |
| --- | --- | --- |
| **Electron** (dipilih) | Mesin sama dengan yang sudah dites, banyak dipakai game di Steam, tooling build matang | Ukuran unduhan besar, sekitar 100 MB ditambah aset game |
| Tauri | Ukuran kecil, sekitar 10 MB ditambah aset | macOS memakai WebKit (mesin Safari), jadi performa kanvas dan audio perlu dites ulang dari nol |

**Tempat rilis, urutan yang disarankan:**

1. **itch.io**: gratis, cepat, cocok untuk rilis awal dan mengumpulkan masukan.
2. **Steam**: biaya Steam Direct USD 100 per game. Perlu halaman toko, aset capsule, dan masa tunggu review.
3. Microsoft Store dan Mac App Store: opsional, nanti saja.

## Struktur folder

```
desktop/
  package.json        konfigurasi Electron dan electron-builder
  main.cjs            jendela, protokol app://, menu
  preload.cjs         jembatan kecil ke game (keluar, layar penuh)
  build/
    icon.png          1024×1024, sumber ikon
    icon.ico          Windows
    icon.icns         macOS
```

Saat build, isi `web/` disalin ke dalam paket aplikasi. File `middleware.js`, `vercel.json`, dan `web/sw.js` tidak ikut dipakai di desktop.

## Cara kerja di dalam aplikasi

- **Memuat game lewat protokol `app://rex/`**, bukan `file://`. Modul ES dan `fetch` ke `manifest.json` lebih stabil lewat protokol khusus. Alamat ini harus **tetap sama di semua versi** karena simpanan game (`localStorage`) terikat ke alamat itu. Kalau alamatnya berubah, progres pemain hilang.
- **Service worker otomatis tidak aktif**, karena game hanya mendaftarkannya di `https` atau `localhost`.
- **Mode developer tidak bisa dibuka**, karena aplikasi tidak punya parameter `?dev=1`. DevTools dimatikan di build rilis.
- **Simpanan** tersimpan di folder data aplikasi:
  - Windows: `%APPDATA%\Rampage Rex`
  - macOS: `~/Library/Application Support/Rampage Rex`

## Penyesuaian game sebelum build

| No | Pekerjaan | Status |
| --- | --- | --- |
| 1 | Tombol **Keluar** di menu utama, hanya muncul di versi desktop | Belum |
| 2 | Layar penuh: F11 atau Alt+Enter, plus pilihan Jendela/Layar penuh di Pengaturan | Belum |
| 3 | Jendela mengingat ukuran dan posisi terakhir, ukuran minimum 960×540 | Belum |
| 4 | **Dukungan gamepad** (Xbox/PlayStation/Steam Deck): gerak, gigit, injak, ekor, lompat, ulti, jeda | Belum |
| 5 | Klik kanan tidak memunculkan menu bawaan Electron | Belum |
| 6 | Kunci DevTools dan `rexDebug` di build rilis | Belum |
| 7 | Musik chiptune dibuat lewat kode (`web/src/music.js`) | Selesai |
| 8 | Ikon resmi 1024×1024 di `desktop/build/icon.png` | Selesai |

Poin 4 tidak wajib, tapi pemain Steam Deck dan pemakai gamepad cukup banyak. Label "Full Controller Support" di Steam juga membantu penjualan.

## Tanda tangan aplikasi

Tanpa tanda tangan, aplikasi tetap bisa dirilis, tapi pemain akan melihat peringatan.

- **Windows**: tanpa sertifikat, muncul peringatan SmartScreen "Windows protected your PC".
  - Pilihan termurah sekarang biasanya Azure Trusted Signing (langganan bulanan) atau sertifikat OV.
  - Untuk itch.io awal, boleh tanpa tanda tangan dulu.
  - Untuk Steam, peringatan ini tidak muncul karena game dijalankan lewat Steam.
- **macOS**: perlu akun Apple Developer Program (USD 99 per tahun) untuk tanda tangan dan notarisasi. Tanpa notarisasi, macOS menolak membuka aplikasi kecuali pemain mengizinkannya manual lewat Settings. Lewat Steam pun build macOS tetap sebaiknya dinotarisasi.

Cek ulang harga dan syaratnya saat mendaftar, karena kebijakan toko bisa berubah.

## Build

Pakai **electron-builder**.

| Target | Hasil |
| --- | --- |
| Windows x64 | Installer NSIS `.exe` dan versi portable `.zip` |
| macOS | `.dmg` universal (Apple Silicon dan Intel) |

Build macOS yang ditandatangani harus dijalankan di Mac. Cara paling praktis adalah GitHub Actions dengan runner `windows-latest` dan `macos-latest`, jadi tidak perlu punya dua komputer. Sertifikat dan password Apple disimpan sebagai secret di GitHub, tidak pernah di dalam repo.

Untuk Steam, hasil build diunggah dengan SteamPipe (`steamcmd`). Depot Windows dan macOS dipisah.

## Versi

- Nomor versi diambil dari `desktop/package.json` (misal `1.0.0`). Website juga menampilkan nomor yang sama.
- Setiap rilis diberi tag git `v1.0.0`.

## Urutan kerja

1. Ikon dan musik sudah selesai.
2. Penyesuaian game no. 1–6.
3. Folder `desktop/` dan build lokal Windows, dites di laptop Windows.
4. GitHub Actions untuk build Windows dan macOS.
5. Rilis uji di itch.io (bisa disetel *restricted* dulu, hanya untuk yang punya tautan).
6. Perbaikan dari masukan, lalu daftar Steam dan siapkan halaman toko.

## Hal yang perlu disiapkan pemilik

- Laptop atau PC Windows untuk tes. Kalau mau rilis macOS, perlu akses Mac atau cukup lewat GitHub Actions.
- Akun itch.io (gratis).
- Nanti: akun Steamworks, Apple Developer, dan sertifikat Windows bila diperlukan.
- Konten sensitif: nama dan logo program pemerintah (Kopdes Merah Putih, SPPG, Badan Gizi Nasional) sudah diganti plesetan (Kopwar Merah Bata, Dapur Kenyang). Lihat `backup/image-prompts.md` bagian 21.
