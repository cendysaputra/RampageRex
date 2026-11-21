// Bahasa aktif
export let lang = 'id';
export const languages = { id: 'Bahasa Indonesia', en: 'English' };

// Terjemahan Inggris
const en = {
  // Menu
  'Suara nyala': 'Sound on', 'Suara mati': 'Sound off', 'Rekor {n}': 'Best {n}', 'Belum ada rekor': 'No record yet',
  'Kamu jadi Rex. Hancurkan delapan distrik kota dan hadapi para penjaganya.': 'You are Rex. Wreck eight city districts and face their guardians.',
  'Mulai main': 'Play', 'Pilih distrik': 'Choose district', 'Pengaturan': 'Settings', 'Kembali': 'Back', 'Lewati': 'Skip',
  'Data distrik gagal dimuat.': 'District data failed to load.',
  'Aset gagal dimuat. Tekan Mulai main untuk mencoba lagi.': 'Assets failed to load. Press Play to try again.',
  'Kredit': 'Credits', 'Kisah Rex': "Rex's story", 'Arena permainan Rampage Rex': 'Rampage Rex game arena',
  'Aktifkan JavaScript untuk memainkan Rampage Rex.': 'Enable JavaScript to play Rampage Rex.',
  // Pilih distrik
  'Terkunci': 'Locked', 'belum selesai': 'not cleared', 'skor terbaik {n}': 'best {n}',
  'Bertahan selama mungkin': 'Survive as long as you can', 'Terbuka setelah Jalan Ruko selesai': 'Unlocks after Ruko Street',
  // Distrik
  'Jalan Ruko': 'Ruko Street', 'Pasar Tradisional': 'Traditional Market', 'Pusat Kota': 'Downtown', 'Stasiun Kereta': 'Train Station',
  'Pelabuhan': 'Harbour', 'Jembatan Tol': 'Toll Bridge', 'Pantai': 'Beach', 'Alun-Alun': 'Town Square', 'Tanpa Akhir': 'Endless',
  'Distrik {n}': 'District {n}', 'Mode': 'Mode', 'Mode Tanpa Akhir': 'Endless mode',
  'Target destruksi {n}%': 'Destruction target {n}%', 'Bertahan dan hancurkan sebanyak mungkin': 'Survive and wreck as much as you can',
  'Memuat distrik…': 'Loading district…', 'Memuat distrik… {n}%': 'Loading district… {n}%', 'Koneksi lambat, masih memuat… {n}%': 'Slow connection, still loading… {n}%', 'Siap mengamuk!': 'Ready to rampage!',
  // HUD
  'Jeda': 'Pause', 'Kiri': 'Left', 'Kanan': 'Right', 'Jalan': 'Walk', 'Gigit': 'Bite', 'Ekor': 'Tail', 'Injak': 'Stomp',
  'Raung': 'Roar', 'Lompat': 'Jump', 'Ulti': 'Ulti', 'Spasi': 'Space', 'W / Klik kiri': 'W / Left click', 'Q / Klik kanan': 'Q / Right click', 'W / klik kiri': 'W / left click', 'Q / klik kanan': 'Q / right click',
  '{n} dtk': '{n}s', '{n} kombo': '{n} combo',
  'Jalan ke ujung distrik →': 'Walk to the end of the district →', 'Kalahkan {names}': 'Defeat {names}',
  'Penuhi target destruksi': 'Reach the destruction target', 'Hancurkan bangunan': 'Wreck the buildings',
  // Jeda dan hasil
  'Lanjut main': 'Resume', 'Kontrol': 'Controls', 'Menu utama': 'Main menu',
  'Distrik {n}, {name} · {pct}% hancur · kombo terbaik {combo}': 'District {n}, {name} · {pct}% wrecked · best combo {combo}',
  'Mode Tanpa Akhir · skor {score} · rekor {best} · kombo terbaik {combo}': 'Endless mode · score {score} · best {best} · best combo {combo}',
  'Rekor baru!': 'New record!', 'Rex tumbang': 'Rex is down', 'Coba lagi': 'Try again', 'Distrik runtuh!': 'District wrecked!',
  'Kota ditaklukkan!': 'City conquered!', 'Lanjut ke distrik {n}': 'On to district {n}', 'Main dari awal': 'Play again',
  '{name} · destruksi {pct}% · Skor {score}': '{name} · destruction {pct}% · Score {score}',
  '{name} rata {stars} · Skor {score}': '{name} wrecked {stars} · Score {score}',
  // Kontrol
  'Gigit bangunan dan musuh di depan': 'Bite buildings and enemies in front', 'Sabet ke belakang, melempar tentara': 'Swipe behind, flinging soldiers',
  'Rusak lantai dasar di sekitar kaki': 'Smash ground floors around your feet', 'Bikin tentara terpaku, jatuhkan drone': 'Freeze soldiers, drop drones',
  'Kebal di udara, musuh terpaku saat mendarat': 'Invulnerable in the air, enemies freeze on landing',
  'Amukan Rex, guncang seluruh layar': "Rex's Rampage, shakes the whole screen",
  'Raung: tentara terpaku, drone jatuh': 'Roar: soldiers freeze, drones fall',
  'Lompat: kebal di udara, musuh terpaku saat mendarat': 'Jump: invulnerable in the air, enemies freeze on landing',
  'Ulti Amukan Rex, guncang seluruh layar': "Ulti Rex's Rampage, shakes the whole screen",
  'Runtuhkan lantai dasar untuk menjatuhkan seluruh bangunan.': 'Collapse the ground floor to bring the whole building down.',
  'Raung atau lompat saat panel ulti penjaga muncul untuk menggagalkannya.': 'Roar or jump when a guardian ulti panel appears to cancel it.',
  'Ekor membalikkan tank dan melempar jeep serta truk pemadam.': 'The tail flips tanks and flings jeeps and fire trucks.',
  // Pengaturan
  'Bahasa': 'Language', 'Grafis': 'Graphics', 'Otomatis': 'Auto', 'Tinggi': 'High', 'Ringan': 'Lite',
  'Perangkat ini disarankan memakai Ringan.': 'Lite is recommended on this device.',
  'Ringan: resolusi lebih rendah dan efek lebih sedikit untuk HP lama.': 'Lite: lower resolution and fewer effects for older phones.',
  'Tingkat kesulitan': 'Difficulty', 'Santai': 'Relaxed', 'Normal': 'Normal', 'Ngamuk': 'Rampage',
  'Berlaku mulai distrik berikutnya.': 'Applies from the next district.',
  'Santai: musuh lebih sedikit dan tidak terlalu sakit.': 'Relaxed: fewer enemies that hit softer.',
  'Skin Rex': 'Rex skin', 'Merah': 'Red', 'Batik': 'Batik', 'Hutan': 'Forest', 'Mecha': 'Mecha',
  'Bintang terkumpul: {n} dari {total}.': 'Stars collected: {n} of {total}.',
  'Efek suara': 'Sound effects', 'Musik': 'Music', 'Getaran': 'Vibration', 'Nyala': 'On', 'Mati': 'Off',
  'Ukuran tombol sentuh': 'Touch button size', 'Kecil': 'Small', 'Sedang': 'Medium', 'Besar': 'Large',
  'Ulangi tutorial di distrik 1': 'Replay the district 1 tutorial', 'Tutorial aktif di distrik 1': 'Tutorial on in district 1',
  'Hapus progres': 'Erase progress', 'Yakin? Tekan lagi untuk menghapus': 'Sure? Tap again to erase', 'Progres dihapus': 'Progress erased',
  // Misi
  'Ratakan distrik': 'Wreck the district', 'Selesai dalam {n} menit': 'Finish within {n} minutes', 'Capai kombo {n}': 'Reach a {n} combo',
  'Kalahkan {n} warga': 'Defeat {n} civilians', 'Gagalkan 2 ulti pahlawan': 'Cancel 2 hero ultis', 'Hancurkan semua gerbong': 'Wreck every train carriage',
  'Hancurkan semua properti jalan': 'Wreck every street prop', 'Kalahkan {n} tentara': 'Defeat {n} soldiers',
  'Selesai dengan darah ≥ 50%': 'Finish with ≥ 50% health',
  // Tutorial
  'Tekan D atau → untuk berjalan.': 'Press D or → to walk.', 'Tekan ▶ untuk berjalan.': 'Press ▶ to walk.',
  'Gigit bangunan: tekan W atau klik kiri.': 'Bite a building: press W or left click.', 'Gigit bangunan: tekan Gigit.': 'Bite a building: press Bite.',
  'Runtuhkan lantai dasar dengan Injak: tekan S.': 'Collapse a ground floor with Stomp: press S.',
  'Runtuhkan lantai dasar dengan Injak.': 'Collapse a ground floor with Stomp.',
  'Tentara datang! Lempar mereka dengan ekor: Q atau klik kanan.': 'Soldiers incoming! Fling them with your tail: Q or right click.',
  'Tentara datang! Lempar mereka dengan Ekor.': 'Soldiers incoming! Fling them with Tail.',
  'Terkepung? Tekan Spasi untuk lompat: kebal di udara, musuh terpaku saat mendarat.': 'Surrounded? Press Space to jump: invulnerable in the air, enemies freeze when you land.',
  'Terkepung? Tekan Lompat: kebal di udara, musuh terpaku saat mendarat.': 'Surrounded? Press Jump: invulnerable in the air, enemies freeze when you land.',
  'Ulti siap! Tekan R untuk Amukan Rex.': "Ulti ready! Press R for Rex's Rampage.", 'Ulti siap! Tekan Ulti untuk Amukan Rex.': "Ulti ready! Press Ulti for Rex's Rampage.",
  'Tutorial selesai! Ratakan 100% kota.': 'Tutorial done! Wreck 100% of the city.', 'Selesai': 'Done',
  // Upgrade
  'Pilih upgrade': 'Choose an upgrade', 'Upgrade berlaku sampai kampanye selesai.': 'Upgrades last until the campaign ends.', 'Upgrade aktif': 'Active upgrades',
  'Taring Baja': 'Steel Fangs', 'Gigitan +25% damage': 'Bite +25% damage', 'Ekor Godam': 'Hammer Tail', 'Sabetan ekor +30% damage': 'Tail swipe +30% damage',
  'Telapak Gempa': 'Quake Feet', 'Injakan +30% damage': 'Stomp +30% damage', 'Sisik Tebal': 'Thick Scales', 'Darah maksimal +60': 'Max health +60',
  'Paru-paru Besar': 'Big Lungs', 'Cooldown raung −30%': 'Roar cooldown −30%', 'Kaki Pegas': 'Spring Legs', 'Cooldown lompat −30%': 'Jump cooldown −30%',
  'Amarah Purba': 'Primal Fury', 'Cooldown ulti −25%': 'Ulti cooldown −25%', 'Perut Rakus': 'Greedy Gut', 'Pulih darah dari musuh +50%': 'Health from defeated enemies +50%',
  'Murka': 'Wrath', 'Rage terisi 30% lebih cepat': 'Rage fills 30% faster', 'Irama Amuk': 'Rampage Rhythm', 'Kombo bertahan 1 detik lebih lama': 'Combos last 1 second longer',
  // Pencapaian
  'Pencapaian': 'Achievements', 'Pencapaian {n}/{total}': 'Achievements {n}/{total}', 'Pencapaian baru: {names}': 'New achievement: {names}',
  'Langkah Pertama': 'First Steps', 'Selesaikan Jalan Ruko': 'Clear Ruko Street', 'Penakluk Kota': 'City Conqueror', 'Selesaikan kedelapan distrik': 'Clear all eight districts',
  'Bintang Kota': 'City Star', 'Kumpulkan 15 bintang': 'Collect 15 stars', 'Langit Penuh Bintang': 'Starry Sky', 'Kumpulkan semua 24 bintang': 'Collect all 24 stars',
  'Besi Tua': 'Scrap Metal', 'Kalahkan Robot Penjaga': 'Defeat the Robot Guardian', 'Tukang Gusur': 'Demolition Crew', 'Runtuhkan 200 bangunan': 'Bring down 200 buildings',
  'Teror Barak': 'Barracks Terror', 'Kalahkan 500 tentara': 'Defeat 500 soldiers', 'Kota Sepi': 'Ghost Town', 'Kalahkan 300 warga': 'Defeat 300 civilians',
  'Pemburu Angkot': 'Angkot Hunter', 'Hancurkan 40 angkot': 'Wreck 40 angkots', 'Pom Bensin Meledak': 'Gas Station Boom', 'Ledakkan 10 SPBU': 'Blow up 10 petrol stations',
  'Tank Terbalik': 'Tank Flipper', 'Balikkan 25 tank dengan ekor': 'Flip 25 tanks with your tail', 'Langit Bersih': 'Clear Skies', 'Jatuhkan 30 drone': 'Down 30 drones',
  'Penggagal Ulti': 'Ulti Breaker', 'Gagalkan 20 ulti pahlawan': 'Cancel 20 hero ultis', 'Kombo Maut': 'Deadly Combo', 'Capai kombo 60 dalam satu distrik': 'Reach a 60 combo in one district',
  'Tak Kenal Lelah': 'Relentless', 'Raih 50.000 skor di Mode Tanpa Akhir': 'Score 50,000 in Endless mode',
  // Misi harian
  'Misi harian': 'Daily mission', '{n} hari beruntun': '{n}-day streak', 'Misi harian berhasil!': 'Daily mission complete!', 'Misi harian gagal': 'Daily mission failed',
  'Ratakan {name} dalam {n} menit': 'Wreck {name} within {n} minutes', 'Ratakan {name} dengan kombo {n}': 'Wreck {name} with a {n} combo',
  'Ratakan {name} dan kalahkan {n} tentara': 'Wreck {name} and defeat {n} soldiers', 'Ratakan {name} dengan darah ≥ {n}%': 'Wreck {name} with ≥ {n}% health',
  'Ratakan {name} tanpa ulti': 'Wreck {name} without using the ulti', 'Ratakan {name} dan kalahkan {n} warga': 'Wreck {name} and defeat {n} civilians',
  // Pesan permainan
  'Rex tersambar petir! Skin ThunderRex terbuka!': 'Rex was struck by lightning! ThunderRex skin unlocked!', 'Skin langka terbuka': 'Rare skin unlocked', 'ThunderRex': 'ThunderRex', 'langka': 'rare', 'AMUKAN PETIR!': 'THUNDER RAMPAGE!',
  'Hujan deras! Tentara dan warga melambat.': 'Heavy rain! Soldiers and civilians slow down.',
  '{name} · Hancurkan {n}% kota': '{name} · Wreck {n}% of the city', 'SPBU meledak!': 'Petrol station exploded!',
  'Rex makan! +{n} darah': 'Rex eats! +{n} health', 'Rex sudah kenyang.': 'Rex is full.', '{skill} siap dalam {n} dtk.': '{skill} ready in {n}s.',
  'Perisai memblokir gigitan.': 'Perisai blocks the bite.', 'Hancurkan turret Jaring dulu.': "Destroy Jaring's turret first.", 'Turret hancur! Injak Jaring sekarang.': 'Turret down! Stomp Jaring now.', 'Konvoi motor lewat!': 'Motorbike convoy incoming!', 'Pawai 17 Agustus lewat!': 'Independence Day parade ahead!',
  '{name} tumbang!': '{name} is down!', 'Ulti {name} gagal!': "{name}'s ulti cancelled!", 'Ulti siap! Tekan R.': 'Ulti ready! Press R.',
  'Rage penuh! Damage 2× selama 8 detik.': 'Rage full! 2× damage for 8 seconds.',
  'Para penjaga mengepung Rex! Pecah formasi mereka satu per satu.': 'The guardians surround Rex! Break their formation one by one.',
  '{name} datang! {hint}': '{name} arrives! {hint}', 'Ketiga penjaga bergabung: ROBOT PENJAGA!': 'The three guardians combine: ROBOT GUARDIAN!',
  'Kota rata! Jalan ke ujung distrik →': 'City wrecked! Walk to the end of the district →', 'Tank terbalik!': 'Tank flipped!',
  'Hindari tubrukannya, lalu sabet dengan ekor.': 'Dodge the charge, then swipe with your tail.',
  'Raungkan Rex saat Rajawali mendekat, lalu gigit.': 'Roar when Rajawali swoops in, then bite.',
  'Hancurkan turret, lalu injak Jaring.': 'Destroy the turret, then stomp Jaring.',
  'Robot Penjaga': 'Robot Guardian',
  // Kanvas
  'AMUKAN REX!': "REX'S RAMPAGE!", 'BENTENG BAJA!': 'STEEL FORTRESS!', 'HUJAN LASER!': 'LASER RAIN!', 'JARING RAKSASA!': 'GIANT NET!',
  'MEGA PENJAGA!': 'MEGA GUARDIAN!', 'Raung untuk menggagalkan!': 'Roar to cancel it!', 'REX TUMBANG': 'REX IS DOWN',
  // Opening
  'Suatu malam, sesuatu jatuh dari langit.': 'One night, something fell from the sky.',
  'Benda itu menghantam hutan di pinggir kota.': 'It crashed into the forest at the edge of town.',
  'Di dasar kawah itu bukan batu. Sebutir telur.': 'At the bottom of the crater was no rock. It was an egg.',
  'Lalu ia menetas.': 'Then it hatched.', 'Hutan menjadi rumahnya. Ia belajar berburu.': 'The forest became its home. It learned to hunt.',
  'Ia tumbuh besar. Hutan tidak lagi cukup.': 'It grew big. The forest was no longer enough.',
  'Dan di kejauhan, ia melihat kota.': 'And in the distance, it saw the city.',
  // Misi spesial
  'Misi Spesial': 'Special Missions', 'Jalur lebih panjang, darah Rex 900, dan bos monster di ujung peta.': 'Longer routes, 900 HP for Rex, and a monster boss at the end of the map.',
  'Misi {name}': '{name} Mission', 'Hadiah: skin {skin}': 'Reward: {skin} skin', 'Skin ZombieRex terbuka!': 'ZombieRex skin unlocked!',
  'Selesaikan ketiga misi untuk membuka ZombieRex': 'Clear all three missions to unlock ZombieRex', 'Sedang dipakai': 'Equipped', 'Keluar dari game?': 'Quit the game?', 'Keluar': 'Quit', 'Pakai skin ZombieRex': 'Equip the ZombieRex skin', 'semua misi': 'all missions',
  '{name} · {pct}% hancur · kombo terbaik {combo}': '{name} · {pct}% wrecked · best combo {combo}', 'Skin {skin} terbuka!': '{skin} skin unlocked!',
  'Misi selesai!': 'Mission complete!', 'Main lagi': 'Play again',
  'Kemerdekaan': 'Independence', 'Salju': 'Snow', 'Halloween': 'Halloween',
  'Kampung Merah Putih': 'Red and White Kampung', 'Kota Bersalju': 'Snowy City', 'Malam Halloween': 'Halloween Night',
  'Selesaikan kedelapan distrik': 'Clear all eight districts', 'Selesaikan Misi Kemerdekaan dan kumpulkan 15 bintang': 'Clear the Independence Mission and collect 15 stars',
  'Selesaikan Misi Salju dan runtuhkan 200 bangunan': 'Clear the Snow Mission and topple 200 buildings',
  'Tikus Raksasa': 'Giant Rat', 'Boneka Salju Raksasa': 'Giant Snowman', 'Penyihir': 'Witch',
  'HUJAN KOIN EMAS!': 'GOLD COIN RAIN!', 'MERIAM PEMBEKU!': 'FREEZE CANNON!', 'PASUKAN TULANG!': 'BONE ARMY!', '{name} muncul!': '{name} appears!',
  'Sayap Merah Putih': 'Red-White Wings', 'Rex Es': 'Ice Rex', 'Rex Tulang': 'Bone Rex', 'ZombieRex': 'ZombieRex',
  'Terbang': 'Fly', 'Duri Es': 'Ice Spikes', 'Rex terbang!': 'Rex takes flight!', 'Duri es!': 'Ice spikes!', 'Rex bangkit lagi!': 'Rex rises again!',
  'Rex membeku! Tekan tombol berulang untuk lepas.': 'Rex is frozen! Mash buttons to break free.', 'Tulang Rex rontok…': "Rex's bones fall apart…",
};

// Pasang bahasa
export function setLang(code) {
  lang = code === 'en' ? 'en' : 'id';
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
}

// Bahasa perangkat
export function deviceLang(nav = globalThis.navigator) {
  return (nav?.language || 'id').toLowerCase().startsWith('id') ? 'id' : 'en';
}

// Terjemahkan
export function t(text, vars = {}) {
  const template = lang === 'en' ? (en[text] ?? text) : text;
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}

// Format angka
export function num(value) {
  return Number(value).toLocaleString(lang === 'en' ? 'en-US' : 'id-ID');
}

// Terjemahkan halaman
export function translatePage(root = document) {
  for (const node of root.querySelectorAll('[data-i18n]')) node.textContent = t(node.dataset.i18n);
  for (const node of root.querySelectorAll('[data-i18n-label]')) node.setAttribute('aria-label', t(node.dataset.i18nLabel));
}

// Kunci terdaftar
export const keys = Object.keys(en);
