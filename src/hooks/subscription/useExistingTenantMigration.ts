
import { useMigrationBase, MigrationResult } from './useMigrationBase';

export const useExistingTenantMigration = () => {
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
      // Get current session access token
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }
      
      // Call the create-tenant edge function with the existing tenant ID - fixed for webview compatibility
      const functionUrl = `/functions/v1/create-tenant`;
      console.log(`Calling edge function for existing tenant migration:`, {
        tenantId,
        userId: targetUserId
      });
      
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
    migrateToExistingTenant
  };
};
