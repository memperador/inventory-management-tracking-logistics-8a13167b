
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { migrateUserToNewTenant } from '@/contexts/auth/handlers/subscriptionHandler';

export const useUserMigration = () => {
  const { toast } = useToast();
  const { user, refreshSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);

  /**
   * Migrate the user to a new tenant
   */
  const migrateToNewTenant = async (newTenantName: string, userId?: string) => {
    const targetUserId = userId || user?.id;
    
    if (!targetUserId) {
      toast({
        title: "Error",
        description: "No user information available",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await migrateUserToNewTenant(targetUserId, newTenantName);
      setMigrationResult(result);
      
      toast({
        title: result.success ? "Migration Successful" : "Migration Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
      
      // If migration was successful and we're migrating ourselves, refresh the session
      if (result.success && targetUserId === user?.id) {
        await refreshSession();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to migrate user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
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
