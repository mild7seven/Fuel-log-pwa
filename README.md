# Fuel Log PWA MVP

Offline-first PWA untuk pencatatan BBM kendaraan dengan IndexedDB.

## Fitur
- Profil kendaraan
- Input/edit/hapus transaksi BBM
- SPBU, tanggal, waktu, jenis BBM, liter, harga/L, total, nomor kendaraan
- Odometer dan validasi urutan
- Full tank flag
- Jarak, km/L, biaya/km
- Riwayat dan pencarian
- Scan struk via Tesseract.js
- OCR: kandidat SPBU, tanggal, waktu, BBM, liter, harga/L, total, plat
- Konfirmasi OCR sebelum simpan
- Arsip foto struk
- PWA/service worker

## Tidak ada
MID fuel level, pembayaran, cloud sync, GPS, Google Calendar.

## Run
Gunakan static server, misalnya `python -m http.server 8080`, lalu buka localhost:8080.
OCR memakai Tesseract.js CDN pada MVP; pencatatan manual tetap dapat digunakan offline.

## Phase 2 OCR
- Multi-pattern parser untuk Pertamina/Pertamax/Pertalite/Vivo/BP.
- Preprocessing lokal: grayscale, contrast enhancement, rotate 90°.
- Confidence gabungan OCR engine + kelengkapan field parser.
- Validasi volume × harga/L terhadap total.
- SHA-256 duplicate receipt detection sebelum save.
- Arsip foto struk di IndexedDB dan ditampilkan pada History.
- `node tests/ocr.test.js` untuk regression test parser.
- OCR engine tetap memakai Tesseract.js CDN; scan pertama membutuhkan koneksi jika engine belum tercache. Input manual tetap offline.
