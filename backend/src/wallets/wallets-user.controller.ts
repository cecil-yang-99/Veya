import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtUserGuard } from '../common/guards/jwt-user.guard';
import { User } from '../users/entities/user.entity';
import { WalletsService } from './wallets.service';
import { BindWalletDto } from './dto/bind-wallet.dto';

/**
 * User-facing wallet management (bound addresses, not the sign-in challenge,
 * which lives in AuthModule under /v1/wallets/nonce and /v1/wallets/verify).
 */
@Controller('v1/wallets')
@UseGuards(JwtUserGuard)
export class WalletsUserController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  listMine(@CurrentUser() user: User) {
    return this.walletsService.listByUser(user.id);
  }

  @Post()
  bind(@CurrentUser() user: User, @Body() dto: BindWalletDto) {
    return this.walletsService.bindWallet(
      user,
      dto.address,
      dto.chainId,
      dto.label,
    );
  }

  @Delete(':id')
  async unbind(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.walletsService.unbindForUser(user, id);
    return { success: true };
  }
}
