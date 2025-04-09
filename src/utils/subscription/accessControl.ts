
import { Tenant } from '@/types/tenant';
import { FeatureAccessLevel } from './types';
import { FEATURE_ACCESS_MAP } from './featureMap';

// Check if user has access to a specific feature
export const hasFeatureAccess = (
  tenant: Tenant | null, 
  featureKey: string
): boolean => {
  if (!tenant || !tenant.subscription_tier) return false;
  
  const requiredTier = FEATURE_ACCESS_MAP[featureKey];
  if (!requiredTier) return false;
  
  const tierHierarchy: Record<FeatureAccessLevel, number> = {
    'basic': 1,
    'standard': 2,
    'premium': 3,
    'enterprise': 4
  };
  
  const userTierLevel = tierHierarchy[tenant.subscription_tier as FeatureAccessLevel] || 0;
  const requiredTierLevel = tierHierarchy[requiredTier];
  
  return userTierLevel >= requiredTierLevel;
};

// Get all features available for a specific subscription tier
export const getAvailableFeaturesForTier = (tier: FeatureAccessLevel | null): string[] => {
  if (!tier) return [];
  
  const tierHierarchy: Record<FeatureAccessLevel, number> = {
    'basic': 1,
    'standard': 2,
    'premium': 3,
    'enterprise': 4
  };
  
  const userTierLevel = tierHierarchy[tier] || 0;
  
  return Object.entries(FEATURE_ACCESS_MAP)
    .filter(([_, requiredTier]) => {
      const requiredTierLevel = tierHierarchy[requiredTier];
      return userTierLevel >= requiredTierLevel;
    })
    .map(([featureKey, _]) => featureKey);
};
