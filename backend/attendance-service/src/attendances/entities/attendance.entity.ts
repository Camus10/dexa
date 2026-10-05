import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

/** Status absensi harian. */
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  LATE = 'LATE',
  ABSENT = 'ABSENT',
  LEAVE = 'LEAVE',
  SICK = 'SICK',
  PERMIT = 'PERMIT',
}

/** Mode kerja saat absen. Hanya WFO yang divalidasi terhadap radius kantor. */
export enum WorkMode {
  WFO = 'WFO',
  WFH = 'WFH',
  WFA = 'WFA',
  FIELD = 'FIELD',
}

/** Decimal MySQL dikembalikan sebagai string; ubah jadi number untuk API. */
const decimalTransformer = {
  to: (value: number | null): number | null => value,
  from: (value: string | number | null): number | null =>
    value === null || value === undefined ? null : Number(value),
};

/**
 * Satu baris per karyawan per hari (db_attendance.attendances).
 *
 * Data shift & kantor disimpan sebagai SNAPSHOT (nama + id), bukan relasi,
 * supaya histori absensi tetap benar walau master shift/kantor berubah.
 * Waktu absen selalu diambil dari jam server.
 */
@Entity('attendances')
@Unique('UQ_attendances_employee_date', ['employeeId', 'date'])
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id', type: 'varchar', length: 36 })
  employeeId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'work_mode', type: 'enum', enum: WorkMode, default: WorkMode.WFO })
  workMode: WorkMode;

  @Column({ name: 'check_in_time', type: 'datetime', nullable: true })
  checkInTime: Date | null;

  @Column({ name: 'check_out_time', type: 'datetime', nullable: true })
  checkOutTime: Date | null;

  @Column({ name: 'check_in_photo_url', type: 'varchar', length: 255, nullable: true })
  checkInPhotoUrl: string | null;

  @Column({ name: 'check_out_photo_url', type: 'varchar', length: 255, nullable: true })
  checkOutPhotoUrl: string | null;

  @Column({ name: 'check_in_latitude', type: 'decimal', precision: 10, scale: 7, nullable: true, transformer: decimalTransformer })
  checkInLatitude: number | null;

  @Column({ name: 'check_in_longitude', type: 'decimal', precision: 10, scale: 7, nullable: true, transformer: decimalTransformer })
  checkInLongitude: number | null;

  @Column({ name: 'check_out_latitude', type: 'decimal', precision: 10, scale: 7, nullable: true, transformer: decimalTransformer })
  checkOutLatitude: number | null;

  @Column({ name: 'check_out_longitude', type: 'decimal', precision: 10, scale: 7, nullable: true, transformer: decimalTransformer })
  checkOutLongitude: number | null;

  @Column({ name: 'check_in_address', type: 'varchar', length: 255, nullable: true })
  checkInAddress: string | null;

  @Column({ name: 'check_out_address', type: 'varchar', length: 255, nullable: true })
  checkOutAddress: string | null;

  @Column({ name: 'office_location_id', type: 'varchar', length: 36, nullable: true })
  officeLocationId: string | null;

  @Column({ name: 'office_location_name', type: 'varchar', length: 100, nullable: true })
  officeLocationName: string | null;

  @Column({ name: 'distance_meters', type: 'int', nullable: true })
  distanceMeters: number | null;

  /** null bila mode kerja bukan WFO (geofence tidak divalidasi). */
  @Column({ name: 'within_geofence', type: 'tinyint', nullable: true })
  withinGeofence: boolean | null;

  @Column({ name: 'shift_id', type: 'varchar', length: 36, nullable: true })
  shiftId: string | null;

  @Column({ name: 'shift_name', type: 'varchar', length: 50, nullable: true })
  shiftName: string | null;

  @Column({ name: 'late_minutes', type: 'int', default: 0 })
  lateMinutes: number;

  @Column({ name: 'early_leave_minutes', type: 'int', default: 0 })
  earlyLeaveMinutes: number;

  @Column({ name: 'work_minutes', type: 'int', nullable: true })
  workMinutes: number | null;

  @Column({ type: 'enum', enum: AttendanceStatus, default: AttendanceStatus.PRESENT })
  status: AttendanceStatus;

  @Column({ name: 'check_in_notes', type: 'text', nullable: true })
  checkInNotes: string | null;

  @Column({ name: 'check_out_notes', type: 'text', nullable: true })
  checkOutNotes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
