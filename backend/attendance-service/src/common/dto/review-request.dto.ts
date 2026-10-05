import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

/** Keputusan HRD pada pengajuan (cuti/lembur/koreksi). */
export enum ReviewDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

/**
 * Body untuk PATCH /api/leaves/:id/review,
 * /api/overtimes/:id/review, dan /api/corrections/:id/review.
 */
export class ReviewRequestDto {
  @ApiPropertyOptional({ enum: ReviewDecision, example: ReviewDecision.APPROVED })
  @IsEnum(ReviewDecision, { message: 'Keputusan harus APPROVED atau REJECTED' })
  decision: ReviewDecision;

  @ApiPropertyOptional({ example: 'Disetujui' })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Catatan maksimal 255 karakter' })
  reviewNote?: string;
}
