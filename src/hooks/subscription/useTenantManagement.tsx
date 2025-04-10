
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/hooks/useTenantContext';
import { useAuth } from '@/contexts/auth';
import { 
  verifyTrialPeriod, 
  migrateUserToNewTenant 
} from '@/contexts/auth/handlers/subscriptionHandler';

export const useTenantManagement = () => {
  const { toast } = useToast();
  const { user, refreshSession } = useAuth();
  const { currentTenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [trialVerificationResult, setTrialVerificationResult] = useState<any>(null);
  const [migrationResult, setMigrationResult] = useState<any>(null);

  /**
   * Verify the trial period for the current tenant
   */
  const verifyTrialStatus = async () => {
    if (!currentTenant?.id) {
      toast({
        title: "Error",
        description: "No tenant information available",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await verifyTrialPeriod(currentTenant.id);
      setTrialVerificationResult(result);
      
      toast({
        title: result.isValid ? "Trial Verification" : "Trial Verification Failed",
        description: result.message,
        variant: result.isValid ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to verify trial: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Migrate the current user to a new tenant
   */
  const migrateToNewTenant = async (newTenantName: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "No user information available",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await migrateUserToNewTenant(user.id, newTenantName);
      setMigrationResult(result);
      
      toast({
        title: result.success ? "Migration Successful" : "Migration Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
      
      // If migration was successful, refresh the session to update tenant info
      if (result.success) {
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
    trialVerificationResult,
    migrationResult,
    verifyTrialStatus,
    migrateToNewTenant
  };
};
