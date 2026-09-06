import { IsIn } from 'class-validator';
import { UserStatus } from '@veya/shared';

/** Body for administrator-driven user status changes. */
export class UpdateUserStatusDto {
  @IsIn([UserStatus.ACTIVE, UserStatus.SUSPENDED, UserStatus.BANNED])
  status: UserStatus;
}
