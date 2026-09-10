import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Injects the authenticated {@link AdminUser} attached by JwtAdminGuard.
 */
export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.adminUser;
  },
);
