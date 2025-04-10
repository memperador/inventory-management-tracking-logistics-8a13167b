
import { useTenant } from '@/hooks/useTenantContext';
import { getSubscriptionTierLimits } from '@/utils/subscription/limits';

export const useSubscriptionLimits = () => {
  const { currentTenant } = useTenant();
  
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

  return {
    getSubscriptionLimits,
    isUnderAssetLimit,
    isUnderUserLimit
  };
};
