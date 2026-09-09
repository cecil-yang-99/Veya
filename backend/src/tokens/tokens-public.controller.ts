import { Controller, Get, Param } from '@nestjs/common';
import { TokensService } from './tokens.service';

/** Public token catalog used by the mobile app. */
@Controller('v1/tokens')
export class TokensPublicController {
  constructor(private readonly tokensService: TokensService) {}

  @Get()
  list() {
    return this.tokensService.findActive();
  }

  @Get(':symbol')
  getOne(@Param('symbol') symbol: string) {
    return this.tokensService.findBySymbol(symbol);
  }
}
