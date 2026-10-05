import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { CreateAccountDto } from './dto/create-account.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { ResetAccountPasswordDto } from './dto/reset-account-password.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee, EmployeeStatus } from './entities/employee.entity';
import { UserRole } from '../auth/interfaces/jwt-payload.interface';
import { AuthClientService } from '../integrations/auth-client.service';
import { WorkShift } from '../work-shifts/entities/work-shift.entity';
import { WorkShiftsService } from '../work-shifts/work-shifts.service';

/** Karyawan beserta shift-nya (dipakai halaman Beranda karyawan). */
export type EmployeeWithShift = Employee & { shift: WorkShift | null };

/** Bentuk response pagination yang dipakai DataTable di frontend. */
export interface PaginatedEmployees {
  items: EmployeeWithShift[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
    private readonly workShiftsService: WorkShiftsService,
    private readonly authClientService: AuthClientService,
  ) {}

  /** GET /api/employees - pagination + filter dikerjakan di server. */
  async findAll(query: QueryEmployeeDto): Promise<PaginatedEmployees> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;

    const builder = this.employeesRepository.createQueryBuilder('employee');

    if (query.status) {
      builder.andWhere('employee.status = :status', { status: query.status });
    }

    if (query.department) {
      builder.andWhere('employee.department = :department', {
        department: query.department,
      });
    }

    if (query.shiftId) {
      builder.andWhere('employee.shiftId = :shiftId', {
        shiftId: query.shiftId,
      });
    }

    if (query.search) {
      const keyword = `%${query.search.trim()}%`;
      builder.andWhere(
        new Brackets((where) => {
          where
            .where('employee.nik LIKE :keyword', { keyword })
            .orWhere('employee.fullName LIKE :keyword', { keyword })
            .orWhere('employee.email LIKE :keyword', { keyword })
            .orWhere('employee.position LIKE :keyword', { keyword })
            .orWhere('employee.department LIKE :keyword', { keyword });
        }),
      );
    }

    builder
      .orderBy('employee.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [employees, total] = await builder.getManyAndCount();

    return {
      items: await this.attachShifts(employees),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  /** Dipakai dropdown & export di halaman HRD (tanpa pagination). */
  async findForExport(limit = 200): Promise<EmployeeWithShift[]> {
    const employees = await this.employeesRepository.find({
      order: { fullName: 'ASC' },
      take: limit,
    });

    return this.attachShifts(employees);
  }

  async findOne(id: string): Promise<EmployeeWithShift> {
    const employee = await this.employeesRepository.findOne({ where: { id } });

    if (!employee) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    const [withShift] = await this.attachShifts([employee]);
    return withShift;
  }

  /** GET /api/employees/me - data karyawan milik akun yang login. */
  async findByUserId(userId: string): Promise<EmployeeWithShift> {
    const employee = await this.employeesRepository.findOne({
      where: { userId },
    });

    if (!employee) {
      throw new NotFoundException(
        'Data karyawan untuk akun ini belum terdaftar. Hubungi HRD.',
      );
    }

    const [withShift] = await this.attachShifts([employee]);
    return withShift;
  }

  /** POST /api/employees - tambah karyawan (tanpa akun login). */
  async create(dto: CreateEmployeeDto): Promise<EmployeeWithShift> {
    await this.ensureNikAvailable(dto.nik);

    if (dto.email) {
      await this.ensureEmailAvailable(dto.email);
    }

    const employee = this.employeesRepository.create({
      nik: dto.nik,
      fullName: dto.fullName,
      email: dto.email ?? null,
      position: dto.position ?? null,
      department: dto.department ?? null,
      phone: dto.phone ?? null,
      joinDate: dto.joinDate ?? null,
      shiftId: dto.shiftId ?? null,
      status: dto.status ?? EmployeeStatus.ACTIVE,
      userId: null,
    });

    const saved = await this.employeesRepository.save(employee);
    const [withShift] = await this.attachShifts([saved]);
    return withShift;
  }

  /** PATCH /api/employees/:id */
  async update(id: string, dto: UpdateEmployeeDto): Promise<EmployeeWithShift> {
    const employee = await this.employeesRepository.findOne({ where: { id } });

    if (!employee) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    if (dto.nik && dto.nik !== employee.nik) {
      await this.ensureNikAvailable(dto.nik);
    }

    if (dto.email && dto.email !== employee.email) {
      await this.ensureEmailAvailable(dto.email);
    }

    Object.assign(employee, dto);
    const saved = await this.employeesRepository.save(employee);
    const [withShift] = await this.attachShifts([saved]);
    return withShift;
  }

  /** DELETE /api/employees/:id - soft delete (status menjadi INACTIVE). */
  async deactivate(id: string): Promise<{ id: string }> {
    const employee = await this.employeesRepository.findOne({ where: { id } });

    if (!employee) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    employee.status = EmployeeStatus.INACTIVE;
    await this.employeesRepository.save(employee);

    return { id };
  }

  /**
   * POST /api/employees/:id/account - buatkan akun login lewat auth-service.
   *
   * users.id hasil register disimpan ke employees.user_id supaya
   * attendance-service mengetahui absensi ini milik karyawan yang mana.
   */
  async createAccount(
    id: string,
    dto: CreateAccountDto,
  ): Promise<EmployeeWithShift> {
    const employee = await this.employeesRepository.findOne({ where: { id } });

    if (!employee) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    if (employee.userId) {
      throw new ConflictException('Karyawan ini sudah memiliki akun login');
    }

    const account = await this.authClientService.createAccount({
      email: dto.email,
      password: dto.password,
      role: dto.role ?? UserRole.EMPLOYEE,
      employeeId: employee.id,
    });

    employee.userId = account.id;

    if (!employee.email) {
      employee.email = dto.email;
    }

    const saved = await this.employeesRepository.save(employee);
    const [withShift] = await this.attachShifts([saved]);
    return withShift;
  }

  /**
   * PATCH /api/employees/:id/account/password - reset password akun karyawan.
   *
   * Token HRD pemanggil diteruskan ke auth-service agar endpoint reset di sana
   * tetap terproteksi (tidak pernah dibuka untuk publik/inter-service bebas).
   */
  async resetAccountPassword(
    id: string,
    dto: ResetAccountPasswordDto,
    authorization: string,
  ): Promise<{ id: string }> {
    const employee = await this.employeesRepository.findOne({ where: { id } });

    if (!employee) {
      throw new NotFoundException('Karyawan tidak ditemukan');
    }

    if (!employee.userId) {
      throw new NotFoundException(
        'Karyawan ini belum memiliki akun login. Buat akun terlebih dahulu.',
      );
    }

    await this.authClientService.resetPassword(
      employee.userId,
      dto.password,
      authorization,
    );

    return { id: employee.id };
  }

  /** Melengkapi setiap karyawan dengan objek shift (satu query untuk semua). */
  private async attachShifts(
    employees: Employee[],
  ): Promise<EmployeeWithShift[]> {
    const shiftIds = Array.from(
      new Set(
        employees
          .map((employee) => employee.shiftId)
          .filter((shiftId): shiftId is string => Boolean(shiftId)),
      ),
    );

    const shifts = shiftIds.length
      ? await this.workShiftsService.findByIds(shiftIds)
      : [];

    const shiftMap = new Map(shifts.map((shift) => [shift.id, shift]));

    return employees.map((employee) => ({
      ...employee,
      shift: employee.shiftId ? shiftMap.get(employee.shiftId) ?? null : null,
    }));
  }

  private async ensureNikAvailable(nik: string): Promise<void> {
    const existing = await this.employeesRepository.findOne({ where: { nik } });

    if (existing) {
      throw new ConflictException(`NIK ${nik} sudah dipakai karyawan lain`);
    }
  }

  private async ensureEmailAvailable(email: string): Promise<void> {
    const existing = await this.employeesRepository.findOne({
      where: { email },
    });

    if (existing) {
      throw new ConflictException(`Email ${email} sudah dipakai karyawan lain`);
    }
  }
}
