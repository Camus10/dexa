import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'rahasia_super_aman',
        signOptions: {
          // JWT_EXPIRES_IN diisi "1d" pada .env. Cast ke number diperlukan
          // karena tipe `expiresIn` memakai template literal StringValue dari
          // package `ms`, sedangkan hasil config.get() bertipe string umum.
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ??
            '1d') as unknown as number,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
