import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

/**
 * Parameter Argon2id.
 * - memoryCost 64 MiB, timeCost 3 iterasi, parallelism 4
 * Angka ini dipilih agar aman sekaligus tetap wajar dipakai di laptop
 * penguji (login terasa ~100 ms).
 */
const ARGON2_OPTIONS: argon2.HashOptions = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

/** Data user yang aman dikirim ke frontend (tanpa password_hash). */
export interface AuthProfile {
  id: string;
  email: string;
  role: UserRole;
  employeeId: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /** POST /api/auth/register */
  async register(dto: RegisterDto): Promise<AuthProfile> {
    const existing = await this.usersService.findByEmail(dto.email);

    if (existing) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const user = await this.usersService.create({
      email: dto.email,
      passwordHash: await this.hashPassword(dto.password),
      role: dto.role ?? UserRole.EMPLOYEE,
      employeeId: dto.employeeId ?? null,
    });

    return this.toProfile(user);
  }

  /** POST /api/auth/login */
  async login(dto: LoginDto): Promise<{
    accessToken: string;
    user: AuthProfile;
  }> {
    const user = await this.usersService.findByEmail(dto.email);

    // Pesan sengaja sama untuk email tidak ada dan password salah,
    // supaya tidak membocorkan email mana yang terdaftar.
    if (!user || !(await this.verifyPassword(user.passwordHash, dto.password))) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: this.toProfile(user),
    };
  }

  /** GET /api/auth/me - data user dari token. */
  async getProfile(userId: string): Promise<AuthProfile> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Akun tidak ditemukan');
    }

    return this.toProfile(user);
  }

  /**
   * PATCH /api/auth/password - ganti password akun yang sedang login.
   *
   * Password lama diverifikasi lebih dulu supaya token yang bocor tidak cukup
   * untuk mengambil alih akun. Password baru di-hash ulang dengan Argon2id.
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ id: string }> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Akun tidak ditemukan');
    }

    if (!(await this.verifyPassword(user.passwordHash, dto.currentPassword))) {
      throw new UnauthorizedException('Password saat ini salah');
    }

    await this.usersService.updatePasswordHash(
      user.id,
      await this.hashPassword(dto.newPassword),
    );

    return { id: user.id };
  }

  /**
   * PATCH /api/auth/users/:id/password - reset password akun lain oleh HRD.
   *
   * HRD tidak mengetahui password lama karyawan, jadi password baru langsung
   * ditetapkan. Hak akses HRD diperiksa di controller.
   */
  async resetPassword(
    targetUserId: string,
    dto: ResetPasswordDto,
  ): Promise<{ id: string }> {
    const user = await this.usersService.findById(targetUserId);

    if (!user) {
      throw new NotFoundException('Akun tidak ditemukan');
    }

    await this.usersService.updatePasswordHash(
      user.id,
      await this.hashPassword(dto.password),
    );

    return { id: user.id };
  }

  /** Hash password baru dengan Argon2id. */
  private hashPassword(password: string): Promise<string> {
    return argon2.hash(password, ARGON2_OPTIONS);
  }

  /**
   * Verifikasi password. Dibungkus try/catch karena arangon.verify() melempar
   * error bila hash tidak dikenali (mis. data lama yang masih bcrypt),
   * dan itu harus dianggap sebagai "password salah", bukan error server.
   */
  private async verifyPassword(
    passwordHash: string,
    password: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(passwordHash, password);
    } catch {
      return false;
    }
  }

  private toProfile(user: User): AuthProfile {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
    };
  }
}
