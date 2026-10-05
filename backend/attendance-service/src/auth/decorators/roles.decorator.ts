import { SetMetadata } from '@nestjs/common';

import { UserRole } from '../interfaces/jwt-payload.interface';

/** Key metadata daftar role yang boleh mengakses sebuah handler. */
export const ROLES_KEY = 'roles';

/**
 * Membatasi akses endpoint berdasarkan role.
 * Contoh: @Roles(UserRole.HRD) - hanya HRD yang boleh mengakses.
 * Dipakai bersama RolesGuard.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
