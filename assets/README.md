# City Kit 01 — Toko Terracotta

Satu set bangunan toko modular, tampak depan, ilustrasi 2D dengan outline halus. Bukan pixel art. Warna utama terracotta, teal, mint, dan krem. Aset PNG menggunakan alpha asli; tidak ada bidang latar yang harus dihapus.

## Isi

| File | Fungsi |
| --- | --- |
| `buildings/shop-01/ground-floor.png` | Lantai dasar dengan pintu, etalase, kanopi, lampu, dan alas batu |
| `buildings/shop-01/upper-floor.png` | Lantai berjendela yang bisa diulang secara vertikal |
| `buildings/shop-01/roof.png` | Penutup atap datar, cerobong, dan antena |
| `details/balcony.png` | Overlay balkon; celah pagar transparan |
| `details/shop-sign.png` | Papan toko dengan simbol matahari, tanpa tulisan |
| `props/planter.png` | Tanaman dalam pot untuk bagian depan bangunan |
| `manifest.json` | Dimensi sumber, batas artwork, dan koordinat sambungan |
| `manifest.js` | Data yang sama untuk preview tanpa fetch atau build |
| `preview/index.html` | Preview rakitan, pilihan lantai, toggle detail, dan ekspor PNG |
| `preview/kit.js` | Contoh renderer Canvas yang memakai PNG asli dan metadata |
| `preview/assembled.png` | Contoh tiga variasi rakitan, 1920 × 1080 |
| `source/art-direction.md` | Brief visual dan prompt set aset |

## Cara menyusun

1. Tempatkan `ground-floor` pada titik bawah bangunan.
2. Tambahkan `upper-floor` sebanyak yang dibutuhkan di atasnya.
3. Pasang `roof` paling atas.
4. Tambahkan `balcony` di depan jendela, `shop-sign` di sisi toko, serta `planter` di lantai dasar.

**PNG asli memiliki transparent padding yang berbeda-beda. Jangan sekadar memberi semua gambar lebar yang sama berdasarkan ukuran canvas-nya.** Gunakan lebar fasad dari `connection`, sehingga lantai dan atap tersambung benar. Bagian kanopi, pintu, dan etalase sudah menyatu dengan modul dasar; tiga dekorasi lainnya terpisah.

## Sistem koordinat

Semua koordinat di manifest menggunakan **piksel gambar sumber**, dengan asal di kiri atas. `bounds` dan `connection` berbentuk `[left, top, right, bottom]`; nilai kanan/bawah bersifat eksklusif. `bounds` mencakup artwork yang terlihat. `connection` adalah bidang fasad yang harus disejajarkan antar modul. Atap sedikit menjorok keluar bidang ini.

Misalnya ingin lebar fasad `W = 512` unit dunia pada posisi `(x, bottom)`:

```js
const [left, top, right, base] = part.connection;
const scale = W / (right - left);

ctx.drawImage(image,
  x - left * scale,
  bottom - base * scale,
  part.width * scale,
  part.height * scale
);

const nextBottom = bottom - (base - top) * scale + W * 0.006;
```

Gunakan `nextBottom` untuk modul di atasnya. Overlap sebesar `0.006 × W` menyatukan outline pada sambungan dan menghindari celah subpixel. Jangan menyamakan tinggi modul secara paksa: skala X dan Y harus sama.

Contoh lengkap:

```html
<canvas id="city" width="1920" height="1080"></canvas>
<script src="assets/manifest.js"></script>
<script src="assets/preview/kit.js"></script>
<script>
(async () => {
  const kit = await RexCityKit.loadKit(RAMPAGE_REX_ASSETS, 'assets/');
  const ctx = document.getElementById('city').getContext('2d');
  RexCityKit.drawBuilding(ctx, kit, {
    x: 700, bottom: 1000, width: 512, floors: 2, details: true
  });
})();
</script>
```

`floors` berarti jumlah **lantai atas**, di luar lantai dasar; `floors: 0` membuat toko satu lantai. Renderer contoh mendukung 0–6 lantai atas. `drawDecoration()` bisa dipakai untuk menempatkan detail secara bebas. Rekomendasi lebar fasad 320–640 piksel pada layar; tekstur sumber beresolusi lebih tinggi untuk menjaga garis tetap halus.

## Preview

Buka `preview/index.html` langsung di browser. Untuk ekspor PNG yang konsisten lintas browser, jalankan `python -m http.server 8000` dari root repo dan kunjungi `http://localhost:8000/assets/preview/`.

Latar langit/jalan pada preview hanya latar demonstrasi. Keenam PNG produksi tetap transparan. Kit ini adalah satu set toko; bukan paket kota lengkap atau background seamless horizontal. Modul lantai dibuat untuk pengulangan vertikal, bukan tile horizontal.

Ilustrasi dibuat dengan image generation bawaan, lalu disimpan sebagai PNG asli tanpa pengubahan warna atau alpha. Preview merakit gambar dengan transformasi Canvas; metadata menjaga posisi sambungannya.
