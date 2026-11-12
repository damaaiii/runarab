# رِحْلَةُ الْمُغَامَرَةِ (Rihlatul Mughamarah)
### Arabic Learning Adventure – Endless Runner Game

Game edukasi Bahasa Arab berbasis web dengan konsep **3-lane endless runner** yang terinspirasi dari Subway Surfers, dirancang khusus untuk siswa SMP/MTs kelas VII–IX. Pemain mengendalikan karakter petualang yang berlari di jalanan Timur Tengah, menghindari rintangan (melompat, merunduk, berpindah jalur), mengumpulkan koin dinar/dirham, dan menyelesaikan tantangan 5 keterampilan berbahasa Arab dengan kecerdasan buatan **Gemini AI**.

---

## 🌟 Fitur Utama

1. **Endless Runner Gameplay (Phaser.js 3)**
   - Sistem 3 jalur (*three-lane runner*) dengan transisi halus.
   - Aksi lompat (*jump*) untuk melewati penghalang kayu.
   - Aksi merunduk (*slide*) untuk melewati kain/tapestri gantung.
   - Power-ups: *Perisai Emas* (kebal tabrakan), *Magnet Koin*, dan *Pengali Skor 2x*.
   - Kontrol responsif: Keyboard (Arrow / WASD), Swipe sentuh smartphone, dan tombol kontrol virtual di layar.

2. **Integrasi 5 Keterampilan Bahasa Arab (الْمَهَارَاتُ الْخَمْسُ)**
   - 🎧 **الاستماع (Istima' / Menyimak):** Mendengarkan pelafalan audio kosakata Arab asli dan memilih arti yang benar.
   - 🗣️ **الكلام (Kalam / Berbicara):** Merespons dialog sapaan dan tanya-jawab santun sehari-hari.
   - 📖 **القراءة (Qira'ah / Membaca):** Membaca teks pendek berharakat lengkap dan menjawab pertanyaan pemahaman.
   - ✍️ **الكتابة (Kitabah / Menulis):** Menyusun huruf-huruf hijaiyah menjadi kata yang bermakna (*word arrangement*).
   - 📚 **المفردات (Mufradat / Kosakata):** Menjodohkan mufrodat dengan terjemahan dan mengoleksi kartu kosakata.

3. **8 Tema Kurikulum Bahasa Arab SMP/MTs**
   - التَّعَارُفُ (Perkenalan)
   - الْمَدْرَسَةُ (Sekolah)
   - الْأُسْرَةُ (Keluarga)
   - الْمِهْنَةُ (Profesi)
   - الْبَيْتُ (Rumah)
   - الْحَيَوَانَاتُ (Hewan)
   - الْأَلْوَانُ (Warna)
   - الْأَعْمَالُ الْيَوْمِيَّةُ (Kegiatan Sehari-hari)

4. **Integrasi Gemini AI & Fallback Cerdas**
   - Menghasilkan soal baru secara dinamis sesuai tema, maharah, dan tingkat kesulitan (*Mudah, Sedang, Sulit*).
   - Memberikan evaluasi dan analisis belajar personal dari guru (*AI learning feedback*).
   - Bank soal lokal berharakat lengkap sebagai *fallback otomatis*, sehingga game tetap 100% dapat dimainkan secara offline atau tanpa API key.

5. **Audio & Musik Bernuansa Timur Tengah**
   - Synthesizer procedural Web Audio API memainkan melodi Oud, Qanun, dan ritme Darbuka pada tangga nada Arab (*Maqam Hijaz & Bayati*).
   - Efek suara lengkap (koin, lompat, slide, power-up, benar, salah, level-up, game over).
   - Pengaturan volume, tombol mute, dan penyimpanan preferensi di localStorage.

---

## 🛠️ Arsitektur & Teknologi

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (dengan font Arab *Cairo* & *Amiri*)
- **Game Engine:** Phaser 3
- **Backend:** Express API di `api/index.ts`
- **AI SDK:** `@google/genai` (server-side, model `gemini-3.8-flash`)
- **Deployment:** Vercel Ready (`vercel.json`)

---

## 🚀 Panduan Menjalankan Proyek Secara Lokal

1. **Clone repository dan install dependensi:**
   ```bash
   npm install
   ```

2. **Konfigurasi Environment Variable:**
   Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   Buka file `.env` dan masukkan API Key Gemini Anda:
   ```env
   GEMINI_API_KEY="AIzaSy..."
   ```

3. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:3000`.

---

## 🔑 Cara Mendapatkan dan Mengisi GEMINI_API_KEY

1. Kunjungi [Google AI Studio](https://aistudio.google.com/).
2. Masuk menggunakan akun Google Anda.
3. Klik tombol **Get API key** dan buat kunci API baru.
4. Di lingkungan lokal: Masukkan kunci ke file `.env` sebagai `GEMINI_API_KEY="kunci_anda"`.
5. Di Vercel: Tambahkan di menu **Project Settings > Environment Variables** dengan nama `GEMINI_API_KEY`.
6. *Catatan:* Jika API key tidak diisi, game tetap dapat berjalan lancar menggunakan bank soal lokal kurikulum SMP/MTs.

---

## ☁️ Panduan Deployment ke Vercel

Aplikasi ini sudah dilengkapi dengan `vercel.json` dan arsitektur serverless `api/index.ts`:

1. Pastikan seluruh perubahan sudah di-commit ke Git repository Anda.
2. Buka dashboard [Vercel](https://vercel.com/) dan pilih **Add New Project**.
3. Import repository GitHub proyek ini.
4. Pada bagian **Environment Variables**, tambahkan:
   - Nama: `GEMINI_API_KEY`
   - Nilai: API Key Gemini Anda
5. Klik **Deploy**. Vercel akan otomatis membangun frontend ke `dist` dan menghubungkan rute `/api/*` ke `api/index.ts`.
