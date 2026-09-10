import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
  Index,
} from 'typeorm';
import { ChainType } from '@veya/shared';
import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';

/**
 * A connected Web3 wallet. An address may only be bound to one user per chain
 * family. Sign-in nonces are stored here for wallet-signature authentication.
 */
@Entity('wallets')
@Unique('uq_wallets_address_chain_type', ['address', 'chainType'])
export class Wallet extends BaseEntity {
  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.wallets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** Wallet address, always stored in lower-case for consistent lookups. */
  @Column({ type: 'varchar', length: 128 })
  address: string;

  @Column({
    type: 'enum',
    enum: ChainType,
    enumName: 'chain_type_enum',
    name: 'chain_type',
    default: ChainType.EVM,
  })
  chainType: ChainType;

  @Column({ type: 'int', name: 'chain_id', nullable: true })
  chainId: number | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  label: string | null;

  @Column({ type: 'boolean', name: 'is_primary', default: false })
  isPrimary: boolean;

  /** One-time nonce for the pending sign-in challenge; cleared after use. */
  @Column({ type: 'varchar', length: 128, name: 'sign_in_nonce', nullable: true })
  signInNonce: string | null;

  @Column({
    type: 'timestamptz',
    name: 'last_connected_at',
    nullable: true,
  })
  lastConnectedAt: Date | null;
}
