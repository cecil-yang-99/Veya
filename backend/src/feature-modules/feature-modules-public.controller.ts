import { Controller, Get } from '@nestjs/common';
import { FeatureModulesService } from './feature-modules.service';

/**
 * Public list of enabled feature modules. Used by frontends to hide
 * functionality that has been switched off in the admin console.
 */
@Controller('v1/feature-modules')
export class FeatureModulesPublicController {
  constructor(private readonly featureModulesService: FeatureModulesService) {}

  @Get()
  listEnabled() {
    return this.featureModulesService.listEnabled();
  }
}
