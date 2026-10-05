import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Strategi verifikasi JWT.
 *
 * Token dibaca dari header `Authorization: Bearer <token>` dan diverifikasi
 * memakai JWT_SECRET yang sama dengan service lain (lihat .env). JWT_SECRET
 * sudah dimuat ConfigModule.forRoot() sebelum provider ini dibuat.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'rahasia_super_aman',
    });
  }

  /** Nilai yang di-return otomatis menjadi `request.user`. */
  validate(payload: JwtPayload): JwtPayload {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      employeeId: payload.employeeId ?? null,
    };
  }
}
