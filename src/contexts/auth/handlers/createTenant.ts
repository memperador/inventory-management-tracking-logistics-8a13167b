
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { findTenantByEmail } from './checkTenant';

/**
 * Create a tenant for a new user
 * Will check for existing tenants associated with the user's email first
 */
export async function createTenantForNewUser(
  userId: string,
  accessToken: string,
  userEmail?: string | null,
  isNewSignup: boolean = false,
  needsSubscription: boolean = false
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
    // First, check if user already has a tenant
    const { data: userTenant, error: userTenantError } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', userId)
      .single();
      
    if (!userTenantError && userTenant?.tenant_id) {
      logAuth('TENANT-HANDLER', `User already has a tenant: ${userTenant.tenant_id}, skipping creation`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      // Update user metadata with this tenant ID
      await supabase.auth.updateUser({
        data: { 
          tenant_id: userTenant.tenant_id,
          needs_subscription: needsSubscription
        }
      });
      
      return true;
    }
    
    // Try to use edge function for proper security
    try {
      logAuth('TENANT-HANDLER', `Attempting to use edge function for tenant creation`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      // Get tenant name from user metadata or email
      const { data: { user } } = await supabase.auth.getUser();
      const companyName = user?.user_metadata?.company_name || 
                          (userEmail ? `${userEmail.split('@')[0]}'s Organization` : 'New Organization');
      
      // If we have an email, check for existing tenants associated with this email
      if (userEmail) {
        logAuth('TENANT-HANDLER', `Checking for existing tenant for email: ${userEmail}`, {
          level: AUTH_LOG_LEVELS.INFO,
          force: true
        });
        
        const { tenantId, tenantName } = await findTenantByEmail(userEmail);
        
        if (tenantId) {
          logAuth('TENANT-HANDLER', `Found existing tenant for email: ${userEmail}, reusing tenant: ${tenantId}`, {
            level: AUTH_LOG_LEVELS.INFO,
            force: true,
            data: { tenantName }
          });
          
          // Associate user with this tenant
          const { error: updateError } = await supabase
            .from('users')
            .update({ tenant_id: tenantId })
            .eq('id', userId);
            
          if (updateError) {
            logAuth('TENANT-HANDLER', `Failed to associate user with existing tenant: ${updateError.message}`, {
              level: AUTH_LOG_LEVELS.ERROR,
              force: true,
              data: updateError
            });
          } else {
            // Update user metadata with this tenant ID
            await supabase.auth.updateUser({
              data: { 
                tenant_id: tenantId,
                tenant_name: tenantName,
                needs_subscription: false // They're joining an existing tenant, so no subscription needed
              }
            });
            
            logAuth('TENANT-HANDLER', `Successfully associated user with existing tenant: ${tenantId}`, {
              level: AUTH_LOG_LEVELS.INFO,
              force: true
            });
            
            return true;
          }
        }
      }
      
      // Try to call the edge function to create tenant
      const response = await fetch(`${process.env.SUPABASE_FUNCTIONS_URL || 'https://wscoyigjjcevriqqyxwo.supabase.co/functions/v1'}/create-tenant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          tenant_name: companyName,
          user_id: userId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Edge function returned status ${response.status}`);
      }
      
      const result = await response.json();
      
      logAuth('TENANT-HANDLER', `Edge function tenant creation result:`, {
        level: AUTH_LOG_LEVELS.INFO,
        data: result
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error from edge function');
      }
      
      return result.success;
    } catch (edgeError) {
      logAuth('TENANT-HANDLER', `Edge function not found, falling back to using tenant check`, {
        level: AUTH_LOG_LEVELS.WARN,
        data: edgeError
      });
    }
    
    // Fall back to direct tenant creation if edge function is not available
    let tenantId = null;
    let tenantName = null;
    
    // Check if user has metadata with company name
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      tenantName = user.user_metadata?.company_name || 
                (userEmail ? `${userEmail.split('@')[0]}'s Organization` : 'New Organization');
    }
    
    // Always call findTenantByEmail as a final check if we have an email
    if (userEmail) {
      const existingTenant = await findTenantByEmail(userEmail);
      if (existingTenant.tenantId) {
        logAuth('TENANT-HANDLER', `Found existing tenant for email: ${userEmail}, using tenant: ${existingTenant.tenantId}`, {
          level: AUTH_LOG_LEVELS.INFO,
          force: true
        });
        tenantId = existingTenant.tenantId;
        tenantName = existingTenant.tenantName || tenantName;
      }
    }
    
    // Create new tenant if no existing one found
    if (!tenantId) {
      logAuth('TENANT-HANDLER', `Creating new tenant with name: ${tenantName}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      const { data: newTenant, error: createError } = await supabase
        .from('tenants')
        .insert({
          name: tenantName
        })
        .select('id')
        .single();
        
      if (createError) {
        logAuth('TENANT-HANDLER', `Failed to create tenant: ${createError.message}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          data: createError
        });
        
        toast({
          title: 'Error',
          description: `Failed to create organization: ${createError.message}`,
          variant: 'destructive'
        });
        
        return false;
      }
      
      tenantId = newTenant?.id;
      
      if (!tenantId) {
        throw new Error('Tenant created but no ID returned');
      }
      
      logAuth('TENANT-HANDLER', `Created new tenant with ID: ${tenantId}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
    }
    
    // Connect user to tenant
    logAuth('TENANT-HANDLER', `Connecting user ${userId} to tenant ${tenantId}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    const { error: updateError } = await supabase
      .from('users')
      .update({
        tenant_id: tenantId,
        role: 'admin' // First user is always an admin
      })
      .eq('id', userId);
      
    if (updateError) {
      logAuth('TENANT-HANDLER', `Failed to update user tenant: ${updateError.message}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: updateError
      });
      
      toast({
        title: 'Error',
        description: `Failed to associate user with organization: ${updateError.message}`,
        variant: 'destructive'
      });
      
      return false;
    }
    
    // Update user metadata with tenant info
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        tenant_id: tenantId,
        tenant_name: tenantName,
        needs_subscription: needsSubscription
      }
    });
    
    if (metadataError) {
      logAuth('TENANT-HANDLER', `Failed to update user metadata: ${metadataError.message}`, {
        level: AUTH_LOG_LEVELS.WARN,
        data: metadataError
      });
    }
    
    return true;
  } catch (error: any) {
    logAuth('TENANT-HANDLER', `Unexpected error creating tenant:`, {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error
    });
    
    toast({
      title: 'Error',
      description: `Failed to set up organization: ${error.message}`,
      variant: 'destructive'
    });
    
    return false;
  }
}
