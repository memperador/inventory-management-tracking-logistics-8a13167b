
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { migrateUserToNewTenant } from '@/contexts/auth/handlers/subscriptionHandler';
import { supabase } from '@/integrations/supabase/client';

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
      // Instead of using the handler function that might be restricted by RLS,
      // directly create the tenant with service role if available
      const { data: newTenantData, error: createError } = await supabase
        .from('tenants')
        .insert([{ name: newTenantName }])
        .select('id')
        .single();
        
      if (createError) {
        setMigrationResult({
          success: false,
          message: `Failed to create new tenant: ${createError.message}`
        });
        
        toast({
          title: "Migration Failed",
          description: `Failed to create new tenant: ${createError.message}`,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      const newTenantId = newTenantData.id;
      
      // Update the user's tenant_id in the users table
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ tenant_id: newTenantId })
        .eq('id', targetUserId);
        
      if (updateUserError) {
        setMigrationResult({
          success: false, 
          message: `Failed to update user's tenant: ${updateUserError.message}`
        });
        
        toast({
          title: "Migration Failed",
          description: `Failed to update user's tenant: ${updateUserError.message}`,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Update the profile's tenant_id if it exists
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ tenant_id: newTenantId })
        .eq('id', targetUserId);
      
      // Setup trial period for the new tenant
      try {
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 7); // 7-day trial
        
        const { error: trialError } = await supabase
          .from('tenants')
          .update({
            subscription_status: 'trialing',
            subscription_tier: 'premium',
            trial_ends_at: trialEndsAt.toISOString()
          })
          .eq('id', newTenantId);
          
        if (trialError) {
          console.warn("Failed to set trial period:", trialError.message);
        }
      } catch (e) {
        console.warn("Error setting up trial:", e);
      }
      
      const result = {
        success: true,
        message: `Successfully moved user to new tenant "${newTenantName}"`,
        newTenantId
      };
      
      setMigrationResult(result);
      
      toast({
        title: "Migration Successful",
        description: result.message,
      });
      
      // If migration was successful and we're migrating ourselves, refresh the session
      if (targetUserId === user?.id) {
        await refreshSession();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMigrationResult({
        success: false,
        message: `Failed to migrate user: ${errorMessage}`
      });
      
      toast({
        title: "Error",
        description: `Failed to migrate user: ${errorMessage}`,
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
