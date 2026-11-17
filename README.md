<div align="center">

<img src="assets/banner.svg" alt="NUSA ECO - Bank Sampah Sekolah Adiwiyata" width="100%"/>

<br/>

![HTML5](https://img.shields.io/badge/HTML5-236B45?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1A5236?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-7FCB9A?style=for-the-badge&logo=javascript&logoColor=0F3A24)
![Chart.js](https://img.shields.io/badge/Chart.js-DCEBDD?style=for-the-badge&logo=chartdotjs&logoColor=236B45)
![GitHub Pages](https://img.shields.io/badge/Hosted_on-GitHub_Pages-0F3A24?style=for-the-badge&logo=github&logoColor=white)

### ♻️ Digitalisasi Bank Sampah &bull; Edukasi Pemilahan &bull; Dampak Lingkungan Nyata

[**🌐 Buka Website**](https://USERNAME.github.io/NAMA-REPO/) &nbsp;•&nbsp; [**✨ Fitur**](#-fitur-utama) &nbsp;•&nbsp; [**🚀 Cara Menjalankan**](#-cara-menjalankan) &nbsp;•&nbsp; [**👥 Tim**](#-tim-penyusun)

</div>

---

## 🌿 Tentang NUSA ECO

**NUSA ECO** adalah platform web statis untuk edukasi dan manajemen **Bank Sampah Sekolah Adiwiyata**, dibangun dengan **HTML, CSS, dan Vanilla JavaScript**. Website ini mendukung digitalisasi pencatatan bank sampah sekolah, pemantauan dampak lingkungan, serta edukasi pemilahan sampah bagi siswa.

---

## ✨ Fitur Utama

| Halaman | Deskripsi |
|:--|:--|
| 🏡 **Beranda** <br/>`index.html` | Informasi program Sekolah Adiwiyata, edukasi pengelolaan sampah, **simulasi pemilahan sampah interaktif**, dan ringkasan indikator lingkungan. |
| 📊 **Dashboard** <br/>`dashboard.html` | Grafik komposisi sampah bulanan, tingkat partisipasi siswa, dan persentase pengelolaan prinsip **3R** (*Reduce, Reuse, Recycle*). |
| 🏦 **Bank Sampah** <br/>`banksampah.html` | Formulir pencatatan setoran sampah siswa yang tersimpan langsung secara lokal di browser. |
| 📷 **Scan Sampah** <br/>`scan-sampah.html` | Pemindaian & identifikasi jenis sampah lewat kamera perangkat, terhubung ke database `data/waste-database.json`. |
| 🌱 **EcoPoint & Impact** <br/>`ecopoint-impact.html` | Akumulasi poin lingkungan, jejak pengurangan emisi karbon, dan dampak penerapan prinsip 3R. |

---

## 🚀 Cara Menjalankan

Project sudah di-deploy lewat **GitHub Pages**, jadi bisa langsung dipakai tanpa instalasi:

1. 🌐 Buka tautan **GitHub Pages** project melalui browser (Chrome, Edge, Safari, atau browser mobile).
2. 📶 Pastikan koneksi internet aktif untuk memuat halaman dan aset pendukung (misalnya grafik Chart.js).
3. 📷 Izinkan akses kamera saat diminta pada halaman **Scan Sampah** agar fitur pemindaian berfungsi.
4. 🧭 Jelajahi seluruh menu: Beranda, Dashboard, Bank Sampah, Scan Sampah, dan EcoPoint Impact.

---

## 🛠️ Catatan Teknis

- **Akses langsung via GitHub Pages** — tidak perlu ekstrak ZIP, tidak perlu CMD/Terminal, dan tidak perlu Live Server.
- **Aman lewat HTTPS** — GitHub Pages memakai HTTPS, sehingga browser mengizinkan akses kamera untuk *Scan Sampah* dan pembacaan `data/waste-database.json` tanpa kendala *CORS / insecure context*.
- **Penyimpanan data (`localStorage`)** — data setoran dan poin disimpan di browser lewat `js/storage.js` dengan key `nusaeco-submissions-v1`. Data tetap ada selama cache/riwayat browser tidak dihapus, dan bersifat lokal per perangkat/browser.

---

## 👥 Tim Penyusun

<div align="center">

**© Disuruh Ngikut** &nbsp;|&nbsp; **SMKN 4 Kuningan**

| No | Nama Anggota |
|:-:|:--|
| 1 | Muhammad Ridhan Aisyfarizi |
| 2 | Satria Putra Anugrah |
| 3 | Almahesa |

<br/>

<img src="assets/logo.svg" alt="Logo NUSA ECO" width="64"/>

*Dibuat dengan 💚 untuk sekolah yang lebih hijau.*

</div>
