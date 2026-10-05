import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthedRequest } from '../guards/jwt-auth.guard';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Mengambil data user yang sedang login dari `request.user`.
 *
 * Contoh:
 *   findAll(@CurrentUser() user: JwtPayload)
 *   findMine(@CurrentUser('employeeId') employeeId: string)
 */
export const CurrentUser = createParamDecorator(
  (property: keyof JwtPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthedRequest>();
    const user = request.user;

    return property ? user?.[property] : user;
  },
);
