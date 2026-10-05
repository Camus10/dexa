import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * MySQL mengembalikan kolom decimal sebagai string agar presisinya tidak
 * hilang. Transformer ini mengubahnya menjadi number supaya konsumen API
 * (frontend & attendance-service) bisa langsung memakai sebagai angka.
 */
const decimalTransformer = {
  to: (value: number | null): number | null => value,
  from: (value: string | number | null): number | null =>
    value === null || value === undefined ? null : Number(value),
};

/**
 * Titik lokasi kantor + radius geofencing (db_employee.office_locations).
 * `radiusMeters` dipakai attendance-service untuk menilai apakah absen
 * mode WFO berada di dalam area kantor.
 */
@Entity('office_locations')
export class OfficeLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, transformer: decimalTransformer })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, transformer: decimalTransformer })
  longitude: number;

  @Column({ name: 'radius_meters', type: 'int', default: 100 })
  radiusMeters: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
