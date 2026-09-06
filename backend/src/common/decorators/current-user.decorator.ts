import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Injects the authenticated platform {@link User} attached by JwtUserGuard.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
