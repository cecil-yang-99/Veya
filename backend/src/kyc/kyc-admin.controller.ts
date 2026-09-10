import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AUDIT_ACTIONS, AdminRole } from '@veya/shared';
import { Audit } from '../common/decorators/audit.decorator';
import { CurrentAdmin } from '../common/decorators/current-admin.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAdminGuard } from '../common/guards/jwt-admin.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminUser } from '../admin-users/entities/admin-user.entity';
import { KycService } from './kyc.service';
import { AdminListKycQueryDto, RejectKycDto } from './dto/kyc.dto';

/**
 * Admin console: KYC review queue and decisions. Accessible to compliance
 * reviewers and platform administrators (super admins bypass role checks).
 */
@Controller('admin/kyc/submissions')
@UseGuards(JwtAdminGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.COMPLIANCE)
export class KycAdminController {
  constructor(private readonly kycService: KycService) {}

  @Get()
  findAll(@Query() query: AdminListKycQueryDto) {
    return this.kycService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.kycService.findOne(id);
  }

  @Post(':id/approve')
  @Audit(AUDIT_ACTIONS.KYC_APPROVE, 'kyc_submission')
  approve(
    @CurrentAdmin() admin: AdminUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.kycService.approve(admin, id);
  }

  @Post(':id/reject')
  @Audit(AUDIT_ACTIONS.KYC_REJECT, 'kyc_submission')
  reject(
    @CurrentAdmin() admin: AdminUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectKycDto,
  ) {
    return this.kycService.reject(admin, id, dto.reason);
  }
}
