# Misi Spesial

Brief fitur dan seluruh prompt gambar untuk **Misi Spesial**: Kemerdekaan, Salju, dan Halloween. Semua gambar baru untuk Rampage Rex dikerjakan dari dokumen ini. Prompt lama yang sudah selesai disimpan di `backup/image-prompts.md`.

**Status:** menunggu gambar dari Codex. Kode misi dikerjakan setelah gambarnya masuk.

---

## 1. Aturan wajib gambar

Baca bagian ini sebelum membuat gambar apa pun. Gambar yang melanggar aturan ini akan dikembalikan.

### 1.1 Tidak boleh ada yang terpotong

- **Semua objek utuh di dalam kanvas.** Tidak boleh ada daun, ujung pohon, kepala, ekor, sayap, tiang, atau kabel yang terpotong oleh tepi gambar.
- **Jarak aman dari tepi:**
  - **Sprite** (karakter, properti, efek): minimal 24 px kosong transparan di keempat sisi.
  - **Lapisan latar `far-city` dan `mid-city`:** minimal 16 px kosong di atas.
  - **Atlas animasi:** minimal 32 px kosong di sekeliling setiap pose di dalam selnya.
- **Kalau objek tidak muat, kecilkan dan geser objeknya.** Jangan memotong, dan jangan memperbesar sampai menyentuh tepi.
- **Pengecualian, hanya ini:**
  - `sky` penuh sampai tepi.
  - `street` menyentuh tepi kiri, kanan, dan bawah.
  - Lapisan latar menyentuh tepi bawah.
  - Cut-in boleh terpotong di sisi yang disebut dalam promptnya.
- **Periksa sebelum menyimpan:** lihat baris piksel paling atas, kiri, dan kanan pada kanal alpha. Kalau ada piksel tidak transparan yang bukan pengecualian di atas, gambar ulang.

### 1.2 Lapisan latar menyambung

- Tepi kiri harus menyambung persis dengan tepi kanan saat gambar diulang ke samping.
- 80 px paling kiri dan 80 px paling kanan hanya boleh berisi elemen rendah yang menyambung: garis tanah, pagar, tembok rendah, atau laut. Bangunan, pohon, gunung, tiang, derek, dan kapal harus utuh di tengah gambar.
- Jangan memudarkan, mengaburkan, atau menumpuk dua gambar di sambungan. Setiap objek digambar sekali, tajam, dan tidak tembus pandang.

### 1.3 Ukuran dan format file

- **"Ukuran" selalu berarti ukuran kanvas dalam piksel**, bukan ukuran file dalam byte. Jangan menambal file dengan data kosong (chunk `JUNK`, `paDd`, dan sejenisnya) supaya byte-nya sama.
- `.webp`: WebP lossy, quality 88, alpha quality 100. Jangan lossless.
- `.png`: PNG biasa tanpa chunk tambahan.
- Latar transparan asli, bukan kotak-kotak abu-abu atau putih.

### 1.4 Isi gambar

- Tanpa teks, huruf, angka, logo, merek, atau watermark. Papan dan spanduk hanya berisi bentuk abstrak.
- Karakter menghadap **kanan**, kecuali disebut lain. Bos menghadap **kiri**, ke arah Rex.
- Gaya mengikuti aset yang ada: outline navy gelap, cel shading dua tingkat dengan bayangan teal tua, kartun lucu dan tidak seram berlebihan.
- Jangan ubah kode, `web/assets/manifest.json`, workflow, atau skrip. Pendaftaran aset dikerjakan terpisah.

### 1.5 Shared Brief

Tempel di awal setiap prompt:

```
Production asset for a 2D side-scrolling browser game, "Rampage Rex", set in an Indonesian city. Polished hand-drawn 2D illustration with confident dark navy-charcoal outlines (#1E2A33), varied line weight. Bold two-tone cel shading where shadows are deep cool teal (#1F4E5F family), never just a slightly darker tint. Rich saturated colors. Playful, slightly comedic, never gory. Every object is complete and fully inside the canvas with a generous empty margin on every side: nothing is cropped or touches the edge. No pixel art, no 3D render, no photographic texture, no readable text, no letters, no logos, no watermark, no checkerboard.
```

Untuk karakter, tambahkan:

```
Character lighting: soft even top light with warm rim light on the top edges only, so the sprite still looks correct when mirrored horizontally.
```

---

## 2. Desain fitur

### 2.1 Gambaran umum

- **Menu terpisah:** tombol **Misi Spesial** di menu utama membuka panel sendiri, tidak tercampur dengan daftar distrik. Panelnya berisi tiga kartu misi dan satu kartu hadiah ZombieRex.
- **Peta sendiri:** setiap misi punya peta, latar, properti, musik, dan bos sendiri. Pawai, panjat pinang, dan lagu mars dipindah dari distrik biasa ke Misi Kemerdekaan.
- **Lebih panjang dan lebih tebal:** jalur sekitar 1,5 kali distrik biasa. Darah Rex 900, sedangkan di Alun-Alun 600.
- **Hadiah:** setiap misi membuka satu skin Rex beserta skill khususnya. Setelah ketiga misi selesai, skin **ZombieRex** terbuka.
- **Skill khusus:** tombol baru **Spesial** (keyboard `F`, tombol sentuh sendiri). Skill hanya aktif saat Rex memakai skin hadiah yang bersangkutan, dan bisa dipakai di semua peta.
- **Mode developer** membuka semua misi tanpa menyimpan progres, sama seperti distrik.

### 2.2 Syarat terbuka

Usulan awal, bisa diubah:

| Misi | Syarat |
| --- | --- |
| Tombol Misi Spesial | Pencapaian **Penakluk Kota** (kedelapan distrik selesai) |
| Kemerdekaan | Langsung terbuka bersama tombolnya |
| Salju | Misi Kemerdekaan selesai dan pencapaian **Bintang Kota** (15 bintang) |
| Halloween | Misi Salju selesai dan pencapaian **Tukang Gusur** (200 bangunan) |
| Skin ZombieRex | Ketiga misi selesai |

### 2.3 Ringkasan misi

| Misi | Kode `setting` | Bos | Hadiah skin | Skill khusus |
| --- | --- | --- | --- | --- |
| Kemerdekaan | `merdeka` | Tikus Raksasa | Sayap Merah Putih (`sayap`) | Terbang |
| Salju | `salju` | Boneka Salju Raksasa | Rex Es (`es`) | Duri Es |
| Halloween | `halloween` | Penyihir | Rex Tulang (`tulang`) | Bangkit Lagi |
| Hadiah akhir | – | – | ZombieRex (`zombie`) | – |

### 2.4 Misi Kemerdekaan

- **Suasana:** kampung kota yang meriah menjelang 17 Agustus, siang cerah. Umbul-umbul, bendera merah putih di setiap rumah, gapura hias, panggung lomba.
- **Event:** pawai 17 Agustus, panjat pinang, lomba balap karung (warga anak-anak melompat dalam karung), konvoi motor. Lagu mars diputar selama pawai.
- **Bos, Tikus Raksasa:** tikus gemuk setinggi Rex yang membawa karung koin emas.
  - Serangan: cakaran, dan lemparan karung koin yang memantul di jalan.
  - **Ulti Hujan Koin Emas:** koin berjatuhan di sekitar Rex selama 2 detik. Setiap koin yang kena memperlambat gerak Rex. Lambatnya bertumpuk sampai batas tertentu, lalu hilang perlahan.
  - Ulti bisa digagalkan dengan Raung atau Lompat, sama seperti ulti pahlawan.
- **Hadiah, skin Sayap Merah Putih:** Rex bersayap merah putih yang terlipat di punggung.
  - **Skill Terbang** (jeda 18 detik): Rex terbang setinggi lantai dua selama 4 detik.
  - Selama terbang, gerak lebih cepat, gigitan mengenai lantai atas, serangan jarak dekat dan tabrakan dari darat tidak kena, tapi peluru dan roket tetap kena.
  - Saat mendarat, Rex membuat hentakan kecil.

### 2.5 Misi Salju

- **Suasana:** fantasi kota Indonesia yang tiba-tiba diselimuti salju, sore kebiruan. Atap ruko tertutup salju, es menggantung di talang, jalan licin, boneka salju kecil di trotoar.
- **Aturan peta:** jalan licin, jadi tentara dan warga sesekali tergelincir. Rex tidak terpengaruh.
- **Bos, Boneka Salju Raksasa:** tiga bola salju besar dengan syal, ember di kepala, dan meriam pembeku di satu tangan.
  - Serangan: meluncur menabrak, dan tembakan bola salju.
  - **Ulti Meriam Pembeku:** bola es besar. Kalau kena, Rex membeku di dalam balok es selama 1,5 detik dan tidak bisa bergerak. Menekan tombol berulang mempercepat lepas.
- **Hadiah, skin Rex Es:** tubuh dari kristal es kebiruan yang tembus cahaya, duri punggung jadi bongkahan es.
  - **Skill Duri Es** (jeda 16 detik): barisan duri es setinggi Rex menyembul dari dalam tanah, merambat ke depan sejauh sekitar satu layar.
  - Duri es menusuk pahlawan, bos, tentara, kendaraan, dan warga di jalurnya. Damage besar dan membuat target terpaku sebentar.

### 2.6 Misi Halloween

- **Suasana:** malam Halloween di kota, bulan purnama ungu. Labu menyala, sarang laba-laba, kelelawar, pagar kuburan, pohon kering.
- **Musuh tambahan:** tengkorak yang keluar dari dalam tanah dan berjalan pelan ke arah Rex.
- **Bos, Penyihir:** penyihir melayang di atas sapu.
  - Serangan: bola sihir yang melayang mengejar.
  - Menancapkan tongkat ke tanah untuk memanggil 3 sampai 5 tengkorak dari lingkaran sihir.
  - **Ulti Pasukan Tulang:** pemanggilan besar, 8 tengkorak sekaligus di sekitar Rex.
  - Penyihir hanya bisa digigit saat turun memanggil. Raung membuatnya jatuh sebentar.
- **Hadiah, skin Rex Tulang:** tengkorak dinosaurus tanpa kulit, tulang krem, mata menyala hijau.
  - **Skill Bangkit Lagi** (pasif, sekali per distrik atau misi): saat darah habis, tulang Rex rontok dan menumpuk, lalu tersusun kembali menjadi Rex dan bangkit dengan 50 darah.

### 2.7 ZombieRex

Skin hadiah akhir: Rex zombi dengan kulit hijau pucat, luka jahitan, sebagian tulang rusuk terlihat, satu mata menyala kuning. Tanpa skill khusus.

### 2.8 Musik

Dibuat lewat kode, tanpa file: satu lagu per peta (mars meriah, lagu salju dengan lonceng, lagu Halloween bernada minor yang jenaka) dan satu lagu bos per misi.

---

## 3. Daftar aset

Semua path relatif ke root repo. Setiap misi punya folder latar `web/assets/backgrounds/<setting>/`.

### 3.1 Latar (setiap misi)

| File | Ukuran | Catatan |
| --- | --- | --- |
| `sky.webp` | 1600×900 | Penuh, tidak transparan |
| `far-city.webp` | 1600×295 | Transparan, isi menempel ke tepi bawah, 16 px kosong di atas |
| `mid-city.webp` | 1600×239 | Transparan, isi menempel ke tepi bawah, 16 px kosong di atas |
| `street.webp` | 1600×214 | Transparan hanya di 13 px teratas. Kaki karakter berpijak sekitar 66 px dari atas |

Referensi gaya: `web/assets/backgrounds/sky.webp`, `far-city.webp`, `mid-city.webp`, `street.webp`. Tanpa karakter, kendaraan, atau benda yang bisa dihancurkan.

Template prompt lapisan, tambahkan isi per misi di bawahnya:

```
[LAYER], [SIZE], horizontally seamless with no fades at the seam, the leftmost and rightmost 80 px containing only low continuous ground-level elements, every tall object complete and fully inside the image with at least 16 px of empty space above the tallest point. Same art style, outline weight and horizon height as the attached reference layer. No text.
```

### 3.2 Hiasan bangunan (setiap misi)

Bangunan misi tetap memakai modul ruko yang ada. Hiasan digambar sebagai lapisan transparan yang ditempel di atas modul utuh. Hiasan disembunyikan saat modul rusak berat.

Simpan di `web/assets/buildings/overlays/<setting>/`:

| File | Ukuran | Pasangan modul |
| --- | --- | --- |
| `ground.webp` | 984×457 | `buildings/ruko-01/colors/ground-*.webp` |
| `upper.webp` | 984×361 | `buildings/ruko-01/colors/upper-*.webp` |
| `roof.webp` | 984×293 | `buildings/ruko-01/colors/roof-*.webp` |

```
Transparent decoration overlay that sits exactly on top of the attached ruko [MODULE] module, same canvas size, decorations only, the building itself is NOT drawn. Decorations follow the facade edges, ledges and roof line of the reference precisely and stay inside the facade width: [DECORATION]. Everything else fully transparent.
```

### 3.3 Properti (setiap misi, tiga buah)

Simpan di `web/assets/props/`. Tiga file dengan kanvas sama: `<nama>.webp`, `<nama>-damaged.webp`, `<nama>-wreck.webp`. Tampak samping, latar transparan.

```
ONE [PROP], strict side view facing right, chunky cartoon proportions, same outline and lighting style as the attached ruko reference. Complete object fully inside the canvas with at least 24 px of empty space on every side. No people, no text, no logos.
```

Versi rusak, pakai gambar utuh sebagai edit source:

```
Edit the attached [PROP] into a [STATE] version. Keep the exact same canvas size and the same base position on the bottom, same outline style, palette and lighting. [STATE] = damaged: cracked, bent and leaning, some pieces fallen / wreck: collapsed into a low pile of chunky broken pieces sitting on the same bottom line. Everything stays fully inside the canvas. Transparent background, no characters, no text.
```

### 3.4 Bos (setiap misi)

Simpan di `web/assets/characters/bosses/<nama-bos>/`:

| File | Ukuran | Isi |
| --- | --- | --- |
| `master.webp` | sekitar 1000×1500 | Seluruh badan, menghadap kiri |
| `atlas.webp` | 1280×2048 | 2 kolom × 4 baris, sel 640×512, menghadap kiri, kaki di garis 90% tinggi sel |
| `cutin.webp` | 1600×900 | Wajah tiga perempat, boleh terpotong hanya di tepi bawah dan kiri, area kiri bawah tenang |
| `portrait.webp` | 400×400 | Kepala dan bahu, untuk HUD |

Ukuran tubuh bos setinggi Rex. Referensi skala: `web/assets/characters/heroes/robot/master.webp`.

Template atlas:

```
Production transparent sprite animation atlas for the attached boss character. Output one transparent RGBA image of exactly 1280x2048 px with EXACTLY TWO equal columns and FOUR equal rows: EIGHT full-body sprites, read left to right then top to bottom. Every cell has the same camera and the same body scale, feet on a ground line at 90 percent of the cell height, and at least 32 px of fully transparent margin on all sides: the whole body, including raised arms, weapons and tail, stays inside its own cell. The boss faces LEFT in every frame. Poses: [POSES]. Clean distinct silhouettes. No grid, no borders, no text, no ground, no shadows, no effects outside the body, no checkerboard.
```

### 3.5 Skin Rex

Simpan di `web/assets/characters/rex/skins/<skin>/`. Edit source: atlas yang namanya sama di `web/assets/characters/rex/animations/`, ditambah `web/assets/fx/ulti-cutin.webp`.

```
walk.webp  bite-roar.webp  tail-stomp.webp  ulti.webp  jump.webp  knockdown.webp  ulti-cutin.webp
```

Kanvas setiap file harus sama persis dengan sumbernya. Pose dan posisinya juga tidak boleh berubah, supaya koordinat frame di manifest tetap berlaku.

```
Edit the attached sprite atlas of this exact red dinosaur Rex. Keep EVERYTHING identical: canvas size in pixels, number of cells, every pose, every silhouette, the position and size of each sprite inside its cell, outline weight and the genuine transparent background. Change ONLY the surface design of the character to: [SKIN]. Apply it identically to every frame and every atlas so the design and colours never change between idle, walking and attacking. Any added part (wings, ice spikes, bones) must fit inside each sprite's own cell with at least 32 px of empty margin. No new limbs unless described, no background, no text, no checkerboard.
```

Kerjakan `walk.webp` dulu, lalu pakai hasilnya sebagai referensi tambahan untuk atlas lainnya supaya warna dan bentuknya sama di semua animasi.

Atlas skill baru memakai format atlas ulti:
- 1254×1254 px, 2 kolom × 4 baris.
- Pinggul di 58% lebar sel, kaki di garis 90% tinggi sel.
- Margin 32 px di setiap sel.

---

## 4. Misi Kemerdekaan (`merdeka`)

Pawai, panjat pinang, dan motor memakai aset yang sudah ada:
- `characters/civilians/pawai/`
- `props/panjat-pinang*`
- `characters/soldiers/motor*`

### 4.1 Latar

Simpan di `web/assets/backgrounds/merdeka/`.

- **sky:** `bright clear midday sky, saturated blue fading to pale near the horizon, a few puffy white cumulus clouds, festive and cheerful`
- **far-city:** `distant low skyline of an Indonesian kampung and small mosque dome as soft blue-grey silhouettes, tiny red-and-white flags on rooftops`
- **mid-city:** `a row of small kampung houses with tiled roofs, strings of small red-and-white triangle bunting zig-zagging between the houses, tall curved umbul-umbul banner poles in red and white, a decorated gateway arch made of bamboo with red-and-white cloth, low fences at both edges`
- **street:** `a kampung asphalt road freshly painted with a red-and-white kerb, red-and-white bunting shadows on the pavement, small potted plants`

### 4.2 Hiasan bangunan

`[DECORATION]`:
- **ground:** `a small red-and-white flag on a bamboo pole fixed beside the door, red-and-white pleated cloth swag along the top edge`
- **upper:** `red-and-white triangle bunting strung across the facade under the ledge, a small flag hanging from one window`
- **roof:** `a row of small red-and-white flags along the roof ridge and a short red-and-white umbul-umbul banner on one corner, staying inside the facade width`

### 4.3 Properti

| Nama file | Isi |
| --- | --- |
| `gapura-merdeka` | gapura bambu hias berbalut kain merah putih dengan umbul-umbul, sekitar 600×700 |
| `panggung-lomba` | panggung kayu kecil beratap terpal merah putih dengan pengeras suara, sekitar 640×480 |
| `tenda-hadiah` | tenda kecil berisi tumpukan hadiah lomba (ember, kipas angin, sepeda kecil), sekitar 520×420 |

### 4.4 Warga balap karung

Simpan di `web/assets/characters/civilians/balap-karung/`. Kanvas pose 392×425, kaki di baris 413. File:
- `master.webp`
- `frames/run-a.webp`, `frames/run-b.webp`: dua pose lompat
- `frames/look-back.webp`
- `frames/stumble.webp`

```
ONE small cartoon Indonesian kid in a red-and-white t-shirt standing inside a brown burlap sack held up to the chest for a sack race, cheerful, full body, strict side view facing right, about 2.5 heads tall, fully inside the canvas with 24 px margin.
```

Pose: `(1) hopping up in the sack, (2) landing with knees bent, (3) hopping while looking back in fear, (4) tripping forward in the sack`.

### 4.5 Bos Tikus Raksasa

Simpan di `web/assets/characters/bosses/tikus/`.

```
ONE giant chubby cartoon rat boss, as tall as a giant dinosaur, standing on its hind legs, strict side view facing LEFT. Grey-brown fur with a cream belly, big round ears with pink insides, long pink tail curling behind it, buck teeth, greedy grin, small round sunglasses pushed up on its head. It hugs a huge burlap sack overflowing with shiny gold coins. Comedic villain, not scary. Same outline and cel shading as the attached robot reference. No text, no logos, no clothing with symbols.
```

Atlas `[POSES]`:

`(1) idle hugging the coin sack, (2) running A, (3) running B, (4) wind-up for a claw swipe, (5) claw swipe, (6) throwing the coin sack forward, (7) hit and recoiling, (8) knocked down flat with coins scattered`

Cut-in: `greedy grin, gold coins flying around its head, golden glow`.

### 4.6 Efek koin

Simpan di `web/assets/fx/koin/`:

| File | Ukuran | Isi |
| --- | --- | --- |
| `frames/spin-a.webp` sampai `spin-d.webp` | 128×128 | Koin emas berputar, 4 sudut putaran |
| `pile.webp` | 256×128 | Tumpukan koin kecil di tanah |
| `sack.webp` | 256×256 | Karung koin yang dilempar bos |

```
ONE shiny cartoon gold coin with a simple star emboss (no letters, no numbers), thick dark outline, warm highlights, fully inside the canvas with 16 px margin. [ANGLE: facing front / three-quarter / edge-on / three-quarter reversed]
```

### 4.7 Skin Sayap Merah Putih (`sayap`)

`[SKIN]`:

```
the same red Rex, now with a pair of large feathered wings folded neatly along the back: the upper feathers bright red, the long flight feathers white, outlined in the same dark outline. The folded wings stay close to the body and never cover the face, and they fit inside each sprite's cell. No emblem, no badge
```

Atlas tambahan `fly.webp`, 8 pose:

`(1) crouch with wings starting to open, (2) wings spread wide upward, feet leaving the ground, (3) lifting off, wings sweeping down, (4) gliding level, wings fully spread, (5) gliding with wings mid-beat, (6) diving slightly forward, jaws open, (7) landing with feet forward, wings braking, (8) standing with wings folding back`

Ikon skill `web/assets/ui/skills/terbang.webp` (256×256): `the red-and-white wings spread, simple and bold, readable at 48 px`.

---

## 5. Misi Salju (`salju`)

### 5.1 Latar

Simpan di `web/assets/backgrounds/salju/`.

- **sky:** `pale blue late-afternoon winter sky with soft pink near the horizon, gentle falling snowflakes drawn as small soft dots, a few grey-blue snow clouds`
- **far-city:** `distant Indonesian city skyline and a mosque dome covered in snow, soft blue-white silhouettes`
- **mid-city:** `rows of tiled-roof houses and small shops with thick snow on every roof and ledge, snow-covered palm and mango trees (crowns complete and fully inside the image), low snow banks at both edges`
- **street:** `a snowy asphalt road with tyre tracks, slushy grey-blue patches and a snow-covered pavement with a kerb`

### 5.2 Hiasan bangunan

`[DECORATION]`:
- **ground:** `snow piled on the step and the counter, a small snowman by the door, icicles under the shop sign`
- **upper:** `thick snow on the window ledges and the AC unit, icicles hanging under the ledge, frost on the glass corners`
- **roof:** `a thick soft layer of snow covering the roof line with icicles hanging from the gutter, all inside the facade width`

### 5.3 Properti

| Nama file | Isi |
| --- | --- |
| `boneka-salju` | boneka salju kecil memakai peci dan sarung, sekitar 360×460 |
| `cemara-salju` | pohon cemara tertutup salju di pot beton, puncaknya utuh, sekitar 420×640 |
| `gerobak-es` | gerobak es dawet yang membeku dengan es menggantung, sekitar 480×400 |

### 5.4 Bos Boneka Salju Raksasa

Simpan di `web/assets/characters/bosses/boneka-salju/`.

```
ONE giant cartoon snowman boss made of three huge snowballs, as tall as a giant dinosaur, strict side view facing LEFT. A red-and-white striped knitted scarf, a dented tin bucket as a hat, coal eyes with angry brows, a carrot nose, stick arms. One arm holds a chunky blue-and-silver freeze cannon with frost crystals on the barrel. Comedic, not scary. Same outline and cel shading as the attached robot reference. No text.
```

Atlas `[POSES]`:

`(1) idle with the cannon lowered, (2) sliding forward A, (3) sliding forward B, (4) aiming the freeze cannon, (5) firing with recoil and a puff of frost at the barrel, (6) body slam leaning forward, (7) hit with snow chunks flying off, (8) collapsed into a lumpy pile of snow with the bucket on top`

Cut-in: `angry coal eyes, frost mist around the cannon`.

### 5.5 Efek es

Simpan di `web/assets/fx/es/`:

| File | Ukuran | Isi |
| --- | --- | --- |
| `frames/spike-a.webp` sampai `spike-d.webp` | 256×640 | Duri es keluar dari tanah: (a) retakan dan ujung muncul, (b) setengah tinggi, (c) tinggi penuh setinggi Rex, (d) pecah. Dasar duri di tepi bawah, ujung atas tetap 24 px dari tepi atas |
| `freeze-ball.webp` | 192×192 | Bola es dari meriam bos |
| `ice-block.webp` | 900×700 | Balok es bening berbentuk bongkahan untuk membungkus Rex, tengahnya tembus pandang |
| `snowball.webp` | 128×128 | Bola salju biasa |

### 5.6 Skin Rex Es (`es`)

`[SKIN]`:

```
a dinosaur made of translucent glacier ice: pale cyan and white crystal body with darker blue facets for shading, frosty white belly, dorsal plates turned into jagged ice crystals, glowing light-blue eye, tiny frost sparkles. Same silhouette and readable cartoon look
```

Ikon skill `web/assets/ui/skills/duri-es.webp` (256×256): `three ice spikes bursting out of cracked ground`.

---

## 6. Misi Halloween (`halloween`)

### 6.1 Latar

Simpan di `web/assets/backgrounds/halloween/`.

- **sky:** `deep purple night sky with a huge pale full moon, thin wispy clouds, a few bat silhouettes, stars`
- **far-city:** `distant city skyline as dark violet silhouettes with a few glowing orange windows and a bare tree line`
- **mid-city:** `old tiled-roof houses with crooked shutters, a graveyard fence with rounded tombstones, bare twisted trees (complete crowns, fully inside the image), carved pumpkins glowing on porches, low iron fences at both edges`
- **street:** `a dark cobbled road with fallen leaves, faint purple fog at the kerb, orange lantern light pools`

### 6.2 Hiasan bangunan

`[DECORATION]`:
- **ground:** `two glowing jack-o'-lanterns on the step, a cobweb in the top corner of the door, a small hanging lantern`
- **upper:** `cobwebs in the window corners, a string of small purple and orange lights under the ledge, a cartoon bat hanging upside down`
- **roof:** `a crooked weather vane, a few bats perched on the roof line, cobwebs at the corners, all inside the facade width`

### 6.3 Properti

| Nama file | Isi |
| --- | --- |
| `labu-raksasa` | tumpukan labu besar yang menyala, sekitar 460×360 |
| `nisan` | dua nisan bulat dengan pagar kecil, tanpa tulisan, sekitar 420×320 |
| `pohon-mati` | pohon kering berliuk dengan sarang laba-laba, cabangnya utuh di dalam kanvas, sekitar 480×640 |

### 6.4 Tengkorak (musuh)

Simpan di `web/assets/characters/soldiers/tengkorak/frames/`. Kanvas pose 356×425, kaki di baris 413, seperti infanteri.

```
ONE small cartoon skeleton minion, chunky bones, big round skull with a goofy grin and glowing green eye sockets, wearing a tattered purple cape, strict side view facing right, about 2.5 heads tall, comedic not scary, fully inside the canvas with 24 px margin.
```

Pose: `walk-a.webp`, `walk-b.webp`, `attack.webp` (mengayun tulang), `knockback.webp`, `rise.webp` (baru setengah keluar dari tanah, tangan terangkat). Untuk `rise`, tanah retak di bawahnya digambar di dalam kanvas.

### 6.5 Bos Penyihir

Simpan di `web/assets/characters/bosses/penyihir/`.

```
ONE cartoon witch boss riding a broom, large enough to match a giant dinosaur, strict side view facing LEFT. Tall crooked purple hat with an orange band, green-tinted skin, long silver hair, a purple and black ragged dress, striped orange-and-purple stockings, a gnarled wooden staff topped with a glowing green crystal. Mischievous grin, comedic not scary. Same outline and cel shading as the attached robot reference. No text.
```

Atlas `[POSES]`:

`(1) hovering on the broom, (2) flying A, (3) flying B, (4) raising the staff with the crystal glowing, (5) stabbing the staff down to summon, standing on the ground, (6) throwing a magic orb, (7) hit and spinning off the broom, (8) fallen on the ground with the hat crumpled`

Cut-in: `cackling, green crystal glow lighting the face from below`.

### 6.6 Efek sihir

Simpan di `web/assets/fx/sihir/`:

| File | Ukuran | Isi |
| --- | --- | --- |
| `orb.webp` | 192×192 | Bola sihir hijau-ungu |
| `circle.webp` | 640×200 | Lingkaran sihir di tanah dilihat miring, tanpa huruf atau simbol tulisan |
| `bat.webp` | 192×128 | Kelelawar kartun |

### 6.7 Skin Rex Tulang (`tulang`)

`[SKIN]`:

```
a cartoon dinosaur skeleton with no skin or flesh: chunky cream-white bones with dark outlines, a big friendly skull with glowing green eye lights, visible ribcage, bony spine with small bone plates instead of dorsal plates, bony tail. Clean and comedic, not gory, no blood
```

Atlas tambahan `revive.webp`, 8 pose:

`(1) standing skeleton hit, bones rattling, (2) bones loosening, the skull tilting, (3) collapsing, bones falling apart in mid-air, (4) a messy pile of bones on the ground with the skull on top, (5) the bones twitching and the eye lights flickering on, (6) the legs and spine reassembled, ribs flying back into place, (7) almost complete, the skull snapping onto the neck, (8) fully rebuilt, roaring with glowing green eyes`

Semua tulang di setiap pose tetap di dalam selnya.

Ikon skill `web/assets/ui/skills/bangkit.webp` (256×256): `a bone skull with a curved arrow circling it`.

---

## 7. ZombieRex (`zombie`)

Simpan di `web/assets/characters/rex/skins/zombie/` dengan tujuh atlas di bagian 3.5.

`[SKIN]`:

```
a cartoon zombie Rex: pale greenish-grey skin with darker green spots, a few stitched scars, a small patch of exposed ribs on one flank, ragged dorsal plates, one eye glowing yellow and the other cloudy white, mouth with a few crooked teeth. Funny and spooky, not gory, no blood
```

---

## 8. Menu Misi Spesial

Simpan di `web/assets/ui/missions/`:

| File | Ukuran | Isi |
| --- | --- | --- |
| `merdeka.webp` | 640×360 | Rex bersayap di depan gapura merah putih |
| `salju.webp` | 640×360 | Rex Es di depan ruko bersalju |
| `halloween.webp` | 640×360 | Rex Tulang di bawah bulan ungu |
| `zombie.webp` | 640×360 | ZombieRex di depan kota malam |

```
Mission card illustration 640x360 for the game Rampage Rex: [SCENE]. Rex is complete and fully inside the image with margin, centred slightly right, the left third calmer for a title added later by the game. Full-bleed background, no text, no letters, no logos, no frame.
```

Kartu yang terkunci digelapkan oleh kode, jadi tidak perlu versi terkunci.

---

## 9. Perbaikan aset terpotong yang ada

Empat lapisan latar distrik biasa belum menyambung, dan objeknya terpotong di sambungan. Gambar ulang dengan aturan bagian 1, lalu timpa file aslinya:

| File | Ukuran | Masalah |
| --- | --- | --- |
| `web/assets/backgrounds/mid-city.webp` | 1600×239 | Pohon dan atap terpotong di tepi kanan, atap tercoreng di sambungan |
| `web/assets/backgrounds/far-city.webp` | 1600×295 | Gunung terpotong di tepi kanan |
| `web/assets/backgrounds/beach/far-city.webp` | 1600×295 | Gunung terpotong dan memudar di tepi kanan |
| `web/assets/backgrounds/port/far-city.webp` | 1600×295 | Derek terpotong di tepi kiri |

```
Edit the attached transparent background strip so it tiles seamlessly left to right. Keep the exact canvas size in pixels, art style, colours and line weight, with the content anchored to the bottom edge and at least 16 px of empty space at the top. Move or redraw objects so that every tree, roof, mountain, crane and building is complete and fully inside the image: the leftmost 80 px and rightmost 80 px contain only the low continuous ground line, sea or a low wall, drawn so the right edge continues exactly into the left edge. No fades, no blur, no ghosting at the seam. Transparent background, no text.
```

---

## 10. Urutan kerja dan checklist

Kerjakan per misi, satu commit per bagian. Urutan yang disarankan:
1. Bagian 9, perbaikan latar terpotong.
2. Misi Kemerdekaan.
3. Misi Salju.
4. Misi Halloween.
5. ZombieRex.
6. Kartu menu.

Sebelum commit, cek setiap file:

- [ ] Ukuran kanvas dalam piksel sesuai tabel.
- [ ] Tidak ada objek yang terpotong atau menyentuh tepi, kecuali pengecualian di bagian 1.1.
- [ ] Lapisan latar menyambung tanpa pudar atau bayangan ganda.
- [ ] Latar transparan asli, tanpa kotak-kotak.
- [ ] Tanpa teks, huruf, angka, atau logo.
- [ ] WebP lossy quality 88, tanpa chunk padding.
- [ ] Skin: warna dan bentuk sama di semua atlas, pose dan posisi sel tidak berubah.
- [ ] Tidak ada perubahan kode, manifest, workflow, atau skrip.
