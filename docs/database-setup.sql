-- ==========================================================================
-- Setup Database - Aplikasi Absensi Karyawan (Dexa Group)
-- ==========================================================================
-- Membuat 3 database: db_auth, db_employee, db_attendance.
--
-- Semua Primary Key memakai UUID v4 (lihat v4_uuids.txt) dan password
-- disimpan sebagai hash Argon2id (library argon2), bukan bcrypt.
--
-- Cara pakai:
--   mysql -u root -p < docs/database-setup.sql
--   atau jalankan langsung dari MySQL Workbench / phpMyAdmin.
-- ==========================================================================

-- TypeORM memakai synchronize: true, jadi tabel akan dibuat otomatis saat
-- service pertama kali dijalankan. DDL di bawah ini disertakan agar skema
-- tetap bisa direview tanpa harus menjalankan service.

CREATE DATABASE IF NOT EXISTS `db_auth` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `db_employee` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `db_attendance` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SHOW DATABASES;

-- ------------------------------------------------------------------------
-- db_auth
-- ------------------------------------------------------------------------
USE `db_auth`;

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

-- ------------------------------------------------------------------------
-- db_employee
-- ------------------------------------------------------------------------
USE `db_employee`;

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

CREATE TABLE `holidays` (
  `id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_40dfddee0c0d7125c767d8962b` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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

-- ------------------------------------------------------------------------
-- db_attendance
-- ------------------------------------------------------------------------
USE `db_attendance`;

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

