import { supabase } from '@/integrations/supabase/client';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { toast } from '@/hooks/use-toast';
import { addDays } from 'date-fns';

/**
 * Creates a tenant through edge function for a new user
 */
export async function createTenantForNewUser(userId: string, accessToken: string, userEmail?: string, isNewSignup?: boolean, needsSubscription?: boolean) {
  logAuth('TENANT-HANDLER', `Creating tenant for user: ${userId}`, {
    level: AUTH_LOG_LEVELS.INFO,
    data: {
      userEmail,
      isNewSignup,
      needsSubscription
    }
  });
  
  try {
    // Call the create-tenant edge function to set up a new tenant for this user
    const response = await fetch(`${window.location.origin}/api/create-tenant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      // Handle tenant conflict - show a toast message
      if (response.status === 409 && result.conflict) {
        logAuth('TENANT-HANDLER', `Tenant conflict detected: ${result.message}`, {
          level: AUTH_LOG_LEVELS.WARN,
          data: result
        });
        
        // Show toast message about the conflict
        toast({
          title: 'Organization Already Exists',
          description: `${result.message}. Please contact your administrator to join the organization.`,
          variant: 'destructive',
          duration: 10000, // Show for 10 seconds
        });
        
        // Sign out the user since they cannot proceed
        await supabase.auth.signOut();
        
        // Redirect to auth page
        window.location.href = '/auth';
        return false;
      } else {
        throw new Error(result.error || 'Failed to create tenant');
      }
    }
    
    logAuth('TENANT-HANDLER', `Successfully created new tenant: ${result.tenant_id}`, {
      level: AUTH_LOG_LEVELS.INFO,
      data: result
    });
    return true;
  } catch (error) {
    logAuth('TENANT-HANDLER', `Error creating tenant: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error
    });
    // Continue with the flow even if tenant creation fails
    return false;
  }
}

/**
 * Checks if the user has an associated tenant
 */
export async function checkUserTenant(userId: string) {
  logAuth('TENANT-HANDLER', `Checking user tenant for user: ${userId}`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  
  try {
    // Check if user has an associated tenant
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', userId)
      .single();
      
    if (userError && userError.code !== 'PGRST116') {
      logAuth('TENANT-HANDLER', `Error checking user tenant: ${userError.message}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: userError
      });
      return null;
    }
    
    return userData?.tenant_id || null;
  } catch (error) {
    logAuth('TENANT-HANDLER', `Error checking user tenant: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      level: AUTH_LOG_LEVELS.ERROR
    });
    return null;
  }
}

/**
 * Handles starting a trial for a new user
 */
export async function startUserTrial(tenantId: string) {
  logAuth('TENANT-HANDLER', 'Starting 7-day free trial for new user', {
    level: AUTH_LOG_LEVELS.INFO
  });
  
  // Calculate trial end date - 7 days from now
  const trialEndsAt = addDays(new Date(), 7).toISOString();
  
  try {
    // Update tenant with trial information
    const { error: updateError } = await supabase
      .from('tenants')
      .update({
        subscription_status: 'trialing',
        subscription_tier: 'premium', // Give them Premium during trial
        trial_ends_at: trialEndsAt
      })
      .eq('id', tenantId);
      
    if (updateError) {
      logAuth('TENANT-HANDLER', `Error starting free trial: ${updateError.message}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: updateError
      });
      return false;
    } else {
      logAuth('TENANT-HANDLER', `Free trial started successfully, ends at: ${trialEndsAt}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      return true;
    }
  } catch (error) {
    logAuth('TENANT-HANDLER', `Error starting trial: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      level: AUTH_LOG_LEVELS.ERROR
    });
    return false;
  }
}

/**
 * Gets the tenant subscription details
 */
export async function getTenantDetails(tenantId: string) {
  logAuth('TENANT-HANDLER', `Getting tenant subscription details for tenant: ${tenantId}`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  
  try {
    // Check tenant subscription status
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('subscription_status, subscription_tier, trial_ends_at')
      .eq('id', tenantId)
      .single();
      
    if (tenantError) {
      logAuth('TENANT-HANDLER', `Error checking tenant subscription: ${tenantError.message}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: tenantError
      });
      return null;
    }
    
    return tenantData;
  } catch (error) {
    logAuth('TENANT-HANDLER', `Error getting tenant details: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      level: AUTH_LOG_LEVELS.ERROR
    });
    return null;
  }
}

/**
 * Handles expired trials
 */
export async function handleExpiredTrial(tenantId: string, trialEndsAt: string) {
  if (new Date(trialEndsAt) <= new Date()) {
    logAuth('TENANT-HANDLER', 'Trial has expired, updating status', {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    try {
      // Update tenant with inactive subscription
      const { error: updateError } = await supabase
        .from('tenants')
        .update({
          subscription_status: 'inactive',
          // Keep trial_ends_at for reference
        })
        .eq('id', tenantId);
        
      if (updateError) {
        logAuth('TENANT-HANDLER', `Error updating expired trial: ${updateError.message}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          data: updateError
        });
        return false;
      }
      return true;
    } catch (error) {
      logAuth('TENANT-HANDLER', `Error handling expired trial: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        level: AUTH_LOG_LEVELS.ERROR
      });
      return false;
    }
  }
  return false;
}
