import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MarketStatus } from '@veya/shared';
import { Repository } from 'typeorm';
import { MarketCandlesQueryDto } from './dto/market-candles-query.dto';
import { MarketCandle } from './entities/market-candle.entity';
import { MarketPair } from './entities/market-pair.entity';

@Injectable()
export class MarketsService {
  constructor(
    @InjectRepository(MarketPair)
    private readonly pairs: Repository<MarketPair>,
    @InjectRepository(MarketCandle)
    private readonly candles: Repository<MarketCandle>,
  ) {}

  listActive(): Promise<MarketPair[]> {
    return this.pairs.find({
      where: { status: MarketStatus.ACTIVE },
      relations: { baseToken: true, quoteToken: true },
      order: { sortOrder: 'ASC', symbol: 'ASC' },
    });
  }

  async getBySymbol(symbol: string): Promise<MarketPair> {
    const pair = await this.pairs.findOne({
      where: {
        symbol: this.normalizeSymbol(symbol),
        status: MarketStatus.ACTIVE,
      },
      relations: { baseToken: true, quoteToken: true },
    });
    if (!pair) {
      throw new NotFoundException('Market pair not found');
    }
    return pair;
  }

  async listCandles(
    symbol: string,
    query: MarketCandlesQueryDto,
  ): Promise<MarketCandle[]> {
    const pair = await this.getBySymbol(symbol);
    return this.candles.find({
      where: { pairId: pair.id, interval: query.interval },
      order: { openedAt: 'DESC' },
      take: query.limit,
    });
  }

  private normalizeSymbol(symbol: string): string {
    return symbol.trim().toUpperCase().replace('-', '/');
  }
}
