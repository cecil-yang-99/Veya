import { IsBoolean } from 'class-validator';

/** Body for enabling/disabling a platform feature module. */
export class ToggleFeatureModuleDto {
  @IsBoolean()
  isEnabled: boolean;
}
