import { Column, Entity, Index } from 'typeorm';
import { AdminRole, AdminStatus } from '@veya/shared';
import { BaseEntity } from '../../database/base.entity';

/**
 * A console administrator account. Administrators operate the admin console;
 * they are distinct from platform end users ({@link User}).
 */
@Entity('admin_users')
export class AdminUser extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  /** Bcrypt hash of the administrator password. Never store plain text. */
  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: AdminRole,
    enumName: 'admin_role_enum',
    default: AdminRole.ADMIN,
  })
  role: AdminRole;

  @Column({
    type: 'enum',
    enum: AdminStatus,
    enumName: 'admin_status_enum',
    default: AdminStatus.ACTIVE,
  })
  status: AdminStatus;

  @Column({ type: 'timestamptz', name: 'last_login_at', nullable: true })
  lastLoginAt: Date | null;
}
