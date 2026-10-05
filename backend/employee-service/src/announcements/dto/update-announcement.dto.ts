import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

import { CreateAnnouncementDto } from './create-announcement.dto';

/**
 * Body untuk PATCH /api/announcements/:id.
 * `isActive` ditambahkan di sini (bukan di create) supaya HRD bisa
 * menonaktifkan pengumuman tanpa menghapusnya.
 */
export class UpdateAnnouncementDto extends PartialType(CreateAnnouncementDto) {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
