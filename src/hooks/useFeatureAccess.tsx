
import { useTenant } from '@/hooks/useTenantContext';
import { useRole } from '@/hooks/useRoleContext';
import { 
  hasFeatureAccess, 
  getUpgradePromptForFeature, 
  getAvailableFeaturesForTier,
  getSubscriptionTierLimits,
  FeatureAccessLevel
} from '@/utils/subscriptionUtils';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export const useFeatureAccess = () => {
  const { currentTenant } = useTenant();
  const { userRole } = useRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if subscription is active or in trial period
  const hasActiveSubscription = (): boolean => {
    if (!currentTenant) return false;
    
    const now = new Date();
    const trialEndsAt = currentTenant.trial_ends_at ? new Date(currentTenant.trial_ends_at) : null;
    const isActive = currentTenant.subscription_status === 'active';
    const inTrial = trialEndsAt && trialEndsAt > now;
    
    return isActive || inTrial;
  };

  // Check if user is in trial mode
  const isTrialMode = !!currentTenant?.subscription_status === 'trialing';

  // Check if user has access to a feature
  const canAccessFeature = (featureKey: string): boolean => {
    // Admin always has access to all features for testing purposes
    if (userRole === 'admin') return true;
    
    // During trial, grant access to Premium tier features
    if (currentTenant?.subscription_status === 'trialing') return true;
    
    return hasFeatureAccess(currentTenant, featureKey);
  };

  // Get the tier that a feature belongs to
  const getFeatureTier = (featureKey: string): 'basic' | 'standard' | 'premium' | 'enterprise' | null => {
    // Feature to tier mapping
    const featureTierMap: Record<string, 'basic' | 'standard' | 'premium' | 'enterprise'> = {
      // Basic tier features
      'equipment': 'basic',
      'projects': 'basic',
      'inventory_management': 'basic',
      'basic_analytics': 'basic',
      'simple_alerts': 'basic',
      'qr_generation': 'basic',
      
      // Standard tier features
      'gps': 'standard',
      'audit_logs': 'standard',
      'advanced_alerts': 'standard',
      'bulk_qr': 'standard',
      'location_history': 'standard',
      'tracking': 'standard',
      
      // Premium tier features
      'advanced_gps': 'premium',
      'geofencing': 'premium',
      'route_optimization': 'premium',
      'maintenance': 'premium',
      'analytics': 'premium',
      'premium_ai': 'premium',
      
      // Enterprise tier features
      'api_access': 'enterprise',
      'white_labeling': 'enterprise',
      'sso': 'enterprise',
      'custom_reporting': 'enterprise',
      'sla': 'enterprise',
      'custom_implementation': 'enterprise'
    };
    
    return featureTierMap[featureKey] || null;
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

  // Get current subscription limits
  const getSubscriptionLimits = () => {
    // During trial, use Premium tier limits
    if (currentTenant?.subscription_status === 'trialing') {
      return getSubscriptionTierLimits('premium');
    }
    
    return getSubscriptionTierLimits(
      currentTenant?.subscription_tier as 'basic' | 'standard' | 'premium' | 'enterprise' | null
    );
  };

  // Prompt for upgrade with redirect to payment page
  const promptUpgrade = (featureKey: string): void => {
    const upgradeInfo = getUpgradePromptForFeature(featureKey);
    
    if (upgradeInfo) {
      toast({
        title: upgradeInfo.title,
        description: upgradeInfo.description,
        action: <Button onClick={() => navigate('/payment')}>Upgrade</Button>
      });
    }
  };

  // Check if a user is under the asset limit for their tier
  const isUnderAssetLimit = (assetCount: number): boolean => {
    const limits = getSubscriptionLimits();
    if (typeof limits.assets === 'string') return true; // Unlimited
    return assetCount < limits.assets;
  };

  // Check if a user is under the user limit for their tier
  const isUnderUserLimit = (userCount: number): boolean => {
    const limits = getSubscriptionLimits();
    if (typeof limits.users === 'string') return true; // Unlimited
    return userCount < limits.users;
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
    getFeatureTier,
    hasSubscriptionTier,
    getAccessibleFeatures,
    getAvailableAIFeatures,
    promptUpgrade,
    getSubscriptionLimits,
    isUnderAssetLimit,
    isUnderUserLimit,
    hasActiveSubscription,
    currentTier: currentTenant?.subscription_tier as 'basic' | 'standard' | 'premium' | 'enterprise' | null,
    isTrialMode: currentTenant?.subscription_status === 'trialing'
  };
};
