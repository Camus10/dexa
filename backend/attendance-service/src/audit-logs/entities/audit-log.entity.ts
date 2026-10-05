import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Jejak audit (db_attendance.audit_logs).
 *
 * Setiap aksi penting (absen masuk/keluar, keputusan HRD) dicatat di sini
 * agar bisa ditelusuri siapa melakukan apa dan kapan.
 */
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** users.id pelaku. */
  @Column({ name: 'actor_id', type: 'varchar', length: 36, nullable: true })
  actorId: string | null;

  /** Role pelaku saat aksi dilakukan (HRD / EMPLOYEE). */
  @Column({ name: 'actor_role', type: 'varchar', length: 20, nullable: true })
  actorRole: string | null;

  /** Kode aksi, mis. ATTENDANCE_CHECK_IN atau LEAVE_APPROVE. */
  @Column({ type: 'varchar', length: 50 })
  action: string;

  /** Nama tabel yang terpengaruh. */
  @Column({ type: 'varchar', length: 50, nullable: true })
  entity: string | null;

  @Column({ name: 'entity_id', type: 'varchar', length: 36, nullable: true })
  entityId: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
