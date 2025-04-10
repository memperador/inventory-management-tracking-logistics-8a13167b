import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { supabase } from '@/integrations/supabase/client';

/**
 * Creates a tenant for a new user
 */
export async function createTenantForNewUser(
  userId: string,
  accessToken: string,
  userEmail?: string,
  isNewSignup = false,
  needsSubscription = false
): Promise<boolean> {
  logAuth('TENANT-HANDLER', `Creating tenant for user: ${userId}`, {
    level: AUTH_LOG_LEVELS.INFO,
    data: {
      userEmail,
      isNewSignup,
      needsSubscription
    }
  });
  
  try {
    // Call the create-tenant edge function - fixed for webview compatibility
    const functionUrl = `/functions/v1/create-tenant`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        userId
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create tenant: ${errorText || response.statusText}`);
    }
    
    // Parse response
    const responseText = await response.text();
    
    if (!responseText || responseText.trim() === '') {
      throw new Error('Empty response from server');
    }
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      logAuth('TENANT-HANDLER', `Error parsing tenant creation response: ${responseText}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: parseError
      });
      throw parseError;
    }
    
    if (!result.success) {
      logAuth('TENANT-HANDLER', `Tenant creation failed: ${result.error || result.message}`, {
        level: AUTH_LOG_LEVELS.ERROR
      });
      return false;
    }
    
    const tenantId = result.tenant_id;
    
    logAuth('TENANT-HANDLER', `Tenant created successfully: ${tenantId}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    return true;
  } catch (error) {
    logAuth('TENANT-HANDLER', `Error creating tenant:`, {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error
    });
    return false;
  }
}

/**
 * Check if the user has an associated tenant
 */
export async function checkUserTenant(userId: string): Promise<string | null> {
  logAuth('TENANT-HANDLER', `Checking tenant for user: ${userId}`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      logAuth('TENANT-HANDLER', `No tenant found for user: ${userId}`, {
        level: AUTH_LOG_LEVELS.INFO,
        data: error
      });
      return null;
    }
    
    logAuth('TENANT-HANDLER', `Fetching tenant with ID: ${data.tenant_id}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    return data.tenant_id;
  } catch (error) {
    logAuth('TENANT-HANDLER', `Error checking user tenant:`, {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error
    });
    return null;
  }
}

/**
 * Get tenant details
 */
export async function getTenantDetails(tenantId: string): Promise<any | null> {
  logAuth('TENANT-HANDLER', `Getting details for tenant: ${tenantId}`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();
    
    if (error || !data) {
      logAuth('TENANT-HANDLER', `No tenant found with ID: ${tenantId}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
      return null;
    }
    
    return data;
  } catch (error) {
    logAuth('TENANT-HANDLER', `Error getting tenant details:`, {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error
    });
    return null;
  }
}

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
