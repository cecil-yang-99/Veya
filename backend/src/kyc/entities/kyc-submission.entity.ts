import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { KycDocumentType, KycStatus } from '@veya/shared';
import { BaseEntity } from '../../database/base.entity';
import { User } from '../../users/entities/user.entity';
import { AdminUser } from '../../admin-users/entities/admin-user.entity';

/**
 * A KYC verification submission. Each submission moves through a simple
 * lifecycle: pending -> approved | rejected.
 */
@Entity('kyc_submissions')
export class KycSubmission extends BaseEntity {
  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /** Target verification tier (1 = basic, 2 = full). */
  @Column({ type: 'int' })
  level: number;

  @Index()
  @Column({
    type: 'enum',
    enum: [KycStatus.PENDING, KycStatus.APPROVED, KycStatus.REJECTED],
    enumName: 'kyc_submission_status_enum',
    default: KycStatus.PENDING,
  })
  status: KycStatus;

  @Column({ type: 'varchar', length: 255, name: 'full_name' })
  fullName: string;

  @Column({
    type: 'enum',
    enum: KycDocumentType,
    enumName: 'kyc_document_type_enum',
    name: 'document_type',
  })
  documentType: KycDocumentType;

  /**
   * Sensitive PII. Stored as plain text in this development phase;
   * a production deployment MUST apply field-level encryption here.
   */
  @Column({ type: 'varchar', length: 128, name: 'document_number' })
  documentNumber: string;

  @Column({ type: 'varchar', length: 64 })
  country: string;

  /** ISO date string (YYYY-MM-DD). */
  @Column({ type: 'date', name: 'date_of_birth' })
  dateOfBirth: string;

  /** Relative paths of the uploaded supporting documents. */
  @Column({ type: 'jsonb', name: 'document_files', default: () => `'[]'` })
  documentFiles: string[];

  @Column({ type: 'uuid', name: 'reviewed_by_id', nullable: true })
  reviewedById: string | null;

  @ManyToOne(() => AdminUser, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy: AdminUser | null;

  @Column({ type: 'timestamptz', name: 'reviewed_at', nullable: true })
  reviewedAt: Date | null;

  @Column({ type: 'text', name: 'reject_reason', nullable: true })
  rejectReason: string | null;
}
