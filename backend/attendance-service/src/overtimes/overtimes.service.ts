import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { OvertimeRequest } from './entities/overtime-request.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RequestStatus } from '../leaves/entities/leave-request.entity';
import { QueryLeaveDto } from '../leaves/dto/query-leave.dto';
import {
  ReviewDecision,
  ReviewRequestDto,
} from '../common/dto/review-request.dto';
import { WithEmployeeInfo } from '../common/interfaces/employee-info.interface';
import { attachEmployeeInfo } from '../common/utils/attach-employee-info';
import {
  EmployeeClientService,
  EmployeeSummary,
} from '../integrations/employee-client.service';

/** Ubah "HH:mm" menjadi jumlah menit sejak tengah malam. */
function toMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

export interface PaginatedOvertimeRequests {
  items: WithEmployeeInfo<OvertimeRequest>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class OvertimesService {
  constructor(
    @InjectRepository(OvertimeRequest)
    private readonly overtimesRepository: Repository<OvertimeRequest>,
    private readonly auditLogsService: AuditLogsService,
    private readonly employeeClient: EmployeeClientService,
  ) {}

  /** POST /api/overtimes - karyawan mengajukan lembur. */
  async create(
    employeeId: string,
    dto: CreateOvertimeDto,
  ): Promise<OvertimeRequest> {
    const hours = this.calculateHours(dto.startTime, dto.endTime);

    if (hours <= 0) {
      throw new BadRequestException(
        'Jam selesai harus lebih besar dari jam mulai',
      );
    }

    const saved = await this.overtimesRepository.save(
      this.overtimesRepository.create({
        employeeId,
        date: dto.date,
        startTime: dto.startTime,
        endTime: dto.endTime,
        hours,
        reason: dto.reason,
        status: RequestStatus.PENDING,
      }),
    );

    await this.auditLogsService.log({
      actorId: employeeId,
      actorRole: 'EMPLOYEE',
      action: 'OVERTIME_CREATE',
      entity: 'overtime_requests',
      entityId: saved.id,
      description: `Lembur ${hours} jam`,
    });

    return saved;
  }

  findMine(employeeId: string): Promise<OvertimeRequest[]> {
    return this.overtimesRepository.find({
      where: { employeeId },
      order: { createdAt: 'DESC' },
    });
  }

  async cancel(employeeId: string, id: string): Promise<OvertimeRequest> {
    const overtime = await this.findOne(id);

    if (overtime.employeeId !== employeeId) {
      throw new ForbiddenException('Pengajuan ini bukan milik Anda');
    }

    if (overtime.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Hanya pengajuan yang masih menunggu yang bisa dibatalkan',
      );
    }

    overtime.status = RequestStatus.CANCELLED;
    return this.overtimesRepository.save(overtime);
  }

  /** GET /api/overtimes (HRD) - semua pengajuan lembur + nama karyawan. */
  async findAll(
    query: QueryLeaveDto,
    token: string,
  ): Promise<PaginatedOvertimeRequests> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const builder = this.overtimesRepository.createQueryBuilder('overtime');

    if (query.status) {
      builder.andWhere('overtime.status = :status', { status: query.status });
    }

    if (query.employeeId) {
      builder.andWhere('overtime.employeeId = :employeeId', {
        employeeId: query.employeeId,
      });
    }

    builder
      .orderBy('overtime.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await builder.getManyAndCount();

    // Nama & NIK karyawan diambil dari employee-service (token HRD diteruskan).
    const employees = await this.employeeClient
      .getEmployees(token)
      .catch(() => [] as EmployeeSummary[]);

    return {
      items: attachEmployeeInfo(items, employees),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  /** PATCH /api/overtimes/:id/review - keputusan HRD. */
  async review(
    id: string,
    dto: ReviewRequestDto,
    reviewerId: string,
  ): Promise<OvertimeRequest> {
    const overtime = await this.findOne(id);

    if (overtime.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Pengajuan ini sudah diproses');
    }

    overtime.status =
      dto.decision === ReviewDecision.APPROVED
        ? RequestStatus.APPROVED
        : RequestStatus.REJECTED;
    overtime.reviewedBy = reviewerId;
    overtime.reviewedAt = new Date();
    overtime.reviewNote = dto.reviewNote ?? null;

    const saved = await this.overtimesRepository.save(overtime);

    await this.auditLogsService.log({
      actorId: reviewerId,
      actorRole: 'HRD',
      action:
        saved.status === RequestStatus.APPROVED
          ? 'OVERTIME_APPROVE'
          : 'OVERTIME_REJECT',
      entity: 'overtime_requests',
      entityId: saved.id,
      description: dto.reviewNote ?? null,
    });

    return saved;
  }

  /** Selisih jam; bila melewati tengah malam dihitung sebagai hari berikutnya. */
  private calculateHours(startTime: string, endTime: string): number {
    let minutes = toMinutes(endTime) - toMinutes(startTime);

    if (minutes < 0) {
      minutes += 24 * 60;
    }

    return Math.round((minutes / 60) * 100) / 100;
  }

  private async findOne(id: string): Promise<OvertimeRequest> {
    const overtime = await this.overtimesRepository.findOne({ where: { id } });

    if (!overtime) {
      throw new NotFoundException('Pengajuan lembur tidak ditemukan');
    }

    return overtime;
  }
}
