
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { findTenantByEmail } from '../checkTenant';

/**
 * Create a new tenant in the database
 */
export async function createNewTenant(tenantName: string): Promise<string | null> {
  logAuth('TENANT-CREATION', `Creating new tenant with name: ${tenantName}`, {
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
    logAuth('TENANT-CREATION', `Failed to create tenant: ${createError.message}`, {
      level: AUTH_LOG_LEVELS.ERROR,
      data: createError
    });
    
    toast({
      title: 'Error',
      description: `Failed to create organization: ${createError.message}`,
      variant: 'destructive'
    });
    
    return null;
  }
  
  const tenantId = newTenant?.id;
  
  if (!tenantId) {
    logAuth('TENANT-CREATION', 'Tenant created but no ID returned', {
      level: AUTH_LOG_LEVELS.ERROR
    });
    return null;
  }
  
  logAuth('TENANT-CREATION', `Created new tenant with ID: ${tenantId}`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  
  return tenantId;
}

/**
 * Connect a user to a tenant
 */
export async function connectUserToTenant(
  userId: string, 
  tenantId: string, 
  isAdmin: boolean = false
): Promise<boolean> {
  logAuth('TENANT-CREATION', `Connecting user ${userId} to tenant ${tenantId}`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  
  const { error: updateError } = await supabase
    .from('users')
    .update({
      tenant_id: tenantId,
      role: isAdmin ? 'admin' : 'viewer'
    })
    .eq('id', userId);
    
  if (updateError) {
    logAuth('TENANT-CREATION', `Failed to update user tenant: ${updateError.message}`, {
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
  
  return true;
}

/**
 * Update user metadata with tenant information
 */
export async function updateUserMetadataWithTenant(
  tenantId: string, 
  tenantName: string | null = null, 
  needsSubscription: boolean = false
): Promise<boolean> {
  logAuth('TENANT-CREATION', `Updating user metadata with tenant ID: ${tenantId}`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  
  const metadata: Record<string, any> = {
    tenant_id: tenantId,
    needs_subscription: needsSubscription
  };
  
  if (tenantName) {
    metadata.tenant_name = tenantName;
  }
  
  const { error: metadataError } = await supabase.auth.updateUser({
    data: metadata
  });
  
  if (metadataError) {
    logAuth('TENANT-CREATION', `Failed to update user metadata: ${metadataError.message}`, {
      level: AUTH_LOG_LEVELS.WARN,
      data: metadataError
    });
    return false;
  }
  
  return true;
}
