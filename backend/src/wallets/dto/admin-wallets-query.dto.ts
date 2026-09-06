import { IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { ChainType } from '@veya/shared';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

/** Filters for the admin wallet list. */
export class AdminListWalletsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsIn(Object.values(ChainType))
  chainType?: ChainType;
}
