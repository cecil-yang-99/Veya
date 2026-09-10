import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureModule } from './entities/feature-module.entity';
import { FeatureModulesService } from './feature-modules.service';
import { FeatureModulesAdminController } from './feature-modules-admin.controller';
import { FeatureModulesPublicController } from './feature-modules-public.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FeatureModule])],
  controllers: [FeatureModulesAdminController, FeatureModulesPublicController],
  providers: [FeatureModulesService],
  exports: [FeatureModulesService],
})
export class FeatureModulesModule {}
