# Rampage Rex — Image Generation Prompts

Arah visual: **Ruko Senja**. Kota bergaya Indonesia (ruko, warung, angkot, kabel listrik semrawut) saat matahari terbenam. Menggantikan City Kit 01 yang palet pastelnya terlalu datar.

## Cara pakai

1. **Selalu awali setiap prompt dengan Shared Brief** di bawah.
2. Aktifkan **transparent background** (kecuali background di bagian 8).
3. Generate **master design** tiap karakter dan **lantai dasar ruko** dulu. Setelah cocok, pakai sebagai **image reference** untuk aset turunan. Jangan generate turunan tanpa referensi.
4. Semua karakter **menghadap kanan**. Arah kiri cukup di-flip di code.
5. Arah cahaya **wajib sama** di semua aset: matahari senja dari **kiri atas**. Karena karakter di-flip di code, rim light karakter dibuat **netral** (lihat Shared Brief).
6. Catat bounds, pivot, dan titik sambungan di `manifest.json` setelah aset jadi.

---

## Palet Ruko Senja

| Peran | Hex |
| --- | --- |
| Langit senja oranye | `#F28A5B` |
| Langit magenta | `#D9487D` |
| Bayangan teal tua | `#1F4E5F` |
| Outline | `#1E2A33` |
| Krem dinding | `#F4E1B5` |
| Mustard aksen | `#F2B33D` |
| Hijau aksen | `#3FA36B` |
| Rim light hangat | `#FFC27A` |

---

## Shared Brief (tempel di awal setiap prompt)

```
Production PNG asset for a 2D side-scrolling browser game, "Rampage Rex", set in a dense Indonesian city at sunset. Polished hand-drawn 2D illustration with confident dark navy-charcoal outlines (#1E2A33), varied line weight (thicker outer silhouette, thinner interior lines). Strong value contrast: bold two-tone cel shading where shadows are deep cool teal (#1F4E5F family), never just a slightly darker tint. Warm sunset key light coming from the upper left, with a thin warm orange rim light (#FFC27A) on upper edges. Rich saturated colors: sunset orange #F28A5B, magenta #D9487D, deep teal #1F4E5F, warm cream #F4E1B5, mustard #F2B33D, green #3FA36B. Medium-high detail density with purposeful small details, subtle hand-painted grain inside fills allowed. Playful, slightly comedic, not gory. Genuine transparent background, generous safety margin, object fully intact and uncropped. No pixel art, no voxel, no 3D render, no photographic texture, no readable text, no letters, no logos, no watermark, no UI, no ground shadow, no background scenery.
```

**Tambahan khusus karakter** (tempel setelah Shared Brief untuk semua karakter, karena sprite akan di-flip):

```
Character lighting: soft even top light with warm rim light on the top edges only, no strongly one-sided lighting, so the sprite still looks correct when mirrored horizontally.
```

---

## 1. City Kit 02 — Ruko

Bangunan tampak depan murni (front orthographic elevation), tanpa dinding samping atau perspektif. Tepi luar fasad lurus supaya modul bisa ditumpuk.

### 1.1 Lantai dasar ruko (master, buat paling awal)

```
ONE isolated ground-floor module of an Indonesian ruko shophouse, not a whole building. Wide rectangular facade, straight open top edge and straight parallel vertical sides so upper floors can stack on it. Cream plaster wall with weathered stains and cracks, a half-open corrugated metal folding shutter in deep teal, a small warung counter with colorful snack packets and hanging sachet strips, a mustard plastic stool, a tiled step plinth at the bottom. A small blank signboard above the shutter with only abstract shapes (a bowl and steam icon), absolutely no letters. Front orthographic elevation only. No upper floor, no roof, no sidewalk, no people.
```

### 1.2 Lantai atas ruko (bisa diulang vertikal)

Pakai 1.1 sebagai image reference, lebar fasad sama.

```
Using the attached ground floor as the exact style, palette and facade-width reference, generate ONE repeatable upper-floor module of the same ruko. Wide rectangle, straight top and bottom edges, same facade width. Two windows with teal-tinted glass and simple iron security bars, an outdoor AC unit bolted under one window with a dripping pipe, a short clothesline with colorful laundry, a rusty water pipe running down one side, a few cracks and rain stains. Must stack seamlessly on itself and on the ground floor. No roof, no balcony protruding outside the facade.
```

### 1.3 Atap ruko

```
Using the attached ground floor as the style reference, generate ONE flat rooftop cap module of the same ruko, wide and low (about 4:1). Plaster parapet with a dark teal coping, an orange plastic water tank (toren) on a small metal stand toward the left, a satellite dish and a bent TV antenna toward the right, a few loose cables. Straight horizontal bottom edge matching the facade width. Flat urban roof, not a pitched roof.
```

### 1.4 Variasi warna fasad

Pakai 1.1–1.3 sebagai reference, ganti warna dinding supaya jalan tidak monoton.

```
Recolor the attached module only: change the plaster wall color to [COLOR], keep every shape, outline, detail position, canvas size and facade edge exactly the same.
```

`[COLOR]`: `faded mint green`, `dusty pink`, `pale mustard yellow`, `light sky blue`.

### 1.5 Props jalan

Satu prompt per prop.

- **Tiang listrik:** `ONE concrete electric pole, side elevation, with a transformer box, crossbars and a chaotic tangle of black cables drooping off both sides and cut cleanly at the image edges so they can connect to the next pole.`
- **Angkot:** `ONE small Indonesian angkot minivan, strict side view facing right, teal-green body with a mustard stripe, open side door, roof rack, slightly dented, no driver, no route text.`
- **Gerobak:** `ONE street food cart (gerobak) with glass display box, a small gas burner, hanging plastic bags, wooden wheels, colorful but grimy. Strict side view.`
- **Papan reklame:** `ONE rooftop billboard on a rusty steel frame, the billboard face shows only abstract colorful shapes of a happy family and a product bottle, absolutely no letters.`
- **Pohon:** `ONE roadside tropical tree in a small concrete planter ring, rounded dense canopy in two greens, warm rim light on the top-left of the canopy.`
- **Warung tenda:** `ONE small tent food stall with a striped tarp roof in orange and teal, plastic stools, a hanging lamp, stacked crates. Strict side view.`

### 1.6 Destruksi modul

Pakai modul utuh sebagai **edit source**. Output harus sama ukuran canvas dan sama posisi tepi fasad, supaya koordinat `connection` di manifest tetap berlaku.

```
Edit the attached [MODULE] into a DAMAGED version. Keep the exact same canvas size, exact same position and straight outer edges of the facade, same outline style, palette and lighting. Damage level: [STATE]. Cartoon destruction, chunky and readable, not realistic. Transparent background stays transparent. No smoke covering the facade, no fire outside the facade bounds, no characters, no text.
```

`[MODULE]`: `ruko ground floor` / `ruko upper floor` / `ruko roof`.

`[STATE]`:
- **cracked:** `light damage — zig-zag cracks across the plaster, one or two windows with broken glass, chipped corners, the shutter dented, the AC unit hanging at an angle, laundry blown off.`
- **broken:** `heavy damage — large jagged holes showing dark inner brick and bent rebar, windows smashed, shutter torn half off, cables sparking, small cartoon flames glowing orange inside one opening, outer edges still mostly straight.`
- **rubble:** `fully collapsed — a low pile of chunky plaster slabs, bricks, twisted shutter metal, broken window bars and the toren or AC unit on top, sitting along the same bottom edge, much lower than the intact module.`

---

## 2. Rex

Palet: hijau `#4E8A3E`, bayangan `#2E5A2A`, perut krem `#F4E1B5`, duri punggung mustard `#F2B33D`, dalam mulut `#B5524A`, mata kuning `#FFD45C`. Hijau Rex sengaja jadi warna komplementer dari langit oranye-magenta supaya menonjol.

### 2.1 Rex — master design

```
ONE character: a giant cartoon tyrannosaurus named Rex, full body, strict side view (profile) facing right. Chunky, heroic-but-goofy proportions: big blocky head about one quarter of body height, wide grin with rounded blunt teeth, small yellow eye with a cheeky expression, tiny two-fingered arms, thick powerful legs with three claws, long tapering tail held horizontally. Saturated red skin with deep crimson cel shadows and dark maroon outlines, cream belly plates from jaw to tail underside, a row of chunky mustard-yellow spikes along the back, a few darker crimson scale patches and a small scar on the snout. Neutral standing idle pose, mouth closed. Silhouette must read clearly at small size. Single character only.
```

### 2.2 Rex — parts sheet (cutout rig)

Pakai 2.1 sebagai image reference.

```
Using the attached Rex as the exact character reference (same colors, outline weight, shading, proportions), produce a CUTOUT ANIMATION PARTS SHEET: body parts separated with clear transparent gaps between them, all strict side view facing right, same scale as the reference. Parts: (1) upper head and skull without lower jaw, (2) lower jaw alone, (3) torso with neck and belly, (4) tail split into three segments base / middle / tip, (5) near arm, (6) far arm in a darker shade, (7) near leg thigh-and-shin, (8) near foot, (9) far leg thigh-and-shin in a darker shade, (10) far foot in a darker shade, (11) closed-eye overlay, (12) angry-eye overlay. Every joint end is rounded with extra overlapping material so parts can rotate without gaps. Parts do not touch on the sheet. No labels, no numbers, no text.
```

> Potong tiap part ke PNG sendiri di `web/assets/characters/rex/parts/`, lalu tentukan titik pivot sendi.

---

## 3. Pahlawan

Desain orisinal. Jangan sebut nama superhero yang sudah ada di prompt.

### 3.1 Perisai — master design

Palet: navy `#24365C`, krem `#F4E1B5`, aksen mustard `#F2B33D`.

```
ONE character: an original superhero named Perisai, a stocky muscular tank-type hero, full body, strict side view facing right, cartoon proportions (about 3 heads tall, sturdy and broad). Deep navy armored suit with cream chest plate and mustard trim, short cape, helmet with a visor. Carries a large rounded tower shield with a simple geometric emblem (no letters) on the near arm, the shield has dents and scratches. Confident ready stance, shield raised forward. Single character only.
```

### 3.2 Rajawali — master design

Palet: merah `#C8323C`, putih `#F7F3EA`, aksen charcoal.

```
ONE character: an original superhero named Rajawali, a slim agile flying hero, full body, strict side view facing right, cartoon proportions (about 3 heads tall). Red and white flight suit with charcoal panels, a stylized eagle-feather pattern on the shoulders, aviator goggles, a compact jetpack with two short wing fins, glowing pale cyan thruster nozzles, a wrist-mounted blaster on the near arm. Mid-air hover pose, legs slightly bent, small thruster flames. Single character only.
```

### 3.3 Jaring — master design

Palet: ungu `#5B3A8C`, teal `#1F4E5F`, aksen hijau `#3FA36B`.

```
ONE character: an original superhero named Jaring, a clever engineer-type hero, full body, strict side view facing right, cartoon proportions (about 3 heads tall). Purple work suit with teal utility harness and green gloves, round tinted goggles pushed up on the forehead, a tool belt full of gadgets, and a chunky net-launcher gadget held in both hands. Focused determined pose, slightly crouched. Single character only.
```

### 3.4 Pahlawan — parts sheet (pakai untuk ketiganya)

Ganti `[NAME]` dan pakai master design pahlawan itu sebagai image reference.

```
Using the attached [NAME] as the exact character reference (same colors, outline, shading, proportions), produce a CUTOUT ANIMATION PARTS SHEET in strict side view facing right, same scale as the reference. Parts separated with clear transparent gaps: (1) head, (2) torso with hips, (3) near upper arm, (4) near forearm with hand, (5) far upper arm darker shade, (6) far forearm with hand darker shade, (7) near thigh, (8) near shin with foot, (9) far thigh darker shade, (10) far shin with foot darker shade, (11) signature equipment as its own part (shield / jetpack / net launcher), (12) cape or accessory if any. Rounded overlapping joint ends so parts can rotate without gaps. No labels, no text.
```

### 3.5 Pahlawan — potret UI

```
Using the attached [NAME] as the exact character reference, draw ONE head-and-shoulders portrait in three-quarter view, determined heroic expression, warm sunset rim light, fitting inside a square with safety margin. Transparent background.
```

---

## 4. Tentara

Palet: hijau loreng `#5C6B3A`, khaki `#B9A274`, outline, aksen teal.

### 4.1 Infanteri — master design

```
ONE character: a small cartoon soldier, full body, strict side view facing right, chibi-ish proportions (about 2.5 heads tall) so he reads at small size. Olive green camouflage uniform with simple blotch pattern, khaki vest, rounded helmet with a net cover, simple face with a nervous-but-brave expression, holding a stubby cartoon rifle. Standing ready pose. Single character only. Toy-like and friendly, not realistic military gear.
```

### 4.2 Infanteri — pose sheet

Pakai 4.1 sebagai image reference.

```
Using the attached soldier as the exact character reference, produce a POSE SHEET of FOUR separate poses in a single horizontal row, evenly spaced in equal-width cells, same scale, all strict side view facing right, with transparent gaps: (1) aiming and shooting, rifle forward, (2) running pose A, (3) running pose B with opposite legs, (4) knocked back, falling backwards with helmet flying off, comedic not violent. Feet baseline aligned across all four poses. No text, no muzzle flash.
```

### 4.3 Bazooka — master + pose sheet

```
ONE character: same cartoon soldier design family as the attached reference, but carrying an oversized chunky bazooka on his shoulder, slightly bigger build, goggles on the helmet. Strict side view facing right.
```

Lalu pose sheet dengan prompt 4.2, ganti pose (1) jadi `kneeling and firing the bazooka`.

### 4.4 Jeep

```
ONE vehicle: a small cartoon military jeep, strict side view facing right, chunky rounded toy-like proportions, olive camouflage body, khaki canvas roof frame, big rounded wheels, a mounted mini gun on the back. No driver visible. Wheels drawn as clean separate circles so they could be rotated.
```

### 4.5 Helikopter

```
ONE vehicle: a small cartoon military helicopter, strict side view facing right, rounded bubble cockpit reflecting orange sunset light, olive body with a teal stripe, short tail boom, side-mounted rocket pods. Main rotor drawn as a thin flat horizontal blur bar on top. No pilot face detail, no text.
```

---

## 5. Warga sipil

Semua warga **hanya lari panik**. Satu master + satu pose sheet per variasi.

### 5.1 Warga — master design (template)

```
ONE character: a small cartoon Indonesian civilian, [DESCRIPTION], full body, strict side view facing right, chibi-ish proportions (about 2.5 heads tall) to match the soldier scale. Bright saturated clothing that pops against an orange sunset city. Panicked comedic expression, mouth open, eyes wide. Standing pose. Single character only.
```

### 5.2 Warga — pose sheet (template)

```
Using the attached civilian as the exact character reference, produce a POSE SHEET of FOUR separate poses in a single horizontal row, equal-width cells, same scale, strict side view facing right, transparent gaps between them: (1) panicked run pose A with both hands raised above the head, (2) panicked run pose B with opposite legs, (3) run pose C looking back over the shoulder in fear, (4) stumbling forward, almost tripping. Feet baseline aligned across all poses. Comedic, not distressing. No text.
```

### 5.3 Variasi `[DESCRIPTION]`

1. `an office worker man in a colorful batik shirt and glasses, clutching a briefcase`
2. `a woman in a bright hijab and long tunic carrying a plastic shopping bag with vegetables poking out`
3. `a schoolkid in a red-and-white elementary school uniform with a big backpack`
4. `an elderly man in a sarong, peci cap and sandals, holding a walking cane`
5. `a meatball soup vendor in an apron carrying a bamboo shoulder pole with two small baskets`

---

## 6. Efek (FX)

Canvas persegi, objek di tengah.

### 6.1 Debu runtuh

```
ONE effect sprite sheet: a cartoon dust cloud puff in FOUR growth stages in a single horizontal row, equal cells, from small tight puff to large dissipating cloud. Warm cream dust with orange sunset light on the top-left and cool teal shadow underneath, outline getting thinner in later stages. Transparent background.
```

### 6.2 Puing

```
A set of EIGHT small separate debris pieces arranged in a grid with transparent gaps: cream plaster chunks, red bricks, a twisted piece of teal shutter metal, broken window bars, a roof tile, glass shards. Same outline and lighting style. For use as particles.
```

### 6.3 Ledakan

```
ONE effect sprite sheet: cartoon explosion in FOUR stages in a horizontal row, equal cells: small white-yellow flash, big round burst with a hot yellow core and orange-magenta outer flames, dark smoky cloud with glowing embers, last small smoke wisps. Bold flat shapes with outline, comic-book style.
```

### 6.4 Api

```
ONE effect sprite sheet: a small cartoon flame in FOUR flicker frames in a horizontal row, equal cells, yellow core, orange and magenta outer tongues, outlined, same base width in every frame for looping.
```

### 6.5 Proyektil

```
A set of separate small projectile sprites arranged in a row with transparent gaps, all pointing right: (1) small rifle bullet streak, (2) chunky cartoon rocket with flame tail, (3) pale cyan laser bolt with soft glow, (4) a folded steel net capsule. Same outline style.
```

### 6.6 Jaring baja

```
ONE effect: a wide stretched steel cable net, slightly sagging, gunmetal cables catching orange sunset highlights, rounded weights at the corners, see-through gaps between the cables genuinely transparent. Strict side view. Sized to drape over a giant dinosaur.
```

---

## 7. UI

```
A small set of game HUD icons arranged in a row with transparent gaps, same outline style: (1) a heart-shaped health icon with a tiny dinosaur claw mark, (2) a rage icon shaped like a roaring dinosaur head silhouette in orange-magenta, (3) a cracked ruko building icon for destruction percentage. Bold, simple, readable at 48px. No text.
```

---

## 8. Background (parallax)

Background boleh berwarna penuh kecuali disebut lain. Buat **horizontally seamless** supaya bisa diulang.

### 8.1 Langit senja

```
A wide horizontally seamless sunset sky background, 16:9 or wider. Vertical gradient from deep magenta-purple at the top, through hot pink, to glowing orange near the horizon. A large low sun disc partly behind the horizon, a few long flat stylized clouds lit orange from below with magenta tops, a few tiny distant birds. Flat stylized illustration, no city, no text.
```

### 8.2 Siluet kota jauh

```
A wide horizontally seamless distant Indonesian city skyline strip on transparent background: flat single dusky purple-magenta silhouette, mix of tall office towers, a mosque dome with a minaret, construction cranes, water towers and antennas, a few tiny warm window lights. No outline. For far parallax layer.
```

### 8.3 Kota lapis tengah

```
A wide horizontally seamless mid-distance city layer on transparent background: simplified rows of ruko and low apartment blocks in desaturated teal and mauve, small warm-lit windows, billboards with only abstract shapes, sagging power cables between poles, thin soft outlines, lower contrast than the foreground. For middle parallax layer.
```

### 8.4 Jalan

```
A wide horizontally seamless street ground strip on transparent background above: a cracked cream concrete sidewalk with a small gutter on top, dark asphalt road below with warm orange sunset reflections, patched potholes and faded dashed lane markings, a painted curb in alternating black and white. Front orthographic elevation, same outline style.
```

---

## 9. Ulti Rex — Amukan Rex

Ulti sudah berjalan di game dengan pose pinjaman (raung + injak) dan banner cut-in yang memakai pose Rex yang diperbesar. Dua gambar di bawah menggantikan keduanya. Kilatan layar, gelombang kejut, dan garis kecepatan digambar lewat kode, jadi **jangan** dimasukkan ke gambar.

Referensi identitas untuk kedua prompt: `web/assets/characters/rex/master.png` dan `web/assets/characters/rex/animations/walk.png`. Ikuti cara kerja di `REX-ANIMATIONS.md` (simpan PNG asli, catat prompt akhirnya di sana).

### 9.1 Atlas animasi ulti (8 pose)

Simpan sebagai `web/assets/characters/rex/animations/ulti.png`.

```
Production transparent PNG sprite animation atlas for this exact Rex dinosaur. Match the red chunky Rex's identity and polished cartoon rendering in both references precisely: cream segmented belly, orange dorsal plates, dark maroon outlines and dark crimson spots, yellow eye, three red cheek scars, small clawed arms, long tapering tail, warm top rim lighting. Output one square transparent RGBA image, largest available resolution, with EXACTLY TWO equal columns and FOUR equal rows: EIGHT full-body sprites, read left to right then top to bottom. No grid, borders, text, ground, shadows or checkerboard. Every cell has the same fixed camera and the same body scale, hips at 58 percent of the cell width, planted feet on a ground line at 90 percent of the cell height, and at least 32 pixels of fully transparent margin on all sides. Rex faces RIGHT in every frame.

This is his ULTIMATE attack, a furious rearing ground slam:
(1) deep anticipatory crouch, body low and coiled, head tucked down, tail curled, eyes narrowed;
(2) starting to rear up, chest swelling, head pulling back, small arms flexing, dorsal plates beginning to glow hot orange;
(3) reared up tall on straightened legs, chest fully inflated, head thrown back with jaws wide open roaring at the sky, dorsal plates glowing bright orange-yellow, tail whipping upward;
(4) peak of the rear: both small arms spread wide, jaws at their widest, whole body stretched to its tallest, plates at their brightest glow;
(5) the drop: body plunging forward and down, head driving toward the ground, both feet about to hit, tail high behind him;
(6) IMPACT: both feet and the underside of the tail slammed flat on the ground line, body squashed low and wide, head lunged forward with jaws open in a roar, plates still glowing;
(7) rebound: body springing back up to mid height, mouth closing, plate glow fading to a dull ember;
(8) settling into his neutral standing pose, jaw closed, plates back to their normal orange.

Eight clearly different, individually clean poses with big readable silhouette changes. The glow belongs to the dorsal plates themselves: no aura, no flames, no smoke, no shockwave, no dust, no speed lines, no motion blur. No extra limbs. Smooth confident antialiased linework, consistent proportions, genuine alpha transparency. The whole character, including the raised head in frames 3 and 4 and the full tail, stays inside its own cell.
```

### 9.2 Ilustrasi cut-in (hiasan banner kiri)

Simpan sebagai `web/assets/fx/ulti-cutin.png`. Banner tampil miring di sisi kiri layar selama ancang-ancang; judul "AMUKAN REX!" ditulis kode di pojok kiri bawah.

```
Dramatic close-up key art of this exact Rex dinosaur for a fighting-game style super move cut-in banner. Same character identity and polished cartoon cel shading as the references: red skin with dark crimson spots and dark maroon outlines, cream segmented belly and jaw, orange dorsal plates, yellow eye, three red cheek scars. Wide horizontal composition, 16:9, high resolution, genuine transparent RGBA background.

Framing: head, neck and upper chest only, seen in a dynamic three-quarter view facing RIGHT and slightly toward the viewer, shot from a low angle so he looms. Jaws thrown wide open in a furious roar, teeth and pink tongue clearly visible, brow furrowed, the yellow eye blazing with a small bright highlight, saliva strands kept minimal. The dorsal plates along the back of the neck glow hot orange-yellow as if lit from within, casting a warm rim light across the top of the head and snout; deep teal shadows under the jaw and on the neck for strong contrast.

Place the head in the upper-right two thirds of the frame. The lower-left third shows only the darker neck and chest, calm and low in detail, because a title will be overlaid there. The neck and back run off the left and bottom edges of the canvas; the snout and upper jaw keep a small transparent margin from the right and top edges.

Thick confident antialiased outlines, clean silhouette, rich saturated colour. No background, no scenery, no speed lines, no energy aura, no flames, no smoke, no text, no letters, no logo, no frame, no border, no watermark, no checkerboard.
```

### 9.3 Yang perlu dihubungkan setelah gambar jadi

1. Jalankan `python tools/to-webp.py` untuk membuat salinan WebP.
2. Tambahkan ke `web/assets/manifest.json`:
   - di `assets`: `"characters/rex/animations/ulti.png"` dan `"fx/ulti-cutin.png"`, masing-masing dengan `width`, `height`, `"pivot": [0, 0]`, `"alpha": true` (tanpa `bounds`, supaya gambar tidak dipangkas);
   - di `rexAnimations.atlases`: `"ulti": {"path": "characters/rex/animations/ulti", "frames": [...]}` dengan delapan baris `[x, y, lebar, tinggi, pivotX, pivotY]` seperti atlas lain (pivot = titik tanah di bawah pinggul), ditambah `"scale"` bila ukuran badan perlu disamakan dengan atlas jalan;
   - di `rexAnimations.clips`: `"ulti": {"atlas": "ulti", "frames": [0, 1, 2, 3, 4, 5, 6, 7], "contact": 5}`. `contact` adalah indeks pose hantaman (pose ke-6), yang tampil tepat saat damage.
3. Tidak perlu mengubah kode: `web/src/rex-animation.js` otomatis memakai klip `ulti` bila ada, dan `web/src/art.js` otomatis memakai `fx/ulti-cutin` di banner.
4. Jalankan `npm run check`, lalu coba Ulti (tombol R) di browser pada layar desktop dan portrait.

---

## 10. Latar menu — Rex mengejar warga

Gambar utama halaman sebelum main. Menggantikan susunan sekarang (langit, siluet kota, dan ilustrasi Rex tampak samping). Ini gambar penuh **tanpa** latar transparan, dan **tanpa teks apa pun**: judul, tombol, dan label digambar oleh halaman di atasnya.

Referensi identitas: `web/assets/characters/rex/master.webp`, `web/assets/fx/ulti-cutin.webp` (wajah Rex tampak tiga perempat), lima `master.png` warga di `web/assets/characters/civilians/`, serta `web/assets/buildings/ruko-01/colors/` untuk gaya ruko.

Dibuat dua versi karena tata letak menu berbeda: di layar lebar teks ada di kiri, di layar tegak teks ada di bawah.

### 10.1 Versi lebar (desktop dan ponsel mendatar)

Simpan sebagai `web/assets/backgrounds/menu-wide.png`.

```
Full-bleed key art illustration for a video game title screen, wide 16:9 landscape, high resolution, opaque (no transparency). Same polished 2D cartoon style as the references: thick confident dark teal outlines, rich cel shading, saturated colour, warm orange rim light from a low sunset, deep teal shadows.

Scene: a narrow Indonesian shophouse street (ruko) at sunset, seen from street level looking straight down the road. Rex, the exact red dinosaur from the references (dark crimson spots, dark maroon outlines, cream segmented belly and jaw, orange dorsal plates, yellow eyes, three red scars on his cheek, small clawed arms, long tail), is charging directly TOWARD the camera, front-facing with a slight three-quarter turn, mid-stride with one huge foot lifted and the other cracking the asphalt. Low camera angle with strong foreshortening so his head and open roaring jaws loom large, teeth and pink tongue visible, eyes locked on the people below. His tail whips behind him, clipping a shop sign.

In the foreground, five terrified civilians from the references run toward the viewer, away from Rex, small in the frame so his scale reads as enormous: a schoolchild with a backpack, an office worker clutching a bag, a woman in a hijab with shopping bags, an elderly man with a cane, and a bakso vendor carrying his shoulder pole. Arms up, mouths open, clearly cartoon panic, no injuries and no gore. A green angkot minivan is swerving at the side of the road and a food cart is tipping over.

Both sides of the street are lined with two-storey ruko in mustard, mint, pink and blue with roll-up shutters, laundry on balconies, water tanks, satellite dishes and tangled power lines on leaning poles. Dust and small chunks of rubble fly up around Rex's feet. Behind him, a magenta-to-orange sunset sky with a large low sun and the purple silhouette of a city skyline, a mosque dome and a crane.

Composition for interface overlay: place Rex in the RIGHT half of the frame, his head in the upper right. Keep the LEFT 45 percent of the image calmer and darker (shadowed shopfronts in deep teal, fewer details, no faces and no bright highlights) because the game title and buttons sit there. Keep the bottom 12 percent as plain dark road for a footer line. The civilians run in the lower centre and lower right, not in the left 40 percent.

No text, no letters, no numbers, no logos, no signage lettering (shop signs and billboards show only abstract shapes), no watermark, no frame, no border, no interface elements.
```

### 10.2 Versi tegak (ponsel berdiri)

Simpan sebagai `web/assets/backgrounds/menu-tall.png`.

```
Full-bleed key art illustration for a video game title screen, tall 9:16 portrait, high resolution, opaque (no transparency). The same scene, characters, palette and polished cartoon style as the wide version in reference 1; match it precisely so the two read as one artwork.

Rex, the exact red dinosaur from the references, charges directly TOWARD the camera down a narrow Indonesian shophouse street at sunset, front-facing with a slight three-quarter turn, low camera angle with strong foreshortening, jaws open in a roar, one foot lifted mid-stride, the other cracking the asphalt, dust and rubble flying. Ruko in mustard, mint, pink and blue rise on both sides with shutters, laundry, water tanks and tangled power lines; a magenta-to-orange sunset sky with a large low sun and a purple skyline sits behind him.

The five civilians from the references (schoolchild with backpack, office worker, woman in a hijab with shopping bags, elderly man with a cane, bakso vendor with shoulder pole) run toward the viewer in clear cartoon panic, small in the frame, no injuries and no gore.

Composition for interface overlay: Rex's head and body fill the UPPER 55 percent of the frame, centred. The civilians run across the middle band, between 50 and 65 percent of the height. The LOWER 38 percent is calm dark asphalt in deep teal shadow with only faint road markings and no characters, because the game title and buttons sit there. Leave a little sky above Rex's head for a small button in the top right corner.

No text, no letters, no numbers, no logos, no signage lettering (signs show only abstract shapes), no watermark, no frame, no border, no interface elements.
```

### 10.3 Setelah gambar jadi

1. Simpan salinan WebP di sebelahnya (`menu-wide.webp`, `menu-tall.webp`), kualitas 90. Kedua gambar ini tidak perlu masuk manifest karena tidak digambar di canvas.
2. Periksa di tiga ukuran layar: 1440×900, 390×844, dan 844×390. Judul "Rampage Rex", dua tombol, dan baris bawah harus tetap terbaca di atas gambar tanpa menutupi wajah Rex atau para warga.
3. Kedua gambar sudah terpasang: `web/index.html` memilihnya lewat `<picture>` menurut orientasi layar, dan posisinya diatur `.cover` di `web/style.css`. Gambar pengganti cukup ditaruh dengan nama file yang sama.

---

## 11. Latar per distrik

Saat ini keempat distrik memakai latar yang sama (bagian 8). Tiga set di bawah membuat Pusat Kota, Pelabuhan, dan Alun-Alun terlihat sebagai tempat yang berbeda. Distrik 1 (Jalan Ruko) tetap memakai latar yang ada.

Tiap set terdiri dari empat lapis dengan **ukuran kanvas persis sama** dengan latar sekarang, supaya posisi cakrawala dan trotoar tidak bergeser:

| Lapis | File | Ukuran | Latar belakang gambar |
| --- | --- | --- | --- |
| Langit | `sky.png` | 1600 × 900 | penuh, tidak transparan |
| Kota jauh | `far-city.png` | 1600 × 295 | transparan, isi menempel ke tepi bawah |
| Kota tengah | `mid-city.png` | 1600 × 239 | transparan, isi menempel ke tepi bawah |
| Jalan | `street.png` | 1600 × 214 | transparan hanya di 13 px teratas |

Aturan untuk semua lapis:

- **Menyambung mulus ke kiri dan kanan** (seamless horizontal). Tepi kiri dan kanan harus cocok saat gambar diulang.
- Gaya sama dengan latar sekarang: pakai `web/assets/backgrounds/sky.webp`, `far-city.webp`, `mid-city.webp`, dan `street.webp` sebagai referensi gaya dan komposisi.
- Tanpa teks, huruf, angka, logo, atau watermark. Papan dan rambu hanya bentuk abstrak.
- Tanpa karakter, kendaraan, atau benda yang bisa dihancurkan: itu digambar game di atasnya.
- Di `street.png`, trotoar ada di bagian atas dan permukaan jalan di bawahnya, dengan tinggi trotoar sama seperti jalan sekarang. Kaki karakter berpijak sekitar 66 px dari tepi atas gambar.

Simpan di `web/assets/backgrounds/<nama-set>/`, dengan nama set `office`, `port`, dan `square` (sama dengan `setting` di `web/data/levels/`).

### 11.1 Pusat Kota (`office`)

Suasana: senja yang lebih larut, lampu kantor mulai menyala, kaca gedung memantulkan langit.

```
SKY, 1600x900, opaque, horizontally seamless: a late sunset sky over a business district. Deep violet at the top fading through magenta to a narrow band of orange at the horizon, the sun already below the skyline. Long flat stratus clouds lit orange from underneath, a few early stars near the top. Same painterly cartoon cloud shapes as the reference sky. No buildings, no sun disc, no text.
```

```
FAR CITY, 1600x295, transparent background, horizontally seamless: a distant skyline of tall modern office towers as flat dusky purple silhouettes with no outline, taller and denser than the reference skyline. Mix of slim glass towers, a stepped high-rise, a tower with a helipad, a telecom mast and two construction cranes. A scattering of tiny warm lit windows. Tops reach close to the upper edge, bases sit flush on the bottom edge. No text.
```

```
MID CITY, 1600x239, transparent background, horizontally seamless: a mid-distance row of four to eight storey office and bank buildings in desaturated teal, slate blue and mauve, with thin soft outlines and lower contrast than the foreground. Glass curtain walls reflecting orange sky, rooftop air-conditioning units, blank billboards with abstract shapes only, a pedestrian bridge linking two buildings. Many small warm lit windows. Bases sit flush on the bottom edge. No text.
```

```
STREET, 1600x214, transparent only above the kerb line, horizontally seamless, front orthographic elevation: a wide city-centre pavement of clean square grey paving slabs with a tactile yellow guide strip, a low planter edge and a stainless bollard rhythm, then a painted black-and-white kerb. Below it, smooth dark asphalt with crisp white lane dashes, a section of zebra crossing, a drain cover, and warm orange reflections of the sunset. Same outline weight and kerb height as the reference street. No text.
```

Warna dasar jalan untuk kode (`ground`): ambil warna aspal paling bawah gambar.

### 11.2 Pelabuhan (`port`)

Suasana: senja di tepi laut, udara berkabut asin, lampu sorot derek menyala.

```
SKY, 1600x900, opaque, horizontally seamless: a hazy harbour sunset. Teal-grey upper sky fading to peach and a strong orange glow low on the horizon, with a soft sea haze band just above the horizon line. Thin ragged clouds, a few distant seabirds as tiny dark ticks. Same painterly cartoon cloud shapes as the reference sky. No ships, no sun disc, no text.
```

```
FAR CITY, 1600x295, transparent background, horizontally seamless: a distant port horizon as flat dusky blue-purple silhouettes with no outline. A flat sea line across the lower third with two cargo ships and a tanker on it, a row of giant ship-to-shore gantry cranes with their booms raised, a lighthouse, storage tank domes and a refinery chimney with a small flare. A few tiny warm lights. Bases sit flush on the bottom edge. No text.
```

```
MID CITY, 1600x239, transparent background, horizontally seamless: a mid-distance dockside in desaturated teal, rust and mauve with thin soft outlines and lower contrast than the foreground. Stacks of shipping containers three and four high in muted red, blue and green with no markings, corrugated warehouse sheds with sawtooth roofs, floodlight masts with warm lamps, a straddle carrier, chain-link fencing. Bases sit flush on the bottom edge. No text.
```

```
STREET, 1600x214, transparent only above the kerb line, horizontally seamless, front orthographic elevation: a worn concrete quay apron with expansion joints, oil stains and embedded steel crane rails, edged with a chunky yellow-and-black hazard-striped kerb and iron mooring bollards. Below it, rough dark concrete road with faded yellow lane lines, puddles reflecting orange sky and scattered gravel. Same outline weight and kerb height as the reference street. No text.
```

Warna dasar jalan untuk kode (`ground`): ambil warna beton paling bawah gambar.

### 11.3 Alun-Alun (`square`)

Suasana: malam, kota sudah berasap setelah amukan di tiga distrik sebelumnya. Ini distrik terakhir.

```
SKY, 1600x900, opaque, horizontally seamless: a smoky night sky over a burning city. Near-black indigo at the top, turning to deep crimson and a dirty orange glow at the horizon as if lit by distant fires. Heavy columns and drifting banks of dark smoke with ember-orange undersides, a pale full moon half hidden by smoke in the upper left, scattered floating embers. Same painterly cartoon cloud shapes as the reference sky. No buildings, no text.
```

```
FAR CITY, 1600x295, transparent background, horizontally seamless: a distant city skyline at night as flat near-black purple silhouettes with no outline, back-lit by fire glow. A large mosque dome with two minarets, a clock tower, a radio mast, and broken tower outlines with missing upper floors. Several thin smoke plumes rising. Sparse tiny orange lights. Bases sit flush on the bottom edge. No text.
```

```
MID CITY, 1600x239, transparent background, horizontally seamless: a mid-distance view across a town square at night in dark teal, plum and ember orange, with thin soft outlines and lower contrast than the foreground. A colonial-style white town hall with columns and a pediment, a tall stone monument on a stepped base, a huge old banyan tree with hanging roots, rows of unlit flagpoles, ornate street lamps casting warm pools of light, strings of festival bulbs. Bases sit flush on the bottom edge. No text.
```

```
STREET, 1600x214, transparent only above the kerb line, horizontally seamless, front orthographic elevation: a ceremonial plaza edge paved in large terracotta and cream tiles laid in a diamond pattern, with a low carved stone border and a painted black-and-white kerb. Below it, dark cobblestone road lit by warm lamp pools and red fire glow, with scattered ash and a few glowing embers. Same outline weight and kerb height as the reference street. No text.
```

Warna dasar jalan untuk kode (`ground`): ambil warna batu paling bawah gambar.

### 11.4 Yang perlu dihubungkan setelah gambar jadi

1. Taruh PNG di `web/assets/backgrounds/office/`, `web/assets/backgrounds/port/`, dan `web/assets/backgrounds/square/`.
2. Tambahkan 12 entri ke `assets` di `web/assets/manifest.json`, misalnya `"backgrounds/office/sky.png"`, dengan nilai yang sama seperti entri `backgrounds/sky.png`, `far-city.png`, `mid-city.png`, dan `street.png` yang sudah ada (ukuran, `bounds`, `pivot`, `alpha`, `repeatX`). Pada tiap entri `street.png`, tambahkan `"ground": "#rrggbb"` berisi warna jalan paling bawah.
3. Jalankan `python tools/to-webp.py`, periksa hasilnya, lalu hapus PNG-nya.
4. Tidak perlu mengubah kode. Distrik yang punya `sky.png` sendiri di manifest otomatis memakai setnya; siluet dan rona ungu buatan kode untuk distrik itu otomatis mati. Set yang belum lengkap jangan didaftarkan dulu.
5. Jalankan `npm run check`, lalu lihat tiap distrik di layar 1440×900 dan 390×844. Sambungan antar-ulangan gambar tidak boleh terlihat saat Rex berjalan.

---

## 12. Rex — lompat gertakan dan tumbang

Kedua gerakan ini sudah jalan di game dengan pose pinjaman dan gerakan dari kode:
- **Lompat:** jongkok, lalu melayang dengan pose raung, lalu mendarat dengan pose injak. Tinggi lompatan, gepeng/melar, gelombang kejut, dan debu digambar kode.
- **Tumbang:** pose injak dimiringkan ke depan, lalu muncul bintang pusing dan judul "REX TUMBANG".

Dua atlas di bawah menggantikan pose pinjaman itu. **Jangan** gambar efek (debu, gelombang, bintang, garis kecepatan, bayangan): semuanya sudah dibuat kode, dan tinggi lompatan juga diatur kode, jadi Rex tetap digambar dengan kaki di garis tanah sel.

Referensi identitas untuk kedua prompt: `web/assets/characters/rex/master.png` dan atlas `web/assets/characters/rex/animations/walk.png`. Ikuti cara kerja di `REX-ANIMATIONS.md` (simpan PNG asli, catat prompt akhirnya di sana).

### 12.1 Atlas lompat gertakan (8 pose)

Simpan sebagai `web/assets/characters/rex/animations/jump.png`.

```
Production transparent PNG sprite animation atlas for this exact Rex dinosaur. Match the red chunky Rex's identity and polished cartoon rendering in both references precisely: red skin with dark crimson spots and dark maroon outlines, cream segmented belly, orange dorsal plates, yellow eye, three red cheek scars, small clawed arms, long tapering tail, warm top rim lighting. Output one square transparent RGBA image, largest available resolution, with EXACTLY TWO equal columns and FOUR equal rows: EIGHT full-body sprites, read left to right then top to bottom. No grid, borders, text, ground, shadows or checkerboard. Every cell has the same fixed camera and the same body scale, hips at 58 percent of the cell width, and at least 32 pixels of fully transparent margin on all sides. Rex faces RIGHT in every frame. Draw every pose with the lowest point of the body near a baseline at 90 percent of the cell height: the jump height is added later by the game, so do not move him up inside the cell.

This is an INTIMIDATION JUMP, a showy hop meant to scare soldiers, ending in a heavy ground-shaking landing:
(1) anticipation: deep crouch, knees bent hard, body low, tail curled down, head lowered with a smug menacing grin;
(2) launch: legs extending explosively, toes just leaving the ground, body angled up and forward, tail swinging down for balance;
(3) rising: legs tucked up under the belly, small arms raised, jaws opening, tail streaming behind;
(4) peak: body stretched and floating, chest out, jaws wide open in a mocking roar, arms flung out, tail high and curled up;
(5) falling: legs reaching down ready to land, knees bent, head tilted down looking at the ground, jaws half closed, tail raised high behind;
(6) LANDING IMPACT: both feet slammed flat on the baseline, knees deeply bent, body squashed low and wide, tail pressed down, head thrust forward with a loud roar;
(7) rebound: body pushing back up to mid height, mouth closing into a cocky grin;
(8) settling back into his neutral standing pose, jaw closed.

Eight clearly different, individually clean poses with big readable silhouette changes. No dust, no shockwave, no cracks, no speed lines, no motion blur, no aura. No extra limbs. Smooth confident antialiased linework, consistent proportions, genuine alpha transparency. The whole character, including the full tail and open jaws, stays inside its own cell.
```

### 12.2 Atlas tumbang (6 pose)

Simpan sebagai `web/assets/characters/rex/animations/defeat.png`.

```
Production transparent PNG sprite animation atlas for this exact Rex dinosaur. Match the red chunky Rex's identity and polished cartoon rendering in both references precisely: red skin with dark crimson spots and dark maroon outlines, cream segmented belly, orange dorsal plates, yellow eye, three red cheek scars, small clawed arms, long tapering tail, warm top rim lighting. Output one wide transparent RGBA image, largest available resolution, with EXACTLY THREE equal columns and TWO equal rows: SIX full-body sprites, read left to right then top to bottom. No grid, borders, text, ground, shadows or checkerboard. Every cell has the same fixed camera and the same body scale, and at least 32 pixels of fully transparent margin on all sides. The lowest point of the body always touches a ground line at 90 percent of the cell height, and the point under his hips stays at 58 percent of the cell width. Rex faces RIGHT in every frame.

This is his DEFEAT, a comedic cartoon knockout, not gory and not sad:
(1) hit reaction: body jerked backward, head snapped up, eyes squeezed shut, mouth open in an "oof", arms flailing;
(2) staggering: wobbling on one leg, body leaning back, tail swinging for balance, dazed half-closed eyes;
(3) losing balance forward: knees buckling, body tipping forward, head drooping toward the ground, eyes turning into dizzy spirals;
(4) collapse: belly and chin hitting the ground, legs folding under him, tail lifting up from the momentum, arms splayed;
(5) small bounce: body slightly lifted off the ground from the impact, tail tip flopping, tongue lolling out of the side of the mouth;
(6) knocked out: lying flat on his belly along the ground line, chin resting on the ground, tail limp and stretched out behind, dizzy spiral eyes, tongue out, small arms limp. This last pose is held on screen.

Six clearly different, individually clean poses with big readable silhouette changes. No dizzy stars, no birds, no sweat drops, no dust, no blood, no tears, no motion blur: those are added by the game. No extra limbs. Smooth confident antialiased linework, consistent proportions, genuine alpha transparency. The whole character, including the full tail, stays inside its own cell.
```

### 12.3 Yang perlu dihubungkan setelah gambar jadi

1. Jalankan `python tools/to-webp.py` untuk membuat salinan WebP.
2. Tambahkan ke `web/assets/manifest.json`:
   - di `assets`: `"characters/rex/animations/jump.png"` dan `"characters/rex/animations/defeat.png"`, masing-masing dengan `width`, `height`, `"pivot": [0, 0]`, `"alpha": true` (tanpa `bounds`);
   - di `rexAnimations.atlases`: `"jump"` dan `"defeat"` dengan `path` dan baris `frames` `[x, y, lebar, tinggi, pivotX, pivotY]` seperti atlas lain (pivot = titik tanah di bawah pinggul), ditambah `"scale"` bila ukuran badan perlu disamakan dengan atlas jalan;
   - di `rexAnimations.clips`:
     - `"jump": {"atlas": "jump", "frames": [0, 1, 2, 3, 4, 5, 6, 7], "contact": 5}`. `contact` adalah pose mendarat (pose ke-6), yang tampil tepat saat gelombang kejut muncul.
     - `"defeat": {"atlas": "defeat", "frames": [0, 1, 2, 3, 4, 5], "fall": 1.1}`. `fall` adalah detik sampai pose terakhir tercapai; pose terakhir ditahan sampai layar hasil.
3. Tidak perlu mengubah kode: `web/src/rex-animation.js` otomatis memakai klip `jump` dan `defeat` bila ada. Begitu klip `defeat` terdaftar, kemiringan buatan kode otomatis mati dan bintang pusing pindah ke posisi kepala yang rebah.
4. Jalankan `npm run check`, lalu coba lompat (Spasi) dan biarkan Rex kalah di browser pada layar desktop dan portrait. Bila bintang pusing tidak pas di atas kepala, sesuaikan angka `-200` di fungsi `rexRig` pada `web/src/art.js`.

---

## Checklist kualitas setiap aset

- [ ] Background benar-benar transparan (cek alpha, bukan latar putih atau kotak-kotak palsu).
- [ ] Bayangan jelas gelap (teal tua), bukan cuma sedikit lebih gelap dari warna dasar.
- [ ] Rim light hangat ada di tepi atas.
- [ ] Bangunan dan props: cahaya dari kiri atas. Karakter: cahaya netral (aman di-flip).
- [ ] Tidak ada teks, huruf, logo, atau watermark. Papan reklame dan papan toko hanya bentuk abstrak.
- [ ] Karakter menghadap kanan, side view murni.
- [ ] Pose sheet: semua pose sama skala, kaki di baseline yang sama.
- [ ] Modul ruko: lebar fasad sama, bisa ditumpuk tanpa celah.
- [ ] Aset destruksi: canvas dan tepi fasad sama persis dengan versi utuh.
- [ ] Skala relatif: manusia ≈ 2/3 tinggi pintu ruko; Rex ≈ lantai dasar + 1,5 lantai atas.
