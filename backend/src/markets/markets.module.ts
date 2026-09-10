import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketCandle } from './entities/market-candle.entity';
import { MarketPair } from './entities/market-pair.entity';
import { MarketsPublicController } from './markets-public.controller';
import { MarketsService } from './markets.service';

@Module({
  imports: [TypeOrmModule.forFeature([MarketPair, MarketCandle])],
  controllers: [MarketsPublicController],
  providers: [MarketsService],
  exports: [MarketsService],
})
export class MarketsModule {}
