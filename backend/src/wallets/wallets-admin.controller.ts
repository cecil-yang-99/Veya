import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AUDIT_ACTIONS } from '@veya/shared';
import { Audit } from '../common/decorators/audit.decorator';
import { JwtAdminGuard } from '../common/guards/jwt-admin.guard';
import { WalletsService } from './wallets.service';
import { AdminListWalletsQueryDto } from './dto/admin-wallets-query.dto';

/**
 * Admin console: wallet inspection and unbinding.
 */
@Controller('admin/wallets')
@UseGuards(JwtAdminGuard)
export class WalletsAdminController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  findAll(@Query() query: AdminListWalletsQueryDto) {
    return this.walletsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.walletsService.findOne(id);
  }

  @Delete(':id')
  @Audit(AUDIT_ACTIONS.WALLET_UNBIND, 'wallet')
  async unbind(@Param('id', ParseUUIDPipe) id: string) {
    const wallet = await this.walletsService.findOne(id);
    await this.walletsService.unbind(wallet);
    return { success: true };
  }
}
