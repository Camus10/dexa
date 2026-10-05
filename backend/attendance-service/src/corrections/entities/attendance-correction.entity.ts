import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RequestStatus } from '../../leaves/entities/leave-request.entity';

/**
 * Pengajuan koreksi absensi (db_attendance.attendance_corrections).
 *
 * Dipakai karyawan yang lupa absen. Saat HRD menyetujui, jam pada baris
 * `attendances` tanggal tersebut ikut diperbarui (lihat CorrectionsService).
 */
@Entity('attendance_corrections')
export class AttendanceCorrection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id', type: 'varchar', length: 36 })
  employeeId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'requested_check_in', type: 'varchar', length: 5, nullable: true })
  requestedCheckIn: string | null;

  @Column({ name: 'requested_check_out', type: 'varchar', length: 5, nullable: true })
  requestedCheckOut: string | null;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @Column({ name: 'reviewed_by', type: 'varchar', length: 36, nullable: true })
  reviewedBy: string | null;

  @Column({ name: 'reviewed_at', type: 'datetime', nullable: true })
  reviewedAt: Date | null;

  @Column({ name: 'review_note', type: 'text', nullable: true })
  reviewNote: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
