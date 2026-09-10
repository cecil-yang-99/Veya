import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { KycStatus, UserStatus } from '@veya/shared';
import { JwtAdminGuard } from '../common/guards/jwt-admin.guard';
import { User } from '../users/entities/user.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { KycSubmission } from '../kyc/entities/kyc-submission.entity';
import { FeatureModule } from '../feature-modules/entities/feature-module.entity';

/**
 * Admin console dashboard: high-level platform counters.
 */
@Controller('admin/dashboard')
@UseGuards(JwtAdminGuard)
export class DashboardController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Get('summary')
  async summary() {
    const users = this.dataSource.getRepository(User);
    const wallets = this.dataSource.getRepository(Wallet);
    const kyc = this.dataSource.getRepository(KycSubmission);
    const modules = this.dataSource.getRepository(FeatureModule);

    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      bannedUsers,
      pendingKyc,
      totalWallets,
      enabledModules,
      totalModules,
    ] = await Promise.all([
      users.count(),
      users.count({ where: { status: UserStatus.ACTIVE } }),
      users.count({ where: { status: UserStatus.SUSPENDED } }),
      users.count({ where: { status: UserStatus.BANNED } }),
      kyc.count({ where: { status: KycStatus.PENDING } }),
      wallets.count(),
      modules.count({ where: { isEnabled: true } }),
      modules.count(),
    ]);

    return {
      users: { total: totalUsers, active: activeUsers, suspended: suspendedUsers, banned: bannedUsers },
      pendingKyc,
      totalWallets,
      featureModules: { enabled: enabledModules, total: totalModules },
    };
  }
}
