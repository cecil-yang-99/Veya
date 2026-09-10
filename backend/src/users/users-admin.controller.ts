import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Audit } from '../common/decorators/audit.decorator';
import { AUDIT_ACTIONS } from '@veya/shared';
import { JwtAdminGuard } from '../common/guards/jwt-admin.guard';
import { UsersService } from './users.service';
import { AdminListUsersQueryDto } from './dto/admin-users-query.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

/**
 * Admin console: platform user management.
 */
@Controller('admin/users')
@UseGuards(JwtAdminGuard)
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() query: AdminListUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getDetail(id);
  }

  @Patch(':id/status')
  @Audit(AUDIT_ACTIONS.USER_STATUS_CHANGE, 'user')
  setStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.usersService.setStatus(id, dto.status);
  }
}
