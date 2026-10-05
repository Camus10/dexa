import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

/**
 * Akses data akun login. Satu-satunya tempat yang boleh menyentuh
 * tabel `users` di db_auth.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  /** Dipakai attendance/employee service via endpoint internal bila perlu. */
  findByEmployeeId(employeeId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { employeeId } });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    role: User['role'];
    employeeId?: string | null;
  }): Promise<User> {
    const user = this.usersRepository.create({
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
      employeeId: data.employeeId ?? null,
    });

    return this.usersRepository.save(user);
  }

  /** Dipakai endpoint internal untuk menautkan akun ke karyawan. */
  async attachEmployee(userId: string, employeeId: string): Promise<void> {
    await this.usersRepository.update({ id: userId }, { employeeId });
  }

  /**
   * Menyimpan hash password baru.
   * Dipakai ganti password sendiri (PATCH /api/auth/password) dan reset oleh
   * HRD (PATCH /api/auth/users/:id/password).
   */
  async updatePasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    await this.usersRepository.update({ id: userId }, { passwordHash });
  }
}
