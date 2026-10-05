import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { Holiday } from './entities/holiday.entity';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holiday)
    private readonly holidaysRepository: Repository<Holiday>,
  ) {}

  /** Daftar hari libur, opsional dibatasi rentang tanggal dari/sampai. */
  findAll(from?: string, to?: string): Promise<Holiday[]> {
    return this.holidaysRepository.find({
      where: from && to ? { date: Between(from, to) } : {},
      order: { date: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Holiday> {
    const holiday = await this.holidaysRepository.findOne({ where: { id } });

    if (!holiday) {
      throw new NotFoundException('Hari libur tidak ditemukan');
    }

    return holiday;
  }

  async create(dto: CreateHolidayDto): Promise<Holiday> {
    const existing = await this.holidaysRepository.findOne({
      where: { date: dto.date },
    });

    if (existing) {
      throw new ConflictException('Tanggal tersebut sudah terdaftar sebagai hari libur');
    }

    return this.holidaysRepository.save(this.holidaysRepository.create(dto));
  }

  async update(id: string, dto: UpdateHolidayDto): Promise<Holiday> {
    const holiday = await this.findOne(id);

    if (dto.date && dto.date !== holiday.date) {
      const existing = await this.holidaysRepository.findOne({
        where: { date: dto.date },
      });

      if (existing) {
        throw new ConflictException('Tanggal tersebut sudah terdaftar sebagai hari libur');
      }
    }

    Object.assign(holiday, dto);
    return this.holidaysRepository.save(holiday);
  }

  /** Hari libur tidak dipakai sebagai referensi histori, jadi dihapus permanen. */
  async remove(id: string): Promise<{ id: string }> {
    const holiday = await this.findOne(id);
    await this.holidaysRepository.remove(holiday);
    return { id };
  }
}
