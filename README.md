# Attendance App - Absensi Karyawan (WFH / Flexible Working Space)

Aplikasi absensi karyawan bertema **Gaji.id-style**: karyawan melakukan **check-in/check-out dengan
foto selfie**, **GPS**, dan validasi **geofencing** dari perangkat mobile, sedangkan HRD mengelola
data karyawan, jadwal/shift, lokasi kantor, pengajuan (cuti/lembur/koreksi), laporan, dan audit.

Backend dibangun sebagai **microservices** (Auth, Employee, Attendance) yang diakses lewat satu
**API Gateway**; masing-masing service memiliki database sendiri di dalam satu instance MySQL.
Seluruh **Primary Key memakai UUID v4**.

## Daftar Isi

- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Arsitektur](#arsitektur)
- [Struktur Folder](#struktur-folder)
- [Prasyarat](#prasyarat)
- [Setup Database](#1-setup-database)
- [Konfigurasi Environment](#2-konfigurasi-environment)
- [Menjalankan Aplikasi](#3-menjalankan-aplikasi)
- [Akun Demo dan Data Uji](#akun-demo-dan-data-uji)
- [Alur Penggunaan](#alur-penggunaan)
- [Daftar Endpoint API](#daftar-endpoint-api)
- [Dokumentasi API (Swagger)](#dokumentasi-api-swagger)
- [Struktur Database](#struktur-database)
- [Keputusan Desain](#keputusan-desain)

## Fitur

**Karyawan (role `EMPLOYEE`) - mobile-first (`/app`)**
- Login JWT; layout HP dengan **bottom tab bar** (Beranda, Riwayat, Pengajuan, Profil).
- Beranda: kartu shift, status absensi hari ini, pemilih **mode kerja** (WFO/WFH/WFA/Kunjungan).
- **Check-in dengan selfie** (kamera depan) + **GPS** + alamat hasil reverse-geocoding.
- **Geofencing**: titik lokasi diambil otomatis dan wajib ada sebelum absen dikirim; panel
  menampilkan jarak ke kantor terdekat dan status di dalam/di luar radius.
- **Deteksi keterlambatan** otomatis berdasarkan shift + toleransi (dihitung di server).
- **Check-out** dengan foto, GPS, dan perhitungan durasi kerja + pulang cepat.
- Riwayat bulanan + rekap (hadir/terlambat/cuti/durasi) + thumbnail foto absensi.
- **Pengajuan**: Cuti/Izin/Sakit, **Lembur**, **Koreksi absensi** + **saldo cuti tahunan**.
- **Ubah password** akun sendiri dari tab **Profil** (PATCH `/api/auth/password`).
- Pengumuman dari HRD.

**HRD (role `HRD`) - admin desktop (`/admin`)**
- Template admin TailAdmin (sidebar + header), dioptimalkan untuk laptop.
- **Dashboard** statistik: hadir, terlambat, cuti/izin, WFH/WFA, di kantor, **di luar geofence**,
  jumlah pengajuan menunggu.
- **Manajemen Karyawan**: CRUD, filter, penugasan shift, **buatkan akun login sekaligus saat
  menambah karyawan** (inter-service), **ubah password** akun karyawan tanpa tahu password lama,
  aktif/nonaktif.
- **Data Absensi**: filter periode/status/mode, detail foto + titik koordinat, tautan **Lihat di
  Maps** dan **rute ke kantor terdekat**, export CSV.
- **Persetujuan**: setujui/tolak Cuti/Izin, Lembur, dan Koreksi + catatan reviewer. Kolom
  Karyawan menampilkan nama dan NIK (bukan ID) karena attendance-service melengkapinya dari
  employee-service saat daftar diminta HRD.
- **Lokasi Kantor**: atur titik kantor + **radius geofencing (meter)**.
- **Shift Kerja**: master jam kerja + toleransi keterlambatan.
- **Hari Libur** dan **Pengumuman**.
- **Laporan** + **Export CSV** + **Jejak Audit** (`/api/audit-logs`).

## Tech Stack

**Backend**
- TypeScript + NestJS, MySQL + TypeORM (UUID v4 sebagai PK)
- JWT + Passport + **Argon2id** (`argon2`), class-validator + class-transformer
- Multer (upload foto absensi ke `uploads/`), Swagger (`@nestjs/swagger`)
- Komunikasi antar-service memakai `fetch` bawaan Node

**Frontend**
- React 19 + Vite (TypeScript), Tailwind CSS + TailAdmin React (FREE)
- Axios (interceptor JWT dan handling 401), React Router v6, Zustand
- React Hook Form + Zod, react-webcam (komponen `CameraCapture`)

## Arsitektur

```
React (Vite) :5173
  |
  v
API Gateway :3000 (NestJS, hanya proxy)
  |
  +-- Auth Service :3001        -> db_auth
  +-- Employee Service :3002    -> db_employee   (karyawan, shift, lokasi kantor, libur, pengumuman)
  +-- Attendance Service :3003  -> db_attendance (absensi, cuti, lembur, koreksi, audit)
```

- Setiap service punya database sendiri dalam satu instance MySQL.
- Komunikasi antar-service via HTTP:
  - **attendance-service -> employee-service** (ambil shift dan lokasi kantor untuk hitung telat dan geofence).
  - **employee-service -> auth-service** (buat akun login karyawan).
- API Gateway hanya meneruskan request dan tidak menyimpan business logic.
- Tidak ada foreign key antar database; referensi divalidasi di application layer.

## Struktur Folder

```
project-root/
  README.md
  GUIDELINE.md
  docs/
    database-setup.sql
    seed-data.sql
  backend/
    api-gateway/        (:3000)
    auth-service/       (:3001)
    employee-service/   (:3002)
    attendance-service/ (:3003)
      scripts/seed.js   (runner seed tanpa CLI mysql; butuh mysql2 dari service ini)
  frontend/             (:5173)
    src/
      api/              (auth, attendances, employees, masters, requests)
      components/       (CameraCapture, DataTable, form/, ui/)
      layouts/          (AppLayout/AppSidebar = admin desktop,
                         MobileAppLayout/MobileTabBar = aplikasi karyawan)
      pages/
        auth/
        employee/       (Home, History, Requests, Profile)
        hrd/            (Dashboard, Employees, Attendances, Approvals,
                         OfficeLocations, WorkShifts, Holidays,
                         Announcements, Reports)
      lib/              (axios, auth, attendance, employee, requests, geolocation)
      routes/           (/app/* mobile, /admin/* desktop)
      stores/           (authStore, themeStore)
      types/            (attendance, employee, master, requests)
  logs/                 (opsional: output service saat dijalankan background)
```

## Prasyarat

- **Node.js** (versi LTS) dan npm.
- **MySQL** - MySQL Server lokal, XAMPP, atau layanan cloud.

## 1. Setup Database

Buat 3 database (tanpa perlu membuat tabel - TypeORM membuatnya otomatis):

```bash
mysql -u root -p < docs/database-setup.sql
```

Setara dengan:

```sql
CREATE DATABASE IF NOT EXISTS db_auth CHAR SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_employee CHAR SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_attendance CHAR SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 2. Konfigurasi Environment

Setiap service memiliki `.env` sendiri (sesuaikan kredensial MySQL bila perlu):

**`backend/auth-service/.env`**
```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=root
DB_NAME=db_auth
JWT_SECRET=rahasia_super_aman
JWT_EXPIRES_IN=1d
```

**`backend/employee-service/.env`** - tambahan `AUTH_SERVICE_URL` (untuk membuat akun login).
**`backend/attendance-service/.env`** - tambahan `UPLOAD_DIR=./uploads` dan `EMPLOYEE_SERVICE_URL`.
**`backend/api-gateway/.env`** - `AUTH_SERVICE_URL`, `EMPLOYEE_SERVICE_URL`, `ATTENDANCE_SERVICE_URL`,
`JWT_SECRET`, `CORS_ORIGIN=http://localhost:5173`.

> `JWT_SECRET` **harus sama** di seluruh service dan gateway.
> `AUTH_SERVICE_URL`/`EMPLOYEE_SERVICE_URL` dipakai untuk komunikasi antar-service.

## 3. Menjalankan Aplikasi

Jalankan tiap komponen di terminal terpisah (urutan: **auth -> employee -> attendance -> gateway -> frontend**).

```bash
# Terminal 1 - Auth Service (:3001)
cd backend/auth-service && npm install && npm run start:dev
```

```bash
# Terminal 2 - Employee Service (:3002)
cd backend/employee-service && npm install && npm run start:dev
```

```bash
# Terminal 3 - Attendance Service (:3003)
cd backend/attendance-service && npm install && npm run start:dev
```

```bash
# Terminal 4 - API Gateway (:3000)
cd backend/api-gateway && npm install && npm run start:dev
```

```bash
# Terminal 5 - Frontend (:5173)
cd frontend && npm install && npm run dev
```

Setelah semua berjalan, buka **<http://localhost:5173>** dan login memakai akun demo.

### Mengisi data contoh (seed)

Service harus pernah dijalankan minimal sekali (agar tabel dibuat), lalu:

```bash
# Cara A - CLI mysql
mysql -u root -p < docs/seed-data.sql

# Cara B - tanpa CLI mysql (memakai kredensial .env attendance-service)
cd backend/attendance-service && node scripts/seed.js
```

## Akun Demo dan Data Uji

Password seluruh akun: **`password123`**.

| Role | Email | Terhubung ke |
|------|-------|--------------|
| HRD | `hrd@dexa.co.id` | Rina Wijaya - HRD Manager |
| Karyawan | `budi@dexa.co.id` | Budi Santoso - Backend Engineer |
| Karyawan | `citra@dexa.co.id` | Citra Lestari - UI/UX Designer |

Detail data contoh (shift, lokasi kantor + radius, absensi, pengajuan) ada di
[GUIDELINE.md](./GUIDELINE.md).

## Alur Penggunaan

1. **HRD** login -> `/admin/dashboard`.
   Atur **Lokasi Kantor** (titik + radius geofencing) dan **Shift Kerja** terlebih dahulu.
2. **HRD** menambah karyawan di **Data Karyawan** dan menekan **Buat Akun** agar karyawan bisa login.
3. **Karyawan** login -> `/app/home`, memilih mode kerja, lalu **Absen Masuk** dengan selfie.
   Titik GPS diambil otomatis dan tombol kirim baru aktif setelah titik didapat; untuk **WFO**
   sistem menampilkan jarak ke kantor terdekat dan status geofence.
4. **Karyawan** mengajukan **Cuti/Lembur/Koreksi** dari tab **Pengajuan**.
5. **HRD** memproses pengajuan di **Persetujuan**; keterlambatan/geofence terlihat di
   **Dashboard**, **Data Absensi**, dan **Laporan**.

## Daftar Endpoint API

Semua endpoint diakses lewat gateway `http://localhost:3000`.

### Auth Service

| Method | Endpoint | Akses | Keterangan |
|--------|----------|-------|------------|
| POST | `/api/auth/register` | publik | Registrasi user |
| POST | `/api/auth/login` | publik | Login -> JWT |
| GET | `/api/auth/me` | semua | Data user dari token |
| PATCH | `/api/auth/password` | semua | Ganti password sendiri (wajib password lama) |
| PATCH | `/api/auth/users/:id/password` | HRD | Reset password akun karyawan |

### Employee Service

| Method | Endpoint | Akses | Keterangan |
|--------|----------|-------|------------|
| GET | `/api/employees` | HRD | List + filter (search, department, status) |
| GET | `/api/employees/me` | semua | Data karyawan sendiri (+ shift) |
| GET | `/api/employees/:id` | HRD | Detail karyawan |
| POST | `/api/employees` | HRD | Tambah karyawan |
| PATCH | `/api/employees/:id` | HRD | Update karyawan |
| DELETE | `/api/employees/:id` | HRD | Soft delete (INACTIVE) |
| POST | `/api/employees/:id/account` | HRD | Buatkan akun login |
| PATCH | `/api/employees/:id/account/password` | HRD | Ubah password akun karyawan |
| GET | `/api/office-locations` | HRD | List lokasi kantor |
| GET | `/api/office-locations/active` | semua | Lokasi aktif (untuk geofencing) |
| POST/PATCH/DELETE | `/api/office-locations[/:id]` | HRD | CRUD lokasi + radius |
| GET | `/api/work-shifts` | HRD | List shift |
| GET | `/api/work-shifts/active` | semua | Shift aktif |
| POST/PATCH/DELETE | `/api/work-shifts[/:id]` | HRD | CRUD shift |
| GET | `/api/holidays` | semua | List hari libur (bisa filter rentang) |
| POST/PATCH/DELETE | `/api/holidays[/:id]` | HRD | CRUD hari libur |
| GET | `/api/announcements` | semua | Pengumuman aktif sesuai role |
| GET | `/api/announcements/admin` | HRD | Semua pengumuman (termasuk nonaktif) |
| POST/PATCH/DELETE | `/api/announcements[/:id]` | HRD | CRUD pengumuman |

### Attendance Service

| Method | Endpoint | Akses | Keterangan |
|--------|----------|-------|------------|
| POST | `/api/attendances/check-in` | EMPLOYEE | Absen masuk (multipart foto + GPS) |
| POST | `/api/attendances/check-out` | EMPLOYEE | Absen keluar (multipart, foto opsional) |
| GET | `/api/attendances/me` | EMPLOYEE | Riwayat absensi pribadi (pagination) |
| GET | `/api/attendances/me/today` | EMPLOYEE | Absensi hari ini |
| GET | `/api/attendances/me/calendar?month=YYYY-MM` | EMPLOYEE | Rekap bulanan |
| GET | `/api/attendances/summary` | HRD | Statistik ringkas (dashboard) |
| GET | `/api/attendances/export` | HRD | Export laporan CSV (siap dibuka di Excel) |
| GET | `/api/attendances` | HRD | Semua absensi + filter |
| GET | `/api/attendances/:id` | HRD | Detail absensi |
| POST | `/api/leaves` | EMPLOYEE | Ajukan cuti/izin/sakit |
| GET | `/api/leaves/me` | EMPLOYEE | Riwayat pengajuan sendiri |
| GET | `/api/leaves/balance/me` | EMPLOYEE | Saldo cuti tahunan |
| PATCH | `/api/leaves/:id/cancel` | EMPLOYEE | Batalkan pengajuan sendiri |
| GET | `/api/leaves` | HRD | Semua pengajuan + filter status |
| PATCH | `/api/leaves/:id/review` | HRD | Setujui/tolak |
| POST | `/api/overtimes`, `/me`, `/:id/cancel` | EMPLOYEE | Pengajuan lembur |
| GET/PATCH | `/api/overtimes`, `/:id/review` | HRD | List dan keputusan lembur |
| POST | `/api/corrections`, `/me`, `/:id/cancel` | EMPLOYEE | Koreksi absensi |
| GET/PATCH | `/api/corrections`, `/:id/review` | HRD | List dan keputusan koreksi |
| GET | `/api/audit-logs?limit=` | HRD | Jejak audit |
| GET | `/uploads/<nama-file>` | publik | Serve foto absensi (via gateway) |

## Dokumentasi API (Swagger)

Setiap service mengekspos Swagger UI:

| Service | URL |
|---------|-----|
| Auth | <http://localhost:3001/api/docs> |
| Employee | <http://localhost:3002/api/docs> |
| Attendance | <http://localhost:3003/api/docs> |

Gunakan tombol **Authorize** lalu tempel JWT (`Bearer`) hasil login.

## Struktur Database

> Semua Primary Key bertipe **UUID v4** (`varchar(36)`). Tidak ada foreign key antar database
> (aturan microservices) - referensi divalidasi di application layer.

**`db_auth` -> `users`**

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | varchar(36) PK | UUID v4 |
| email | varchar(100) | unique |
| password_hash | varchar(255) | Argon2id (`argon2`) |
| role | enum | `EMPLOYEE`, `HRD` |
| employee_id | varchar(36) nullable | referensi ke `db_employee.employees.id` |
| created_at, updated_at | timestamp | |

**`db_employee` -> `employees`**

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | varchar(36) PK | UUID v4 |
| user_id | varchar(36) nullable | unique, referensi ke `db_auth.users.id` |
| email | varchar(100) nullable | unique |
| nik | varchar(20) | unique |
| full_name, position, department, phone, photo_url | varchar | |
| join_date | date | |
| status | enum | `ACTIVE`, `INACTIVE` |
| shift_id | varchar(36) nullable | referensi ke `work_shifts.id` |

**`db_employee` -> master lain**

- `work_shifts` - `id`, `name`, `start_time` (`HH:mm`), `end_time`, `late_tolerance_minutes`, `is_active`.
- `office_locations` - `id`, `name`, `address`, `latitude`, `longitude`, **`radius_meters`**, `is_active`.
- `holidays` - `id`, `date` (unique), `name`.
- `announcements` - `id`, `title`, `body`, `audience` (`ALL`/`EMPLOYEE`/`HRD`), `is_active`, `created_by`.

**`db_attendance` -> `attendances`** (UNIQUE `(employee_id, date)`)

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | varchar(36) PK | UUID v4 |
| employee_id | varchar(36) | referensi ke `db_employee.employees.id` |
| date | date | |
| work_mode | enum | `WFO`, `WFH`, `WFA`, `FIELD` |
| check_in_time / check_out_time | datetime nullable | waktu server |
| check_in_photo_url / check_out_photo_url | varchar(255) nullable | |
| check_in_latitude/longitude, check_out_latitude/longitude | decimal(10,7) nullable | |
| check_in_address / check_out_address | varchar(255) nullable | hasil reverse-geocode |
| office_location_id / office_location_name | varchar / varchar(100) nullable | kantor terdekat |
| distance_meters | int nullable | jarak ke kantor |
| within_geofence | boolean nullable | validasi radius (mode WFO) |
| shift_id / shift_name | varchar nullable | snapshot shift saat absen |
| late_minutes / early_leave_minutes / work_minutes | int | hasil perhitungan server |
| status | enum | `PRESENT`, `LATE`, `ABSENT`, `LEAVE`, `SICK`, `PERMIT` |
| check_in_notes / check_out_notes | text nullable | |

**`db_attendance` -> pengajuan dan audit**

- `leave_requests` - `type` (`ANNUAL`/`SICK`/`PERMIT`/`UNPAID`), `start_date`, `end_date`, `days`,
  `reason`, `attachment_url`, `status`, `reviewed_by`, `reviewed_at`, `review_note`.
- `overtime_requests` - `date`, `start_time`, `end_time`, `hours`, `reason`, `status`, `reviewed_*`.
- `attendance_corrections` - `date`, `requested_check_in`, `requested_check_out`, `reason`, `status`, `reviewed_*`.
- `audit_logs` - `actor_id`, `actor_role`, `action`, `entity`, `entity_id`, `description`, `created_at`.

## Keputusan Desain

- **UUID v4 sebagai PK** - ID tidak mudah ditebak dan aman bila data digabung antar environment.
- **Microservices + database per service** - komunikasi via HTTP, tanpa FK antar database.
- **API Gateway tanpa business logic** - hanya meneruskan request (termasuk multipart upload foto).
- **Perhitungan telat dan geofence di server** - attendance-service memanggil employee-service agar
  aturan bersifat otoritatif (bukan bergantung jam/lokasi perangkat).
- **Pemisahan layout per role** - HRD memakai template admin desktop (`AppLayout`), karyawan memakai
  layout aplikasi mobile (`MobileAppLayout` + `MobileTabBar` di bawah, kolom selebar 520px).
- **`cn()` dengan tailwind-merge terkonfigurasi** - skala font custom (`text-theme-*`, `text-title-*`)
  didaftarkan sebagai `font-size` supaya tidak dianggap warna teks (kalau tidak, `text-white` pada
  tombol primary ikut terhapus dan label tombol biru jadi gelap).
- **Waktu absensi dari server** - mencegah manipulasi jam perangkat.
- **Lokasi wajib sebelum absen** - titik GPS diambil otomatis saat modal absen dibuka dan tombol
  kirim baru aktif setelah titik didapat. Validasi geofence tetap dikerjakan server.
- **Mode kerja + geofence** - WFO divalidasi radius, WFH/WFA/Kunjungan tetap mencatat selfie + GPS.
- **Rute absen ke kantor di detail absensi HRD** - cukup memakai tautan Google Maps (mode
  berkendara), jadi tidak perlu Google Maps API key.
- **`CameraCapture`** - membungkus `react-webcam` untuk selfie check-in/check-out.
- **`DataTable` server-side** - pagination/pencarian dikerjakan backend.
- **Swagger + respons konsisten** - format response seragam di semua service.

---

Dibuat dengan NestJS, TypeORM, MySQL (UUID v4), dan React 19 + Vite + Tailwind CSS.




