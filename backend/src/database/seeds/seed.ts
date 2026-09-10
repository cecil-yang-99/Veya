import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';
import { Logger } from '@nestjs/common';
import {
  AdminRole,
  AdminStatus,
  CandleInterval,
  FeatureModuleCode,
} from '@veya/shared';
import { AppDataSource } from '../data-source';
import { AdminUser } from '../../admin-users/entities/admin-user.entity';
import { FeatureModule } from '../../feature-modules/entities/feature-module.entity';
import { MarketCandle } from '../../markets/entities/market-candle.entity';
import { MarketPair } from '../../markets/entities/market-pair.entity';
import { Token } from '../../tokens/entities/token.entity';

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

const TOKEN_SEED = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    chain: 'bitcoin',
    contractAddress: null,
    decimals: 8,
    logoUrl: null,
    sortOrder: 1,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    chain: 'ethereum',
    contractAddress: null,
    decimals: 18,
    logoUrl: null,
    sortOrder: 2,
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    chain: 'ethereum',
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    logoUrl: null,
    sortOrder: 3,
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    chain: 'ethereum',
    contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    logoUrl: null,
    sortOrder: 4,
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    chain: 'solana',
    contractAddress: null,
    decimals: 9,
    logoUrl: null,
    sortOrder: 5,
  },
] as const;

const MARKET_SEED = [
  {
    symbol: 'BTC/USDT',
    base: 'BTC',
    quote: 'USDT',
    lastPrice: '68000.00000000',
    change24h: '2.4500',
    volume24h: '1245.78000000',
    sortOrder: 1,
  },
  {
    symbol: 'ETH/USDT',
    base: 'ETH',
    quote: 'USDT',
    lastPrice: '3450.00000000',
    change24h: '-0.8200',
    volume24h: '15420.12000000',
    sortOrder: 2,
  },
  {
    symbol: 'SOL/USDT',
    base: 'SOL',
    quote: 'USDT',
    lastPrice: '155.00000000',
    change24h: '5.1800',
    volume24h: '87500.00000000',
    sortOrder: 3,
  },
  {
    symbol: 'ETH/USDC',
    base: 'ETH',
    quote: 'USDC',
    lastPrice: '3448.50000000',
    change24h: '-0.7600',
    volume24h: '4210.50000000',
    sortOrder: 4,
  },
] as const;

/**
 * Idempotent seed: creates the initial super administrator from environment
 * variables and upserts the default feature-module registry.
 */
async function run(): Promise<void> {
  await AppDataSource.initialize();
  logger.log('Data source initialized');

  const adminRepo = AppDataSource.getRepository(AdminUser);
  const moduleRepo = AppDataSource.getRepository(FeatureModule);
  const tokenRepo = AppDataSource.getRepository(Token);
  const marketRepo = AppDataSource.getRepository(MarketPair);
  const candleRepo = AppDataSource.getRepository(MarketCandle);

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

  // --- Sandbox tokens ------------------------------------------------------
  const tokensBySymbol = new Map<string, Token>();
  for (const def of TOKEN_SEED) {
    const existing = await tokenRepo.findOne({ where: { symbol: def.symbol } });
    const token = existing
      ? tokenRepo.merge(existing, def)
      : tokenRepo.create(def);
    const saved = await tokenRepo.save(token);
    tokensBySymbol.set(saved.symbol, saved);
    if (!existing) {
      logger.log(`Registered sandbox token "${saved.symbol}"`);
    }
  }

  // --- Sandbox markets and candles ----------------------------------------
  for (const def of MARKET_SEED) {
    const baseToken = tokensBySymbol.get(def.base);
    const quoteToken = tokensBySymbol.get(def.quote);
    if (!baseToken || !quoteToken) {
      throw new Error(`Missing token for market ${def.symbol}`);
    }

    const existing = await marketRepo.findOne({ where: { symbol: def.symbol } });
    const market = existing
      ? marketRepo.merge(existing, {
          baseTokenId: baseToken.id,
          quoteTokenId: quoteToken.id,
          lastPrice: def.lastPrice,
          change24h: def.change24h,
          volume24h: def.volume24h,
          sortOrder: def.sortOrder,
        })
      : marketRepo.create({
          symbol: def.symbol,
          baseTokenId: baseToken.id,
          quoteTokenId: quoteToken.id,
          lastPrice: def.lastPrice,
          change24h: def.change24h,
          volume24h: def.volume24h,
          sortOrder: def.sortOrder,
        });
    const savedMarket = await marketRepo.save(market);
    if (!existing) {
      logger.log(`Registered sandbox market "${savedMarket.symbol}"`);
    }

    const candleCount = await candleRepo.count({
      where: { pairId: savedMarket.id },
    });
    if (candleCount === 0) {
      const basePrice = Number(def.lastPrice);
      const openedAtBase = new Date('2026-09-09T00:00:00.000Z');
      const candles = Array.from({ length: 48 }, (_, index) => {
        const drift = (index - 24) * 0.0015;
        const wave = Math.sin(index / 3) * 0.008;
        const open = basePrice * (1 + drift + wave);
        const close = open * (1 + Math.cos(index / 4) * 0.004);
        const high = Math.max(open, close) * 1.006;
        const low = Math.min(open, close) * 0.994;
        const openedAt = new Date(openedAtBase);
        openedAt.setUTCHours(openedAtBase.getUTCHours() - (47 - index));

        return candleRepo.create({
          pairId: savedMarket.id,
          interval: CandleInterval.ONE_HOUR,
          open: open.toFixed(8),
          high: high.toFixed(8),
          low: low.toFixed(8),
          close: close.toFixed(8),
          volume: (Number(def.volume24h) / 48).toFixed(8),
          openedAt,
        });
      });
      await candleRepo.save(candles);
      logger.log(`Seeded ${candles.length} candles for "${savedMarket.symbol}"`);
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
