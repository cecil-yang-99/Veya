import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@veya/shared';

/**
 * Standard pagination query parameters shared by all list endpoints.
 */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  pageSize: number = DEFAULT_PAGE_SIZE;

  /** Number of rows to skip (TypeORM `skip`). */
  get skip(): number {
    return (this.page - 1) * this.pageSize;
  }

  /** Number of rows to take (TypeORM `take`). */
  get take(): number {
    return this.pageSize;
  }
}

/** Uniform paginated response envelope returned by list endpoints. */
export class PaginatedResultDto<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;

  constructor(items: T[], total: number, page: number, pageSize: number) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
  }
}
