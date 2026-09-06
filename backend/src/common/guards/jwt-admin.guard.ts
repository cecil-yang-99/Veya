import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { AdminStatus } from '@veya/shared';
import { AdminUser } from '../../admin-users/entities/admin-user.entity';
import { extractBearerToken } from '../utils/bearer';

/**
 * Authenticates requests to admin console routes. Expects a Bearer JWT issued
 * by `POST /api/admin/auth/login`; attaches the active {@link AdminUser} to
 * `request.adminUser`.
 */
@Injectable()
export class JwtAdminGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = extractBearerToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    let payload: { sub?: string; type?: string };
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    if (payload.type !== 'admin' || !payload.sub) {
      throw new UnauthorizedException('Administrator token required');
    }

    const admin = await this.dataSource
      .getRepository(AdminUser)
      .findOne({ where: { id: payload.sub } });

    if (!admin || admin.status !== AdminStatus.ACTIVE) {
      throw new UnauthorizedException(
        'Administrator account does not exist or is disabled',
      );
    }

    request.adminUser = admin;
    return true;
  }
}
