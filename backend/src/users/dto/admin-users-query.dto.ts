import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { KycLevel, KycStatus, UserStatus } from '@veya/shared';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

/** Filters for the admin user list. */
export class AdminListUsersQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(Object.values(UserStatus))
  status?: UserStatus;

  @IsOptional()
  @IsIn(Object.values(KycStatus))
  kycStatus?: KycStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(KycLevel.NONE)
  @Max(KycLevel.FULL)
  kycLevel?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
