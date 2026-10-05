import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Jenis pengajuan cuti/izin. */
export enum LeaveType {
  ANNUAL = 'ANNUAL', // cuti tahunan
  SICK = 'SICK', // sakit (dengan surat)
  PERMIT = 'PERMIT', // izin
  UNPAID = 'UNPAID', // cuti di luar tanggungan
}

/** Status pengajuan yang dipakai cuti, lembur, dan koreksi absensi. */
export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

/**
 * Pengajuan cuti/izin/sakit (db_attendance.leave_requests).
 * Saldo cuti tahunan dihitung dari total hari pengajuan ANNUAL ber-status
 * APPROVED pada tahun berjalan.
 */
@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id', type: 'varchar', length: 36 })
  employeeId: string;

  @Column({ type: 'enum', enum: LeaveType })
  type: LeaveType;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ type: 'int', default: 1 })
  days: number;

  @Column({ type: 'text' })
  reason: string;

  @Column({ name: 'attachment_url', type: 'varchar', length: 255, nullable: true })
  attachmentUrl: string | null;

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
