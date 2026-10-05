import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../interfaces/jwt-payload.interface';
import { AuthedRequest } from './jwt-auth.guard';

/**
 * Guard otorisasi berbasis role.
 *
 * Urutannya selalu JwtAuthGuard lalu RolesGuard, sehingga `request.user`
 * sudah terisi saat guard ini berjalan. Endpoint tanpa @Roles() dilewatkan
 * (artinya cukup login).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthedRequest>();

    if (!request.user || !requiredRoles.includes(request.user.role)) {
      throw new ForbiddenException(
        'Anda tidak memiliki hak akses untuk aksi ini',
      );
    }

    return true;
  }
}
