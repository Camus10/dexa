-- ==========================================================================
-- Seed Data Uji - Aplikasi Absensi Karyawan (Dexa Group)
-- ==========================================================================
-- Mengosongkan tabel lalu mengisi ulang data contoh (akun demo + absensi).
--
-- Semua Primary Key memakai UUID v4 (lihat v4_uuids.txt) dan password
-- disimpan sebagai hash Argon2id (library argon2), bukan bcrypt.
--
-- Cara pakai:
--   A. Via CLI mysql (dari root project)
--      mysql -u root -p < docs/seed-data.sql
--   B. Tanpa CLI mysql (memakai kredensial .env attendance-service)
--      cd backend/attendance-service && node scripts/seed.js
-- ==========================================================================

-- Akun demo (password: password123):
--   hrd@dexa.co.id     -> Rina Wijaya  (HRD)
--   budi@dexa.co.id    -> Budi Santoso (EMPLOYEE)
--   citra@dexa.co.id   -> Citra Lestari (EMPLOYEE)

SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `db_auth` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `db_employee` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `db_attendance` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------
-- db_auth
-- ------------------------------------------------------------------------
USE `db_auth`;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('EMPLOYEE','HRD') NOT NULL DEFAULT 'EMPLOYEE',
  `employee_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `users` VALUES ('762a8a35-3f22-485e-accf-1389cde6e960','citra@dexa.co.id','$argon2id$v=19$m=65536,p=4,t=3$w77xbeRwLru+f9AkS/V0hg$1a/SSH9UY/8AeP3aX3dODA/Cm5bNxR5FGH+3nInCVLs','EMPLOYEE','a87f6074-210a-4ffe-946c-00c32be085b6',NOW(6),NOW(6)),('85a4f6e4-4230-4c67-8a28-b4bf7798cd76','budi@dexa.co.id','$argon2id$v=19$m=65536,p=4,t=3$pGelrfljD0gPb2AyVBzAmA$UH/FfPB54YX9bc+EIkffp8LvVACoOjxgP2YxJxo8ctc','EMPLOYEE','5a36515a-b9ab-4644-b8ef-ff15417c3ece',NOW(6),NOW(6)),('bc123f32-3332-4a28-9aaa-c18d124ecf85','hrd@dexa.co.id','$argon2id$v=19$m=65536,p=4,t=3$m7oBXh1SnsffwXRHL43LtA$4fis1g54US00wpkuSqz4wfal5EqpkBTIUO5LXtX6VW0','HRD','da316c43-8747-4363-97ac-bd899df6bbd8',NOW(6),NOW(6));

-- ------------------------------------------------------------------------
-- db_employee
-- ------------------------------------------------------------------------
USE `db_employee`;

DROP TABLE IF EXISTS `announcements`;
CREATE TABLE `announcements` (
  `id` varchar(36) NOT NULL,
  `title` varchar(150) NOT NULL,
  `body` text NOT NULL,
  `audience` enum('ALL','EMPLOYEE','HRD') NOT NULL DEFAULT 'ALL',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `announcements` VALUES ('290470fc-703b-480c-804a-1f519844674d','Kebijakan WFO/WFH','WFO wajib absen di dalam radius kantor. WFH/WFA tetap wajib selfie dan GPS aktif.','EMPLOYEE',1,'bc123f32-3332-4a28-9aaa-c18d124ecf85',NOW(6),NOW(6)),('eb4ced15-7393-4551-bd2c-2ccb1e5a4b93','Selamat Datang di Aplikasi Absensi Dexa','Silakan gunakan aplikasi ini untuk absen harian, pengajuan cuti, lembur, dan koreksi absensi.','ALL',1,'bc123f32-3332-4a28-9aaa-c18d124ecf85',NOW(6),NOW(6));

DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `nik` varchar(20) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `position` varchar(50) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `join_date` date DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `shift_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_489786f7733ad24dbb649035d7` (`nik`),
  UNIQUE KEY `IDX_2d83c53c3e553a48dadb9722e3` (`user_id`),
  UNIQUE KEY `IDX_765bc1ac8967533a04c74a9f6a` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `employees` VALUES ('5a36515a-b9ab-4644-b8ef-ff15417c3ece','85a4f6e4-4230-4c67-8a28-b4bf7798cd76','budi@dexa.co.id','DXA-0002','Budi Santoso','Backend Engineer','Engineering','081200000002',NULL,'2023-03-01','ACTIVE','accd7878-d6f1-4a85-ac44-8603336a8087',NOW(6),NOW(6)),('a87f6074-210a-4ffe-946c-00c32be085b6','762a8a35-3f22-485e-accf-1389cde6e960','citra@dexa.co.id','DXA-0003','Citra Lestari','UI/UX Designer','Product','081200000003',NULL,'2023-07-15','ACTIVE','57bb9c6a-1135-4bcb-aae2-d488b588982a',NOW(6),NOW(6)),('da316c43-8747-4363-97ac-bd899df6bbd8','bc123f32-3332-4a28-9aaa-c18d124ecf85','hrd@dexa.co.id','DXA-0001','Rina Wijaya','HRD Manager','Human Resource','081200000001',NULL,'2022-01-10','ACTIVE','accd7878-d6f1-4a85-ac44-8603336a8087',NOW(6),NOW(6));

DROP TABLE IF EXISTS `holidays`;
CREATE TABLE `holidays` (
  `id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_40dfddee0c0d7125c767d8962b` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `holidays` VALUES ('804fcab2-c5bd-4681-8a0d-a1c9f7c99ae5','2026-01-01','Tahun Baru Masehi',NOW(6)),('a3b5eb89-abc2-4271-b093-f977ccc0fd26','2026-03-19','Hari Raya Nyepi',NOW(6)),('cd067cab-b577-4ffe-ba7f-eab9e1afaa5d','2026-05-01','Hari Buruh Internasional',NOW(6));

DROP TABLE IF EXISTS `office_locations`;
CREATE TABLE `office_locations` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `address` text,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `radius_meters` int NOT NULL DEFAULT '100',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `office_locations` VALUES ('049ab897-b8c7-4c4d-b337-5480acebcb2a','Kantor Surabaya','Jl. Tunjungan No. 1, Surabaya',-7.2575000,112.7521000,100,1,NOW(6),NOW(6)),('48b1f246-47e5-452c-9e0a-95cb747d257e','Kantor Pusat Jakarta','Jl. K.H. Wahid Hasyim No. 162, Jakarta Pusat',-6.1836000,106.8325000,150,1,NOW(6),NOW(6)),('5bdb1c0e-405c-48dc-a12f-bb01d90183e0','Kantor Bandung','Jl. Asia Afrika No. 100, Bandung',-6.9175000,107.6191000,120,1,NOW(6),NOW(6));

DROP TABLE IF EXISTS `work_shifts`;
CREATE TABLE `work_shifts` (
  `id` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `start_time` varchar(5) NOT NULL,
  `end_time` varchar(5) NOT NULL,
  `late_tolerance_minutes` int NOT NULL DEFAULT '0',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `work_shifts` VALUES ('57bb9c6a-1135-4bcb-aae2-d488b588982a','Pagi (07:00 - 16:00)','07:00','16:00',10,1,NOW(6),NOW(6)),('a3b74f86-d922-41c8-b071-20a21496c021','Siang (13:00 - 22:00)','13:00','22:00',10,1,NOW(6),NOW(6)),('accd7878-d6f1-4a85-ac44-8603336a8087','Reguler (09:00 - 18:00)','09:00','18:00',15,1,NOW(6),NOW(6));

-- ------------------------------------------------------------------------
-- db_attendance
-- ------------------------------------------------------------------------
USE `db_attendance`;

DROP TABLE IF EXISTS `attendance_corrections`;
CREATE TABLE `attendance_corrections` (
  `id` varchar(36) NOT NULL,
  `employee_id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `requested_check_in` varchar(5) DEFAULT NULL,
  `requested_check_out` varchar(5) DEFAULT NULL,
  `reason` text NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `reviewed_by` varchar(36) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `review_note` text,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `attendance_corrections` VALUES ('f28b47f9-e9c8-46b9-8334-1baa7ef79314','5a36515a-b9ab-4644-b8ef-ff15417c3ece','2026-02-03','08:58','17:05','Lupa absen masuk karena HP mati','PENDING',NULL,NULL,NULL,NOW(6),NOW(6));

DROP TABLE IF EXISTS `attendances`;
CREATE TABLE `attendances` (
  `id` varchar(36) NOT NULL,
  `employee_id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `work_mode` enum('WFO','WFH','WFA','FIELD') NOT NULL DEFAULT 'WFO',
  `check_in_time` datetime DEFAULT NULL,
  `check_out_time` datetime DEFAULT NULL,
  `check_in_photo_url` varchar(255) DEFAULT NULL,
  `check_out_photo_url` varchar(255) DEFAULT NULL,
  `check_in_latitude` decimal(10,7) DEFAULT NULL,
  `check_in_longitude` decimal(10,7) DEFAULT NULL,
  `check_out_latitude` decimal(10,7) DEFAULT NULL,
  `check_out_longitude` decimal(10,7) DEFAULT NULL,
  `check_in_address` varchar(255) DEFAULT NULL,
  `check_out_address` varchar(255) DEFAULT NULL,
  `office_location_id` varchar(36) DEFAULT NULL,
  `office_location_name` varchar(100) DEFAULT NULL,
  `distance_meters` int DEFAULT NULL,
  `within_geofence` tinyint DEFAULT NULL,
  `shift_id` varchar(36) DEFAULT NULL,
  `shift_name` varchar(50) DEFAULT NULL,
  `late_minutes` int NOT NULL DEFAULT '0',
  `early_leave_minutes` int NOT NULL DEFAULT '0',
  `work_minutes` int DEFAULT NULL,
  `status` enum('PRESENT','LATE','ABSENT','LEAVE','SICK','PERMIT') NOT NULL DEFAULT 'PRESENT',
  `check_in_notes` text,
  `check_out_notes` text,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_attendances_employee_date` (`employee_id`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `attendances` VALUES ('1f71c642-7e3b-448e-b0a4-4b847d65cac6','5a36515a-b9ab-4644-b8ef-ff15417c3ece',CURDATE(),'WFO',CONCAT(CURDATE(),' 08:52:00'),NULL,NULL,NULL,-6.1836000,106.8325000,NULL,NULL,'Jl. K.H. Wahid Hasyim No. 162, Jakarta Pusat',NULL,'48b1f246-47e5-452c-9e0a-95cb747d257e','Kantor Pusat Jakarta',24,1,'accd7878-d6f1-4a85-ac44-8603336a8087','Reguler (09:00 - 18:00)',0,0,NULL,'PRESENT','Masuk tepat waktu, WFO',NULL,NOW(6),NOW(6)),('c7710960-70a7-4be7-80a7-1c3013a9beb1','5a36515a-b9ab-4644-b8ef-ff15417c3ece',CURDATE() - INTERVAL 1 DAY,'WFH',CONCAT(CURDATE() - INTERVAL 1 DAY,' 08:55:00'),CONCAT(CURDATE() - INTERVAL 1 DAY,' 17:05:00'),NULL,NULL,-6.2088000,106.8456000,NULL,NULL,'Kebayoran Baru, Jakarta Selatan',NULL,NULL,NULL,NULL,NULL,'accd7878-d6f1-4a85-ac44-8603336a8087','Reguler (09:00 - 18:00)',0,55,490,'PRESENT','WFH harian','Selesai WFH',NOW(6),NOW(6)),('e59df4e7-206e-4935-ac43-b2c90742b2a9','a87f6074-210a-4ffe-946c-00c32be085b6','2026-10-05','WFO',CONCAT(CURDATE(),' 07:25:00'),NULL,NULL,NULL,-6.1836000,106.8325000,NULL,NULL,'Jl. K.H. Wahid Hasyim No. 162, Jakarta Pusat',NULL,'48b1f246-47e5-452c-9e0a-95cb747d257e','Kantor Pusat Jakarta',40,1,'57bb9c6a-1135-4bcb-aae2-d488b588982a','Pagi (07:00 - 16:00)',15,0,NULL,'LATE','Terlambat karena macet',NULL,NOW(6),NOW(6));

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` varchar(36) NOT NULL,
  `actor_id` varchar(36) DEFAULT NULL,
  `actor_role` varchar(20) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `entity` varchar(50) DEFAULT NULL,
  `entity_id` varchar(36) DEFAULT NULL,
  `description` text,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `audit_logs` VALUES ('1aabaf31-55e8-4c5f-89df-40290f5e4410','bc123f32-3332-4a28-9aaa-c18d124ecf85','HRD','LEAVE_APPROVE','leave_requests','99b34441-0f41-495e-9f1b-1b724bebfa26','Cuti tahunan Budi',NOW(6)),('a8d049ad-2de8-4786-9667-7ac6abb4baab','85a4f6e4-4230-4c67-8a28-b4bf7798cd76','EMPLOYEE','ATTENDANCE_CHECK_IN','attendances','5a36515a-b9ab-4644-b8ef-ff15417c3ece','WFO check-in',NOW(6));

DROP TABLE IF EXISTS `leave_requests`;
CREATE TABLE `leave_requests` (
  `id` varchar(36) NOT NULL,
  `employee_id` varchar(36) NOT NULL,
  `type` enum('ANNUAL','SICK','PERMIT','UNPAID') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `days` int NOT NULL DEFAULT '1',
  `reason` text NOT NULL,
  `attachment_url` varchar(255) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `reviewed_by` varchar(36) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `review_note` text,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `leave_requests` VALUES ('28569e5c-b5e0-4b8e-848a-1f239440c774','a87f6074-210a-4ffe-946c-00c32be085b6','SICK','2026-02-12','2026-02-12',1,'Demam, ada surat dokter',NULL,'PENDING',NULL,NULL,NULL,NOW(6),NOW(6)),('69e46c22-ad47-4f95-9170-de8478e32aba','5a36515a-b9ab-4644-b8ef-ff15417c3ece','ANNUAL','2026-03-01','2026-03-02',2,'Acara keluarga di luar kota',NULL,'PENDING',NULL,NULL,NULL,NOW(6),NOW(6)),('99b34441-0f41-495e-9f1b-1b724bebfa26','5a36515a-b9ab-4644-b8ef-ff15417c3ece','ANNUAL','2026-02-10','2026-02-11',2,'Cuti tahunan bersama keluarga',NULL,'APPROVED','bc123f32-3332-4a28-9aaa-c18d124ecf85',NOW(),'Disetujui',NOW(6),NOW(6));

DROP TABLE IF EXISTS `overtime_requests`;
CREATE TABLE `overtime_requests` (
  `id` varchar(36) NOT NULL,
  `employee_id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `start_time` varchar(5) NOT NULL,
  `end_time` varchar(5) NOT NULL,
  `hours` decimal(4,2) NOT NULL DEFAULT '0.00',
  `reason` text NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `reviewed_by` varchar(36) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `review_note` text,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `overtime_requests` VALUES ('370fd2a5-e38a-479a-a0d4-28985ff9d579','a87f6074-210a-4ffe-946c-00c32be085b6','2026-02-06','19:00','21:00',2.00,'Revisi desain dashboard','PENDING',NULL,NULL,NULL,NOW(6),NOW(6)),('74c244ee-6a3d-40d3-8572-de662ecbdc00','5a36515a-b9ab-4644-b8ef-ff15417c3ece','2026-02-05','18:00','20:30',2.50,'Menyelesaikan rilis fitur absensi','APPROVED','bc123f32-3332-4a28-9aaa-c18d124ecf85',NOW(),'Disetujui',NOW(6),NOW(6));

SET FOREIGN_KEY_CHECKS = 1;

