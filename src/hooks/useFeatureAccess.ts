
import { useTenant } from '@/hooks/useTenantContext';
import { useRole } from '@/hooks/useRoleContext';
import { hasFeatureAccess, getUpgradePromptForFeature, getAvailableFeaturesForTier } from '@/utils/subscriptionUtils';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export const useFeatureAccess = () => {
  const { currentTenant } = useTenant();
  const { userRole } = useRole();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user has access to a feature
  const canAccessFeature = (featureKey: string): boolean => {
    // Admin always has access to all features for testing purposes
    if (userRole === 'admin') return true;
    
    return hasFeatureAccess(currentTenant, featureKey);
  };

  // Check if specific tier is active
  const hasSubscriptionTier = (tier: 'basic' | 'standard' | 'premium'): boolean => {
    if (!currentTenant || !currentTenant.subscription_tier) return false;
    
    const tierHierarchy = {
      'basic': 1,
      'standard': 2,
      'premium': 3
    };
    
    const userTierLevel = tierHierarchy[currentTenant.subscription_tier as keyof typeof tierHierarchy] || 0;
    const requiredTierLevel = tierHierarchy[tier];
    
    return userTierLevel >= requiredTierLevel;
  };

  // Get all features user has access to
  const getAccessibleFeatures = (): string[] => {
    if (userRole === 'admin') {
      // Admins can access all features
      return Object.keys(getAvailableFeaturesForTier('premium'));
    }
    
    return getAvailableFeaturesForTier(
      currentTenant?.subscription_tier as 'basic' | 'standard' | 'premium' | null
    );
  };

  // Prompt for upgrade with redirect to payment page
  const promptUpgrade = (featureKey: string): void => {
    const upgradeInfo = getUpgradePromptForFeature(featureKey);
    
    if (upgradeInfo) {
      toast({
        title: upgradeInfo.title,
        description: upgradeInfo.description,
        action: (
          <Button 
            onClick={() => navigate('/payment')}
          >
            Upgrade
          </Button>
        )
      });
    }
  };

  return {
    canAccessFeature,
    hasSubscriptionTier,
    getAccessibleFeatures,
    promptUpgrade,
    currentTier: currentTenant?.subscription_tier as 'basic' | 'standard' | 'premium' | null
  };
};
