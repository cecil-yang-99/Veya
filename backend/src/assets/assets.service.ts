import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  TokenStatus,
  TransactionStatus,
  TransactionType,
} from '@veya/shared';
import { DataSource, Repository } from 'typeorm';
import { Token } from '../tokens/entities/token.entity';
import { UserTransaction } from '../transactions/entities/user-transaction.entity';
import { User } from '../users/entities/user.entity';
import { AssetBalance } from './entities/asset-balance.entity';

interface SandboxGrant {
  symbol: string;
  available: string;
  frozen?: string;
}

const SANDBOX_GRANTS: SandboxGrant[] = [
  { symbol: 'USDT', available: '12500.00000000' },
  { symbol: 'USDC', available: '2500.00000000' },
  { symbol: 'ETH', available: '3.42000000', frozen: '0.18000000' },
  { symbol: 'BTC', available: '0.08500000' },
  { symbol: 'SOL', available: '42.00000000' },
];

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(AssetBalance)
    private readonly balances: Repository<AssetBalance>,
    @InjectRepository(Token)
    private readonly tokens: Repository<Token>,
    private readonly dataSource: DataSource,
  ) {}

  async listForUser(user: User): Promise<AssetBalance[]> {
    await this.ensureSandboxPortfolio(user.id);
    return this.balances.find({
      where: { userId: user.id },
      relations: { token: true },
      order: { estimatedUsdValue: 'DESC' },
    });
  }

  async summaryForUser(user: User) {
    const balances = await this.listForUser(user);
    const totalEstimatedUsdValue = balances
      .reduce((sum, balance) => sum + Number(balance.estimatedUsdValue), 0)
      .toFixed(2);

    return {
      currency: 'USD',
      totalEstimatedUsdValue,
      sandbox: true,
      assetCount: balances.length,
    };
  }

  async ensureSandboxPortfolio(userId: string): Promise<void> {
    const existingCount = await this.balances.count({ where: { userId } });
    if (existingCount > 0) {
      return;
    }

    await this.dataSource.transaction(async (manager) => {
      const transactionBalances = manager.getRepository(AssetBalance);
      const transactionTokens = manager.getRepository(Token);
      const transactionLedger = manager.getRepository(UserTransaction);

      const alreadyInitialized = await transactionBalances.count({
        where: { userId },
      });
      if (alreadyInitialized > 0) {
        return;
      }

      for (const grant of SANDBOX_GRANTS) {
        const token = await transactionTokens.findOne({
          where: { symbol: grant.symbol, status: TokenStatus.ACTIVE },
        });
        if (!token) {
          continue;
        }

        const available = grant.available;
        const frozen = grant.frozen ?? '0.00000000';
        const estimatedUsdValue = this.estimateUsdValue(token.symbol, available, frozen);
        const balance = await transactionBalances.save(
          transactionBalances.create({
            userId,
            tokenId: token.id,
            available,
            frozen,
            estimatedUsdValue,
            source: 'sandbox',
          }),
        );

        await transactionLedger.save(
          transactionLedger.create({
            userId,
            type: TransactionType.SANDBOX_FUNDING,
            status: TransactionStatus.SUCCESS,
            assetBalanceId: balance.id,
            toTokenId: token.id,
            toAmount: available,
            usdValue: estimatedUsdValue,
            network: token.chain,
            metadata: {
              sandbox: true,
              reason: 'Initial sandbox portfolio funding',
            },
          }),
        );
      }
    });
  }

  private estimateUsdValue(symbol: string, available: string, frozen: string): string {
    const total = Number(available) + Number(frozen);
    const price = {
      BTC: 68000,
      ETH: 3450,
      SOL: 155,
      USDC: 1,
      USDT: 1,
    }[symbol] ?? 0;
    return (total * price).toFixed(8);
  }
}
