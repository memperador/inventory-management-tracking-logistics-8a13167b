
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
    // We can't directly query the auth.users table, so instead we'll use the public users table
    // and find users that match the email (if there are any existing users with this email in tenant system)
    
    // First get all users and check for matching email
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, tenant_id')
      .order('created_at', { ascending: false });
      
    if (usersError || !users || users.length === 0) {
      logAuth('TENANT-HANDLER', `No users found when searching for email: ${email}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      return { tenantId: null, tenantName: null };
    }
    
    // Check if any of the users have the email we're looking for by querying auth
    for (const user of users) {
      // We need to check if this user has the email we're looking for
      // Since we can't query auth directly with the client, we can check the user's session
      // or use a function to verify if this is the user with the matching email
      
      // For now we'll just check user information to try to match
      const { data: userProfile } = await supabase.auth.admin.getUserById(user.id);
      
      if (userProfile?.user && userProfile.user.email?.toLowerCase() === email.toLowerCase()) {
        logAuth('TENANT-HANDLER', `Found user matching email: ${email}, user ID: ${user.id}`, {
          level: AUTH_LOG_LEVELS.INFO,
          force: true
        });
        
        if (!user.tenant_id) {
          logAuth('TENANT-HANDLER', `User exists but has no tenant association: ${user.id}`, {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });
          return { tenantId: null, tenantName: null };
        }
        
        // Get tenant name
        const { data: tenant, error: tenantNameError } = await supabase
          .from('tenants')
          .select('name')
          .eq('id', user.tenant_id)
          .single();
          
        if (tenantNameError || !tenant) {
          logAuth('TENANT-HANDLER', `Found tenant ID but couldn't get name: ${user.tenant_id}`, {
            level: AUTH_LOG_LEVELS.WARN,
            force: true
          });
          return { tenantId: user.tenant_id, tenantName: null };
        }
        
        logAuth('TENANT-HANDLER', `Successfully found tenant for email: ${email}`, {
          level: AUTH_LOG_LEVELS.INFO,
          force: true,
          data: { tenantId: user.tenant_id, tenantName: tenant.name }
        });
        
        return {
          tenantId: user.tenant_id,
          tenantName: tenant.name
        };
      }
    }
    
    // If we get here, no matching user was found
    logAuth('TENANT-HANDLER', `No existing user found for email: ${email}`, {
      level: AUTH_LOG_LEVELS.INFO,
      force: true
    });
    return { tenantId: null, tenantName: null };
  } catch (error) {
    logAuth('TENANT-HANDLER', `Error finding tenant by email:`, {
      level: AUTH_LOG_LEVELS.ERROR,
      force: true,
      data: error
    });
    return { tenantId: null, tenantName: null };
  }
}
