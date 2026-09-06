import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import { AuditActorType } from '@veya/shared';
import { AUDIT_KEY, AuditMetadata } from '../common/decorators/audit.decorator';
import { AuditLogService } from './audit-log.service';

/** Request fields that must never be persisted into audit metadata. */
const SENSITIVE_KEY_PATTERN = /password|token|signature|secret|privatekey/i;

/** Returns a shallow copy of the body with sensitive values removed. */
function sanitizeBody(
  body: unknown,
): Record<string, unknown> | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return null;
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Global interceptor that writes audit records for successful mutating admin
 * routes annotated with `@Audit(action, resource)`. The audit write happens
 * after the response and never affects the business operation.
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request & { adminUser?: { id: string; username: string } }>();
    const response = http.getResponse<Response>();

    const metadata = this.reflector.get<AuditMetadata | undefined>(
      AUDIT_KEY,
      context.getHandler(),
    );

    return next.handle().pipe(
      tap(() => {
        if (!metadata) {
          return;
        }
        if (!request.url.includes('/admin/')) {
          return;
        }
        if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method)) {
          return;
        }
        if (response.statusCode >= 400) {
          return;
        }

        const paramValues = Object.values(request.params ?? {});
        void this.auditLogService.record({
          actorType: AuditActorType.ADMIN,
          adminUserId: request.adminUser?.id ?? null,
          actorName: request.adminUser?.username ?? null,
          action: metadata.action,
          resource: metadata.resource,
          resourceId: paramValues.length > 0 ? String(paramValues[0]) : null,
          method: request.method,
          path: request.originalUrl ?? request.url,
          statusCode: response.statusCode,
          ip: request.ip ?? null,
          userAgent: request.headers['user-agent'] ?? null,
          metadata: sanitizeBody(request.body),
        });
      }),
    );
  }
}
