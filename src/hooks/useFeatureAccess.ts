
import { useTenant } from '@/contexts/TenantContext';
import { hasFeatureAccess } from '@/utils/subscription/accessControl';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function useFeatureAccess() {
  const { currentTenant } = useTenant();
  const navigate = useNavigate();
  
  /**
   * Check if the current tenant has access to a feature
   */
  const checkFeatureAccess = (featureKey: string): boolean => {
    return hasFeatureAccess(currentTenant, featureKey);
  };
  
  /**
   * Guard function to use when a feature requires a specific tier
   * Will redirect to payment page if feature is not available
   */
  const guardFeature = (featureKey: string): boolean => {
    const hasAccess = checkFeatureAccess(featureKey);
    
    if (!hasAccess) {
      toast({
        title: "Feature Unavailable",
        description: "This feature requires a higher subscription tier.",
        variant: "destructive"  // Changed from "warning" to fix TS error
      });
      
      navigate('/payment');
      return false;
    }
    
    return true;
  };
  
  /**
   * Gets the current tenant subscription tier
   */
  const getCurrentTier = () => {
    return currentTenant?.subscription_tier || 'basic';
  };
  
  /**
   * Check if specific tier is active for the current tenant
   */
  const hasSubscriptionTier = (tier: 'basic' | 'standard' | 'premium' | 'enterprise'): boolean => {
    if (!currentTenant || !currentTenant.subscription_tier) return tier === 'basic';
    
    const tierHierarchy: Record<string, number> = {
      'basic': 1,
      'standard': 2,
      'premium': 3,
      'enterprise': 4
    };
    
    const userTierLevel = tierHierarchy[currentTenant.subscription_tier] || 0;
    const requiredTierLevel = tierHierarchy[tier];
    
    return userTierLevel >= requiredTierLevel;
  };
  
  /**
   * Gets the tier that a specific feature belongs to
   */
  const getFeatureTier = (featureKey: string): string | null => {
    const featureMap = {
      // Basic tier features
      'inventory_management': 'basic',
      'qr_codes': 'basic',
      'basic_alerts': 'basic',
      'simple_analytics': 'basic',
      
      // Standard tier features
      'gps_tracking': 'standard',
      'audit_logs': 'standard',
      'advanced_alerts': 'standard',
      
      // Premium tier features
      'geofencing': 'premium',
      'route_optimization': 'premium',
      'premium_analytics': 'premium',
      'premium_ai_assistant': 'premium',
      
      // Enterprise tier features
      'white_labeling': 'enterprise',
      'sso_integration': 'enterprise',
      'custom_api': 'enterprise'
    };
    
    return featureMap[featureKey as keyof typeof featureMap] || null;
  };
  
  /**
   * Check if the current tenant is in trial mode
   */
  const isTrialMode = (): boolean => {
    return currentTenant?.subscription_status === 'trialing';
  };
  
  /**
   * Alias for checkFeatureAccess for compatibility with other components
   */
  const canAccessFeature = checkFeatureAccess;
  
  /**
   * Current subscription tier
   */
  const currentTier = getCurrentTier();
  
  return {
    checkFeatureAccess,
    guardFeature,
    getCurrentTier,
    hasSubscriptionTier,
    getFeatureTier,
    isTrialMode: isTrialMode(),
    canAccessFeature,
    currentTier
  };
}
