# Rampage Rex — Game Plan

Game 2D side-scroller di browser. Pemain mengendalikan **Rex**, dinosaurus raksasa yang mengamuk dan menghancurkan kota. Kota melawan balik dengan **tentara** dan **3 pahlawan**, sementara **warga sipil** hanya berlarian panik.

> Asumsi: pemain = Rex. Kalau maksudnya pemain = pahlawan yang melawan Rex, bagian 2–5 perlu dibalik, tapi daftar aset dan prompt tetap terpakai.

---

## 1. Pilar desain

1. **Destruksi terasa memuaskan.** Bangunan retak bertahap, runtuh per lantai, debu dan puing beterbangan, layar bergetar.
2. **Kota terasa hidup.** Warga berlarian, tentara berdatangan, pahlawan muncul dengan dramatis.
3. **Eskalasi jelas.** Makin hancur kotanya, makin kuat perlawanannya.
4. **Arah visual Ruko Senja.** Kota Indonesia (ruko, warung, angkot, kabel semrawut) saat matahari terbenam. Ilustrasi 2D non-pixel, kontras gelap-terang kuat, bayangan teal tua, rim light oranye, detail padat. Menggantikan City Kit 01 yang terlalu pastel dan polos.

---

## 2. Core loop

```
Jalan menyusuri jalan kota
  → hancurkan bangunan (skor + isi Rage Meter)
  → tentara datang menembak (HP Rex turun)
  → hancurkan tentara / bertahan
  → ambang destruksi tercapai → pahlawan muncul (mini-boss)
  → kalahkan pahlawan → lanjut / level selesai
```

**Menang level:** destruksi kota mencapai target (mis. 80%) **dan** pahlawan level itu kalah.
**Kalah:** HP Rex habis.

---

## 3. Karakter & perilaku

### Rex (pemain)

| Aksi | Input (keyboard) | Efek |
| --- | --- | --- |
| Jalan kiri/kanan | `A` / `D` atau panah | Kamera mengikuti, langkah memicu screen shake kecil |
| Gigit | `J` | Damage tinggi, jangkauan pendek, bisa ke lantai atas bangunan |
| Sabetan ekor | `K` | Area belakang, mendorong tentara, merusak lantai dasar |
| Injak | `S` | Damage area di kaki, efektif lawan infanteri |
| Raungan | `L` (pakai Rage) | Stun tentara di layar, warga makin panik |
| Rage Mode | otomatis saat Rage penuh | 8 detik: damage ×2, kebal stun |

Stat awal: HP 1000, kecepatan pelan dan berat. Rex **tidak bisa melompat**, ia raksasa.

### Warga sipil

- **Hanya berlari.** Tidak menyerang, tidak bisa diserang.
- Spawn dari pintu bangunan saat bangunan mulai rusak, lalu kabur menjauhi Rex sampai keluar layar.
- Variasi: pria kantoran, ibu dengan tas belanja, anak sekolah, kakek, pedagang dengan gerobak kecil.
- Animasi: lari panik (loop) + tangan di atas kepala.
- Fungsi: atmosfer dan indikator chaos. Jumlah warga di layar naik seiring tingkat destruksi.

### Tentara (musuh biasa)

| Tipe | Muncul | Perilaku |
| --- | --- | --- |
| Infanteri senapan | sejak awal | Jaga jarak, tembak beruntun, mundur kalau Rex mendekat |
| Bazooka | destruksi ≥ 30% | Tembak roket lambat dengan damage besar, perlu aim |
| Jeep | destruksi ≥ 50% | Lewat cepat sambil menembak, bisa dilempar sabetan ekor |
| Helikopter | destruksi ≥ 70% | Di udara, hanya bisa dikenai gigitan saat terbang rendah |

### 3 Pahlawan (mini-boss)

Pahlawan muncul satu per satu sesuai ambang destruksi. Desain orisinal, bukan tiruan superhero yang sudah ada.

| Pahlawan | Peran | Muncul | Gerakan khas | Counter |
| --- | --- | --- | --- | --- |
| **Perisai** | Tank jarak dekat | 25% | Tubrukan perisai yang men-stun Rex, blok gigitan dari depan | Sabetan ekor dari belakang setelah ia gagal menubruk |
| **Rajawali** | Penyerang udara | 50% | Terbang dengan jetpack, tembakan laser dari atas, menukik | Raungan menjatuhkannya, lalu gigit saat ia di tanah |
| **Jaring** | Insinyur / kontrol | 75% | Pasang turret dan jaring baja yang memperlambat Rex | Hancurkan turret dulu, lalu injak |

Level terakhir: ketiganya muncul bersamaan sebagai final boss.

---

## 4. Sistem destruksi bangunan

Setiap modul (lantai dasar, lantai atas, atap) punya HP sendiri dan **4 state visual**:

1. `intact` — utuh
2. `cracked` — retak, kaca pecah sebagian
3. `broken` — dinding bolong, rangka terlihat, api kecil
4. `rubble` — runtuh, jadi tumpukan puing

Aturan:
- Lantai atas runtuh lebih dulu kalau lantai di bawahnya `rubble` (efek domino).
- Setiap pergantian state: partikel debu + puing + screen shake kecil.
- Dekorasi (balkon, papan toko, pot) lepas dan jatuh saat modul induknya `cracked`.
- Persentase destruksi kota = total HP modul yang hilang / total HP awal.

Aset state rusak dibuat **dengan canvas size dan titik sambungan yang sama** dengan versi utuh, supaya `manifest.json` tetap valid.

---

## 5. Struktur level

| Level | Setting | Target | Pahlawan |
| --- | --- | --- | --- |
| 1 | Jalan ruko dan warung | 60% | Perisai |
| 2 | Pusat kota, gedung perkantoran | 70% | Rajawali (+ Perisai muncul lagi di 90%) |
| 3 | Pelabuhan dan kawasan industri | 75% | Jaring |
| 4 | Alun-alun kota | 80% | Ketiganya (final) |

Panjang level: ±6–10 layar. Latar: langit senja + siluet kota parallax 2–3 lapis. Langit makin gelap dan merah tiap level (senja → malam berasap) untuk menunjukkan eskalasi.

Untuk MVP cukup **Level 1** saja.

---

## 6. Teknologi

- **HTML5 Canvas + vanilla JS**, tanpa build, sejalan dengan `assets/preview/kit.js` yang sudah ada.
- Resolusi logis 1920×1080, di-scale ke layar.
- Game loop `requestAnimationFrame` dengan fixed timestep (60 Hz).
- **Animasi:**
  - Rex dan pahlawan: **cutout rig** (bagian tubuh PNG terpisah, dirotasi di code). Paling konsisten untuk ilustrasi non-pixel hasil image generation.
  - Warga dan tentara: **pose sheet** 4 pose per karakter + bob/squash di code.
- Collision: AABB sederhana + hitbox per serangan.
- Audio: Web Audio API (raungan, injakan, runtuh, tembakan, teriakan).
- Data level di JSON: urutan bangunan, jumlah lantai, spawn point.

Usulan struktur folder:

```
/
├─ index.html
├─ plan.md
├─ src/
│  ├─ main.js          # boot, game loop
│  ├─ input.js
│  ├─ camera.js
│  ├─ entities/
│  │  ├─ rex.js
│  │  ├─ civilian.js
│  │  ├─ soldier.js
│  │  └─ heroes/ (perisai.js, rajawali.js, jaring.js)
│  ├─ world/
│  │  ├─ building.js   # modul + HP + state destruksi
│  │  └─ level.js
│  ├─ fx/particles.js
│  └─ ui/hud.js
├─ data/levels/level-01.json
└─ assets/
   ├─ buildings/ruko-01/           # City Kit 02, + damage/
   ├─ props/                       # tiang listrik, angkot, gerobak, dll.
   ├─ legacy/city-kit-01/          # aset lama, dipensiunkan
   ├─ characters/rex/
   ├─ characters/heroes/
   ├─ characters/soldiers/
   ├─ characters/civilians/
   ├─ fx/
   └─ backgrounds/
```

---

## 7. Daftar aset yang dibutuhkan

Prompt lengkap ada di [`image-prompts.md`](image-prompts.md).

| Kelompok | Aset | Jumlah |
| --- | --- | --- |
| City Kit 02 (ruko) | Lantai dasar, lantai atas, atap, 4 variasi warna, 6 props | 9 + variasi |
| Rex | Master design, parts sheet (rig) | 2 |
| Pahlawan | Master + parts sheet × 3 | 6 |
| Tentara | Pose sheet: infanteri, bazooka; sprite jeep, helikopter | 4 |
| Warga | Pose sheet × 5 variasi | 5 |
| Destruksi | Ground/upper/roof × (cracked, broken, rubble) | 9 |
| FX | Debu, puing, ledakan, api, peluru/roket/laser, jaring | 6 |
| Background | Langit, siluet kota jauh, siluet kota tengah, jalan | 4 |
| UI | Ikon HP, Rage Meter, potret pahlawan | 3 |

---

## 8. Milestone

### M1 — Prototype gerak (1 minggu)
- Game loop, kamera, input.
- Rex sebagai kotak placeholder bisa jalan.
- Bangunan placeholder (boleh pakai City Kit 01 sementara) dirakit di jalan, bisa dihancurkan (HP saja, belum ganti visual).
- Paralel: generate City Kit 02 ruko + background senja.

### M2 — Destruksi & Rex (1–2 minggu)
- Aset Rex rig + animasi idle, jalan, gigit, ekor, injak, raung.
- State destruksi bangunan 4 tahap + partikel + screen shake.

### M3 — Kota hidup (1 minggu)
- Warga sipil spawn dan kabur.
- Infanteri dan bazooka dengan AI dasar.
- HUD: HP, Rage, persentase destruksi.

### M4 — Pahlawan pertama (1 minggu)
- Perisai lengkap dengan pola serangan.
- Kondisi menang/kalah, layar hasil.
- **Level 1 playable = MVP.**

### M5 — Konten penuh
- Rajawali, Jaring, jeep, helikopter.
- Level 2–4, audio, polish, menu.

---

## 9. Keputusan yang masih terbuka

- Pemain = Rex (asumsi saat ini) atau pemain = pahlawan?
- Rex boleh mengenai warga atau tidak? Plan ini memilih **tidak**, warga murni kabur.
- Target platform: desktop saja atau perlu kontrol sentuh mobile?
