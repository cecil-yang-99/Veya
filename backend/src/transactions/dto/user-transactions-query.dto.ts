import { IsIn, IsOptional } from 'class-validator';
import { TransactionStatus, TransactionType } from '@veya/shared';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class UserTransactionsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(Object.values(TransactionType))
  type?: TransactionType;

  @IsOptional()
  @IsIn(Object.values(TransactionStatus))
  status?: TransactionStatus;
}
