# Panduan Penggunaan dan Data Uji

Dokumen ini berisi **akun demo**, **data contoh**, dan **langkah pengujian** aplikasi absensi
Dexa. Cocok dibaca oleh penguji yang ingin langsung mencoba aplikasi tanpa menyiapkan data dari nol.

> Untuk cara instalasi dan menjalankan aplikasi, lihat [README.md](./README.md).

## 1. Akun Demo

**Password seluruh akun: `password123`**. Semua ID memakai **UUID v4** yang di-generate
penguji pada berkas [`v4_uuids.txt`](./v4_uuids.txt). Password disimpan sebagai hash
**Argon2id** (library `argon2`), bukan bcrypt.

| Role | Email | Password | Terhubung ke | employee_id (UUID) |
|------|-------|----------|--------------|--------------------|
| **HRD** | `hrd@dexa.co.id` | `password123` | Rina Wijaya - HRD Manager | `da316c43-8747-4363-97ac-bd899df6bbd8` |
| **Karyawan** | `budi@dexa.co.id` | `password123` | Budi Santoso - Backend Engineer | `5a36515a-b9ab-4644-b8ef-ff15417c3ece` |
| **Karyawan** | `citra@dexa.co.id` | `password123` | Citra Lestari - UI/UX Designer | `a87f6074-210a-4ffe-946c-00c32be085b6` |

Buka **<http://localhost:5173>**, lalu login memakai salah satu akun di atas.
Setelah login, pengguna otomatis diarahkan ke **area sesuai role**:

- **HRD** -> `/admin/dashboard` (template admin desktop, dioptimalkan untuk laptop).
- **Karyawan** -> `/app/home` (mobile-first, ada bottom tab bar + kamera selfie).

## 2. Data Contoh (Seed)

Data uji didefinisikan pada [`docs/seed-data.sql`](./docs/seed-data.sql).

**`db_auth.users`**

| email | role | employee_id |
|-------|------|-------------|
| hrd@dexa.co.id | HRD | `da316c43-8747-4363-97ac-bd899df6bbd8` |
| budi@dexa.co.id | EMPLOYEE | `5a36515a-b9ab-4644-b8ef-ff15417c3ece` |
| citra@dexa.co.id | EMPLOYEE | `a87f6074-210a-4ffe-946c-00c32be085b6` |

**`db_employee.work_shifts`** - 3 shift contoh:

| Nama | Jam | Toleransi telat |
|------|-----|-----------------|
| Reguler (09:00 - 18:00) | 09:00-18:00 | 15 menit |
| Pagi (07:00 - 16:00) | 07:00-16:00 | 10 menit |
| Siang (13:00 - 22:00) | 13:00-22:00 | 10 menit |

**`db_employee.office_locations`** - titik kantor + **radius geofencing**:

| Nama | Koordinat | Radius |
|------|-----------|--------|
| Kantor Pusat Jakarta | -6.1836, 106.8325 | 150 m |
| Kantor Bandung | -6.9175, 107.6191 | 120 m |
| Kantor Surabaya | -7.2575, 112.7521 | 100 m |

**`db_employee.employees`** - 3 karyawan (Rina/Budi/Citra) lengkap dengan shift, email, dan telepon.

**`db_employee.holidays`** - 3 hari libur nasional, **`db_employee.announcements`** - 2 pengumuman.

**`db_attendance.attendances`** - absensi hari ini (Budi PRESENT WFO, Citra LATE) + kemarin (Budi WFH).

**`db_attendance.leave_requests`** / **`overtime_requests`** / **`attendance_corrections`** - contoh
pengajuan dengan status campuran (`APPROVED` / `PENDING`) untuk melatih alur persetujuan.

**`db_attendance.audit_logs`** - jejak audit contoh.

Tanggal absensi memakai `CURDATE()` sehingga data selalu relevan dengan hari pengujian.

## 3. Mengatur Ulang Data Uji (Reset)

Pilih salah satu cara berikut:

```bash
# A. Via CLI mysql (dari root project)
mysql -u root -p < docs/seed-data.sql
```

```bash
# B. Tanpa CLI mysql - memakai kredensial .env attendance-service
cd backend/attendance-service
node scripts/seed.js
```

Script akan mengosongkan tabel lalu mengisi ulang data contoh.

> **Penting:** jalankan ketiga service minimal sekali sebelum seeding agar TypeORM
> (`synchronize: true`) membuat seluruh tabel + kolom terbaru.

> **Catatan migrasi:** sejak versi UUID, skema lama (PK `int`) tidak kompatibel. Jika database
> masih memakai skema lama dan sinkronisasi TypeORM gagal
> (`Duplicate entry '' for key '...PRIMARY'`), hapus lalu buat ulang database
> (`db_auth`, `db_employee`, `db_attendance`) kemudian jalankan ulang service.

## 4. Panduan sebagai Karyawan (mobile-first, `/app`)

1. **Login** memakai `budi@dexa.co.id` - otomatis masuk ke **Beranda** (`/app/home`).
2. **Beranda** menampilkan: kartu salam + shift Anda, status absensi hari ini, **pemilih mode
   kerja** (WFO/WFH/WFA/Kunjungan), **panel lokasi + geofence**, tombol absen, dan pengumuman.
3. **Absen Masuk**:
   - Pilih **mode kerja**. Untuk **WFO** sistem menampilkan jarak ke kantor terdekat + status
     *di dalam / di luar area kantor* (berdasarkan radius yang diatur HRD).
   - Titik lokasi **diambil otomatis** begitu modal absen dibuka (tombol `Gunakan Lokasi Saya` bisa
     dipakai ulang). Panel lokasi menampilkan kantor terdekat beserta jarak dan radiusnya, dan tombol
     **Kirim** baru aktif setelah titik lokasi didapat.
   - Tekan **Absen Masuk** -> kamera selfie terbuka -> **Ambil Foto** -> **Gunakan Foto** -> **Kirim**.
   - Status otomatis `Hadir` atau `Terlambat` (dihitung dari jam mulai shift + toleransi HRD).
4. **Absen Keluar** aktif setelah check-in. Foto, GPS, alamat, dan durasi kerja dicatat.
5. Tab **Riwayat** (`/app/history`): pilih bulan, lihat rekap (hadir/telat/cuti/durasi) dan
   thumbnail foto (klik untuk memperbesar).
6. Tab **Pengajuan** (`/app/requests`) berisi 3 jenis pengajuan dengan saldo cuti tahunan:
   - **Cuti / Izin** (Cuti Tahunan, Sakit, Izin, Cuti Tanpa Gaji) + hitung jumlah hari.
   - **Lembur** (tanggal + jam mulai/selesai; durasi dihitung server).
   - **Koreksi** (lupa absen masuk/keluar).
   Pengajuan `PENDING` bisa **dibatalkan** oleh karyawan.
7. Tab **Profil** (`/app/profile`): data karyawan, shift, tombol **ubah password** akun sendiri,
   dan tombol keluar.

## 5. Panduan sebagai HRD (admin desktop, `/admin`)

1. **Login** memakai `hrd@dexa.co.id` - masuk ke **Dashboard** (`/admin/dashboard`):
   statistik hari ini (hadir, terlambat, cuti/izin, WFH, di kantor, di luar geofence, jumlah
   pengajuan menunggu).
2. **Data Karyawan** (`/admin/employees`): cari/filter, tambah/edit (sekaligus opsional **buat akun
   login**), **ubah password** akun karyawan, serta aktif/nonaktif. Setiap karyawan dapat
   **ditugaskan ke shift**.
3. **Data Absensi** (`/admin/attendances`): filter rentang tanggal + status + mode kerja, buka
   **detail** (foto masuk/keluar, alamat, koordinat, **Lihat di Maps**, status geofence), dan
   **Export CSV**. Di detail ada juga tautan **rute ke kantor terdekat** (Google Maps mode
   berkendara) plus jarak meter dari server.
4. **Persetujuan** (`/admin/approvals`): tab Cuti/Izin, Lembur, Koreksi - **Setujui/Tolak**
   dengan catatan. Kolom **Karyawan** menampilkan nama + NIK (dilengkapi attendance-service
   dari employee-service, bukan `employeeId`). Persetujuan koreksi otomatis memperbarui jam
   absensi terkait.
5. **Lokasi Kantor** (`/admin/office-locations`): atur titik kantor + **radius geofencing (meter)**.
   Tombol **Gunakan Lokasi Saya** memudahkan mengambil koordinat saat berada di lokasi.
6. **Shift Kerja** (`/admin/work-shifts`): master jam kerja + toleransi keterlambatan.
7. **Hari Libur** (`/admin/holidays`) dan **Pengumuman** (`/admin/announcements`).
8. **Laporan** (`/admin/reports`): ringkasan statistik + pratinjau tabel + **Export CSV**.

## 6. Menambah Karyawan Baru Agar Bisa Login

Sejak versi ini akun login dibuat **dari UI HRD** (employee-service memanggil auth-service):

1. HRD -> **Data Karyawan** -> **Tambah Karyawan** (isi NIK, nama, email, departemen, shift).
2. Centang **Buatkan akun login sekarang** (aktif secara default), lalu isi email akun, role, dan
   password -> **Simpan Karyawan**. Data karyawan + akun login dibuat sekaligus.
3. Bila akun belum dibuat / password lupa: pada baris karyawan klik **Buat Akun** (bila belum punya
   akun) atau **Ubah Password** (HRD menetapkan password baru tanpa perlu tahu password lama).
4. Karyawan tersebut langsung dapat login dan melakukan absensi.

Alternatif manual (tanpa UI):

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"andi@dexa.co.id","password":"password123","role":"EMPLOYEE"}'
```

Lalu set `employee_id` pada akun user (UUID karyawan dari `db_employee.employees.id`):

```sql
UPDATE db_auth.users SET employee_id = '<uuid-karyawan>' WHERE email = 'andi@dexa.co.id';
```

## 7. Skenario Pengujian yang Disarankan

| # | Skenario | Hasil yang Diharapkan |
|---|----------|-----------------------|
| 1 | Login password salah | Muncul pesan "Email atau password salah" |
| 2 | Login HRD lalu buka `/app/home` | Ditolak / diarahkan kembali sesuai role |
| 3 | Login karyawan lalu buka `/admin/dashboard` | Ditolak / diarahkan kembali sesuai role |
| 4 | Karyawan WFO absen di luar radius kantor | Tetap tercatat namun ditandai **di luar area** dan muncul di statistik HRD |
| 5 | Karyawan absen tanpa memilih mode WFO (mis. WFH) | Geofence tidak diwajibkan, selfie dan GPS tetap dicatat |
| 6 | Check-in sebelum jam shift | Status `Hadir` |
| 7 | Check-in setelah jam shift + toleransi | Status `Terlambat` + `lateMinutes` terisi |
| 8 | Check-in dua kali di hari yang sama | Ditolak (satu absen per karyawan per hari) |
| 9 | Ajukan cuti lalu login HRD -> Persetujuan | Pengajuan muncul dan bisa disetujui/ditolak |
| 10 | Setujui pengajuan koreksi | Jam absensi pada tanggal tersebut ikut diperbarui |
| 11 | HRD membuat akun untuk karyawan baru | Karyawan baru bisa login |
| 12 | HRD export laporan CSV | Berkas `.csv` terunduh |
| 13 | Cek **Jejak Audit** (`/api/audit-logs`) | Terisi aksi absen dan approval |
| 14 | HRD menekan **Ubah Password** pada karyawan | Karyawan bisa login dengan password baru |
| 15 | Karyawan mengubah password di tab Profil | Password baru berlaku untuk login berikutnya |
| 16 | Karyawan dan HRD membuka aplikasi di layar 1024-1279 px | Sidebar HRD tetap terlihat; area karyawan tetap memakai tab bar bawah |

## 8. Catatan Penggunaan

- **Kamera** memerlukan izin browser. Jalankan lewat `localhost` (bukan IP jaringan) agar browser
  mengizinkan akses kamera.
- **Lokasi** diambil via `navigator.geolocation`. Bila izin ditolak, absensi tetap dapat dikirim
  tanpa koordinat (geofence tidak dapat divalidasi).
- **Alamat** hasil reverse-geocoding gratis (BigDataCloud). Bila jaringan gagal, alamat "-".
- Foto absensi disimpan di `backend/attendance-service/uploads/` dan diakses via
  `http://localhost:3000/uploads/<nama-file>`.
- Satu akun hanya bisa check-in **sekali per hari** (dijaga `UNIQUE(employee_id, date)`).
- **Waktu absensi selalu diambil dari server**, bukan jam perangkat.
- Mode kerja **WFO** saja yang divalidasi terhadap geofence; **WFH/WFA/Kunjungan** tetap mencatat
  selfie + GPS untuk audit.
- Password dapat diubah dari UI: HRD lewat **Data Karyawan -> Ubah Password**, karyawan lewat
  **Profil -> Keamanan**. Bila password akun demo di atas diganti, kredensial pada dokumen ini tidak
  berlaku lagi sampai `docs/seed-data.sql` dijalankan ulang.

