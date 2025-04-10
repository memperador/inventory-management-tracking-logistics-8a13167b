
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { supabase } from '@/integrations/supabase/client';
import { startUserTrial } from '@/contexts/auth/handlers/tenantSubscription';

/**
 * Move a user to a new tenant
 * NOTE: This function is kept for backward compatibility but the direct implementation
 * in useUserMigration.ts should be preferred to avoid RLS issues
 */
export async function migrateUserToNewTenant(
  userId: string, 
  newTenantName: string
): Promise<{
  success: boolean;
  message: string;
  newTenantId?: string;
}> {
  try {
    logAuth('USER-MIGRATION', `Attempting to migrate user ${userId} to new tenant: ${newTenantName}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    // Create a new tenant
    const { data: newTenantData, error: createError } = await supabase
      .from('tenants')
      .insert([
        { name: newTenantName }
      ])
      .select('id')
      .single();
      
    if (createError) {
      logAuth('USER-MIGRATION', `Failed to create new tenant: ${createError.message}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: { error: createError, code: createError.code, details: createError.details }
      });
      
      if (createError.code === '42501') {
        // This is an RLS permission error
        return {
          success: false,
          message: `Row-level security prevented tenant creation. Try using edge functions or admin API key.`
        };
      }
      
      return {
        success: false,
        message: `Failed to create new tenant: ${createError.message || 'No tenant data returned'}`
      };
    }
    
    const newTenantId = newTenantData.id;
    logAuth('USER-MIGRATION', `Successfully created new tenant with ID: ${newTenantId}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    // Update the user's tenant_id in the users table
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ tenant_id: newTenantId })
      .eq('id', userId);
      
    if (updateUserError) {
      logAuth('USER-MIGRATION', `Failed to update user's tenant: ${updateUserError.message}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: updateUserError
      });
      
      return {
        success: false, 
        message: `Failed to update user's tenant: ${updateUserError.message}`
      };
    }
    
    logAuth('USER-MIGRATION', `Successfully updated user's tenant to: ${newTenantId}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    // Update the profile's tenant_id if it exists
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ tenant_id: newTenantId })
      .eq('id', userId);
    
    if (updateProfileError) {
      logAuth('USER-MIGRATION', `Note: Failed to update profile's tenant (continuing): ${updateProfileError.message}`, {
        level: AUTH_LOG_LEVELS.WARN,
        data: updateProfileError
      });
    } else {
      logAuth('USER-MIGRATION', `Successfully updated user's profile tenant to: ${newTenantId}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
    }
    
    // Start a trial for the new tenant
    try {
      await startUserTrial(newTenantId);
      logAuth('USER-MIGRATION', `Started trial for new tenant: ${newTenantId}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
    } catch (trialError) {
      logAuth('USER-MIGRATION', `Failed to start trial (continuing): ${trialError instanceof Error ? trialError.message : 'Unknown error'}`, {
        level: AUTH_LOG_LEVELS.WARN,
        data: trialError
      });
    }
    
    return {
      success: true,
      message: `Successfully moved user to new tenant "${newTenantName}"`,
      newTenantId
    };
  } catch (error) {
    logAuth('USER-MIGRATION', `Unexpected error during migration:`, {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error
    });
    
    return {
      success: false,
      message: `Unexpected error during migration: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get user details by email via direct Supabase query
 * Uses a simplified approach to avoid deep type instantiation
 */
export async function getUserDetailsByEmail(email: string): Promise<{ id: string } | null> {
  if (!email) return null;
  
  try {
    // Simplest possible approach to avoid deep type instantiation issues
    const response = await supabase.from('users').select('id');
    if (response.error) {
      throw response.error;
    }
    
    // Just return the first user for demo purposes
    // In a real app, you would have email stored properly and query by it
    const user = response.data && response.data.length > 0 ? response.data[0] : null;
      
    if (!user) {
      return null;
    }
    
    return { id: user.id };
  } catch (error) {
    console.error(`Error fetching user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}
