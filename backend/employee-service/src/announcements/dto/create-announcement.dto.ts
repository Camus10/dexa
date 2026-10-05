import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { AnnouncementAudience } from '../entities/announcement.entity';

/** Body untuk POST /api/announcements (HRD). */
export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Kebijakan WFO/WFH' })
  @IsString({ message: 'Judul pengumuman wajib diisi' })
  @MaxLength(150, { message: 'Judul maksimal 150 karakter' })
  title: string;

  @ApiProperty({ example: 'WFO wajib absen di dalam radius kantor.' })
  @IsString({ message: 'Isi pengumuman wajib diisi' })
  body: string;

  @ApiPropertyOptional({ enum: AnnouncementAudience, default: AnnouncementAudience.ALL })
  @IsOptional()
  @IsEnum(AnnouncementAudience, {
    message: 'Audience harus ALL, EMPLOYEE, atau HRD',
  })
  audience?: AnnouncementAudience;
}
