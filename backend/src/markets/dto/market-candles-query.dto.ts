import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { CandleInterval } from '@veya/shared';

export class MarketCandlesQueryDto {
  @IsOptional()
  @IsIn(Object.values(CandleInterval))
  interval: CandleInterval = CandleInterval.ONE_HOUR;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit: number = 50;
}
