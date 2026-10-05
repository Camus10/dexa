import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateAccountDto } from './dto/create-account.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { ResetAccountPasswordDto } from './dto/reset-account-password.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload, UserRole } from '../auth/interfaces/jwt-payload.interface';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@ApiTags('Employees')
@ApiBearerAuth()
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Daftar karyawan + filter + pagination (HRD)' })
  @ResponseMessage('Daftar karyawan berhasil diambil')
  findAll(@Query() query: QueryEmployeeDto) {
    return this.employeesService.findAll(query);
  }

  @Get('all')
  @Roles(UserRole.HRD)
  @ApiOperation({
    summary: 'Seluruh karyawan tanpa pagination (dipakai export & dropdown)',
  })
  @ResponseMessage('Daftar karyawan berhasil diambil')
  findAllForIntegration() {
    return this.employeesService.findForExport(200);
  }

  @Get('me')
  @ApiOperation({ summary: 'Data karyawan milik akun yang login (semua role)' })
  @ResponseMessage('Data karyawan berhasil diambil')
  findMine(@CurrentUser() user: JwtPayload) {
    return this.employeesService.findByUserId(user.sub);
  }

  @Get(':id')
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Detail karyawan (HRD)' })
  @ResponseMessage('Detail karyawan berhasil diambil')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Tambah karyawan (HRD)' })
  @ResponseMessage('Karyawan berhasil ditambahkan')
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Ubah data karyawan (HRD)' })
  @ResponseMessage('Data karyawan berhasil diperbarui')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Nonaktifkan karyawan atau soft delete (HRD)' })
  @ResponseMessage('Karyawan berhasil dinonaktifkan')
  deactivate(@Param('id') id: string) {
    return this.employeesService.deactivate(id);
  }

  @Post(':id/account')
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Buatkan akun login untuk karyawan (HRD)' })
  @ResponseMessage('Akun login berhasil dibuat')
  createAccount(@Param('id') id: string, @Body() dto: CreateAccountDto) {
    return this.employeesService.createAccount(id, dto);
  }

  @Patch(':id/account/password')
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Reset password akun login karyawan (HRD)' })
  @ResponseMessage('Password akun karyawan berhasil diubah')
  resetAccountPassword(
    @Param('id') id: string,
    @Body() dto: ResetAccountPasswordDto,
    @Headers('authorization') authorization: string,
  ) {
    return this.employeesService.resetAccountPassword(id, dto, authorization);
  }
}
