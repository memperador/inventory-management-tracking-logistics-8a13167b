
import { FeatureAccessLevel, SubscriptionTierLimitsMap } from './types';

// Subscription tier limits
export const SUBSCRIPTION_TIER_LIMITS: SubscriptionTierLimitsMap = {
  'basic': { assets: 25, users: 3 },
  'standard': { assets: 75, users: 10 },
  'premium': { assets: 500, users: 25 },
  'enterprise': { assets: 'Unlimited', users: 'Unlimited' }
};

// Get the limits for a specific subscription tier
export const getSubscriptionTierLimits = (tier: FeatureAccessLevel | null) => {
  if (!tier || !SUBSCRIPTION_TIER_LIMITS[tier]) {
    return { assets: 0, users: 0 };
  }
  return SUBSCRIPTION_TIER_LIMITS[tier];
};
