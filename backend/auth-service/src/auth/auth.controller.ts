import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserRole } from '../users/entities/user.entity';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

/** Tipe request yang sudah melewati JwtAuthGuard. */
type AuthedRequest = Request & { user: JwtPayload };

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrasi akun baru (publik)' })
  @ApiResponse({ status: 201, description: 'Akun berhasil dibuat' })
  @ResponseMessage('Registrasi berhasil')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login dan dapatkan JWT (publik)' })
  @ResponseMessage('Login berhasil')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Data user yang sedang login' })
  @ResponseMessage('Data user berhasil diambil')
  me(@Req() request: AuthedRequest) {
    return this.authService.getProfile(request.user.sub);
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ganti password akun yang sedang login' })
  @ResponseMessage('Password berhasil diubah')
  changePassword(
    @Req() request: AuthedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(request.user.sub, dto);
  }

  @Patch('users/:id/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reset password akun karyawan (HRD / employee-service)',
  })
  @ResponseMessage('Password akun berhasil direset')
  resetPassword(
    @Req() request: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
  ) {
    if (request.user.role !== UserRole.HRD) {
      throw new ForbiddenException(
        'Hanya HRD yang boleh mereset password karyawan',
      );
    }

    return this.authService.resetPassword(id, dto);
  }
}
