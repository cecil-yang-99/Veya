import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { AdminUser } from './entities/admin-user.entity';
import { AdminUsersService } from './admin-users.service';
import {
  AdminListAdminsQueryDto,
  CreateAdminUserDto,
  ResetPasswordDto,
  UpdateAdminStatusDto,
  UpdateAdminUserDto,
} from './dto/admin-user.dto';

/**
 * Administrator account management (super admins only).
 */
@Controller('admin/admins')
@UseGuards(JwtAdminGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Post()
  @Audit(AUDIT_ACTIONS.ADMIN_CREATE, 'admin_user')
  create(@Body() dto: CreateAdminUserDto) {
    return this.adminUsersService.create(dto);
  }

  @Get()
  findAll(@Query() query: AdminListAdminsQueryDto) {
    return this.adminUsersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminUsersService.findOne(id);
  }

  @Patch(':id')
  @Audit(AUDIT_ACTIONS.ADMIN_UPDATE, 'admin_user')
  update(
    @CurrentAdmin() actor: AdminUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return this.adminUsersService.update(actor.id, id, dto);
  }

  @Patch(':id/status')
  @Audit(AUDIT_ACTIONS.ADMIN_STATUS_CHANGE, 'admin_user')
  setStatus(
    @CurrentAdmin() actor: AdminUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdminStatusDto,
  ) {
    return this.adminUsersService.setStatus(actor.id, id, dto.status);
  }

  @Post(':id/reset-password')
  @Audit(AUDIT_ACTIONS.ADMIN_PASSWORD_RESET, 'admin_user')
  resetPassword(
    @CurrentAdmin() actor: AdminUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.adminUsersService.resetPassword(actor.id, id, dto.newPassword);
  }
}
