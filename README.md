# Undangan Digital Khitan – Adrian Riski Pratama

## Isi folder
- `index.html` – struktur dan konten undangan.
- `style.css` – tampilan responsif untuk ponsel dan desktop.
- `script.js` – interaksi, RSVP, dan pemuatan daftar ucapan.
- `Code.gs` – backend Google Apps Script untuk menyimpan RSVP ke Google Sheets.
- `assets/foto-keluarga.jpg` – crop foto keluarga dari foto undangan yang dikirim.

## 1. Siapkan Google Sheets
1. Buat Google Spreadsheet baru, misalnya `RSVP Khitan Adrian`.
2. Salin ID spreadsheet dari URL: bagian di antara `/d/` dan `/edit`.
3. Buka https://script.google.com/ lalu buat project baru.
4. Hapus kode contoh dan tempel seluruh isi file `Code.gs`.
5. Di Apps Script, buka **Project Settings** → **Script Properties** → **Add script property**:
   - Property: `SPREADSHEET_ID`
   - Value: ID spreadsheet pada langkah 2.
6. Pilih **Deploy** → **New deployment** → ikon roda gigi → **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Klik Deploy, berikan izin akses, lalu salin URL Web App yang berakhiran `/exec`.

## 2. Hubungkan website ke Google Sheets
Buka `script.js`, cari baris:
`const SHEETS_WEB_APP_URL = "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";`
Ganti teks di dalam tanda kutip dengan URL Web App `/exec` yang didapat dari Apps Script. Simpan.

## 3. Jalankan / publikasikan
- Untuk tes sederhana, buka `index.html` di browser. Sebagian browser membatasi fitur saat file dibuka langsung; untuk penggunaan publik, unggah seluruh folder ke hosting statis seperti GitHub Pages, Netlify, atau hosting milik sendiri.
- Pastikan `assets/foto-keluarga.jpg` ikut diunggah bersama tiga file utama.
- Tes RSVP dari halaman yang sudah online. Setelah sukses, baris baru akan masuk ke Google Sheets dan ucapan akan tampil di daftar.

## 4. Personalisasi
- Nama tamu dapat diisi lewat tautan seperti `https://domain-undangan.com/?to=Keluarga%20Bapak%20Andi`.
- Teks acara, alamat, dan nama keluarga dapat diedit di `index.html`.
- Link peta saat ini memakai pencarian alamat berdasarkan teks. Untuk titik rumah yang akurat, ganti URL Google Maps pada tombol lokasi dengan link pin lokasi yang tepat.

## Catatan penting
- Foto keluarga pada paket ini diambil dari foto kecil yang tercetak di kartu undangan yang diunggah, sehingga kualitasnya terbatas. Ganti `assets/foto-keluarga.jpg` dengan foto keluarga asli resolusi tinggi agar bagian sampul lebih tajam.
- RSVP akan masuk ke spreadsheet milik akun Google yang men-deploy Apps Script. Jangan membagikan akses edit spreadsheet kepada publik.
- Jika mengubah kode Apps Script setelah deploy, buka **Deploy → Manage deployments → Edit** lalu pilih versi baru agar perubahan aktif.
