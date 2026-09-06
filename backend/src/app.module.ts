import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { AuthModule } from './auth/auth.module';
import { AdminUsersModule } from './admin-users/admin-users.module';
import { KycModule } from './kyc/kyc.module';
import { FeatureModulesModule } from './feature-modules/feature-modules.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    AuditLogModule,
    UsersModule,
    WalletsModule,
    AuthModule,
    AdminUsersModule,
    KycModule,
    FeatureModulesModule,
    DashboardModule,
  ],
})
export class AppModule {}
