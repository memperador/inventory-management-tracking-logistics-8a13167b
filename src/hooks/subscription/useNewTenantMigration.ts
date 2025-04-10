
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
        level: AUTH_LOG_LEVELS.INFO
      });
      
      // Always try direct migration first as the most reliable method
      logAuth('MIGRATION', 'Using direct database migration as primary approach', {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      try {
        return await performDirectMigration(newTenantName, targetUserId);
      } catch (directError) {
        logAuth('MIGRATION', `Direct migration failed, trying edge function: ${directError instanceof Error ? directError.message : 'Unknown error'}`, {
          level: AUTH_LOG_LEVELS.WARN,
          data: directError
        });
        
        // Only try edge function if direct migration fails
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
          }
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
            level: AUTH_LOG_LEVELS.INFO
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            logAuth('MIGRATION', `Edge function error: ${response.status} - ${errorText}`, {
              level: AUTH_LOG_LEVELS.ERROR
            });
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
            data: fetchError
          });
          throw fetchError;
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logAuth('MIGRATION', `Migration failed: ${errorMessage}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
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
        logAuth('MIGRATION', `Failed to create new tenant: ${createError.message}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          data: createError
        });
        
        throw createError;
      }
      
      if (!newTenantData || !newTenantData.id) {
        throw new Error('No tenant ID returned after creation');
      }
      
      const newTenantId = newTenantData.id;
      logAuth('MIGRATION', `Created new tenant with ID: ${newTenantId}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      // Update the user's tenant_id in the users table
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ tenant_id: newTenantId })
        .eq('id', userId);
        
      if (updateUserError) {
        logAuth('MIGRATION', `Failed to update user's tenant: ${updateUserError.message}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          data: updateUserError
        });
        throw updateUserError;
      }
      
      logAuth('MIGRATION', `Successfully updated user's tenant to: ${newTenantId}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      // Update the profile's tenant_id if it exists
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ tenant_id: newTenantId })
        .eq('id', userId);
      
      if (updateProfileError) {
        logAuth('MIGRATION', `Warning: Failed to update profile tenant, but continuing: ${updateProfileError.message}`, {
          level: AUTH_LOG_LEVELS.WARN,
          data: updateProfileError
        });
      } else {
        logAuth('MIGRATION', `Successfully updated user's profile tenant to: ${newTenantId}`, {
          level: AUTH_LOG_LEVELS.INFO
        });
      }
      
      // Start a trial for the new tenant
      try {
        await startUserTrial(newTenantId);
        logAuth('MIGRATION', `Started trial for new tenant: ${newTenantId}`, {
          level: AUTH_LOG_LEVELS.INFO
        });
      } catch (trialError) {
        logAuth('MIGRATION', `Warning: Failed to start trial, but continuing: ${trialError instanceof Error ? trialError.message : 'Unknown error'}`, {
          level: AUTH_LOG_LEVELS.WARN,
          data: trialError
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
        data: error
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
