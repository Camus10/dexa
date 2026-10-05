import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCorrectionDto } from './dto/create-correction.dto';
import { AttendanceCorrection } from './entities/attendance-correction.entity';
import { Attendance } from '../attendances/entities/attendance.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { QueryLeaveDto } from '../leaves/dto/query-leave.dto';
import { RequestStatus } from '../leaves/entities/leave-request.entity';
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

export interface PaginatedCorrectionRequests {
  items: WithEmployeeInfo<AttendanceCorrection>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class CorrectionsService {
  constructor(
    @InjectRepository(AttendanceCorrection)
    private readonly correctionsRepository: Repository<AttendanceCorrection>,
    @InjectRepository(Attendance)
    private readonly attendancesRepository: Repository<Attendance>,
    private readonly auditLogsService: AuditLogsService,
    private readonly employeeClient: EmployeeClientService,
  ) {}

  /** POST /api/corrections - karyawan melaporkan absen yang salah/lupa absen. */
  async create(
    employeeId: string,
    dto: CreateCorrectionDto,
  ): Promise<AttendanceCorrection> {
    if (!dto.requestedCheckIn && !dto.requestedCheckOut) {
      throw new BadRequestException(
        'Isi minimal salah satu: jam masuk atau jam keluar yang benar',
      );
    }

    const saved = await this.correctionsRepository.save(
      this.correctionsRepository.create({
        employeeId,
        date: dto.date,
        requestedCheckIn: dto.requestedCheckIn ?? null,
        requestedCheckOut: dto.requestedCheckOut ?? null,
        reason: dto.reason,
        status: RequestStatus.PENDING,
      }),
    );

    await this.auditLogsService.log({
      actorId: employeeId,
      actorRole: 'EMPLOYEE',
      action: 'CORRECTION_CREATE',
      entity: 'attendance_corrections',
      entityId: saved.id,
      description: `Koreksi absensi ${dto.date}`,
    });

    return saved;
  }

  findMine(employeeId: string): Promise<AttendanceCorrection[]> {
    return this.correctionsRepository.find({
      where: { employeeId },
      order: { createdAt: 'DESC' },
    });
  }

  async cancel(employeeId: string, id: string): Promise<AttendanceCorrection> {
    const correction = await this.findOne(id);

    if (correction.employeeId !== employeeId) {
      throw new ForbiddenException('Pengajuan ini bukan milik Anda');
    }

    if (correction.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        'Hanya pengajuan yang masih menunggu yang bisa dibatalkan',
      );
    }

    correction.status = RequestStatus.CANCELLED;
    return this.correctionsRepository.save(correction);
  }

  /** GET /api/corrections (HRD) - semua pengajuan koreksi + filter + nama karyawan. */
  async findAll(
    query: QueryLeaveDto,
    token: string,
  ): Promise<PaginatedCorrectionRequests> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const builder = this.correctionsRepository.createQueryBuilder('correction');

    if (query.status) {
      builder.andWhere('correction.status = :status', { status: query.status });
    }

    if (query.employeeId) {
      builder.andWhere('correction.employeeId = :employeeId', {
        employeeId: query.employeeId,
      });
    }

    builder
      .orderBy('correction.createdAt', 'DESC')
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

  /**
   * PATCH /api/corrections/:id/review.
   * Bila disetujui, jam pada baris attendances tanggal tersebut ikut
   * diperbarui (skenario pengujian no. 10 di GUIDELINE.md).
   */
  async review(
    id: string,
    dto: ReviewRequestDto,
    reviewerId: string,
  ): Promise<AttendanceCorrection> {
    const correction = await this.findOne(id);

    if (correction.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Pengajuan ini sudah diproses');
    }

    const approved = dto.decision === ReviewDecision.APPROVED;

    correction.status = approved
      ? RequestStatus.APPROVED
      : RequestStatus.REJECTED;
    correction.reviewedBy = reviewerId;
    correction.reviewedAt = new Date();
    correction.reviewNote = dto.reviewNote ?? null;

    const saved = await this.correctionsRepository.save(correction);

    if (approved) {
      await this.applyToAttendance(saved);
    }

    await this.auditLogsService.log({
      actorId: reviewerId,
      actorRole: 'HRD',
      action: approved ? 'CORRECTION_APPROVE' : 'CORRECTION_REJECT',
      entity: 'attendance_corrections',
      entityId: saved.id,
      description: dto.reviewNote ?? null,
    });

    return saved;
  }

  /** Tulis jam koreksi ke absensi pada tanggal yang sama (bila barisnya ada). */
  private async applyToAttendance(
    correction: AttendanceCorrection,
  ): Promise<void> {
    const attendance = await this.attendancesRepository.findOne({
      where: { employeeId: correction.employeeId, date: correction.date },
    });

    if (!attendance) {
      return;
    }

    if (correction.requestedCheckIn) {
      attendance.checkInTime = new Date(
        `${correction.date}T${correction.requestedCheckIn}:00`,
      );
    }

    if (correction.requestedCheckOut) {
      attendance.checkOutTime = new Date(
        `${correction.date}T${correction.requestedCheckOut}:00`,
      );
    }

    if (attendance.checkInTime && attendance.checkOutTime) {
      const worked =
        (attendance.checkOutTime.getTime() - attendance.checkInTime.getTime()) /
        60_000;
      attendance.workMinutes = Math.max(0, Math.round(worked));
    }

    await this.attendancesRepository.save(attendance);
  }

  private async findOne(id: string): Promise<AttendanceCorrection> {
    const correction = await this.correctionsRepository.findOne({
      where: { id },
    });

    if (!correction) {
      throw new NotFoundException('Pengajuan koreksi tidak ditemukan');
    }

    return correction;
  }
}
