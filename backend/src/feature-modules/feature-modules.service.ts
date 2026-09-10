import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureModule } from './entities/feature-module.entity';

@Injectable()
export class FeatureModulesService {
  constructor(
    @InjectRepository(FeatureModule)
    private readonly modules: Repository<FeatureModule>,
  ) {}

  /** All registered modules, ordered for console display. */
  findAll(): Promise<FeatureModule[]> {
    return this.modules.find({ order: { sortOrder: 'ASC', code: 'ASC' } });
  }

  /** Only the enabled modules — used by clients for menu/feature gating. */
  listEnabled(): Promise<FeatureModule[]> {
    return this.modules.find({
      where: { isEnabled: true },
      order: { sortOrder: 'ASC', code: 'ASC' },
    });
  }

  /** Enables or disables a module. */
  async setEnabled(id: string, isEnabled: boolean): Promise<FeatureModule> {
    const module = await this.modules.findOne({ where: { id } });
    if (!module) {
      throw new NotFoundException('Feature module not found');
    }
    module.isEnabled = isEnabled;
    return this.modules.save(module);
  }
}
