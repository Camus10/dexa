import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateLeaveDto } from './dto/create-leave.dto';
import { QueryLeaveDto } from './dto/query-leave.dto';
import {
  LeaveRequest,
  LeaveType,
  RequestStatus,
} from './entities/leave-request.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
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

/** Jatah cuti tahunan per karyawan per tahun. */
const ANNUAL_LEAVE_QUOTA = 12;

export interface PaginatedLeaveRequests {
  items: WithEmployeeInfo<LeaveRequest>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Hitung jumlah hari (inklusif) antara dua tanggal ISO. */
function countDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00Z`).getTime();
  const end = new Date(`${endDate}T00:00:00Z`).getTime();
  return Math.floor((end - start) / 86_400_000) + 1;
}

@Injectable()
export class LeavesService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leavesRepository: Repository<LeaveRequest>,
    private readonly auditLogsService: AuditLogsService,
    private readonly employeeClient: EmployeeClientService,
  ) {}

  /** POST /api/leaves - karyawan mengajukan cuti/izin/sakit. */
  async create(employeeId: string, dto: CreateLeaveDto): Promise<LeaveRequest> {
    const days = countDays(dto.startDate, dto.endDate);

    if (days < 1) {
      throw new BadRequestException(
        'Tanggal selesai tidak boleh lebih awal dari tanggal mulai',
      );
    }

    // Tolak pengajuan yang rentang tanggalnya bertabrakan dengan pengajuan
    // lain yang masih menunggu atau sudah disetujui.
    const clashing = await this.leavesRepository
      .createQueryBuilder('leave')
      .where('leave.employeeId = :employeeId', { employeeId })
      .andWhere('leave.status IN (:...statuses)', {
        statuses: [RequestStatus.PENDING, RequestStatus.APPROVED],
      })
      .andWhere('leave.startDate <= :endDate', { endDate: dto.endDate })
      .andWhere('leave.endDate >= :startDate', { startDate: dto.startDate })
      .getOne();

    if (clashing) {
      throw new ConflictException(
        'Sudah ada pengajuan pada rentang tanggal tersebut',
      );
    }

    const leave = this.leavesRepository.create({
      employeeId,
      type: dto.type,
      startDate: dto.startDate,
      endDate: dto.endDate,
      days,
      reason: dto.reason,
      attachmentUrl: dto.attachmentUrl ?? null,
      status: RequestStatus.PENDING,
    });

    const saved = await this.leavesRepository.save(leave);

    await this.auditLogsService.log({
      actorId: employeeId,
      actorRole: 'EMPLOYEE',
      action: 'LEAVE_CREATE',
      entity: 'leave_requests',
      entityId: saved.id,
      description: `${dto.type} ${days} hari`,
    });

    return saved;
  }

  /** GET /api/leaves/me - riwayat pengajuan sendiri. */
  findMine(employeeId: string): Promise<LeaveRequest[]> {
    return this.leavesRepository.find({
      where: { employeeId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * GET /api/leaves/balance/me - saldo cuti tahunan.
   * Saldo = jatah tahun ini dikurangi cuti ANNUAL yang sudah disetujui.
   */
  async getBalance(
    employeeId: string,
  ): Promise<{ quota: number; used: number; remaining: number }> {
    const year = new Date().getFullYear();

    const approved = await this.leavesRepository.find({
      where: {
        employeeId,
        type: LeaveType.ANNUAL,
        status: RequestStatus.APPROVED,
      },
    });

    const used = approved
      .filter(
        (leave) =>
          new Date(`${leave.startDate}T00:00:00Z`).getFullYear() === year,
      )
      .reduce((total, leave) => total + leave.days, 0);

    return {
      quota: ANNUAL_LEAVE_QUOTA,
      used,
      remaining: Math.max(0, ANNUAL_LEAVE_QUOTA - used),
    };
  }

  /** PATCH /api/leaves/:id/cancel - hanya pengajuan sendiri & masih PENDING. */
  async cancel(employeeId: string, id: string): Promise<LeaveRequest> {
    const leave = await this.findOne(id);

    if (leave.employeeId !== employeeId) {
      throw new ForbiddenException('Pengajuan ini bukan milik Anda');
    }

    if (leave.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Hanya pengajuan yang masih menunggu yang bisa dibatalkan',
      );
    }

    leave.status = RequestStatus.CANCELLED;
    return this.leavesRepository.save(leave);
  }

  /** GET /api/leaves (HRD) - semua pengajuan + filter + nama karyawan. */
  async findAll(
    query: QueryLeaveDto,
    token: string,
  ): Promise<PaginatedLeaveRequests> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const builder = this.leavesRepository.createQueryBuilder('leave');

    if (query.status) {
      builder.andWhere('leave.status = :status', { status: query.status });
    }

    if (query.employeeId) {
      builder.andWhere('leave.employeeId = :employeeId', {
        employeeId: query.employeeId,
      });
    }

    builder
      .orderBy('leave.createdAt', 'DESC')
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

  /** PATCH /api/leaves/:id/review - keputusan HRD. */
  async review(
    id: string,
    dto: ReviewRequestDto,
    reviewerId: string,
  ): Promise<LeaveRequest> {
    const leave = await this.findOne(id);

    if (leave.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Pengajuan ini sudah diproses');
    }

    leave.status =
      dto.decision === ReviewDecision.APPROVED
        ? RequestStatus.APPROVED
        : RequestStatus.REJECTED;
    leave.reviewedBy = reviewerId;
    leave.reviewedAt = new Date();
    leave.reviewNote = dto.reviewNote ?? null;

    const saved = await this.leavesRepository.save(leave);

    await this.auditLogsService.log({
      actorId: reviewerId,
      actorRole: 'HRD',
      action:
        saved.status === RequestStatus.APPROVED
          ? 'LEAVE_APPROVE'
          : 'LEAVE_REJECT',
      entity: 'leave_requests',
      entityId: saved.id,
      description: dto.reviewNote ?? null,
    });

    return saved;
  }

  private async findOne(id: string): Promise<LeaveRequest> {
    const leave = await this.leavesRepository.findOne({ where: { id } });

    if (!leave) {
      throw new NotFoundException('Pengajuan tidak ditemukan');
    }

    return leave;
  }
}
