
import { supabase } from '@/integrations/supabase/client';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

export const checkTenantAndOnboarding = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        tenant_id,
        tenants (
          onboarding_completed,
          subscription_status,
          subscription_tier
        )
      `)
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    
    return {
      needsOnboarding: !data?.tenants?.onboarding_completed,
      needsSubscription: !data?.tenants?.subscription_status || 
                        data?.tenants?.subscription_status === 'inactive',
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
