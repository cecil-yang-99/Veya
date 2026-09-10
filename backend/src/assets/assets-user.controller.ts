import { Controller, Get, UseGuards } from '@nestjs/common';
import { FeatureModuleCode } from '@veya/shared';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequireFeature } from '../common/decorators/require-feature.decorator';
import { FeatureEnabledGuard } from '../common/guards/feature-enabled.guard';
import { JwtUserGuard } from '../common/guards/jwt-user.guard';
import { User } from '../users/entities/user.entity';
import { AssetsService } from './assets.service';

/** Authenticated sandbox portfolio endpoints. */
@Controller('v1/assets')
@UseGuards(JwtUserGuard, FeatureEnabledGuard)
@RequireFeature(FeatureModuleCode.ASSETS)
export class AssetsUserController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.assetsService.listForUser(user);
  }

  @Get('summary')
  summary(@CurrentUser() user: User) {
    return this.assetsService.summaryForUser(user);
  }
}
