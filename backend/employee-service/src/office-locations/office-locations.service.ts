import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateOfficeLocationDto } from './dto/create-office-location.dto';
import { UpdateOfficeLocationDto } from './dto/update-office-location.dto';
import { OfficeLocation } from './entities/office-location.entity';

@Injectable()
export class OfficeLocationsService {
  constructor(
    @InjectRepository(OfficeLocation)
    private readonly officeLocationsRepository: Repository<OfficeLocation>,
  ) {}

  /** Halaman HRD menampilkan semua kantor (termasuk yang nonaktif). */
  findAll(includeInactive = true): Promise<OfficeLocation[]> {
    return this.officeLocationsRepository.find({
      where: includeInactive ? {} : { isActive: true },
      order: { name: 'ASC' },
    });
  }

  /** Dipakai attendance-service & karyawan untuk validasi geofencing. */
  findActive(): Promise<OfficeLocation[]> {
    return this.findAll(false);
  }

  async findOne(id: string): Promise<OfficeLocation> {
    const location = await this.officeLocationsRepository.findOne({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException('Lokasi kantor tidak ditemukan');
    }

    return location;
  }

  create(dto: CreateOfficeLocationDto): Promise<OfficeLocation> {
    return this.officeLocationsRepository.save(
      this.officeLocationsRepository.create(dto),
    );
  }

  async update(
    id: string,
    dto: UpdateOfficeLocationDto,
  ): Promise<OfficeLocation> {
    const location = await this.findOne(id);
    Object.assign(location, dto);
    return this.officeLocationsRepository.save(location);
  }

  /** Nonaktifkan kantor (soft delete) agar histori absensi tetap terbaca. */
  async remove(id: string): Promise<{ id: string }> {
    const location = await this.findOne(id);
    location.isActive = false;
    await this.officeLocationsRepository.save(location);
    return { id };
  }
}
