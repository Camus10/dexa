import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard JWT bawaan Passport. Dipakai pada endpoint yang butuh login
 * (mis. GET /api/auth/me). Hasil validasi JwtStrategy otomatis
 * ditempelkan ke `request.user`.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
