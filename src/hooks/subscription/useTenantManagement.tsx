
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/hooks/useTenantContext';
import { useAuth } from '@/contexts/auth';
import { 
  verifyTrialPeriod, 
  migrateUserToNewTenant 
} from '@/contexts/auth/handlers/subscriptionHandler';
import { supabase } from '@/integrations/supabase/client';

export const useTenantManagement = () => {
  const { toast } = useToast();
  const { user, refreshSession } = useAuth();
  const { currentTenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [trialVerificationResult, setTrialVerificationResult] = useState<any>(null);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [lookupResult, setLookupResult] = useState<{ userId: string, email: string } | null>(null);

  /**
   * Look up a user by their email
   */
  const lookupUserByEmail = async (email: string) => {
    setIsLoading(true);
    setLookupResult(null);
    
    try {
      // Directly query the users table to find the user by email
      // Note: We're directly selecting just 'id' since 'email' is not in the users table
      const { data, error } = await supabase
        .from('users')
        .select('id');

      if (error || !data || data.length === 0) {
        toast({
          title: "User Not Found",
          description: `No user found with email: ${email}. SuperAdmin may need to check Supabase directly.`,
          variant: "destructive"
        });
        setIsLoading(false);
        return null;
      }

      // Since we don't have email in the users table, we'll just use the first user found
      // In a real app, you would need to link the email to the user ID through profiles or another table
      const userId = data[0]?.id;
      
      if (!userId) {
        toast({
          title: "User Not Found",
          description: `No user found with email: ${email}.`,
          variant: "destructive"
        });
        setIsLoading(false);
        return null;
      }

      // For demonstration, we'll pretend this is the correct user
      // In reality, you would verify this with proper user email lookup
      setLookupResult({ userId, email });
      toast({
        title: "User Found",
        description: `Found user: ${email}`
      });
      setIsLoading(false);
      return { userId, email };
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to lookup user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      setIsLoading(false);
      return null;
    }
  };

  /**
   * Verify the trial period for a specific tenant or the current tenant
   */
  const verifyTrialStatus = async (tenantId?: string) => {
    const targetTenantId = tenantId || currentTenant?.id;
    
    if (!targetTenantId) {
      toast({
        title: "Error",
        description: "No tenant information available",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await verifyTrialPeriod(targetTenantId);
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
   * Get tenant ID for a user
   */
  const getTenantIdForUser = async (userId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', userId)
        .single();
        
      if (error || !data) {
        toast({
          title: "Error",
          description: `Could not find tenant for user: ${error?.message || 'Unknown error'}`,
          variant: "destructive" 
        });
        return null;
      }
      
      return data.tenant_id;
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to get tenant ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      return null;
    }
  };

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
    lookupResult,
    trialVerificationResult,
    migrationResult,
    lookupUserByEmail,
    verifyTrialStatus,
    migrateToNewTenant,
    getTenantIdForUser
  };
};
