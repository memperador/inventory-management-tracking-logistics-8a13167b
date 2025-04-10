
import { useMigrationBase, MigrationResult } from './useMigrationBase';

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
      // Get current session access token
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }
      
      // Call the create-tenant edge function - fixed for webview compatibility
      // Use relative URL to avoid cross-origin issues in webviews
      const functionUrl = `/functions/v1/create-tenant`;
      console.log(`Calling edge function at: ${functionUrl}`);
      
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

  return {
    isLoading,
    migrationResult,
    migrateToNewTenant
  };
};
