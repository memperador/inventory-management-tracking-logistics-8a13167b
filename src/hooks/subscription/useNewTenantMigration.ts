
import { useState } from 'react';
import { useMigrationBase, MigrationResult } from './useMigrationBase';
import { useTenantCreation } from './tenant/useTenantCreation';
import { useEdgeTenantCreation } from './tenant/useEdgeTenantCreation';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { useAuth } from '@/hooks/useAuthContext';

export const useNewTenantMigration = () => {
  const {
    isLoading,
    setIsLoading,
    migrationResult,
    setMigrationResult,
    refreshSession,
    session,
    toast,
    handleMigrationResponse
  } = useMigrationBase();
  
  // Get user directly from auth context
  const { user } = useAuth();
  
  // Import modularized hooks
  const { createTenantDirectly } = useTenantCreation();
  const { createTenantWithEdgeFunction, parseEdgeFunctionResponse } = useEdgeTenantCreation();

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
      logAuth('MIGRATION', `Starting tenant creation for user ${targetUserId} with name ${newTenantName}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      
      // In development or webview, use direct method without edge functions
      if (process.env.NODE_ENV === 'development' || window.location.hostname.includes('webview')) {
        return await createTenantDirectly(newTenantName, targetUserId);
      }
      
      // Get current session access token for production environment
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }
      
      try {
        // Call edge function to create tenant
        const response = await createTenantWithEdgeFunction(
          accessToken,
          newTenantName,
          targetUserId
        );
        
        // If we get a 404, the edge function might not be deployed in development
        if (response.status === 404) {
          logAuth('MIGRATION', 'Edge function not found, falling back to direct tenant creation', {
            level: AUTH_LOG_LEVELS.WARN,
            force: true
          });
          return await createTenantDirectly(newTenantName, targetUserId);
        }
        
        // Parse the response
        const result = await parseEdgeFunctionResponse(response);
        
        if (result.newTenantId) {
          const successResult = {
            success: true,
            message: `Successfully created tenant "${newTenantName}" and moved user`,
            newTenantId: result.newTenantId
          };
          
          setMigrationResult(successResult);
          
          logAuth('MIGRATION', `Created tenant via edge function: ${result.newTenantId}`, {
            level: AUTH_LOG_LEVELS.INFO,
            force: true,
            data: { tenantName: newTenantName, tenantId: result.newTenantId }
          });
          
          toast({
            title: "Tenant Created",
            description: successResult.message,
          });
          
          // If we're migrating the current user, refresh their session to update metadata
          if (targetUserId === user?.id) {
            await refreshSession();
          }
          
          return successResult;
        } else {
          throw new Error("No tenant ID returned from migration");
        }
      } catch (fetchError) {
        // If the edge function fails, fall back to direct tenant creation
        logAuth('MIGRATION', `Edge function error, falling back to direct tenant creation: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`, {
          level: AUTH_LOG_LEVELS.WARN,
          force: true
        });
        return await createTenantDirectly(newTenantName, targetUserId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      logAuth('MIGRATION', `Migration error: ${errorMessage}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        force: true,
        data: error
      });
      
      const failureResult = {
        success: false,
        message: `Failed to create tenant: ${errorMessage}`
      };
      
      setMigrationResult(failureResult);
      
      toast({
        title: "Error",
        description: `Failed to create tenant: ${errorMessage}`,
        variant: "destructive"
      });
      
      return failureResult;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    migrationResult,
    migrateToNewTenant
  };
};
