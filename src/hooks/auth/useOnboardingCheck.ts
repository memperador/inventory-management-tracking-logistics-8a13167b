
import { useState, useEffect } from 'react';
import { useTenant } from '@/hooks/useTenantContext';

export const useOnboardingCheck = () => {
  const { currentTenant, loading: tenantLoading } = useTenant();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!tenantLoading && currentTenant) {
      setNeedsOnboarding(currentTenant.onboarding_completed === false);
    }
  }, [currentTenant, tenantLoading]);

  return {
    needsOnboarding,
    isLoading: tenantLoading
  };
};
