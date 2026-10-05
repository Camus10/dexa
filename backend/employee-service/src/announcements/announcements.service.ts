import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { Announcement, AnnouncementAudience } from './entities/announcement.entity';
import { UserRole } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementsRepository: Repository<Announcement>,
  ) {}

  /**
   * Pengumuman untuk karyawan: hanya yang aktif dan audience-nya cocok
   * (ALL selalu tampil, HRD hanya untuk role HRD, dst).
   */
  findForRole(role: UserRole): Promise<Announcement[]> {
    return this.announcementsRepository.find({
      where: {
        isActive: true,
        audience: In([AnnouncementAudience.ALL, role as unknown as AnnouncementAudience]),
      },
      order: { createdAt: 'DESC' },
    });
  }

  /** Halaman admin HRD: semua pengumuman termasuk yang nonaktif. */
  findAllForAdmin(): Promise<Announcement[]> {
    return this.announcementsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Announcement> {
    const announcement = await this.announcementsRepository.findOne({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException('Pengumuman tidak ditemukan');
    }

    return announcement;
  }

  create(dto: CreateAnnouncementDto, createdBy: string | null): Promise<Announcement> {
    return this.announcementsRepository.save(
      this.announcementsRepository.create({
        title: dto.title,
        body: dto.body,
        audience: dto.audience ?? AnnouncementAudience.ALL,
        createdBy,
      }),
    );
  }

  async update(
    id: string,
    dto: UpdateAnnouncementDto,
  ): Promise<Announcement> {
    const announcement = await this.findOne(id);
    Object.assign(announcement, dto);
    return this.announcementsRepository.save(announcement);
  }

  /** Soft delete: pengumuman dinonaktifkan, bukan dihapus dari database. */
  async remove(id: string): Promise<{ id: string }> {
    const announcement = await this.findOne(id);
    announcement.isActive = false;
    await this.announcementsRepository.save(announcement);
    return { id };
  }
}
