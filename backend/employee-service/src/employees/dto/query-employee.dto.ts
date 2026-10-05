import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { EmployeeStatus } from '../entities/employee.entity';

/**
 * Query untuk GET /api/employees (pagination server-side + filter).
 * Dipakai halaman Data Karyawan: pencarian, filter departemen & status.
 */
export class QueryEmployeeDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100, { message: 'limit maksimal 100' })
  limit?: number = 10;

  /** Dicari pada NIK, nama, email, posisi, dan departemen. */
  @ApiPropertyOptional({ example: 'budi' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'Engineering' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ enum: EmployeeStatus })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiPropertyOptional({ example: 'accd7878-d6f1-4a85-ac44-8603336a8087' })
  @IsOptional()
  @IsString()
  shiftId?: string;
}
