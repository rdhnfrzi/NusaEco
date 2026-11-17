# NUSA ECO — Bank Sampah Sekolah Adiwiyata

## Deskripsi Website
**NUSA ECO** adalah platform web statis edukasi dan manajemen **Bank Sampah Sekolah Adiwiyata** berbasis HTML, CSS, dan Vanilla JavaScript. Website ini dirancang untuk mendukung digitalisasi pencatatan bank sampah sekolah, pemantauan dampak lingkungan, serta edukasi pemilahan sampah bagi siswa.

### Halaman & Fitur Utama
- **`index.html` (Beranda):** Informasi program Sekolah Adiwiyata, edukasi pengelolaan sampah, simulasi pemilahan sampah interaktif, serta ringkasan indikator lingkungan.
- **`dashboard.html` (Dashboard):** Visualisasi grafik komposisi sampah bulanan, tingkat partisipasi siswa, dan persentase pengelolaan prinsip 3R (*Reduce, Reuse, Recycle*).
- **`banksampah.html` (Bank Sampah):** Formulir pencatatan setoran sampah siswa yang tersimpan langsung secara lokal di browser.
- **`scan-sampah.html` (Scan Sampah):** Fitur pemindaian dan identifikasi jenis sampah menggunakan kamera perangkat yang terhubung dengan database sampah (`data/waste-database.json`).
- **`ecopoint-impact.html` (EcoPoint & Impact):** Ringkasan akumulasi poin lingkungan, jejak pengurangan emisi karbon, dan dampak penerapan prinsip 3R.

---

## Petunjuk Menjalankan Project
Project ini sudah di-deploy menggunakan **GitHub Pages**, sehingga dapat langsung diakses dan digunakan tanpa proses instalasi tambahan:

1. Buka tautan website **GitHub Pages** yang telah disediakan melalui browser (Google Chrome, Edge, Safari, atau browser mobile).
2. Pastikan koneksi internet aktif untuk memuat halaman serta aset pendukung (seperti grafik Chart.js).
3. Izinkan akses kamera saat browser meminta izin pada halaman **Scan Sampah (`scan-sampah.html`)** agar fitur pemindaian dapat berfungsi.
4. Jelajahi seluruh menu navigasi (Beranda, Dashboard, Bank Sampah, Scan Sampah, dan EcoPoint Impact) secara langsung melalui halaman web.

---

## Catatan Teknis
- **Akses Langsung via Link GitHub Pages:** Pengguna **tidak perlu mengekstrak file ZIP**, **tidak perlu menjalankan perintah di CMD/Terminal**, dan **tidak perlu menggunakan ekstensi Live Server** karena aplikasi sudah berjalan online dalam bentuk tautan web siap pakai.
- **Keamanan Akses Kamera & Data JSON (HTTPS):** Karena di-hosting melalui **GitHub Pages** yang sudah menggunakan protokol aman **HTTPS**, browser secara otomatis mengizinkan akses kamera perangkat untuk fitur *Scan Sampah* serta pembacaan data dari file `data/waste-database.json` tanpa kendala pemblokiran keamanan browser (*CORS / insecure context*).
- **Penyimpanan Data (`localStorage`):** Seluruh data pencatatan setoran sampah dan perolehan poin disimpan secara lokal di browser pengguna menggunakan `localStorage` (melalui `js/storage.js` dengan key `nusaeco-submissions-v1`). Data akan tetap tersimpan selama riwayat/cache browser tidak dihapus, namun bersifat lokal pada masing-masing perangkat/browser yang digunakan.

---

## Tim Penyusun

**Nama Kelompok:** Disuruh Ngikut

**Anggota Kelompok:**
1. Muhammad Ridhan Aisyfarizi
2. Satria Putra Anugrah
3. Almahesa
