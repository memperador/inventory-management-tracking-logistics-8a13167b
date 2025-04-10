
import { useTenant } from '@/hooks/useTenantContext';
import { useRole } from '@/hooks/useRoleContext';
import { FeatureAccessLevel } from '@/utils/subscriptionUtils';
import { hasFeatureAccess, getAvailableFeaturesForTier } from '@/utils/subscription/accessControl';
import { useFeatureTier } from './useFeatureTier';
import { useSubscriptionStatus } from './useSubscriptionStatus';

export const useAccessControl = () => {
  const { currentTenant } = useTenant();
  const { userRole } = useRole();
  const { getFeatureTier } = useFeatureTier();
  const { isTrialMode } = useSubscriptionStatus();

  // Check if user has access to a feature
  const canAccessFeature = (featureKey: string): boolean => {
    // Admin always has access to all features for testing purposes
    if (userRole === 'admin') return true;
    
    // During trial, grant access to Premium tier features
    if (currentTenant?.subscription_status === 'trialing') return true;
    
    return hasFeatureAccess(currentTenant, featureKey);
  };

  // Check if specific tier is active
  const hasSubscriptionTier = (tier: FeatureAccessLevel): boolean => {
    if (!currentTenant || !currentTenant.subscription_tier) return false;
    
    // During trial, user has access to Premium tier
    if (currentTenant.subscription_status === 'trialing') {
      return tier === 'basic' || tier === 'standard' || tier === 'premium';
    }
    
    const tierHierarchy = {
      'basic': 1,
      'standard': 2,
      'premium': 3,
      'enterprise': 4
    };
    
    const userTierLevel = tierHierarchy[currentTenant.subscription_tier as keyof typeof tierHierarchy] || 0;
    const requiredTierLevel = tierHierarchy[tier];
    
    return userTierLevel >= requiredTierLevel;
  };

  // Get all features user has access to
  const getAccessibleFeatures = (): string[] => {
    if (userRole === 'admin') {
      // Admins can access all features
      return Object.keys(getAvailableFeaturesForTier('enterprise'));
    }
    
    // During trial, user has access to Premium tier features
    if (currentTenant?.subscription_status === 'trialing') {
      return getAvailableFeaturesForTier('premium');
    }
    
    return getAvailableFeaturesForTier(
      currentTenant?.subscription_tier as 'basic' | 'standard' | 'premium' | 'enterprise' | null
    );
  };

  // Get available AI features for current tier
  const getAvailableAIFeatures = (): string[] => {
    if (!currentTenant) return [];
    
    // During trial, use Premium tier AI features
    if (currentTenant.subscription_status === 'trialing') {
      return [
        'basic_ai_assistant', 'inventory_suggestions', 'tracking_insights', 'route_suggestions', 
        'advanced_analytics', 'predictive_maintenance', 'custom_ai_queries'
      ];
    }
    
    if (!currentTenant.subscription_tier) return [];
    
    const tier = currentTenant.subscription_tier as 'basic' | 'standard' | 'premium' | 'enterprise';
    const aiFeatures = {
      'basic': ['basic_ai_assistant', 'inventory_suggestions'],
      'standard': ['basic_ai_assistant', 'inventory_suggestions', 'tracking_insights', 'route_suggestions'],
      'premium': ['basic_ai_assistant', 'inventory_suggestions', 'tracking_insights', 'route_suggestions', 
                  'advanced_analytics', 'predictive_maintenance', 'custom_ai_queries'],
      'enterprise': ['basic_ai_assistant', 'inventory_suggestions', 'tracking_insights', 'route_suggestions', 
                  'advanced_analytics', 'predictive_maintenance', 'custom_ai_queries',
                  'enterprise_ai_reporting', 'custom_model_training', 'cross_system_intelligence']
    };
    
    return aiFeatures[tier] || [];
  };

  return {
    canAccessFeature,
    hasSubscriptionTier,
    getAccessibleFeatures,
    getAvailableAIFeatures,
    getFeatureTier,
  };
};
