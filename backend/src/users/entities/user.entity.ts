import { Column, Entity, Index, OneToMany } from 'typeorm';
import { KycLevel, KycStatus, UserStatus } from '@veya/shared';
import { BaseEntity } from '../../database/base.entity';
import { Wallet } from '../../wallets/entities/wallet.entity';

/**
 * A platform end user. Users are created on first wallet sign-in and never
 * hold a password — authentication happens through wallet signatures.
 */
@Entity('users')
export class User extends BaseEntity {
  /** Human-friendly, unique public identifier (e.g. `VEYA-000001`). */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32, name: 'user_code' })
  userCode: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  nickname: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({
    type: 'enum',
    enum: UserStatus,
    enumName: 'user_status_enum',
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ type: 'int', name: 'kyc_level', default: KycLevel.NONE })
  kycLevel: number;

  @Column({
    type: 'enum',
    enum: KycStatus,
    enumName: 'kyc_status_enum',
    name: 'kyc_status',
    default: KycStatus.NONE,
  })
  kycStatus: KycStatus;

  @Column({ type: 'timestamptz', name: 'last_login_at', nullable: true })
  lastLoginAt: Date | null;

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Wallet[];
}
