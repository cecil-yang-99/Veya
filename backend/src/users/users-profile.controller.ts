import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUserGuard } from '../common/guards/jwt-user.guard';
import { User } from './entities/user.entity';

/**
 * User-facing profile endpoint. Returns the authenticated user's own record.
 */
@Controller('v1/profile')
@UseGuards(JwtUserGuard)
export class UsersProfileController {
  @Get()
  getProfile(@CurrentUser() user: User) {
    return user;
  }
}
