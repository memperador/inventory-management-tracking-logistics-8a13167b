
import { useTenant } from '@/hooks/useTenantContext';

export const useSubscriptionStatus = () => {
  const { currentTenant } = useTenant();

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
  const isTrialMode = currentTenant?.subscription_status === 'trialing';
  
  return {
    hasActiveSubscription,
    isTrialMode,
    currentTier: currentTenant?.subscription_tier as 'basic' | 'standard' | 'premium' | 'enterprise' | null
  };
};
