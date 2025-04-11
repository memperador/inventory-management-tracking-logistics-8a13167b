
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { findTenantByEmail } from './checkTenant';
import { 
  createNewTenant, 
  connectUserToTenant, 
  updateUserMetadataWithTenant 
} from './tenantCreation/createTenantOperations';
import { callCreateTenantEdgeFunction } from './tenantCreation/edgeFunctionHandler';
import { generateTenantName } from './tenantCreation/tenantNameUtils';

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
      // Get tenant name from user metadata or email
      const companyName = await generateTenantName(userId, userEmail);
      
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
          const success = await connectUserToTenant(userId, tenantId);
          
          if (!success) {
            return false;
          }
          
          // Update user metadata with this tenant ID
          await updateUserMetadataWithTenant(
            tenantId, 
            tenantName, 
            false // They're joining an existing tenant, so no subscription needed
          );
          
          logAuth('TENANT-HANDLER', `Successfully associated user with existing tenant: ${tenantId}`, {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });
          
          return true;
        }
      }
      
      // Try to call the edge function to create tenant
      const edgeFunctionSuccess = await callCreateTenantEdgeFunction(
        accessToken,
        companyName,
        userId
      );
      
      if (edgeFunctionSuccess) {
        return true;
      }
      
    } catch (edgeError) {
      logAuth('TENANT-HANDLER', `Edge function not found, falling back to using tenant check`, {
        level: AUTH_LOG_LEVELS.WARN,
        data: edgeError
      });
    }
    
    // Fall back to direct tenant creation if edge function is not available
    let tenantId = null;
    let tenantName = null;
    
    // Generate tenant name
    tenantName = await generateTenantName(userId, userEmail);
    
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
      tenantId = await createNewTenant(tenantName);
      
      if (!tenantId) {
        return false;
      }
    }
    
    // Connect user to tenant
    const connectSuccess = await connectUserToTenant(userId, tenantId, true);
    
    if (!connectSuccess) {
      return false;
    }
    
    // Update user metadata with tenant info
    await updateUserMetadataWithTenant(tenantId, tenantName, needsSubscription);
    
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
