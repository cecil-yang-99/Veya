import { SetMetadata } from '@nestjs/common';
import { AdminRole } from '@veya/shared';

/** Metadata key consumed by {@link RolesGuard}. */
export const ROLES_KEY = 'admin_roles';

/**
 * Restricts a route to the listed administrator roles.
 * Usage: `@Roles(AdminRole.SUPER_ADMIN)`.
 */
export const Roles = (...roles: AdminRole[]) => SetMetadata(ROLES_KEY, roles);
