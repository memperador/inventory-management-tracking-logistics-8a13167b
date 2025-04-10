
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

export const useUserMigration = () => {
  const { toast } = useToast();
  const { user, refreshSession, session } = useAuth();
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
      // Get current session access token
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }
      
      // Instead of direct database operations, use the create-tenant edge function
      // which has service role access to bypass RLS
      const response = await fetch(`${window.location.origin}/api/create-tenant`, {
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tenant');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        setMigrationResult({
          success: false,
          message: result.message || 'Failed to create tenant'
        });
        
        toast({
          title: "Migration Failed",
          description: result.message || 'Failed to create tenant',
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      const newTenantId = result.tenant_id;
      
      // Setup trial period for the new tenant
      try {
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 7); // 7-day trial
        
        // Use the edge function to update the tenant trial status
        const trialResponse = await fetch(`${window.location.origin}/api/create-tenant`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            tenantId: newTenantId,
            action: 'setTrial',
            trialData: {
              subscription_status: 'trialing',
              subscription_tier: 'premium',
              trial_ends_at: trialEndsAt.toISOString()
            }
          })
        });
        
        if (!trialResponse.ok) {
          console.warn("Failed to set trial period:", await trialResponse.text());
        }
      } catch (e) {
        console.warn("Error setting up trial:", e);
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
