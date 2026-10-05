import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttendancesModule } from './attendances/attendances.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { CorrectionsModule } from './corrections/corrections.module';
import { LeavesModule } from './leaves/leaves.module';
import { OvertimesModule } from './overtimes/overtimes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<string>('DB_PORT', '3306')),
        username: config.get<string>('DB_USER', 'root'),
        password: config.get<string>('DB_PASS', ''),
        database: config.get<string>('DB_NAME', 'db_attendance'),
        autoLoadEntities: true,
        synchronize: true,
        logging: false,
      }),
    }),
    AuditLogsModule,
    AttendancesModule,
    LeavesModule,
    OvertimesModule,
    CorrectionsModule,
  ],
})
export class AppModule {}
