
import { useTenant } from '@/hooks/useTenantContext';
import { calculateTrialDaysLeft, checkTrialStatus } from '@/contexts/auth/handlers/subscriptionHandler';

export const useSubscriptionStatus = () => {
  const { currentTenant } = useTenant();

  // Check if subscription is active or in trial period
  const hasActiveSubscription = (): boolean => {
    if (!currentTenant) return false;
    
    const isActive = currentTenant.subscription_status === 'active';
    const inValidTrial = checkTrialStatus(currentTenant);
    
    return isActive || inValidTrial;
  };

  // Check if user is in trial mode
  const isTrialMode = currentTenant?.subscription_status === 'trialing';
  
  // Calculate days left in trial
  const trialDaysLeft = calculateTrialDaysLeft(currentTenant?.trial_ends_at);
  
  return {
    hasActiveSubscription,
    isTrialMode,
    trialDaysLeft,
    currentTier: currentTenant?.subscription_tier as 'basic' | 'standard' | 'premium' | 'enterprise' | null
  };
};
