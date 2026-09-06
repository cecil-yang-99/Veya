import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { FeatureModule } from '../../feature-modules/entities/feature-module.entity';
import { FEATURE_KEY } from '../decorators/require-feature.decorator';

/**
 * Blocks access to a user-facing route when its platform feature module has
 * been disabled in the admin console. Fails open (allows the request) when
 * the module code is not registered, so un-migrated features stay available.
 */
@Injectable()
export class FeatureEnabledGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const code = this.reflector.getAllAndOverride<string>(FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!code) {
      return true;
    }

    const featureModule = await this.dataSource
      .getRepository(FeatureModule)
      .findOne({ where: { code } });

    // Unknown module codes are treated as enabled (forward compatibility).
    if (featureModule && !featureModule.isEnabled) {
      throw new ServiceUnavailableException(
        `The "${code}" feature is currently disabled`,
      );
    }
    return true;
  }
}
