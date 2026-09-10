import { SetMetadata } from '@nestjs/common';
import { FeatureModuleCode } from '@veya/shared';

/** Metadata key consumed by FeatureEnabledGuard. */
export const FEATURE_KEY = 'required_feature';

/**
 * Rejects requests when the given platform feature module has been disabled
 * in the admin console. Used on user-facing routes, e.g. KYC submission.
 */
export const RequireFeature = (code: FeatureModuleCode) =>
  SetMetadata(FEATURE_KEY, code);
