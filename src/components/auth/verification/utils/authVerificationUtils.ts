
import { supabase } from '@/integrations/supabase/client';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

export const checkTenantAndOnboarding = async (userId: string) => {
  try {
    // First, get the user's tenant_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', userId)
      .single();
      
    if (userError) throw userError;
    
    if (!userData?.tenant_id) {
      logAuth('AUTH', `User has no tenant_id: ${userId}`, {
        level: AUTH_LOG_LEVELS.WARN
      });
      
      return {
        needsOnboarding: true,
        needsSubscription: false,
        targetPath: null
      };
    }
    
    // Next, query the tenant data separately
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('onboarding_completed, subscription_status, subscription_tier')
      .eq('id', userData.tenant_id)
      .single();
    
    if (tenantError) throw tenantError;
    
    return {
      needsOnboarding: !tenantData?.onboarding_completed,
      needsSubscription: !tenantData?.subscription_status || 
                        tenantData?.subscription_status === 'inactive',
      targetPath: null
    };
  } catch (error) {
    logAuth('AUTH', `Error checking tenant status: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      level: AUTH_LOG_LEVELS.ERROR
    });
    
    return {
      needsOnboarding: true,
      needsSubscription: false,
      targetPath: null
    };
  }
};

export const handleRedirect = (targetPath: string | null, returnTo: string | null): string => {
  if (returnTo) return returnTo;
  if (targetPath) return targetPath;
  return '/dashboard';
};
