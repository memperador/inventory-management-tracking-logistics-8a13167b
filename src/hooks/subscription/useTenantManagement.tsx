
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
      // First check if the email exists in auth.users (requires elevated privileges)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError) {
        // Try to look up the user by their auth email
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
          filter: {
            email: email
          }
        });
        
        if (authError || !authData?.users?.length) {
          toast({
            title: "User Not Found",
            description: `No user found with email: ${email}`,
            variant: "destructive"
          });
          setIsLoading(false);
          return null;
        }
        
        const foundUser = authData.users[0];
        setLookupResult({ userId: foundUser.id, email });
        toast({
          title: "User Found",
          description: `Found user: ${email}`
        });
        setIsLoading(false);
        return { userId: foundUser.id, email };
      }

      setLookupResult({ userId: userData.id, email });
      toast({
        title: "User Found",
        description: `Found user: ${email}`
      });
      setIsLoading(false);
      return { userId: userData.id, email };
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
