import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsIn, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
import { Repository } from 'typeorm';
import { AuditActorType } from '@veya/shared';
import { AuditLog } from './entities/audit-log.entity';
import {
  PaginatedResultDto,
  PaginationQueryDto,
} from '../common/dto/pagination.dto';

/** Query parameters for the admin audit-log list. */
export class AuditLogQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(Object.values(AuditActorType))
  actorType?: AuditActorType;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  resource?: string;

  @IsOptional()
  @IsUUID()
  adminUserId?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

export interface RecordAuditEntry {
  actorType?: AuditActorType;
  adminUserId?: string | null;
  actorName?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  method: string;
  path: string;
  statusCode?: number | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Append-only audit trail. The service exposes writes (`record`) for the
 * interceptor and explicit callers, plus read-only listing for the console.
 */
@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  /** Persists a single audit record. Never throws to the caller. */
  async record(entry: RecordAuditEntry): Promise<void> {
    try {
      const log = this.repo.create({
        actorType: entry.actorType ?? AuditActorType.ADMIN,
        adminUserId: entry.adminUserId ?? null,
        actorName: entry.actorName ?? null,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId ?? null,
        method: entry.method,
        path: entry.path,
        statusCode: entry.statusCode ?? null,
        ip: entry.ip ?? null,
        userAgent: entry.userAgent ?? null,
        metadata: entry.metadata ?? null,
      });
      await this.repo.save(log);
    } catch {
      // Auditing must never break the underlying business operation.
    }
  }

  /** Paginated, newest-first audit trail with optional filters. */
  async findAll(
    query: AuditLogQueryDto,
  ): Promise<PaginatedResultDto<AuditLog>> {
    const qb = this.repo
      .createQueryBuilder('log')
      .orderBy('log.createdAt', 'DESC');

    if (query.actorType) {
      qb.andWhere('log.actor_type = :actorType', {
        actorType: query.actorType,
      });
    }
    if (query.action) {
      qb.andWhere('log.action ILIKE :action', { action: `%${query.action}%` });
    }
    if (query.resource) {
      qb.andWhere('log.resource ILIKE :resource', {
        resource: `%${query.resource}%`,
      });
    }
    if (query.adminUserId) {
      qb.andWhere('log.admin_user_id = :adminUserId', {
        adminUserId: query.adminUserId,
      });
    }
    if (query.dateFrom) {
      qb.andWhere('log.created_at >= :dateFrom', { dateFrom: query.dateFrom });
    }
    if (query.dateTo) {
      qb.andWhere('log.created_at <= :dateTo', { dateTo: query.dateTo });
    }

    qb.skip(query.skip).take(query.take);

    const [items, total] = await qb.getManyAndCount();
    return new PaginatedResultDto(items, total, query.page, query.pageSize);
  }
}
