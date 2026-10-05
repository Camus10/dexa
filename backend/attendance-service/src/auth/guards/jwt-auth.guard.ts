import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { verify } from 'jsonwebtoken';

import { JwtPayload } from '../interfaces/jwt-payload.interface';

/** Request yang sudah diverifikasi guard ini. */
export type AuthedRequest = Request & { user?: JwtPayload };

/**
 * Guard JWT tanpa Passport.
 *
 * Token dari header `Authorization: Bearer <token>` diverifikasi memakai
 * JWT_SECRET yang sama dengan auth-service. Payload hasil verifikasi
 * ditempelkan ke `request.user` supaya bisa dibaca @CurrentUser().
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const header = request.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token tidak ditemukan');
    }

    try {
      const payload = verify(
        header.slice(7),
        process.env.JWT_SECRET ?? 'rahasia_super_aman',
      ) as JwtPayload;

      request.user = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        employeeId: payload.employeeId ?? null,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Token tidak valid atau sudah kedaluwarsa');
    }
  }
}
