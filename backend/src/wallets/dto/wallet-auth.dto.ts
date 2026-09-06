import { IsEthereumAddress, IsString, Matches, MaxLength, MinLength } from 'class-validator';

/** Request body for requesting a sign-in nonce. */
export class WalletNonceDto {
  @IsEthereumAddress()
  address: string;
}

/** Request body for verifying the signed nonce and obtaining a user JWT. */
export class WalletVerifyDto {
  @IsEthereumAddress()
  address: string;

  @IsString()
  @MinLength(10)
  @MaxLength(512)
  @Matches(/^0x[a-fA-F0-9]+$/, {
    message: 'signature must be a 0x-prefixed hexadecimal string',
  })
  signature: string;
}
