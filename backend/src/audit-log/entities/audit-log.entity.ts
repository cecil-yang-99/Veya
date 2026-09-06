import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuditActorType } from '@veya/shared';

/**
 * An immutable audit record. Rows are append-only: the application never
 * updates or deletes audit logs.
 */
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AuditActorType,
    enumName: 'audit_actor_type_enum',
    name: 'actor_type',
    default: AuditActorType.ADMIN,
  })
  actorType: AuditActorType;

  @Index()
  @Column({ type: 'uuid', name: 'admin_user_id', nullable: true })
  adminUserId: string | null;

  @Column({ type: 'varchar', length: 255, name: 'actor_name', nullable: true })
  actorName: string | null;

  @Index()
  @Column({ type: 'varchar', length: 128 })
  action: string;

  @Column({ type: 'varchar', length: 128 })
  resource: string;

  @Column({ type: 'varchar', length: 128, name: 'resource_id', nullable: true })
  resourceId: string | null;

  @Column({ type: 'varchar', length: 16 })
  method: string;

  @Column({ type: 'varchar', length: 512 })
  path: string;

  @Column({ type: 'int', name: 'status_code', nullable: true })
  statusCode: number | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ip: string | null;

  @Column({ type: 'varchar', length: 512, name: 'user_agent', nullable: true })
  userAgent: string | null;

  /** Sanitized request context (sensitive fields such as passwords removed). */
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @Index()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
