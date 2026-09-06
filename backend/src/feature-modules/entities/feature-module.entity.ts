import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../database/base.entity';

/**
 * A platform feature module that can be enabled or disabled from the admin
 * console. Toggles drive admin menu visibility and (for user-facing routes
 * guarded by FeatureEnabledGuard) API access.
 */
@Entity('feature_modules')
export class FeatureModule extends BaseEntity {
  /** Stable machine-readable code (see FeatureModuleCode in @veya/shared). */
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'varchar', length: 512, nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  category: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  icon: string | null;

  @Column({ type: 'boolean', name: 'is_enabled', default: true })
  isEnabled: boolean;

  @Column({ type: 'int', name: 'sort_order', default: 0 })
  sortOrder: number;

  /** System modules are seeded and must not be deleted. */
  @Column({ type: 'boolean', name: 'is_system', default: true })
  isSystem: boolean;
}
