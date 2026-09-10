import {
  IsEthereumAddress,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** Request body for binding an additional wallet to the authenticated user. */
export class BindWalletDto {
  @IsEthereumAddress()
  address: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999_999_999)
  chainId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  label?: string;
}
