# OPENING — Prompt gambar adegan pembuka

Adegan pembuka tampil setelah pemain menekan **Mulai main** dan sebelum gameplay distrik 1. Bentuknya **motion comic layar penuh**: tujuh adegan bergantian tanpa halaman atau bingkai kertas. Tiap adegan terdiri dari tiga lapis gambar yang digeser kamera dengan kecepatan berbeda (parallax), jadi terasa hidup walau gambarnya diam. Teks narasi tampil di bawah seperti subtitle.

Keterangan, efek, dan suara tiap adegan dicatat di sini supaya gambar dibuat sesuai kebutuhan adegan, tetapi semuanya dikerjakan lewat kode, **bukan** digambar di dalam gambar.

## Aturan untuk semua adegan

| Hal | Ketentuan |
| --- | --- |
| Lokasi file | `web/assets/story/scene-01/` sampai `web/assets/story/scene-07/` |
| Nama file | `bg.png`, `mid.png`, `fg.png` di folder tiap adegan |
| Ukuran | 1920 × 1080 (16:9) untuk **ketiga** lapis, posisinya saling pas kalau ditumpuk |
| `bg` | lapis paling belakang, **tidak transparan**, penuh sampai tepi |
| `mid` | lapis tengah, PNG transparan; kosong di luar objeknya |
| `fg` | lapis depan (tokoh utama atau objek fokus), PNG transparan |
| Area di balik objek | `bg` dan `mid` harus tetap tergambar utuh di belakang objek lapis depannya, bukan bolong, karena lapis bergeser sampai ±5% |
| Tepi | jangan taruh bagian penting di 6% tepi mana pun; kode memperbesar lapis 10% supaya tepinya tidak terlihat saat bergeser |
| Teks di gambar | tidak ada: tanpa huruf, angka, balon kata, efek suara tertulis, logo, atau watermark |
| Bingkai | tidak ada: tanpa garis panel, tanpa kertas, gambar penuh sampai tepi |
| Area bawah | 15% bagian bawah tenang dan agak gelap, karena teks narasi duduk di sana |
| Gaya | tinta sepia seperti panel yang sekarang (`web/assets/story/opening-01.png` sampai `opening-07.png`): garis tinta tebal, arsir, warna kertas tua, kontras kuat |

Cara kerja yang disarankan untuk tiap adegan:

1. Buat dulu satu gambar utuh 1920 × 1080 dari prompt adegannya. Pakai panel lama `opening-NN.png` sebagai referensi komposisi dan gaya, tetapi lebarkan menjadi 16:9 penuh.
2. Potong objek lapis depan menjadi `fg.png` (transparan).
3. Potong objek lapis tengah menjadi `mid.png` (transparan).
4. Buat `bg.png` dari gambar utuh dengan objek `fg` dan `mid` dihapus lalu bagian belakangnya diisi (inpaint), supaya tidak ada bayangan ganda atau lubang saat lapis bergeser.
5. Tumpuk `bg` + `mid` + `fg` dan pastikan hasilnya sama persis dengan gambar utuh.

Referensi identitas: `web/assets/characters/rex/master.webp` (Rex dewasa) dan panel lama `opening-04.png` (Rex kecil). Urutan pengerjaan supaya karakter konsisten: 01, 03, 04, 05, 06, 07, lalu 02.

## Brief bersama

Tempel di awal setiap prompt gambar utuh:

```
Motion comic scene, wide 16:9, 1920x1080, opaque full-bleed image. Sepia ink illustration matching the reference panels: bold brush-ink outlines, cross-hatching, aged paper tones from cream to deep brown-black, strong contrast. Cinematic composition with clear depth: a distinct background, middle ground and foreground that can be separated into layers. Keep important details away from the outer 6 percent of every edge. Keep the bottom 15 percent calm, low in detail and slightly darker, because subtitles will be placed over it. No text, no letters, no numbers, no speech bubbles, no written sound effects, no logo, no watermark, no panel border, no frame, no paper edge.
```

Deskripsi karakter yang dipakai berulang, salin persis:

- **Telur Rex:** `a large oval egg about the size of a car tyre, pale cream shell covered in dark teal spots, with a faint warm orange glow leaking from hairline cracks`
- **Rex kecil:** `a baby version of the Rex from the reference, about the size of a house cat: chubby red body with dark crimson spots, cream segmented belly, tiny orange dorsal plates like small buds, oversized head, big round yellow eyes, tiny clawed arms, short stubby tail, no cheek scars yet`
- **Rex dewasa:** `the exact adult Rex from the reference: huge chunky red dinosaur with dark crimson spots, cream segmented belly and jaw, tall orange dorsal plates, yellow eyes, three red scars on his cheek, small clawed arms, long tapering tail`

---

## Adegan 01 — Langit malam

Folder: `web/assets/story/scene-01/` (referensi lama: `opening-01.png`)

- **`bg`:** Langit malam, bintang, dan punggung bukit di kejauhan.
- **`mid`:** Siluet atap kampung, kubah masjid, dan menara.
- **`fg`:** Meteor beserta ekornya (kode menggesernya diagonal sendiri).

- **Keterangan:** "Suatu malam, sesuatu jatuh dari langit."
- **Efek:** kamera bergeser pelan, meteor (`fg`) melintas diagonal sendiri.
- **Suara:** desing panjang yang naik.

```
A vast clear night sky seen from a hill at the edge of a small Indonesian town. Deep indigo sky fading to teal near the horizon, dense with stars and a soft band of the Milky Way. One bright meteor streaks diagonally from the upper left toward the lower right, with a white-hot head, an orange core and a long tapering teal-and-orange tail, plus two smaller shooting stars far behind it. Along the bottom, a low dark silhouette of the town: shophouse rooftops, a mosque dome with a minaret, water tanks and power poles, with a few tiny warm window lights. Beyond the town on the right, a dark forested ridge where the meteor is heading. Quiet, wide and full of wonder.
```

## Adegan 02 — Meteor jatuh ke hutan

Folder: `web/assets/story/scene-02/` (referensi lama: `opening-02.png`)

- **`bg`:** Langit malam, kanopi hutan, dan cahaya kota di kejauhan.
- **`mid`:** Ledakan putih-oranye, gelombang kejut, dan asap.
- **`fg`:** Akar banir, pakis, dan serpihan kayu yang terlempar ke arah kamera.

- **Keterangan:** "Benda itu menghantam hutan di pinggir kota."
- **Efek:** kilatan putih, layar berguncang sekali, kamera mundur dari titik hantaman.
- **Suara:** dentuman berat, lalu gemuruh mereda.

```
The moment of impact in a dense tropical forest at the edge of the town, at night. The meteor from the reference panel slams into the forest floor in the centre of the frame: a blinding white-orange burst at the point of impact, a ring of shockwave flattening ferns and bending tall trees outward, clods of earth, leaves and splintered wood flying toward the viewer, thick dust and smoke billowing up lit orange from within. Low camera angle from the forest floor between giant buttress roots. Startled birds burst from the canopy. Far in the background between the trunks, the tiny warm lights of the town are visible, showing how close it is. Violent, bright against the dark, strong contrast.
```

## Adegan 03 — Ternyata sebutir telur

Folder: `web/assets/story/scene-03/` (referensi lama: `opening-03.png`)

- **`bg`:** Hutan malam, bulan, dan sorot cahaya bulan.
- **`mid`:** Bibir kawah, akar hangus, dan api kecil.
- **`fg`:** Telur bercahaya di dasar kawah, plus musang dan katak di tepi.

- **Keterangan:** "Di dasar kawah itu bukan batu. Sebutir telur."
- **Efek:** kamera mendekat pelan ke telur, cahaya dari retakan berdenyut.
- **Suara:** desis uap, lalu ketukan pelan dari dalam telur.

```
The quiet aftermath, moments later. A shallow smoking crater in the forest floor, seen from its rim looking down. Resting in the centre of the crater, half sunk in scorched black earth and glowing embers: a large oval egg about the size of a car tyre, pale cream shell covered in dark teal spots, with a faint warm orange glow leaking from hairline cracks. Thin wisps of steam curl up from the shell. Charred roots and broken branches ring the crater; a few small flames still lick at fallen leaves. Soft blue moonlight filters down through the torn canopy in visible shafts, contrasting with the warm glow of the egg. Curious small forest animals (a civet and two frogs) peek from the edge of the frame. Hushed, mysterious, a little ominous.
```

## Adegan 04 — Menetas

Folder: `web/assets/story/scene-04/` (referensi lama: `opening-04.png`)

- **`bg`:** Hutan saat fajar dan kabut tipis.
- **`mid`:** Pecahan cangkang yang beterbangan dan separuh bawah telur.
- **`fg`:** Rex kecil (kode memantulkannya sedikit ke atas).

- **Keterangan:** "Lalu ia menetas."
- **Efek:** adegan meletup masuk, Rex kecil (`fg`) terangkat sedikit.
- **Suara:** retak cangkang, disusul cicit kecil.

```
A close-up at ground level inside the crater at dawn. The spotted egg from the reference panel has just burst open: jagged pieces of cream shell with dark teal spots fly outward, and from the broken lower half emerges a baby version of the Rex from the reference, about the size of a house cat: chubby red body with dark crimson spots, cream segmented belly, tiny orange dorsal plates like small buds, oversized head, big round yellow eyes, tiny clawed arms, short stubby tail, no cheek scars yet. A piece of shell sits on his head like a cap. His mouth is open in his very first tiny roar, showing small blunt teeth. Warm golden dawn light breaks through the trees behind him, rim-lighting his outline, with soft morning mist on the forest floor. Charming and funny, but his eyes already have a fierce spark.
```

## Adegan 05 — Hidup dan berburu di hutan

Folder: `web/assets/story/scene-05/` (referensi lama: `opening-05.png`)

- **`bg`:** Air terjun, pepohonan, dan sinar matahari.
- **`mid`:** Babi hutan dan ayam hutan yang kabur di antara pakis.
- **`fg`:** Rex muda di atas batang kayu berlumut.

- **Keterangan:** "Hutan menjadi rumahnya. Ia belajar berburu."
- **Efek:** kamera bergeser ke samping, parallax paling terasa di adegan ini.
- **Suara:** suara hutan, lalu geraman pendek.

```
Daytime in the lush tropical forest, a few months later. The young Rex from the reference panel, now grown to the size of a large dog with slightly taller orange dorsal plates and still no cheek scars, crouches low on a mossy fallen log in the foreground, stalking. His body is coiled, tail raised for balance, eyes locked on his prey: a startled wild boar and a flock of jungle fowl scattering in the mid-ground between ferns and vines. Sunbeams cut through the green canopy, dappling the scene with light; giant leaves, hanging roots, orchids and a small waterfall fill the background. Butterflies lift off around him. Energetic and adventurous, clearly a hunt but with no blood and no injury.
```

## Adegan 06 — Dewasa, mulai menyerang manusia

Folder: `web/assets/story/scene-06/` (referensi lama: `opening-06.png`)

- **`bg`:** Pepohonan tepi hutan dan langit sore.
- **`mid`:** Kamp penebang: truk terguling, gubuk, dan orang-orang yang lari.
- **`fg`:** Rex dewasa yang menerobos keluar dari hutan.

- **Keterangan:** "Ia tumbuh besar. Hutan tidak lagi cukup."
- **Efek:** potong langsung, layar berguncang dua kali mengikuti langkah Rex.
- **Suara:** langkah berat, raungan, teriakan panik.

```
The edge of the forest at late afternoon, years later. The exact adult Rex from the reference: huge chunky red dinosaur with dark crimson spots, cream segmented belly and jaw, tall orange dorsal plates, yellow eyes, three red scars on his cheek, small clawed arms, long tapering tail. He bursts out of the tree line in a roar, snapping trunks aside, towering over a small logging camp at the forest edge. In the foreground, three loggers in hard hats and a woman from a roadside food stall run toward the viewer in clear cartoon panic, arms up, dropping a chainsaw and a thermos; a pickup truck is tipped on its side and a tin-roofed hut is crushed under one of his feet. Low camera angle to exaggerate his size, dust and leaves flying, warm orange light from the low sun behind him. Dramatic and loud, cartoon action with no blood and no injury.
```

## Adegan 07 — Menatap kota

Folder: `web/assets/story/scene-07/` (referensi lama: `opening-07.png`)

- **`bg`:** Langit senja, matahari, dan kota di kejauhan.
- **`mid`:** Deretan ruko, masjid, dan menara yang lebih dekat.
- **`fg`:** Rex dewasa dari belakang di puncak bukit.

- **Keterangan:** "Dan di kejauhan, ia melihat kota."
- **Efek:** gambar mendekat perlahan ke arah kota, lalu layar memudar ke hitam.
- **Suara:** angin, satu geraman rendah yang panjang.

```
Sunset on a hilltop at the edge of the forest. The exact adult Rex from the reference: huge chunky red dinosaur with dark crimson spots, cream segmented belly and jaw, tall orange dorsal plates, yellow eyes, three red scars on his cheek, small clawed arms, long tapering tail. He stands in the left third of the frame seen from behind in a three-quarter back view, a dark rim-lit shape with his head turned toward the right so one glowing yellow eye and the scarred cheek are visible. Below and beyond him, filling the right two thirds, spreads an Indonesian town at sunset: rows of colourful shophouses, a mosque dome with minarets, office towers and construction cranes further back, harbour cranes at the far horizon, tangled power lines, the first lights coming on. The sky is the same magenta-to-orange sunset as the game, with a huge low sun behind the skyline. His tail curls with anticipation. Calm, ominous, the last breath before the rampage.
```

## Penutup — Layar hitam

Tidak ada gambar. Setelah adegan 07, layar memudar ke hitam selama kira-kira satu detik, lalu gameplay distrik 1 dimulai.

---

## Checklist tiap adegan

- [ ] Tiga file `bg.png`, `mid.png`, `fg.png` di `web/assets/story/scene-NN/`, semuanya 1920 × 1080.
- [ ] `bg` penuh tanpa transparansi; `mid` dan `fg` transparan di luar objeknya.
- [ ] Ditumpuk berurutan `bg` → `mid` → `fg`, hasilnya sama dengan gambar utuh, tanpa lubang atau bayangan ganda.
- [ ] Tidak ada teks, angka, balon kata, efek suara tertulis, bingkai, atau tepi kertas.
- [ ] 15% bagian bawah tenang dan agak gelap untuk subtitle.
- [ ] Telur, Rex kecil, dan Rex dewasa terlihat sama antar adegan (tiga bekas luka di pipi hanya pada Rex dewasa).
- [ ] Tidak ada darah atau luka di adegan 05 dan 06.

## Setelah gambar jadi

1. Buat salinan WebP kualitas 90 di sebelah tiap PNG (`bg.webp`, `mid.webp`, `fg.webp`). Game hanya memuat WebP.
2. Tambahkan nomor adegan ke `web/assets/story/layers.json`, misalnya `{ "layered": [1, 3, 4] }`. Adegan yang belum terdaftar tetap memakai panel lama `opening-NN.webp` di atas salinan buramnya, jadi adegan boleh dikirim satu per satu.
3. Tidak perlu mengubah kode atau `web/assets/manifest.json`.
4. Setelah ketujuh adegan berlapis, panel lama `opening-NN.png/.webp` boleh dihapus.

## Cara pemutar bekerja

- Pemutar ada di `web/src/opening.js`, gayanya di blok `#opening` di `web/style.css`.
- Tiap adegan punya gerak kamera (`cam`: geser dan zoom dari awal ke akhir) dan kedalaman tiap lapis (`layers`). Lapis dengan kedalaman lebih besar bergeser lebih jauh, jadi `fg` terasa paling dekat. `move` menambah gerak sendiri, misalnya meteor yang melintas di adegan 01.
- Pergantian adegan: pudar (01, 03, 05, 07), kilat putih dan guncangan (02), letupan cepat (04), potong langsung dengan dua guncangan (06). Adegan 03 punya cahaya berdenyut dari telur.
- Semua gerak hanya memakai `transform` dan `opacity`. Dengan `prefers-reduced-motion`, kamera diam dan adegan hanya memudar.
