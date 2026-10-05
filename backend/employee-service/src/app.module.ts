import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnnouncementsModule } from './announcements/announcements.module';
import { EmployeesModule } from './employees/employees.module';
import { HolidaysModule } from './holidays/holidays.module';
import { OfficeLocationsModule } from './office-locations/office-locations.module';
import { WorkShiftsModule } from './work-shifts/work-shifts.module';

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
        database: config.get<string>('DB_NAME', 'db_employee'),
        autoLoadEntities: true,
        synchronize: true,
        logging: false,
      }),
    }),
    WorkShiftsModule,
    OfficeLocationsModule,
    HolidaysModule,
    AnnouncementsModule,
    EmployeesModule,
  ],
})
export class AppModule {}
