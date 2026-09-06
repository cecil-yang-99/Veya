import { SetMetadata } from '@nestjs/common';

/** Metadata key consumed by AuditLogInterceptor. */
export const AUDIT_KEY = 'audit_metadata';

export interface AuditMetadata {
  /** Action name, e.g. `kyc.approve`. Falls back to AUDIT_ACTIONS constants. */
  action: string;
  /** Resource name, e.g. `kyc_submission`. */
  resource: string;
}

/**
 * Marks a mutating admin route for audit logging. After a successful response
 * the AuditLogInterceptor writes an immutable record attributed to the
 * authenticated administrator.
 */
export const Audit = (action: string, resource: string) =>
  SetMetadata(AUDIT_KEY, { action, resource } satisfies AuditMetadata);
