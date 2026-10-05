import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Master shift kerja (db_employee.work_shifts).
 * Jam disimpan sebagai string "HH:mm" supaya sederhana dan mudah ditampilkan;
 * perhitungan keterlambatan dilakukan attendance-service memakai snapshot ini.
 */
@Entity('work_shifts')
export class WorkShift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ name: 'start_time', type: 'varchar', length: 5 })
  startTime: string;

  @Column({ name: 'end_time', type: 'varchar', length: 5 })
  endTime: string;

  /** Toleransi keterlambatan dalam menit (mis. 15 menit untuk shift Reguler). */
  @Column({ name: 'late_tolerance_minutes', type: 'int', default: 0 })
  lateToleranceMinutes: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
