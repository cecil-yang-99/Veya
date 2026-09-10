import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { TransactionStatus, TransactionType } from '@veya/shared';
import { AssetBalance } from '../../assets/entities/asset-balance.entity';
import { BaseEntity } from '../../database/base.entity';
import { Token } from '../../tokens/entities/token.entity';
import { User } from '../../users/entities/user.entity';
import { Wallet } from '../../wallets/entities/wallet.entity';

/** User-facing sandbox transaction ledger entry. */
@Entity('user_transactions')
export class UserTransaction extends BaseEntity {
  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'wallet_id', nullable: true })
  walletId: string | null;

  @ManyToOne(() => Wallet, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet | null;

  @Column({
    type: 'enum',
    enum: TransactionType,
    enumName: 'transaction_type_enum',
  })
  type: TransactionType;

  @Index()
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    enumName: 'transaction_status_enum',
    default: TransactionStatus.SUCCESS,
  })
  status: TransactionStatus;

  @Column({ type: 'uuid', name: 'asset_balance_id', nullable: true })
  assetBalanceId: string | null;

  @ManyToOne(() => AssetBalance, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'asset_balance_id' })
  assetBalance: AssetBalance | null;

  @Column({ type: 'uuid', name: 'from_token_id', nullable: true })
  fromTokenId: string | null;

  @ManyToOne(() => Token, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'from_token_id' })
  fromToken: Token | null;

  @Column({ type: 'uuid', name: 'to_token_id', nullable: true })
  toTokenId: string | null;

  @ManyToOne(() => Token, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'to_token_id' })
  toToken: Token | null;

  @Column({ type: 'numeric', precision: 28, scale: 8, name: 'from_amount', nullable: true })
  fromAmount: string | null;

  @Column({ type: 'numeric', precision: 28, scale: 8, name: 'to_amount', nullable: true })
  toAmount: string | null;

  @Column({ type: 'numeric', precision: 28, scale: 8, name: 'usd_value', default: 0 })
  usdValue: string;

  @Column({ type: 'varchar', length: 128, name: 'tx_hash', nullable: true })
  txHash: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  network: string | null;

  @Column({ type: 'jsonb', default: () => `'{}'::jsonb` })
  metadata: Record<string, unknown>;
}
