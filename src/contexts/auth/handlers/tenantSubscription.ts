
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { supabase } from '@/integrations/supabase/client';

/**
 * Start a trial for a user's tenant
 */
export async function startUserTrial(tenantId: string): Promise<boolean> {
  logAuth('TENANT-HANDLER', `Starting trial for tenant: ${tenantId}`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  
  try {
    // Calculate trial end date - 7 days from now
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);
    
    const { error } = await supabase
      .from('tenants')
      .update({
        subscription_tier: 'premium',
        subscription_status: 'trialing',
        trial_ends_at: trialEndsAt.toISOString()
      })
      .eq('id', tenantId);
      
    if (error) {
      logAuth('TENANT-HANDLER', `Error starting trial: ${error.message}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
      return false;
    }
    
    logAuth('TENANT-HANDLER', `Trial started successfully for tenant: ${tenantId}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    return true;
  } catch (error) {
    logAuth('TENANT-HANDLER', `Unexpected error starting trial:`, {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error
    });
    return false;
  }
}

/**
 * Handle expired trial by updating subscription status
 */
export async function handleExpiredTrial(tenantId: string, trialEndsAt: string): Promise<boolean> {
  logAuth('TENANT-HANDLER', `Checking expired trial for tenant: ${tenantId}`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  
  try {
    const trialEndDate = new Date(trialEndsAt);
    const now = new Date();
    
    // Only update if the trial has actually expired
    if (trialEndDate <= now) {
      const { error } = await supabase
        .from('tenants')
        .update({
          subscription_status: 'inactive',
          subscription_tier: 'basic'
        })
        .eq('id', tenantId);
        
      if (error) {
        logAuth('TENANT-HANDLER', `Error updating expired trial: ${error.message}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          data: error
        });
        return false;
      }
      
      logAuth('TENANT-HANDLER', `Updated expired trial for tenant: ${tenantId}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      return true;
    }
    
    return false;
  } catch (error) {
    logAuth('TENANT-HANDLER', `Unexpected error handling expired trial:`, {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error
    });
    return false;
  }
}
