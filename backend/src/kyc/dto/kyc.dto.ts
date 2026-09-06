import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { KycDocumentType, KycLevel, KycStatus } from '@veya/shared';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

/**
 * User-facing KYC submission payload. Submitted as multipart/form-data
 * together with the supporting document files.
 */
export class CreateKycSubmissionDto {
  @Type(() => Number)
  @IsInt()
  @Min(KycLevel.BASIC)
  @Max(KycLevel.FULL)
  level: number;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  fullName: string;

  @IsIn(Object.values(KycDocumentType))
  documentType: KycDocumentType;

  @IsString()
  @MinLength(4)
  @MaxLength(128)
  documentNumber: string;

  @IsString()
  @Matches(/^[A-Z]{2}$/, {
    message: 'country must be a 2-letter ISO country code (e.g. US, CN)',
  })
  country: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'dateOfBirth must use the YYYY-MM-DD format',
  })
  dateOfBirth: string;
}

/** Body for rejecting a KYC submission (a reason is mandatory). */
export class RejectKycDto {
  @IsString()
  @MinLength(5)
  @MaxLength(1000)
  reason: string;
}

/** Filters for the admin KYC submission list. */
export class AdminListKycQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn([KycStatus.PENDING, KycStatus.APPROVED, KycStatus.REJECTED])
  status?: KycStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(KycLevel.BASIC)
  @Max(KycLevel.FULL)
  level?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
