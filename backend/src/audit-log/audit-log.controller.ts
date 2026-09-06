import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAdminGuard } from '../common/guards/jwt-admin.guard';
import { AuditLogService, AuditLogQueryDto } from './audit-log.service';

/**
 * Read-only audit trail for the admin console. The Audit Log menu entry in
 * the console must always remain available; this endpoint requires only a
 * valid administrator session (no feature-module gating).
 */
@Controller('admin/audit-logs')
@UseGuards(JwtAdminGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  findAll(@Query() query: AuditLogQueryDto) {
    return this.auditLogService.findAll(query);
  }
}
