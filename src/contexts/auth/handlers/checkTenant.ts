
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { supabase } from '@/integrations/supabase/client';

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
