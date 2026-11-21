# MUSIC — Prompt musik Suno AI

Daftar musik untuk Rampage Rex beserta prompt Suno AI. Saat ini game hanya punya efek suara sintetis (`web/src/audio.js`). Belum ada musik latar.

## Cara pakai

1. Buka Suno dalam mode **Custom** dan aktifkan **Instrumental**.
2. Tempel blok **Style** ke kolom *Style of Music*.
3. Tempel blok **Struktur** ke kolom *Lyrics*. Tag di dalam kurung siku hanya mengatur bagian lagu, bukan untuk dinyanyikan.
4. Buat 2–4 variasi per lagu, lalu pilih yang paling cocok.
5. Prompt sengaja ditulis dalam bahasa Inggris karena Suno lebih akurat begitu. Jangan menambahkan nama artis, karena Suno akan menolak prompt yang menyebut artis.

## Arah musik

Monster raksasa yang lucu mengamuk di kota Indonesia saat senja. Musiknya heroik tapi jenaka, dengan warna lokal dari gamelan, kendang, suling, angklung, keroncong, dan dangdut yang dipadukan dengan brass, gitar, dan orkestra ala game arcade.

## Daftar lagu

| No | Lagu | Diputar saat | Nama file | Durasi | Loop |
| :-: | --- | --- | --- | :-: | :-: |
| 1 | Menu utama | Menu dan kartu distrik | `menu.ogg` | 1–2 menit | Ya |
| 2 | Opening komik | Adegan pembuka | `opening.ogg` | ±35 detik | Tidak |
| 3 | Jalan Ruko | Distrik 1 | `district-1.ogg` | 1,5–2 menit | Ya |
| 4 | Pusat Kota | Distrik 2 | `district-2.ogg` | 1,5–2 menit | Ya |
| 5 | Pelabuhan | Distrik 3 | `district-3.ogg` | 1,5–2 menit | Ya |
| 6 | Alun-Alun | Distrik 4 | `district-4.ogg` | 1,5–2 menit | Ya |
| 7 | Pertarungan hero | Saat tiga penjaga datang | `heroes.ogg` | 1–1,5 menit | Ya |
| 8 | Distrik selesai | Rex berjalan keluar layar | `clear.ogg` | ±8 detik | Tidak |
| 9 | Kalah | Rex tumbang | `defeat.ogg` | ±6 detik | Tidak |

Simpan semua file di `web/assets/music/`.

---

## 1. Menu utama — "Ruko Senja"

Style:
```
Instrumental cinematic adventure theme, playful giant monster comedy, Indonesian gamelan saron and bonang melody over big brass section and kendang drums, warm sunset mood, heroic but cheeky, 110 BPM, video game main menu, loopable
```

Struktur:
```
[Intro: soft gamelan shimmer]
[Main Theme: brass melody, kendang groove]
[Bridge: playful pizzicato strings]
[Main Theme: full band]
[Outro: fade back to gamelan, loop]
```

## 2. Opening komik

Mengiringi tujuh adegan berurutan: meteor jatuh, hantaman di hutan, telur di kawah, menetas, Rex kecil belajar berburu, Rex tumbuh besar, lalu melihat kota. Detail tiap adegan ada di `OPENING.md`.

Style:
```
Instrumental cinematic storybook score, mysterious night ambience, soft suling bamboo flute and angklung, sudden deep boom impact, tender music-box moment, rising strings, ending in a swelling heroic brass reveal, 90 BPM, short cue
```

Struktur:
```
[Intro: quiet night, suling flute]
[Impact: deep boom, rumble]
[Mystery: low strings, heartbeat]
[Hatching: gentle music box and angklung]
[Growth: rising strings and drums]
[Reveal: heroic brass swell]
[End]
```

## 3. Distrik 1 — Jalan Ruko (senja)

Style:
```
Instrumental upbeat arcade action, dangdut rock groove with kendang and suling, driving electric guitar riffs, gamelan accents, playful destruction energy, 140 BPM, energetic video game level loop
```

Struktur:
```
[Intro: kendang solo]
[Verse: guitar riff and suling melody]
[Chorus: full band, brass stabs]
[Break: gamelan and drums]
[Chorus]
[Outro: loop]
```

## 4. Distrik 2 — Pusat Kota (siang)

Style:
```
Instrumental funk rock action, punchy brass section, slap bass, busy city energy, kendang and hi-hat groove, bright and confident, 145 BPM, video game level loop
```

Struktur:
```
[Intro: brass hits]
[Verse: slap bass groove]
[Chorus: big brass melody]
[Bridge: breakdown with kendang]
[Chorus]
[Outro: loop]
```

## 5. Distrik 3 — Pelabuhan (sore)

Style:
```
Instrumental industrial rock action, metallic percussion like ship hulls and chains, keroncong ukulele strumming over heavy guitars, harbor horn accents, gritty but fun, 140 BPM, video game level loop
```

Struktur:
```
[Intro: harbor horn, metallic hits]
[Verse: keroncong ukulele with heavy drums]
[Chorus: distorted guitar melody]
[Break: chains and percussion]
[Chorus]
[Outro: loop]
```

## 6. Distrik 4 — Alun-Alun (malam, final)

Style:
```
Instrumental dark epic orchestral rock, massive gong and gamelan, choir chants, pounding drums, intense final level, dramatic night battle, 150 BPM, video game final stage loop
```

Struktur:
```
[Intro: gong and low choir]
[Build: drums and strings]
[Main: full orchestra and guitars]
[Break: gamelan solo]
[Climax: choir and brass]
[Outro: loop]
```

## 7. Pertarungan hero

Diputar saat Perisai, Rajawali, dan Jaring datang mengepung Rex, menggantikan musik distrik sampai ketiganya kalah.

Style:
```
Instrumental superhero showdown, triumphant brass fanfare clashing with menacing low synths, fast drums, kendang fills, heroic versus monster tension, 160 BPM, boss battle loop
```

Struktur:
```
[Intro: heroic fanfare]
[Verse: tense synth bass, fast drums]
[Chorus: brass and choir]
[Break: drum and kendang duel]
[Chorus]
[Outro: loop]
```

## 8. Distrik selesai

Style:
```
Instrumental short victory jingle, triumphant brass and gamelan flourish, cheeky monster roar ending, video game level clear stinger, 8 seconds
```

Struktur:
```
[Fanfare]
[End]
```

## 9. Kalah

Style:
```
Instrumental short comedic defeat jingle, sad sliding trombone, slow gong, cartoon wobble, video game game over stinger, 6 seconds
```

Struktur:
```
[Sad trombone]
[End]
```

---

## Setelah musik jadi

1. **Pilih variasi:** dengarkan semua hasil dan pilih yang paling cocok dengan suasana distriknya.
2. **Potong untuk loop:** Suno tidak menjamin hasilnya bisa diulang mulus. Untuk lagu yang di-loop (menu, distrik, hero), potong tepat di awal ketukan, lalu pastikan akhir lagu menyambung ke awalnya, misalnya pakai Audacity. Buang intro panjang kalau mengganggu saat lagu berulang.
3. **Samakan volume:** normalisasi semua lagu ke tingkat kekerasan yang sama (sekitar −16 LUFS) supaya efek suara tetap terdengar.
4. **Ekspor:** OGG Vorbis 128 kbps, stereo, 44,1 kHz. Ukurannya sekitar 1 MB per menit, jadi total semua lagu kira-kira 10–12 MB.
5. **Simpan:** taruh di `web/assets/music/` dengan nama file sesuai tabel di atas.
6. **Sambungkan ke game:** setelah filenya ada, musik perlu disambungkan ke `web/src/main.js` dan `web/src/audio.js`:
   - lagu berganti sesuai layar dan fase permainan, dengan transisi halus;
   - musik ikut tombol suara yang sudah ada;
   - musik berhenti saat game dijeda;
   - musik distrik baru dimuat saat distrik itu dibuka, supaya unduhan awal tetap ringan.
