import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { CreateWorkShiftDto } from './dto/create-work-shift.dto';
import { UpdateWorkShiftDto } from './dto/update-work-shift.dto';
import { WorkShift } from './entities/work-shift.entity';

@Injectable()
export class WorkShiftsService {
  constructor(
    @InjectRepository(WorkShift)
    private readonly workShiftsRepository: Repository<WorkShift>,
  ) {}

  /**
   * Daftar shift. Halaman HRD memakai includeInactive = true, sedangkan
   * endpoint /active dipakai karyawan untuk memilih shift saat absen.
   */
  findAll(includeInactive = false): Promise<WorkShift[]> {
    return this.workShiftsRepository.find({
      where: includeInactive ? {} : { isActive: true },
      order: { startTime: 'ASC' },
    });
  }

  async findOne(id: string): Promise<WorkShift> {
    const shift = await this.workShiftsRepository.findOne({ where: { id } });

    if (!shift) {
      throw new NotFoundException('Shift kerja tidak ditemukan');
    }

    return shift;
  }

  /** Ambil beberapa shift sekaligus (dipakai EmployeesService melengkapi shift). */
  findByIds(ids: string[]): Promise<WorkShift[]> {
    if (!ids.length) {
      return Promise.resolve([]);
    }

    return this.workShiftsRepository.find({ where: { id: In(ids) } });
  }

  create(dto: CreateWorkShiftDto): Promise<WorkShift> {
    return this.workShiftsRepository.save(
      this.workShiftsRepository.create(dto),
    );
  }

  async update(id: string, dto: UpdateWorkShiftDto): Promise<WorkShift> {
    const shift = await this.findOne(id);
    Object.assign(shift, dto);
    return this.workShiftsRepository.save(shift);
  }

  /** Nonaktifkan shift (soft delete) agar snapshot absensi lama tetap valid. */
  async remove(id: string): Promise<{ id: string }> {
    const shift = await this.findOne(id);
    shift.isActive = false;
    await this.workShiftsRepository.save(shift);
    return { id };
  }
}
