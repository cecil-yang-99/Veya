import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUser } from '../admin-users/entities/admin-user.entity';
import { WalletsModule } from '../wallets/wallets.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AuthService } from './auth.service';
import { AdminAuthController } from './admin-auth.controller';
import { WalletAuthController } from './wallet-auth.controller';

/**
 * Authentication module: administrator username/password login and
 * user wallet-signature login. Registers the global JWT client used by
 * every JWT guard in the application.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([AdminUser]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: { expiresIn: config.get<string>('jwt.expiresIn') },
      }),
      global: true,
    }),
    WalletsModule,
    AuditLogModule,
  ],
  controllers: [AdminAuthController, WalletAuthController],
  providers: [AuthService],
})
export class AuthModule {}
