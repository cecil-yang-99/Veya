import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AUDIT_ACTIONS } from '@veya/shared';
import { Audit } from '../common/decorators/audit.decorator';
import { JwtAdminGuard } from '../common/guards/jwt-admin.guard';
import { FeatureModulesService } from './feature-modules.service';
import { ToggleFeatureModuleDto } from './dto/toggle-feature-module.dto';

/**
 * Admin console: feature-module registry and enable/disable toggles.
 */
@Controller('admin/feature-modules')
@UseGuards(JwtAdminGuard)
export class FeatureModulesAdminController {
  constructor(private readonly featureModulesService: FeatureModulesService) {}

  @Get()
  findAll() {
    return this.featureModulesService.findAll();
  }

  @Patch(':id/toggle')
  @Audit(AUDIT_ACTIONS.MODULE_TOGGLE, 'feature_module')
  toggle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ToggleFeatureModuleDto,
  ) {
    return this.featureModulesService.setEnabled(id, dto.isEnabled);
  }
}
