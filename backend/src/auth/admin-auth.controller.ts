import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CurrentAdmin } from '../common/decorators/current-admin.decorator';
import { JwtAdminGuard } from '../common/guards/jwt-admin.guard';
import { AdminUser } from '../admin-users/entities/admin-user.entity';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';

/**
 * Administrator console authentication (username + password).
 */
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: AdminLoginDto, @Req() req: Request) {
    return this.authService.adminLogin(dto, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  @Get('profile')
  @UseGuards(JwtAdminGuard)
  profile(@CurrentAdmin() admin: AdminUser) {
    return this.authService.getAdminProfile(admin.id);
  }
}
