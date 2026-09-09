import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { FeatureModuleCode } from '@veya/shared';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequireFeature } from '../common/decorators/require-feature.decorator';
import { FeatureEnabledGuard } from '../common/guards/feature-enabled.guard';
import { JwtUserGuard } from '../common/guards/jwt-user.guard';
import { User } from '../users/entities/user.entity';
import { UserTransactionsQueryDto } from './dto/user-transactions-query.dto';
import { TransactionsService } from './transactions.service';

/** Authenticated sandbox transaction history. */
@Controller('v1/transactions')
@UseGuards(JwtUserGuard, FeatureEnabledGuard)
@RequireFeature(FeatureModuleCode.TRANSACTIONS)
export class TransactionsUserController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  list(@CurrentUser() user: User, @Query() query: UserTransactionsQueryDto) {
    return this.transactionsService.listForUser(user, query);
  }

  @Get(':id')
  getOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.transactionsService.getForUser(user, id);
  }
}
