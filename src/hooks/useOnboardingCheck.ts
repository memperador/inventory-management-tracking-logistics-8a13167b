
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

export const useOnboardingCheck = () => {
  const { user } = useAuth();
  const { tenantId } = useTenant();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || !tenantId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('onboarding_completed')
          .eq('id', tenantId)
          .maybeSingle();
          
        if (error) throw new Error(error.message);
        
        // If no data or onboarding_completed is false, user needs onboarding
        setNeedsOnboarding(data ? !data.onboarding_completed : true);
        
        logAuth('ONBOARDING', `Onboarding status check: ${!data?.onboarding_completed}`, {
          level: AUTH_LOG_LEVELS.INFO
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error checking onboarding status'));
        logAuth('ONBOARDING', 'Error checking onboarding status', {
          level: AUTH_LOG_LEVELS.ERROR,
          data: err
        });
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user, tenantId]);

  const markOnboardingComplete = async (): Promise<boolean> => {
    if (!tenantId) return false;
    
    try {
      const { error } = await supabase
        .from('tenants')
        .update({ onboarding_completed: true })
        .eq('id', tenantId);
        
      if (error) throw error;
      
      setNeedsOnboarding(false);
      return true;
    } catch (err) {
      logAuth('ONBOARDING', 'Error marking onboarding as complete', {
        level: AUTH_LOG_LEVELS.ERROR,
        data: err
      });
      return false;
    }
  };

  return {
    needsOnboarding,
    loading,
    error,
    markOnboardingComplete
  };
};
