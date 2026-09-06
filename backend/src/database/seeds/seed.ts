import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';
import { Logger } from '@nestjs/common';
import { AdminRole, AdminStatus, FeatureModuleCode } from '@veya/shared';
import { AppDataSource } from '../data-source';
import { AdminUser } from '../../admin-users/entities/admin-user.entity';
import { FeatureModule } from '../../feature-modules/entities/feature-module.entity';

dotenv.config();

const logger = new Logger('Seed');

/** Default feature modules registered by the platform. */
const FEATURE_MODULE_SEED: Array<{
  code: FeatureModuleCode;
  name: string;
  description: string;
  category: string;
  sortOrder: number;
}> = [
  {
    code: FeatureModuleCode.USERS,
    name: 'User Management',
    description: 'End user listing, details and account status management.',
    category: 'platform',
    sortOrder: 1,
  },
  {
    code: FeatureModuleCode.WALLETS,
    name: 'Wallet Management',
    description: 'Connected wallet inspection and unbinding.',
    category: 'platform',
    sortOrder: 2,
  },
  {
    code: FeatureModuleCode.KYC,
    name: 'KYC Verification',
    description: 'Identity verification submissions and compliance review.',
    category: 'compliance',
    sortOrder: 3,
  },
  {
    code: FeatureModuleCode.TRADING,
    name: 'Trading',
    description: 'Virtual trading workflows and trading pairs.',
    category: 'trading',
    sortOrder: 4,
  },
  {
    code: FeatureModuleCode.SWAP,
    name: 'Token Swap',
    description: 'Token swap functionality.',
    category: 'trading',
    sortOrder: 5,
  },
  {
    code: FeatureModuleCode.ASSETS,
    name: 'Assets',
    description: 'User asset balances and asset overview.',
    category: 'finance',
    sortOrder: 6,
  },
  {
    code: FeatureModuleCode.TRANSACTIONS,
    name: 'Transactions',
    description: 'Transaction records and status tracking.',
    category: 'finance',
    sortOrder: 7,
  },
  {
    code: FeatureModuleCode.SETTINGS,
    name: 'System Settings',
    description: 'Platform configuration and feature flags.',
    category: 'platform',
    sortOrder: 8,
  },
];

/**
 * Idempotent seed: creates the initial super administrator from environment
 * variables and upserts the default feature-module registry.
 */
async function run(): Promise<void> {
  await AppDataSource.initialize();
  logger.log('Data source initialized');

  const adminRepo = AppDataSource.getRepository(AdminUser);
  const moduleRepo = AppDataSource.getRepository(FeatureModule);

  // --- Super administrator -------------------------------------------------
  const username = process.env.SEED_ADMIN_USERNAME ?? 'superadmin';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@123456';
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@veya.local';

  const existingAdmin = await adminRepo.findOne({ where: { username } });
  if (existingAdmin) {
    logger.log(`Super administrator "${username}" already exists, skipping`);
  } else {
    const admin = adminRepo.create({
      username,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: AdminRole.SUPER_ADMIN,
      status: AdminStatus.ACTIVE,
    });
    await adminRepo.save(admin);
    logger.log(`Created super administrator "${username}"`);
  }

  // --- Feature modules -----------------------------------------------------
  for (const def of FEATURE_MODULE_SEED) {
    const existing = await moduleRepo.findOne({ where: { code: def.code } });
    if (existing) {
      // Keep user-defined state (isEnabled) but refresh presentation fields.
      existing.name = def.name;
      existing.description = def.description;
      existing.category = def.category;
      existing.sortOrder = def.sortOrder;
      existing.isSystem = true;
      await moduleRepo.save(existing);
    } else {
      await moduleRepo.save(
        moduleRepo.create({
          ...def,
          isEnabled: true,
          isSystem: true,
        }),
      );
      logger.log(`Registered feature module "${def.code}"`);
    }
  }

  await AppDataSource.destroy();
  logger.log('Seed completed');
}

run().catch((error) => {
  logger.error('Seed failed');
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
