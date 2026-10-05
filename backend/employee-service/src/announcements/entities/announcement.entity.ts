import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Sasaran pembaca pengumuman. */
export enum AnnouncementAudience {
  ALL = 'ALL',
  EMPLOYEE = 'EMPLOYEE',
  HRD = 'HRD',
}

/**
 * Pengumuman dari HRD (db_employee.announcements).
 * Karyawan hanya melihat `isActive = true` dan audience yang cocok dengan
 * role-nya; HRD memakai endpoint /admin untuk melihat semuanya.
 */
@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'enum', enum: AnnouncementAudience, default: AnnouncementAudience.ALL })
  audience: AnnouncementAudience;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  /** users.id pembuat pengumuman. */
  @Column({ name: 'created_by', type: 'varchar', length: 36, nullable: true })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
