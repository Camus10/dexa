import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Status karyawan: masih aktif bekerja atau sudah nonaktif (soft delete). */
export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

/**
 * Master karyawan (db_employee.employees).
 *
 * `userId` menautkan karyawan ke akun login di db_auth.users (diisi saat HRD
 * menekan "Buat Akun"); tanpa referensi ini karyawan bisa ada tetapi belum
 * bisa login.
 */
@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36, nullable: true, unique: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  email: string | null;

  @Column({ type: 'varchar', length: 20, unique: true })
  nik: string;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  position: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  department: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ name: 'photo_url', type: 'varchar', length: 255, nullable: true })
  photoUrl: string | null;

  @Column({ name: 'join_date', type: 'date', nullable: true })
  joinDate: string | null;

  @Column({ type: 'enum', enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
  status: EmployeeStatus;

  /** Referensi ke work_shifts.id (shift default karyawan). */
  @Column({ name: 'shift_id', type: 'varchar', length: 36, nullable: true })
  shiftId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
