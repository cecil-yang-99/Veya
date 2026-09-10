import { Column, Entity, Index } from 'typeorm';
import { TokenStatus } from '@veya/shared';
import { BaseEntity } from '../../database/base.entity';

/** A sandbox-tradable token shown in the mobile app. */
@Entity('tokens')
export class Token extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 16 })
  symbol: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'varchar', length: 64 })
  chain: string;

  @Column({ type: 'varchar', length: 128, name: 'contract_address', nullable: true })
  contractAddress: string | null;

  @Column({ type: 'int' })
  decimals: number;

  @Column({ type: 'varchar', length: 512, name: 'logo_url', nullable: true })
  logoUrl: string | null;

  @Column({
    type: 'enum',
    enum: TokenStatus,
    enumName: 'token_status_enum',
    default: TokenStatus.ACTIVE,
  })
  status: TokenStatus;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder: number;
}
