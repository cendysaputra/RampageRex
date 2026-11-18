# OPENING — Prompt gambar adegan pembuka

Adegan pembuka tampil setelah pemain menekan **Mulai main** dan sebelum gameplay distrik 1. Bentuknya potongan komik: tujuh panel muncul satu per satu, masing-masing dengan keterangan singkat, efek, dan suara, lalu layar memudar ke hitam dan permainan dimulai.

Dokumen ini hanya berisi prompt gambarnya. Keterangan, efek, dan suara tiap panel dicatat di sini supaya gambar dibuat sesuai kebutuhan adegan, tetapi semuanya dikerjakan lewat kode, **bukan** digambar di dalam panel.

## Aturan untuk semua panel

| Hal | Ketentuan |
| --- | --- |
| Lokasi file | `assets/story/` |
| Nama file | `opening-01.png` sampai `opening-07.png`, nomor dua digit, tanpa nama tambahan |
| Ukuran | 1600 × 900 (16:9), mendatar |
| Latar | penuh, tidak transparan |
| Teks di gambar | tidak ada: tanpa huruf, angka, balon kata, efek suara tertulis, logo, atau watermark |
| Bingkai | tidak ada: garis tepi panel digambar kode |
| Area aman | 12% bagian bawah tiap gambar dibuat tenang dan agak gelap, karena kotak keterangan duduk di sana |

Referensi gaya untuk semua panel: `assets/backgrounds/menu-wide.webp` (garis tebal, cel shading, warna jenuh) dan `assets/characters/rex/master.webp` (identitas Rex dewasa).

Urutan pengerjaan yang disarankan, supaya karakter konsisten:

1. Panel 01 dulu sebagai acuan gaya dan warna malam.
2. Panel 03 lalu 04, untuk mengunci desain telur dan Rex kecil.
3. Panel 05 memakai panel 04 sebagai referensi Rex kecil.
4. Panel 06 dan 07 memakai `master.webp` sebagai referensi Rex dewasa.
5. Panel 02 terakhir, memakai panel 01 dan 03 sebagai referensi.

## Brief bersama

Tempel di awal setiap prompt:

```
Comic book panel illustration, wide 16:9, 1600x900, opaque full-bleed image. Polished 2D cartoon style matching the references: thick confident dark teal outlines, rich cel shading with clear light and shadow shapes, saturated colour, smooth antialiased linework. Cinematic composition with one clear focal point. Keep the bottom 12 percent of the image calm, low in detail and slightly darker, because a caption box will be placed over it. No text, no letters, no numbers, no speech bubbles, no written sound effects, no logo, no watermark, no panel border, no frame.
```

Deskripsi karakter yang dipakai berulang, salin persis:

- **Telur Rex:** `a large oval egg about the size of a car tyre, pale cream shell covered in dark teal spots, with a faint warm orange glow leaking from hairline cracks`
- **Rex kecil:** `a baby version of the Rex from the reference, about the size of a house cat: chubby green body with dark teal spots, cream segmented belly, tiny orange dorsal plates like small buds, oversized head, big round yellow eyes, tiny clawed arms, short stubby tail, no cheek scars yet`
- **Rex dewasa:** `the exact adult Rex from the reference: huge chunky green dinosaur with dark teal spots, cream segmented belly and jaw, tall orange dorsal plates, yellow eyes, three red scars on his cheek, small clawed arms, long tapering tail`

---

## Panel 01 — Langit malam

File: `assets/story/opening-01.png`

- **Keterangan:** "Suatu malam, sesuatu jatuh dari langit."
- **Efek:** bintang berkelip pelan, meteor bergeser diagonal melintasi panel.
- **Suara:** desing panjang yang naik.

```
A vast clear night sky seen from a hill at the edge of a small Indonesian town. Deep indigo sky fading to teal near the horizon, dense with stars and a soft band of the Milky Way. One bright meteor streaks diagonally from the upper left toward the lower right, with a white-hot head, an orange core and a long tapering teal-and-orange tail, plus two smaller shooting stars far behind it. Along the bottom, a low dark silhouette of the town: shophouse rooftops, a mosque dome with a minaret, water tanks and power poles, with a few tiny warm window lights. Beyond the town on the right, a dark forested ridge where the meteor is heading. Quiet, wide and full of wonder.
```

## Panel 02 — Meteor jatuh ke hutan

File: `assets/story/opening-02.png`

- **Keterangan:** "Benda itu menghantam hutan di pinggir kota."
- **Efek:** panel bergetar keras sekali, kilatan putih singkat.
- **Suara:** dentuman berat, lalu gemuruh mereda.

```
The moment of impact in a dense tropical forest at the edge of the town, at night. The meteor from the reference panel slams into the forest floor in the centre of the frame: a blinding white-orange burst at the point of impact, a ring of shockwave flattening ferns and bending tall trees outward, clods of earth, leaves and splintered wood flying toward the viewer, thick dust and smoke billowing up lit orange from within. Low camera angle from the forest floor between giant buttress roots. Startled birds burst from the canopy. Far in the background between the trunks, the tiny warm lights of the town are visible, showing how close it is. Violent, bright against the dark, strong contrast.
```

## Panel 03 — Ternyata sebutir telur

File: `assets/story/opening-03.png`

- **Keterangan:** "Di dasar kawah itu bukan batu. Sebutir telur."
- **Efek:** asap melayang naik pelan, cahaya dari retakan telur berdenyut.
- **Suara:** desis uap, lalu ketukan pelan dari dalam telur.

```
The quiet aftermath, moments later. A shallow smoking crater in the forest floor, seen from its rim looking down. Resting in the centre of the crater, half sunk in scorched black earth and glowing embers: a large oval egg about the size of a car tyre, pale cream shell covered in dark teal spots, with a faint warm orange glow leaking from hairline cracks. Thin wisps of steam curl up from the shell. Charred roots and broken branches ring the crater; a few small flames still lick at fallen leaves. Soft blue moonlight filters down through the torn canopy in visible shafts, contrasting with the warm glow of the egg. Curious small forest animals (a civet and two frogs) peek from the edge of the frame. Hushed, mysterious, a little ominous.
```

## Panel 04 — Menetas

File: `assets/story/opening-04.png`

- **Keterangan:** "Lalu ia menetas."
- **Efek:** telur bergoyang kiri-kanan, pecahan cangkang terlempar, Rex kecil muncul dengan gerakan membal.
- **Suara:** retak cangkang, disusul cicit kecil.

```
A close-up at ground level inside the crater at dawn. The spotted egg from the reference panel has just burst open: jagged pieces of cream shell with dark teal spots fly outward, and from the broken lower half emerges a baby version of the Rex from the reference, about the size of a house cat: chubby green body with dark teal spots, cream segmented belly, tiny orange dorsal plates like small buds, oversized head, big round yellow eyes, tiny clawed arms, short stubby tail, no cheek scars yet. A piece of shell sits on his head like a cap. His mouth is open in his very first tiny roar, showing small blunt teeth. Warm golden dawn light breaks through the trees behind him, rim-lighting his outline, with soft morning mist on the forest floor. Charming and funny, but his eyes already have a fierce spark.
```

## Panel 05 — Hidup dan berburu di hutan

File: `assets/story/opening-05.png`

- **Keterangan:** "Hutan menjadi rumahnya. Ia belajar berburu."
- **Efek:** gambar bergeser pelan ke samping (parallax), daun berjatuhan.
- **Suara:** suara hutan, lalu geraman pendek.

```
Daytime in the lush tropical forest, a few months later. The young Rex from the reference panel, now grown to the size of a large dog with slightly taller orange dorsal plates and still no cheek scars, crouches low on a mossy fallen log in the foreground, stalking. His body is coiled, tail raised for balance, eyes locked on his prey: a startled wild boar and a flock of jungle fowl scattering in the mid-ground between ferns and vines. Sunbeams cut through the green canopy, dappling the scene with light; giant leaves, hanging roots, orchids and a small waterfall fill the background. Butterflies lift off around him. Energetic and adventurous, clearly a hunt but with no blood and no injury.
```

## Panel 06 — Dewasa, mulai menyerang manusia

File: `assets/story/opening-06.png`

- **Keterangan:** "Ia tumbuh besar. Hutan tidak lagi cukup."
- **Efek:** panel bergetar tiap langkah Rex, debu naik dari bawah.
- **Suara:** langkah berat, raungan, teriakan panik.

```
The edge of the forest at late afternoon, years later. The exact adult Rex from the reference: huge chunky green dinosaur with dark teal spots, cream segmented belly and jaw, tall orange dorsal plates, yellow eyes, three red scars on his cheek, small clawed arms, long tapering tail. He bursts out of the tree line in a roar, snapping trunks aside, towering over a small logging camp at the forest edge. In the foreground, three loggers in hard hats and a woman from a roadside food stall run toward the viewer in clear cartoon panic, arms up, dropping a chainsaw and a thermos; a pickup truck is tipped on its side and a tin-roofed hut is crushed under one of his feet. Low camera angle to exaggerate his size, dust and leaves flying, warm orange light from the low sun behind him. Dramatic and loud, cartoon action with no blood and no injury.
```

## Panel 07 — Menatap kota

File: `assets/story/opening-07.png`

- **Keterangan:** "Dan di kejauhan, ia melihat kota."
- **Efek:** gambar mendekat perlahan ke arah kota, lalu layar memudar ke hitam.
- **Suara:** angin, satu geraman rendah yang panjang.

```
Sunset on a hilltop at the edge of the forest. The exact adult Rex from the reference: huge chunky green dinosaur with dark teal spots, cream segmented belly and jaw, tall orange dorsal plates, yellow eyes, three red scars on his cheek, small clawed arms, long tapering tail. He stands in the left third of the frame seen from behind in a three-quarter back view, a dark rim-lit shape with his head turned toward the right so one glowing yellow eye and the scarred cheek are visible. Below and beyond him, filling the right two thirds, spreads an Indonesian town at sunset: rows of colourful shophouses, a mosque dome with minarets, office towers and construction cranes further back, harbour cranes at the far horizon, tangled power lines, the first lights coming on. The sky is the same magenta-to-orange sunset as the game, with a huge low sun behind the skyline. His tail curls with anticipation. Calm, ominous, the last breath before the rampage.
```

## Panel 08 — Layar hitam

Tidak ada gambar. Setelah panel 07, layar memudar ke hitam selama kira-kira satu detik, lalu gameplay distrik 1 dimulai.

---

## Checklist tiap panel

- [ ] Nama file persis `opening-NN.png` di `assets/story/`, nomor 01 sampai 07.
- [ ] Ukuran 1600 × 900, latar penuh.
- [ ] Tidak ada teks, angka, balon kata, atau efek suara tertulis di dalam gambar.
- [ ] 12% bagian bawah tenang dan agak gelap untuk kotak keterangan.
- [ ] Telur, Rex kecil, dan Rex dewasa terlihat sama antar panel (bintik teal, perut krem, pelat punggung oranye; tiga bekas luka di pipi hanya pada Rex dewasa).
- [ ] Tidak ada darah atau luka di panel 05 dan 06.
- [ ] Warna langit panel 07 senada dengan latar game.

## Setelah gambar jadi

1. Buat salinan WebP kualitas 90 di sebelah tiap PNG: `opening-01.webp` sampai `opening-07.webp`. Game hanya memuat WebP.
2. Panel tidak perlu didaftarkan di `assets/manifest.json`, karena ditampilkan lewat halaman, bukan lewat canvas.
3. Pemutar adegan (urutan panel, keterangan, efek, suara, tombol lewati, dan fade ke gameplay) ada di `src/opening.js` dan blok `#opening` di `style.css`.

## Tata letak yang dipakai sekarang

Panel yang terpasang bukan lagi 1600 × 900 penuh. Tiap panel adalah gambar tinta sepia dengan bentuk miring sendiri (alpha transparan di luar bentuk), dan kode mengikuti bentuk itu tanpa memotong paksa.

| Panel | Ukuran | Sisi miring |
| --- | --- | --- |
| 01 | 960 × 700 | kanan |
| 02 | 740 × 900 | kiri |
| 03 | 1250 × 580 | keempat sisi sedikit miring |
| 04 | 740 × 900 | kanan |
| 05 | 950 × 730 | kiri dan bawah |
| 06 | 700 × 900 | kanan |
| 07 | 1300 × 680 | kiri |

- Halaman 1 berisi panel 01 dan 02 di baris atas, panel 03 di bawah. Halaman 2 berisi panel 04 dan 05 di atas, 06 dan 07 di bawah.
- Posisi, ukuran, dan poligon tiap panel ditulis sebagai `--x`, `--y`, `--w`, `--h`, `--cut` di `style.css`. Perbandingan `--w` dan `--h` mengikuti ukuran gambar, jadi kalau ukuran atau kemiringan gambar berubah, angka ini perlu dihitung ulang.
- Kamera mendekat ke panel yang baru muncul, mundur menampilkan satu halaman penuh sebelum ganti halaman, lalu layar memudar ke hitam setelah panel 07.
- Semua gerak hanya memakai `transform` dan `opacity`. Dengan `prefers-reduced-motion`, kamera diam dan panel hanya memudar masuk.
