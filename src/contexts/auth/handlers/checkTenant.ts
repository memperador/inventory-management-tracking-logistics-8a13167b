
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
    
    logAuth('TENANT-HANDLER', `Found tenant with ID: ${data.tenant_id}`, {
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
 * Find tenant by name or email
 * This helps with finding existing tenants for returning users
 */
export async function findTenantByEmail(email: string): Promise<{tenantId: string | null, tenantName: string | null}> {
  logAuth('TENANT-HANDLER', `Finding tenant by email: ${email}`, {
    level: AUTH_LOG_LEVELS.INFO,
    force: true
  });
  
  try {
    // First try to find the user with this email
    const { data: userData, error: userError } = await supabase
      .from('auth')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError || !userData) {
      logAuth('TENANT-HANDLER', `No existing user found for email: ${email}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      return { tenantId: null, tenantName: null };
    }
    
    // Check if user has tenant association
    const { data: userTenant, error: tenantError } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', userData.id)
      .single();
      
    if (tenantError || !userTenant?.tenant_id) {
      logAuth('TENANT-HANDLER', `User exists but has no tenant association: ${userData.id}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      return { tenantId: null, tenantName: null };
    }
    
    // Get tenant name
    const { data: tenant, error: tenantNameError } = await supabase
      .from('tenants')
      .select('name')
      .eq('id', userTenant.tenant_id)
      .single();
      
    if (tenantNameError || !tenant) {
      logAuth('TENANT-HANDLER', `Found tenant ID but couldn't get name: ${userTenant.tenant_id}`, {
        level: AUTH_LOG_LEVELS.WARN,
        force: true
      });
      return { tenantId: userTenant.tenant_id, tenantName: null };
    }
    
    logAuth('TENANT-HANDLER', `Successfully found tenant for email: ${email}`, {
      level: AUTH_LOG_LEVELS.INFO,
      force: true,
      data: { tenantId: userTenant.tenant_id, tenantName: tenant.name }
    });
    
    return {
      tenantId: userTenant.tenant_id,
      tenantName: tenant.name
    };
  } catch (error) {
    logAuth('TENANT-HANDLER', `Error finding tenant by email:`, {
      level: AUTH_LOG_LEVELS.ERROR,
      force: true,
      data: error
    });
    return { tenantId: null, tenantName: null };
  }
}
