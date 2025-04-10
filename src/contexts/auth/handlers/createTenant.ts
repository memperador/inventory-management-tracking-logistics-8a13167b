
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { supabase } from '@/integrations/supabase/client';
import { startUserTrial } from './tenantSubscription';
import { checkUserTenant } from './checkTenant';

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
    
    try {
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
        // If we get a 404, the edge function might not be deployed in development
        if (response.status === 404) {
          logAuth('TENANT-HANDLER', 'Edge function not found, falling back to using tenant check', {
            level: AUTH_LOG_LEVELS.WARN
          });
          
          // Check if user already has a tenant (they might)
          const tenantId = await checkUserTenant(userId);
          
          if (tenantId) {
            logAuth('TENANT-HANDLER', `User already has a tenant: ${tenantId}, skipping creation`, {
              level: AUTH_LOG_LEVELS.INFO
            });
            return true;
          }
          
          // Try to create a tenant directly with Supabase
          return await createTenantDirectly(userId);
        }
        
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
      
    } catch (fetchError) {
      // Handle network errors or other failures
      logAuth('TENANT-HANDLER', `Error calling edge function:`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: fetchError
      });
      
      // Check if user already has a tenant (they might)
      const tenantId = await checkUserTenant(userId);
      
      if (tenantId) {
        logAuth('TENANT-HANDLER', `User already has a tenant: ${tenantId}, skipping creation`, {
          level: AUTH_LOG_LEVELS.INFO
        });
        return true;
      }
      
      // Try to create a tenant directly with Supabase
      return await createTenantDirectly(userId);
    }
  } catch (error) {
    logAuth('TENANT-HANDLER', `Error creating tenant:`, {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error
    });
    return false;
  }
}

/**
 * Fallback method to create a tenant directly in Supabase
 */
export async function createTenantDirectly(userId: string): Promise<boolean> {
  try {
    logAuth('TENANT-HANDLER', `Creating tenant directly in Supabase for user: ${userId}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    // Insert a new tenant
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .insert([{ name: 'Default Organization' }])
      .select('id')
      .single();
      
    if (tenantError || !tenantData) {
      logAuth('TENANT-HANDLER', `Failed to create tenant directly: ${tenantError?.message}`, {
        level: AUTH_LOG_LEVELS.ERROR
      });
      return false;
    }
    
    const tenantId = tenantData.id;
    
    // Update the user's tenant_id
    const { error: userError } = await supabase
      .from('users')
      .update({ tenant_id: tenantId })
      .eq('id', userId);
      
    if (userError) {
      logAuth('TENANT-HANDLER', `Failed to update user's tenant: ${userError.message}`, {
        level: AUTH_LOG_LEVELS.ERROR
      });
      return false;
    }
    
    // Start a trial for the tenant
    await startUserTrial(tenantId);
    
    logAuth('TENANT-HANDLER', `Tenant created directly: ${tenantId}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    return true;
  } catch (error) {
    logAuth('TENANT-HANDLER', `Error in direct tenant creation:`, {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error
    });
    return false;
  }
}
