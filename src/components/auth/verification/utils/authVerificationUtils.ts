
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

export const checkTenantAndOnboarding = async (userId: string) => {
  try {
    // First check if user has a tenant
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', userId)
      .single();
    
    if (userError) {
      logAuth('AUTH', `Error fetching user tenant: ${userError.message}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        force: true
      });
      return { needsOnboarding: false, needsSubscription: false, targetPath: '/dashboard' };
    }
    
    if (!userData?.tenant_id) {
      // No tenant assigned yet, new user
      logAuth('AUTH', `User has no tenant, needs subscription setup`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      return { needsOnboarding: false, needsSubscription: true, targetPath: '/payment' };
    }
    
    // Check tenant's onboarding status
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('onboarding_completed, subscription_status, trial_ends_at')
      .eq('id', userData.tenant_id)
      .single();
      
    if (tenantError) {
      logAuth('AUTH', `Error fetching tenant: ${tenantError.message}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        force: true
      });
      return { needsOnboarding: false, needsSubscription: false, targetPath: '/dashboard' };
    }
    
    // Check subscription status first
    const hasActiveSubscription = tenantData.subscription_status === 'active';
    const inTrialPeriod = tenantData.subscription_status === 'trialing' && 
                          tenantData.trial_ends_at && 
                          new Date(tenantData.trial_ends_at) > new Date();
                          
    const needsSubscription = !hasActiveSubscription && !inTrialPeriod;
    
    // Then check if onboarding is completed - strictly compare with false
    const needsOnboarding = tenantData.onboarding_completed === false;
    
    logAuth('AUTH', `User onboarding status check: ${needsOnboarding ? 'needs onboarding' : 'onboarding completed'}`, {
      level: AUTH_LOG_LEVELS.INFO,
      force: true,
      data: {
        onboardingCompleted: tenantData.onboarding_completed,
        needsSubscription,
        explicitFalseCheck: tenantData.onboarding_completed === false
      }
    });
    
    // Determine where to redirect the user
    let targetPath = '/dashboard';
    if (needsSubscription) {
      targetPath = '/payment';
    } else if (needsOnboarding) {
      targetPath = '/customer-onboarding';
    }
    
    return { needsOnboarding, needsSubscription, targetPath };
  } catch (error) {
    logAuth('AUTH', `Error during tenant/onboarding check: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      level: AUTH_LOG_LEVELS.ERROR,
      force: true
    });
    return { needsOnboarding: false, needsSubscription: false, targetPath: '/dashboard' };
  }
};

export const handleRedirect = (targetPath: string, returnTo: string | null) => {
  const finalPath = returnTo ? decodeURIComponent(returnTo) : targetPath;
  
  logAuth('AUTH', `Redirecting user to ${finalPath}`, {
    level: AUTH_LOG_LEVELS.INFO,
    force: true
  });
  
  return finalPath;
};
