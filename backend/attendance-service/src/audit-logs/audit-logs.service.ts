import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuditLog } from './entities/audit-log.entity';

export interface AuditLogInput {
  actorId: string | null;
  actorRole: string | null;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  description?: string | null;
}

/**
 * Pencatat jejak audit.
 *
 * `log()` sengaja tidak melempar error ke pemanggil: kegagalan menulis audit
 * tidak boleh menggagalkan aksi utama (mis. absen masuk tetap sukses).
 */
@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogsRepository: Repository<AuditLog>,
  ) {}

  async log(input: AuditLogInput): Promise<void> {
    try {
      await this.auditLogsRepository.save(
        this.auditLogsRepository.create({
          actorId: input.actorId,
          actorRole: input.actorRole,
          action: input.action,
          entity: input.entity ?? null,
          entityId: input.entityId ?? null,
          description: input.description ?? null,
        }),
      );
    } catch {
      // Sengaja diabaikan (best effort).
    }
  }

  findAll(limit = 50): Promise<AuditLog[]> {
    return this.auditLogsRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
