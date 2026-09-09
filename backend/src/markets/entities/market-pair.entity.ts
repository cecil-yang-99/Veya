import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { MarketStatus } from '@veya/shared';
import { BaseEntity } from '../../database/base.entity';
import { Token } from '../../tokens/entities/token.entity';

/** A sandbox market pair such as ETH/USDT. */
@Entity('market_pairs')
export class MarketPair extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32 })
  symbol: string;

  @Column({ type: 'uuid', name: 'base_token_id' })
  baseTokenId: string;

  @ManyToOne(() => Token, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'base_token_id' })
  baseToken: Token;

  @Column({ type: 'uuid', name: 'quote_token_id' })
  quoteTokenId: string;

  @ManyToOne(() => Token, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'quote_token_id' })
  quoteToken: Token;

  @Column({ type: 'numeric', precision: 28, scale: 8, name: 'last_price' })
  lastPrice: string;

  @Column({ type: 'numeric', precision: 12, scale: 4, name: 'change_24h' })
  change24h: string;

  @Column({ type: 'numeric', precision: 28, scale: 8, name: 'volume_24h' })
  volume24h: string;

  @Column({
    type: 'enum',
    enum: MarketStatus,
    enumName: 'market_status_enum',
    default: MarketStatus.ACTIVE,
  })
  status: MarketStatus;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder: number;
}
