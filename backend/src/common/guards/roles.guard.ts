import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole } from '@veya/shared';
import { AdminUser } from '../../admin-users/entities/admin-user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Enforces role restrictions declared with `@Roles(...)`. Must run after
 * {@link JwtAdminGuard} so that `request.adminUser` is populated.
 * Super administrators bypass every role check.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const admin = context
      .switchToHttp()
      .getRequest<{ adminUser?: AdminUser }>().adminUser;
    if (!admin) {
      throw new ForbiddenException('Authenticated administrator required');
    }

    if (admin.role === AdminRole.SUPER_ADMIN) {
      return true;
    }

    if (!requiredRoles.includes(admin.role)) {
      throw new ForbiddenException(
        'Your administrator role is not allowed to perform this action',
      );
    }
    return true;
  }
}
