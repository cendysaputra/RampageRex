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
ONE character: a giant cartoon tyrannosaurus named Rex, full body, strict side view (profile) facing right. Chunky, heroic-but-goofy proportions: big blocky head about one quarter of body height, wide grin with rounded blunt teeth, small yellow eye with a cheeky expression, tiny two-fingered arms, thick powerful legs with three claws, long tapering tail held horizontally. Saturated green skin (#4E8A3E) with deep green-teal cel shadows, cream belly plates from jaw to tail underside, a row of chunky mustard-yellow spikes along the back, a few darker green scale patches and a small scar on the snout. Neutral standing idle pose, mouth closed. Silhouette must read clearly at small size. Single character only.
```

### 2.2 Rex — parts sheet (cutout rig)

Pakai 2.1 sebagai image reference.

```
Using the attached Rex as the exact character reference (same colors, outline weight, shading, proportions), produce a CUTOUT ANIMATION PARTS SHEET: body parts separated with clear transparent gaps between them, all strict side view facing right, same scale as the reference. Parts: (1) upper head and skull without lower jaw, (2) lower jaw alone, (3) torso with neck and belly, (4) tail split into three segments base / middle / tip, (5) near arm, (6) far arm in a darker shade, (7) near leg thigh-and-shin, (8) near foot, (9) far leg thigh-and-shin in a darker shade, (10) far foot in a darker shade, (11) closed-eye overlay, (12) angry-eye overlay. Every joint end is rounded with extra overlapping material so parts can rotate without gaps. Parts do not touch on the sheet. No labels, no numbers, no text.
```

> Potong tiap part ke PNG sendiri di `assets/characters/rex/parts/`, lalu tentukan titik pivot sendi.

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
