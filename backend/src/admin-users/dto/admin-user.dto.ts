import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AdminRole, AdminStatus } from '@veya/shared';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

/** Payload for creating a new administrator account. */
export class CreateAdminUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  username: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @IsIn(Object.values(AdminRole))
  role: AdminRole;
}

/** Payload for updating an administrator's profile/role. */
export class UpdateAdminUserDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsIn(Object.values(AdminRole))
  role?: AdminRole;
}

/** Payload for enabling/disabling an administrator. */
export class UpdateAdminStatusDto {
  @IsIn(Object.values(AdminStatus))
  status: AdminStatus;
}

/** Payload for resetting an administrator's password. */
export class ResetPasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string;
}

/** Filters for the administrator list. */
export class AdminListAdminsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(Object.values(AdminRole))
  role?: AdminRole;

  @IsOptional()
  @IsIn(Object.values(AdminStatus))
  status?: AdminStatus;
}
