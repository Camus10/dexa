import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { AuditLogsService } from './audit-logs.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/interfaces/jwt-payload.interface';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles(UserRole.HRD)
  @ApiOperation({ summary: 'Jejak audit terbaru (HRD)' })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ResponseMessage('Jejak audit berhasil diambil')
  findAll(@Query('limit') limit?: string) {
    return this.auditLogsService.findAll(limit ? Number(limit) : 50);
  }
}
