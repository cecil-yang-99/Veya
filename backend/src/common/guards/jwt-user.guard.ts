import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { UserStatus } from '@veya/shared';
import { User } from '../../users/entities/user.entity';
import { extractBearerToken } from '../utils/bearer';

/**
 * Authenticates user-facing API requests. Expects a Bearer JWT issued by
 * wallet-signature verification (`POST /api/v1/wallets/verify`); attaches the
 * active {@link User} to `request.user`.
 */
@Injectable()
export class JwtUserGuard implements CanActivate {
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

    if (payload.type !== 'user' || !payload.sub) {
      throw new UnauthorizedException('User token required');
    }

    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { id: payload.sub } });

    if (!user) {
      throw new UnauthorizedException('User account does not exist');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        'User account is suspended or banned',
      );
    }

    request.user = user;
    return true;
  }
}
