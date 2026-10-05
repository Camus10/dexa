import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Role aplikasi: karyawan biasa atau HRD (admin). */
export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  HRD = 'HRD',
}

/**
 * Akun login (db_auth.users).
 *
 * Primary key memakai UUID v4 (varchar(36)) dan password disimpan sebagai
 * hash Argon2id, bukan plain text dan bukan bcrypt.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.EMPLOYEE })
  role: UserRole;

  /** Referensi lunak ke db_employee.employees.id (tanpa foreign key antar DB). */
  @Column({ name: 'employee_id', type: 'varchar', length: 36, nullable: true })
  employeeId: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
