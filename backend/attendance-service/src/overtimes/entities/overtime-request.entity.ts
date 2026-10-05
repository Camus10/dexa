import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RequestStatus } from '../../leaves/entities/leave-request.entity';

/** Decimal MySQL dikembalikan sebagai string; ubah jadi number untuk API. */
const decimalTransformer = {
  to: (value: number | null): number | null => value,
  from: (value: string | number | null): number | null =>
    value === null || value === undefined ? null : Number(value),
};

/**
 * Pengajuan lembur (db_attendance.overtime_requests).
 * Jam disimpan "HH:mm" dan `hours` dihitung di server dari selisih jam
 * supaya konsisten walau frontend mengirim nilai lain.
 */
@Entity('overtime_requests')
export class OvertimeRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id', type: 'varchar', length: 36 })
  employeeId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'start_time', type: 'varchar', length: 5 })
  startTime: string;

  @Column({ name: 'end_time', type: 'varchar', length: 5 })
  endTime: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 0, transformer: decimalTransformer })
  hours: number;

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
