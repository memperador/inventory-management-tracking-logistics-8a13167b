
import { useState, useEffect } from 'react';
import { useTenant } from '@/hooks/useTenantContext';
import { useAuth } from '@/hooks/useAuthContext';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

export const useOnboardingCheck = () => {
  const { currentTenant, loading: tenantLoading } = useTenant();
  const { user } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Special case for labrat user - never needs onboarding
    if (user?.email === 'labrat@iaware.com') {
      setNeedsOnboarding(false);
      setIsLoading(false);
      return;
    }

    if (!tenantLoading && currentTenant) {
      const onboardingNeeded = currentTenant.onboarding_completed === false;
      
      logAuth('ONBOARDING-CHECK', `Onboarding status: ${onboardingNeeded ? 'Needed' : 'Not needed'}`, {
        level: AUTH_LOG_LEVELS.INFO,
        data: {
          tenantId: currentTenant.id,
          onboardingStatus: currentTenant.onboarding_completed
        }
      });
      
      setNeedsOnboarding(onboardingNeeded);
      setIsLoading(false);
    } else if (!tenantLoading) {
      // No tenant but done loading - assume onboarding is needed
      setIsLoading(false);
      setNeedsOnboarding(false);
    }
  }, [currentTenant, tenantLoading, user]);

  return {
    needsOnboarding,
    isLoading
  };
};
