
import { useMigrationBase, MigrationResult } from './useMigrationBase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';

export const useExistingTenantMigration = () => {
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

  /**
   * Migrate the user to an existing tenant
   */
  const migrateToExistingTenant = async (tenantId: string, userId?: string): Promise<MigrationResult> => {
    const targetUserId = userId || user?.id;
    
    if (!targetUserId || !tenantId) {
      toast({
        title: "Error",
        description: "Missing user ID or tenant ID",
        variant: "destructive"
      });
      return { success: false, message: "Missing user ID or tenant ID" };
    }

    setIsLoading(true);
    
    try {
      console.log(`Starting migration to existing tenant: ${tenantId} for user: ${targetUserId}`);
      
      // In webview or local dev, always try direct migration first
      if (window.location.hostname.includes('webview') || process.env.NODE_ENV === 'development') {
        console.log('Detected webview or development environment, using direct migration');
        return await performDirectExistingMigration(tenantId, targetUserId);
      }

      // Get current session access token for production environment
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }
      
      // Call the create-tenant edge function with the existing tenant ID
      const functionUrl = `/functions/v1/create-tenant`;
      console.log(`Calling edge function for existing tenant migration:`, {
        tenantId,
        userId: targetUserId
      });
      
      try {
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            action: 'migrateToExisting',
            tenantId: tenantId,
            userId: targetUserId
          })
        });

        // If we get a 404 or any other error, fall back to direct migration
        if (!response.ok) {
          console.log(`Edge function returned ${response.status}, falling back to direct migration`);
          return await performDirectExistingMigration(tenantId, targetUserId);
        }
        
        const result = await handleMigrationResponse(response, targetUserId);
        
        const successResult = {
          success: true,
          message: `Successfully moved user to existing tenant`,
          newTenantId: tenantId
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
        console.error('Error calling edge function:', fetchError);
        // Try direct migration as fallback
        return await performDirectExistingMigration(tenantId, targetUserId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Migration error:', error);
      
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
   * Perform migration to existing tenant directly using Supabase client when edge function is not available
   */
  const performDirectExistingMigration = async (tenantId: string, userId: string): Promise<MigrationResult> => {
    try {
      console.log('Performing direct migration for user:', userId, 'to existing tenant:', tenantId);
      
      // Update the user's tenant_id in the users table
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ tenant_id: tenantId, role: 'admin' })
        .eq('id', userId);
        
      if (updateUserError) {
        console.error('Failed to update user tenant:', updateUserError);
        return {
          success: false, 
          message: `Failed to update user's tenant: ${updateUserError.message}`
        };
      }
      
      // Update the profile's tenant_id if it exists
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ tenant_id: tenantId })
        .eq('id', userId);
      
      if (updateProfileError) {
        console.warn('Failed to update profile tenant, but continuing:', updateProfileError.message);
      }
      
      const successResult = {
        success: true,
        message: `Successfully moved user to existing tenant`,
        newTenantId: tenantId
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Direct migration error:', error);
      
      const failureResult = {
        success: false,
        message: `Failed to migrate user directly: ${errorMessage}`
      };
      
      setMigrationResult(failureResult);
      
      toast({
        title: "Error",
        description: `Failed to migrate user: ${errorMessage}`,
        variant: "destructive"
      });
      
      return failureResult;
    }
  };

  return {
    isLoading,
    migrationResult,
    migrateToExistingTenant
  };
};
