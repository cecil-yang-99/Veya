import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  WalletNonceDto,
  WalletVerifyDto,
} from '../wallets/dto/wallet-auth.dto';

/**
 * User-facing wallet-signature authentication endpoints.
 * `nonce` issues a challenge; `verify` checks the signature and returns a JWT.
 */
@Controller('v1/wallets')
export class WalletAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('nonce')
  nonce(@Body() dto: WalletNonceDto) {
    return this.authService.walletNonce(dto.address);
  }

  @Post('verify')
  verify(@Body() dto: WalletVerifyDto) {
    return this.authService.walletVerify(dto.address, dto.signature);
  }
}
