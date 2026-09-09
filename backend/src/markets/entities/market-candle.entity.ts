import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { CandleInterval } from '@veya/shared';
import { BaseEntity } from '../../database/base.entity';
import { MarketPair } from './market-pair.entity';

/** OHLCV sample candle for sandbox market display. */
@Entity('market_candles')
@Unique('uq_market_candles_pair_interval_opened_at', [
  'pairId',
  'interval',
  'openedAt',
])
export class MarketCandle extends BaseEntity {
  @Index()
  @Column({ type: 'uuid', name: 'pair_id' })
  pairId: string;

  @ManyToOne(() => MarketPair, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pair_id' })
  pair: MarketPair;

  @Column({
    type: 'enum',
    enum: CandleInterval,
    enumName: 'candle_interval_enum',
    default: CandleInterval.ONE_HOUR,
  })
  interval: CandleInterval;

  @Column({ type: 'numeric', precision: 28, scale: 8 })
  open: string;

  @Column({ type: 'numeric', precision: 28, scale: 8 })
  high: string;

  @Column({ type: 'numeric', precision: 28, scale: 8 })
  low: string;

  @Column({ type: 'numeric', precision: 28, scale: 8 })
  close: string;

  @Column({ type: 'numeric', precision: 28, scale: 8 })
  volume: string;

  @Index()
  @Column({ type: 'timestamptz', name: 'opened_at' })
  openedAt: Date;
}
