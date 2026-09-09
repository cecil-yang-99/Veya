import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { FeatureModuleCode } from '@veya/shared';
import { RequireFeature } from '../common/decorators/require-feature.decorator';
import { FeatureEnabledGuard } from '../common/guards/feature-enabled.guard';
import { MarketCandlesQueryDto } from './dto/market-candles-query.dto';
import { MarketsService } from './markets.service';

/** Public sandbox market data. */
@Controller('v1/markets')
@UseGuards(FeatureEnabledGuard)
@RequireFeature(FeatureModuleCode.TRADING)
export class MarketsPublicController {
  constructor(private readonly marketsService: MarketsService) {}

  @Get()
  list() {
    return this.marketsService.listActive();
  }

  @Get(':symbol')
  getOne(@Param('symbol') symbol: string) {
    return this.marketsService.getBySymbol(symbol);
  }

  @Get(':symbol/candles')
  getCandles(
    @Param('symbol') symbol: string,
    @Query() query: MarketCandlesQueryDto,
  ) {
    return this.marketsService.listCandles(symbol, query);
  }
}
