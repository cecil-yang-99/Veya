import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';
import { Token } from '../../tokens/entities/token.entity';
import { User } from '../../users/entities/user.entity';

/** User-owned sandbox asset balance. Values are demo-only, not custody data. */
@Entity('asset_balances')
@Unique('uq_asset_balances_user_token', ['userId', 'tokenId'])
export class AssetBalance extends BaseEntity {
  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'token_id' })
  tokenId: string;

  @ManyToOne(() => Token, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'token_id' })
  token: Token;

  @Column({ type: 'numeric', precision: 28, scale: 8, default: 0 })
  available: string;

  @Column({ type: 'numeric', precision: 28, scale: 8, default: 0 })
  frozen: string;

  @Column({ type: 'numeric', precision: 28, scale: 8, name: 'estimated_usd_value', default: 0 })
  estimatedUsdValue: string;

  @Column({ type: 'varchar', length: 32, default: 'sandbox' })
  source: string;
}
