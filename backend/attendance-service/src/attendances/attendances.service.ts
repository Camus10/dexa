import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  In,
  Repository,
} from 'typeorm';

import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import {
  Attendance,
  AttendanceStatus,
  WorkMode,
} from './entities/attendance.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AttendanceCorrection } from '../corrections/entities/attendance-correction.entity';
import { LeaveRequest, RequestStatus } from '../leaves/entities/leave-request.entity';
import { OvertimeRequest } from '../overtimes/entities/overtime-request.entity';
import {
  EmployeeClientService,
  EmployeeSummary,
  OfficeLocationSummary,
} from '../integrations/employee-client.service';

export interface PaginatedAttendances {
  items: AttendanceView[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Absensi + data karyawan (dilengkapi dari employee-service). */
export interface AttendanceView extends Attendance {
  employeeName: string | null;
  employeeNik: string | null;
  employeeDepartment: string | null;
}

/** Statistik ringkas untuk dashboard HRD. */
export interface AttendanceSummary {
  date: string;
  totalEmployees: number;
  present: number;
  late: number;
  onLeave: number;
  workFromHome: number;
  workFromOffice: number;
  outsideGeofence: number;
  pendingLeave: number;
  pendingOvertime: number;
  pendingCorrection: number;
}

/** Tanggal hari ini menurut jam SERVER (bukan jam perangkat karyawan). */
function todayIso(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Gabungkan tanggal ISO + "HH:mm" menjadi objek Date. */
function combine(dateIso: string, time: string): Date {
  return new Date(`${dateIso}T${time}:00`);
}

/** Jarak dua koordinat dalam meter (rumus Haversine). */
function distanceInMeters(
  latitude: number,
  longitude: number,
  targetLatitude: number,
  targetLongitude: number,
): number {
  const earthRadius = 6_371_000;
  const toRadians = (value: number) => (value * Math.PI) / 180;

  const deltaLat = toRadians(targetLatitude - latitude);
  const deltaLon = toRadians(targetLongitude - longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(latitude)) *
      Math.cos(toRadians(targetLatitude)) *
      Math.sin(deltaLon / 2) ** 2;

  return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

@Injectable()
export class AttendancesService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendancesRepository: Repository<Attendance>,
    private readonly employeeClient: EmployeeClientService,
    private readonly auditLogsService: AuditLogsService,
    @InjectRepository(LeaveRequest)
    private readonly leavesRepository: Repository<LeaveRequest>,
    @InjectRepository(OvertimeRequest)
    private readonly overtimesRepository: Repository<OvertimeRequest>,
    @InjectRepository(AttendanceCorrection)
    private readonly correctionsRepository: Repository<AttendanceCorrection>,
  ) {}

  /**
   * POST /api/attendances/check-in
   *
   * Urutan prosesnya sengaja seperti ini:
   * 1. pastikan belum absen masuk hari ini (UNIQUE employee_id + date),
   * 2. ambil shift karyawan dari employee-service (untuk hitung telat),
   * 3. bila mode WFO, cari kantor terdekat dan nilai geofence,
   * 4. simpan dengan jam SERVER + snapshot shift/kantor.
   */
  async checkIn(
    employeeId: string,
    token: string,
    dto: CheckInDto,
    file?: Express.Multer.File,
  ): Promise<Attendance> {
    const date = todayIso();
    const existing = await this.attendancesRepository.findOne({
      where: { employeeId, date },
    });

    if (existing?.checkInTime) {
      throw new ConflictException(
        'Anda sudah melakukan absen masuk hari ini',
      );
    }

    const profile = await this.employeeClient.getMyProfile(token);
    const now = new Date();

    let officeLocation: OfficeLocationSummary | null = null;
    let distanceMeters: number | null = null;
    let withinGeofence: boolean | null = null;

    if (dto.workMode === WorkMode.WFO) {
      const locations = await this.employeeClient.getActiveOfficeLocations(token);
      const nearest = this.findNearest(
        locations,
        dto.latitude,
        dto.longitude,
      );

      officeLocation = nearest.office;
      distanceMeters = nearest.distance;

      // Tanpa koordinat, geofence tidak bisa dinilai (null = tidak diketahui).
      withinGeofence =
        nearest.distance === null || !nearest.office
          ? null
          : nearest.distance <= nearest.office.radiusMeters;
    }

    const shift = profile.shift;
    let lateMinutes = 0;
    let status = AttendanceStatus.PRESENT;

    if (shift) {
      const tolerance = shift.lateToleranceMinutes ?? 0;
      const shiftStart = combine(date, shift.startTime);
      const diff = Math.floor(
        (now.getTime() - shiftStart.getTime() - tolerance * 60_000) / 60_000,
      );

      if (diff > 0) {
        lateMinutes = diff;
        status = AttendanceStatus.LATE;
      }
    }

    const attendance = this.attendancesRepository.create({
      ...(existing ? { id: existing.id } : {}),
      employeeId,
      date,
      workMode: dto.workMode,
      checkInTime: now,
      checkInPhotoUrl: file ? this.photoUrl(file) : null,
      checkInLatitude: dto.latitude ?? null,
      checkInLongitude: dto.longitude ?? null,
      checkInAddress: dto.address ?? null,
      officeLocationId: officeLocation?.id ?? null,
      officeLocationName: officeLocation?.name ?? null,
      distanceMeters,
      withinGeofence,
      shiftId: shift?.id ?? null,
      shiftName: shift?.name ?? null,
      lateMinutes,
      status,
      checkInNotes: dto.notes ?? null,
    });

    const saved = await this.attendancesRepository.save(attendance);

    await this.auditLogsService.log({
      actorId: employeeId,
      actorRole: 'EMPLOYEE',
      action: 'ATTENDANCE_CHECK_IN',
      entity: 'attendances',
      entityId: saved.id,
      description: `${dto.workMode} check-in${lateMinutes ? ` (telat ${lateMinutes} menit)` : ''}`,
    });

    return saved;
  }

  /** POST /api/attendances/check-out - hitung durasi kerja & pulang cepat. */
  async checkOut(
    employeeId: string,
    token: string,
    dto: CheckOutDto,
    file?: Express.Multer.File,
  ): Promise<Attendance> {
    const date = todayIso();
    const attendance = await this.attendancesRepository.findOne({
      where: { employeeId, date },
    });

    if (!attendance || !attendance.checkInTime) {
      throw new ConflictException(
        'Belum ada absen masuk hari ini, silakan absen masuk terlebih dahulu',
      );
    }

    if (attendance.checkOutTime) {
      throw new ConflictException('Anda sudah melakukan absen keluar hari ini');
    }

    const now = new Date();

    attendance.checkOutTime = now;
    attendance.checkOutPhotoUrl = file ? this.photoUrl(file) : null;
    attendance.checkOutLatitude = dto.latitude ?? null;
    attendance.checkOutLongitude = dto.longitude ?? null;
    attendance.checkOutAddress = dto.address ?? null;
    attendance.checkOutNotes = dto.notes ?? null;

    attendance.workMinutes = Math.max(
      0,
      Math.round((now.getTime() - attendance.checkInTime.getTime()) / 60_000),
    );

    // Pulang cepat: dibandingkan dengan jam selesai shift karyawan
    // (diambil dari employee-service; gagal ambil data tidak menggagalkan absen).
    const profile = await this.employeeClient
      .getMyProfile(token)
      .catch(() => null);

    if (profile?.shift && profile.shift.id === attendance.shiftId) {
      const shiftEnd = combine(date, profile.shift.endTime);

      attendance.earlyLeaveMinutes = Math.max(
        0,
        Math.floor((shiftEnd.getTime() - now.getTime()) / 60_000),
      );
    }

    const saved = await this.attendancesRepository.save(attendance);

    await this.auditLogsService.log({
      actorId: employeeId,
      actorRole: 'EMPLOYEE',
      action: 'ATTENDANCE_CHECK_OUT',
      entity: 'attendances',
      entityId: saved.id,
      description: 'Check-out absensi',
    });

    return saved;
  }

  /** GET /api/attendances/me - riwayat absensi sendiri (pagination server). */
  async findMine(
    employeeId: string,
    query: QueryAttendanceDto,
  ): Promise<PaginatedAttendances> {
    return this.queryAttendances(query, employeeId);
  }

  /** GET /api/attendances/me/today - absensi hari ini (bisa null). */
  async findToday(employeeId: string): Promise<Attendance | null> {
    return this.attendancesRepository.findOne({
      where: { employeeId, date: todayIso() },
    });
  }

  /**
   * GET /api/attendances/me/calendar?month=YYYY-MM
   * Rekap satu bulan: jumlah hadir/terlambat, serta total menit kerja.
   */
  async getMonthlySummary(
    employeeId: string,
    month: string,
  ): Promise<{
    month: string;
    days: Attendance[];
    present: number;
    late: number;
    totalWorkMinutes: number;
  }> {
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    const days = await this.attendancesRepository.find({
      where: { employeeId, date: Between(startDate, endDate) },
      order: { date: 'ASC' },
    });

    return {
      month,
      days,
      present: days.filter((day) => day.status === AttendanceStatus.PRESENT).length,
      late: days.filter((day) => day.status === AttendanceStatus.LATE).length,
      totalWorkMinutes: days.reduce(
        (total, day) => total + (day.workMinutes ?? 0),
        0,
      ),
    };
  }

  /** GET /api/attendances/summary - statistik untuk dashboard HRD. */
  async getSummary(token: string): Promise<AttendanceSummary> {
    const date = todayIso();

    const [todayRows, employees, pendingLeave, pendingOvertime, pendingCorrection] =
      await Promise.all([
        this.attendancesRepository.find({ where: { date } }),
        this.employeeClient.getEmployees(token).catch(() => [] as EmployeeSummary[]),
        this.leavesRepository.count({ where: { status: RequestStatus.PENDING } }),
        this.overtimesRepository.count({
          where: { status: RequestStatus.PENDING },
        }),
        this.correctionsRepository.count({
          where: { status: RequestStatus.PENDING },
        }),
      ]);

    return {
      date,
      totalEmployees: employees.length,
      present: todayRows.filter((row) => row.status === AttendanceStatus.PRESENT)
        .length,
      late: todayRows.filter((row) => row.status === AttendanceStatus.LATE).length,
      onLeave: todayRows.filter((row) =>
        [AttendanceStatus.LEAVE, AttendanceStatus.SICK, AttendanceStatus.PERMIT].includes(
          row.status,
        ),
      ).length,
      workFromHome: todayRows.filter((row) =>
        [WorkMode.WFH, WorkMode.WFA].includes(row.workMode),
      ).length,
      workFromOffice: todayRows.filter((row) => row.workMode === WorkMode.WFO)
        .length,
      outsideGeofence: todayRows.filter((row) => row.withinGeofence === false)
        .length,
      pendingLeave,
      pendingOvertime,
      pendingCorrection,
    };
  }

  /** GET /api/attendances (HRD) - semua absensi + filter + nama karyawan. */
  async findAll(
    query: QueryAttendanceDto,
    token: string,
  ): Promise<PaginatedAttendances> {
    const employees = await this.employeeClient
      .getEmployees(token)
      .catch(() => [] as EmployeeSummary[]);

    let employeeIds: string[] | undefined;

    if (query.search) {
      const keyword = query.search.trim().toLowerCase();
      employeeIds = employees
        .filter(
          (employee) =>
            employee.fullName.toLowerCase().includes(keyword) ||
            employee.nik.toLowerCase().includes(keyword),
        )
        .map((employee) => employee.id);

      if (!employeeIds.length) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        return { items: [], total: 0, page, limit, totalPages: 1 };
      }
    }

    const result = await this.queryAttendances(query, null, employeeIds);

    return {
      ...result,
      items: this.attachEmployees(result.items, employees),
    };
  }

  /** GET /api/attendances/:id - detail absensi (HRD). */
  async findOne(id: string, token: string): Promise<AttendanceView> {
    const attendance = await this.attendancesRepository.findOne({
      where: { id },
    });

    if (!attendance) {
      throw new NotFoundException('Data absensi tidak ditemukan');
    }

    const employees = await this.employeeClient
      .getEmployees(token)
      .catch(() => [] as EmployeeSummary[]);

    return this.attachEmployees([attendance], employees)[0];
  }

  /**
   * GET /api/attendances/export - laporan CSV yang enak dibuka di Excel.
   *
   * Berkas diawali BOM UTF-8 + baris `sep=;` supaya Excel langsung memisahkan
   * kolom dengan benar, memakai pemisah `;` dan akhir baris CRLF.
   */
  async exportCsv(query: QueryAttendanceDto, token: string): Promise<string> {
    const all = await this.findAll({ ...query, page: 1, limit: 100 }, token);

    const header = [
      'Tanggal',
      'NIK',
      'Nama Karyawan',
      'Departemen',
      'Mode Kerja',
      'Jam Masuk',
      'Jam Keluar',
      'Status',
      'Telat (menit)',
      'Pulang Cepat (menit)',
      'Durasi Kerja',
      'Shift',
      'Kantor',
      'Jarak ke Kantor (m)',
      'Di Dalam Geofence',
      'Catatan Masuk',
      'Catatan Keluar',
    ];

    const rows = all.items.map((item) => [
      item.date,
      item.employeeNik ?? '-',
      item.employeeName ?? '-',
      item.employeeDepartment ?? '-',
      item.workMode,
      this.formatTime(item.checkInTime),
      this.formatTime(item.checkOutTime),
      item.status,
      String(item.lateMinutes ?? 0),
      String(item.earlyLeaveMinutes ?? 0),
      this.formatDuration(item.workMinutes),
      item.shiftName ?? '-',
      item.officeLocationName ?? '-',
      item.distanceMeters === null ? '-' : String(item.distanceMeters),
      item.withinGeofence === null ? '-' : item.withinGeofence ? 'Ya' : 'Tidak',
      item.checkInNotes ?? '-',
      item.checkOutNotes ?? '-',
    ]);

    const summary = [
      '',
      `Total data;${all.total}`,
      `Hadir;${all.items.filter((item) => item.status === AttendanceStatus.PRESENT).length}`,
      `Terlambat;${all.items.filter((item) => item.status === AttendanceStatus.LATE).length}`,
      `Di luar geofence;${all.items.filter((item) => item.withinGeofence === false).length}`,
    ];

    return [
      '\uFEFFsep=;',
      header.map((cell) => this.csvCell(cell)).join(';'),
      ...rows.map((row) => row.map((cell) => this.csvCell(cell)).join(';')),
      ...summary,
    ].join('\r\n');
  }

  /** Query dasar absensi (dipakai /me, daftar HRD, dan export). */
  private async queryAttendances(
    query: QueryAttendanceDto,
    employeeId: string | null,
    employeeIds?: string[],
  ): Promise<PaginatedAttendances> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const builder = this.attendancesRepository.createQueryBuilder('attendance');

    if (employeeId) {
      builder.andWhere('attendance.employeeId = :employeeId', { employeeId });
    } else if (query.employeeId) {
      builder.andWhere('attendance.employeeId = :employeeId', {
        employeeId: query.employeeId,
      });
    }

    if (employeeIds) {
      builder.andWhere('attendance.employeeId IN (:...employeeIds)', {
        employeeIds,
      });
    }

    if (query.startDate) {
      builder.andWhere('attendance.date >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      builder.andWhere('attendance.date <= :endDate', {
        endDate: query.endDate,
      });
    }

    if (query.status) {
      builder.andWhere('attendance.status = :status', { status: query.status });
    }

    if (query.workMode) {
      builder.andWhere('attendance.workMode = :workMode', {
        workMode: query.workMode,
      });
    }

    builder
      .orderBy('attendance.date', 'DESC')
      .addOrderBy('attendance.checkInTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await builder.getManyAndCount();

    return {
      items: this.attachEmployees(items, []),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  /** Cari kantor terdekat dari titik absen karyawan. */
  private findNearest(
    locations: OfficeLocationSummary[],
    latitude?: number,
    longitude?: number,
  ): { office: OfficeLocationSummary | null; distance: number | null } {
    if (latitude === undefined || longitude === undefined) {
      return { office: null, distance: null };
    }

    let nearest: OfficeLocationSummary | null = null;
    let nearestDistance: number | null = null;

    for (const location of locations) {
      const distance = distanceInMeters(
        latitude,
        longitude,
        location.latitude,
        location.longitude,
      );

      if (nearestDistance === null || distance < nearestDistance) {
        nearest = location;
        nearestDistance = distance;
      }
    }

    return { office: nearest, distance: nearestDistance };
  }

  /** URL publik foto: diserve attendance-service, diakses lewat gateway. */
  private photoUrl(file: Express.Multer.File): string {
    return `/uploads/${file.filename}`;
  }

  /** Tempelkan nama/NIK/departemen karyawan ke setiap baris absensi. */
  private attachEmployees(
    items: Attendance[],
    employees: EmployeeSummary[],
  ): AttendanceView[] {
    const byId = new Map(employees.map((employee) => [employee.id, employee]));

    return items.map((item) => {
      const employee = byId.get(item.employeeId);

      return {
        ...item,
        employeeName: employee?.fullName ?? null,
        employeeNik: employee?.nik ?? null,
        employeeDepartment: employee?.department ?? null,
      };
    });
  }

  private formatTime(value: Date | null): string {
    if (!value) {
      return '-';
    }

    const hours = `${value.getHours()}`.padStart(2, '0');
    const minutes = `${value.getMinutes()}`.padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private formatDuration(minutes: number | null): string {
    if (!minutes) {
      return '-';
    }

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return `${hours} jam ${rest} menit`;
  }

  /** Bungkus sel CSV; tanda kutip ganda di-escape menjadi dua kutip. */
  private csvCell(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
  }
}
