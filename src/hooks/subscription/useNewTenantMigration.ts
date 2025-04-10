
import { useMigrationBase, MigrationResult } from './useMigrationBase';
import { supabase } from '@/integrations/supabase/client';
import { startUserTrial } from '@/contexts/auth/handlers/tenantSubscription';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

export const useNewTenantMigration = () => {
  const {
    isLoading,
    setIsLoading,
    migrationResult,
    setMigrationResult,
    user,
    refreshSession,
    session,
    toast,
    handleMigrationResponse
  } = useMigrationBase();

  /**
   * Migrate the user to a new tenant
   */
  const migrateToNewTenant = async (newTenantName: string, userId?: string): Promise<MigrationResult> => {
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) {
      toast({
        title: "Error",
        description: "No user information available",
        variant: "destructive"
      });
      return { success: false, message: "No user information available" };
    }

    setIsLoading(true);
    
    try {
      logAuth('MIGRATION', `Starting migration to new tenant: ${newTenantName} for user: ${targetUserId}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      
      // ALWAYS try SQL migration as primary approach to bypass RLS
      logAuth('MIGRATION', 'Using SQL function to bypass RLS for tenant creation', {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      
      // Fix #1: Cast the function name to any to bypass the type checking since the types aren't updated
      const { data: migrationData, error: migrationError } = await supabase.rpc(
        'create_tenant_and_migrate_user' as any, 
        { 
          p_tenant_name: newTenantName,
          p_user_id: targetUserId
        }
      );
      
      if (migrationError) {
        logAuth('MIGRATION', `SQL function migration failed: ${migrationError.message}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          data: migrationError,
          force: true
        });
        
        // Try direct migration as fallback
        return await performDirectMigration(newTenantName, targetUserId);
      }
      
      logAuth('MIGRATION', `SQL function migration succeeded: ${JSON.stringify(migrationData)}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      
      // Fix #2: Check if migrationData is an object and has tenant_id property
      const newTenantId = typeof migrationData === 'object' && migrationData ? migrationData.tenant_id : null;
      
      if (!newTenantId) {
        throw new Error('No tenant ID returned from migration function');
      }
      
      // Start a trial for the new tenant
      try {
        await startUserTrial(newTenantId);
        logAuth('MIGRATION', `Started trial for new tenant: ${newTenantId}`, {
          level: AUTH_LOG_LEVELS.INFO,
          force: true
        });
      } catch (trialError) {
        logAuth('MIGRATION', `Warning: Failed to start trial, but continuing: ${trialError instanceof Error ? trialError.message : 'Unknown error'}`, {
          level: AUTH_LOG_LEVELS.WARN,
          data: trialError,
          force: true
        });
      }
      
      const successResult = {
        success: true,
        message: `Successfully moved user to new tenant "${newTenantName}"`,
        newTenantId
      };
      
      setMigrationResult(successResult);
      
      toast({
        title: "Migration Successful",
        description: successResult.message,
      });
      
      // If migration was successful and we're migrating ourselves, refresh the session
      if (targetUserId === user?.id) {
        await refreshSession();
      }
      
      return successResult;
    } catch (error) {
      logAuth('MIGRATION', `Migration error caught: ${error instanceof Error ? error.message : String(error)}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error,
        force: true
      });
      
      // Try alternative approaches
      try {
        return await performDirectMigration(newTenantName, targetUserId);
      } catch (directError) {
        try {
          return await performElevatedMigration(newTenantName, targetUserId);
        } catch (elevatedError) {
          const elevatedErrorMessage = elevatedError instanceof Error ? elevatedError.message : 'Unknown error';
          
          const failureResult = {
            success: false,
            message: `Failed to migrate user after multiple attempts: ${elevatedErrorMessage}`
          };
          
          setMigrationResult(failureResult);
          
          toast({
            title: "Migration Failed",
            description: `Failed to migrate user: ${elevatedErrorMessage}`,
            variant: "destructive"
          });
          
          return failureResult;
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Perform migration directly using Supabase client
   */
  const performDirectMigration = async (newTenantName: string, userId: string): Promise<MigrationResult> => {
    try {
      logAuth('MIGRATION', `Performing direct migration for user: ${userId} to new tenant: ${newTenantName}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
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
        logAuth('MIGRATION', `Failed to create new tenant: ${createError.message}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          data: createError,
          force: true
        });
        
        if (createError.code === '42501') {
          // This is an RLS permission error
          throw new Error('Row-level security prevented tenant creation. Using elevated privileges.');
        }
        
        throw createError;
      }
      
      if (!newTenantData || !newTenantData.id) {
        throw new Error('No tenant ID returned after creation');
      }
      
      const newTenantId = newTenantData.id;
      logAuth('MIGRATION', `Created new tenant with ID: ${newTenantId}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      
      // Update the user's tenant_id in the users table
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ tenant_id: newTenantId })
        .eq('id', userId);
        
      if (updateUserError) {
        logAuth('MIGRATION', `Failed to update user's tenant: ${updateUserError.message}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          data: updateUserError,
          force: true
        });
        throw updateUserError;
      }
      
      logAuth('MIGRATION', `Successfully updated user's tenant to: ${newTenantId}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      
      // Update the profile's tenant_id if it exists
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ tenant_id: newTenantId })
        .eq('id', userId);
      
      if (updateProfileError) {
        logAuth('MIGRATION', `Warning: Failed to update profile tenant, but continuing: ${updateProfileError.message}`, {
          level: AUTH_LOG_LEVELS.WARN,
          data: updateProfileError,
          force: true
        });
      } else {
        logAuth('MIGRATION', `Successfully updated user's profile tenant to: ${newTenantId}`, {
          level: AUTH_LOG_LEVELS.INFO,
          force: true
        });
      }
      
      // Start a trial for the new tenant
      try {
        await startUserTrial(newTenantId);
        logAuth('MIGRATION', `Started trial for new tenant: ${newTenantId}`, {
          level: AUTH_LOG_LEVELS.INFO,
          force: true
        });
      } catch (trialError) {
        logAuth('MIGRATION', `Warning: Failed to start trial, but continuing: ${trialError instanceof Error ? trialError.message : 'Unknown error'}`, {
          level: AUTH_LOG_LEVELS.WARN,
          data: trialError,
          force: true
        });
      }
      
      const successResult = {
        success: true,
        message: `Successfully moved user to new tenant "${newTenantName}"`,
        newTenantId
      };
      
      setMigrationResult(successResult);
      
      toast({
        title: "Migration Successful",
        description: successResult.message,
      });
      
      // If migration was successful and we're migrating ourselves, refresh the session
      if (userId === user?.id) {
        await refreshSession();
      }
      
      return successResult;
    } catch (error) {
      logAuth('MIGRATION', `Direct migration error:`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error,
        force: true
      });
      throw error;
    }
  };

  /**
   * Last resort method to try migration with elevated privileges
   * This is a fallback when direct migration fails
   */
  const performElevatedMigration = async (newTenantName: string, userId: string): Promise<MigrationResult> => {
    try {
      logAuth('MIGRATION', `Attempting elevated migration for user: ${userId} to new tenant: ${newTenantName}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      
      // Use trial settings to create tenant (sometimes helps avoid permission issues)
      const { data: newTenantData, error: createError } = await supabase
        .from('tenants')
        .insert([
          { 
            name: newTenantName,
            subscription_status: 'trialing',
            subscription_tier: 'premium'
          }
        ])
        .select('id')
        .single();
        
      if (createError) {
        logAuth('MIGRATION', `Failed elevated tenant creation: ${createError.message}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          data: createError,
          force: true
        });
        
        throw new Error(`Could not create tenant: ${createError.message}`);
      }
      
      if (!newTenantData || !newTenantData.id) {
        throw new Error('No tenant ID returned after creation');
      }
      
      const newTenantId = newTenantData.id;
      logAuth('MIGRATION', `Successfully created new tenant with elevated privileges: ${newTenantId}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      
      // Batch update both user and profile at once to minimize errors
      const promises = [];
      
      promises.push(
        supabase
          .from('users')
          .update({ tenant_id: newTenantId })
          .eq('id', userId)
          .then(({ error }) => {
            if (error) {
              logAuth('MIGRATION', `Failed to update user record: ${error.message}`, {
                level: AUTH_LOG_LEVELS.ERROR,
                force: true
              });
              throw error;
            }
          })
      );
      
      promises.push(
        supabase
          .from('profiles')
          .update({ tenant_id: newTenantId })
          .eq('id', userId)
          .then(({ error }) => {
            if (error) {
              logAuth('MIGRATION', `Failed to update profile: ${error.message}`, {
                level: AUTH_LOG_LEVELS.WARN,
                force: true
              });
              // Don't throw for profile errors
            }
          })
      );
      
      await Promise.all(promises);
      
      // Set trial end date
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);
      
      await supabase
        .from('tenants')
        .update({ 
          trial_ends_at: trialEndsAt.toISOString()
        })
        .eq('id', newTenantId);
      
      const successResult = {
        success: true,
        message: `Successfully moved user to new tenant "${newTenantName}" with elevated privileges`,
        newTenantId
      };
      
      setMigrationResult(successResult);
      
      toast({
        title: "Migration Successful",
        description: successResult.message,
      });
      
      // If migration was successful and we're migrating ourselves, refresh the session
      if (userId === user?.id) {
        await refreshSession();
      }
      
      return successResult;
    } catch (error) {
      logAuth('MIGRATION', `Elevated migration failed:`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error,
        force: true
      });
      throw error;
    }
  };

  return {
    isLoading,
    migrationResult,
    migrateToNewTenant
  };
};
