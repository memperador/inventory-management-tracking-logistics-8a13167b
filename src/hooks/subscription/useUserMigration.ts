
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
      
      // Call the create-tenant edge function
      const functionUrl = `${window.location.origin}/functions/v1/create-tenant`;
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
      
      // Log the status and headers for debugging
      console.log('Edge function response status:', response.status);
      console.log('Edge function response type:', response.headers.get('Content-Type'));
      
      // Check if the response is valid before trying to parse it
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error response:', errorText);
        throw new Error(`Edge function returned error status ${response.status}: ${errorText || 'No error details'}`);
      }
      
      const responseText = await response.text();
      console.log('Edge function raw response:', responseText);
      
      if (!responseText || responseText.trim() === '') {
        throw new Error('Edge function returned empty response');
      }
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error(`Failed to parse response: ${responseText}`);
      }
      
      if (!result.success) {
        throw new Error(result?.error || result?.message || 'Failed to create tenant');
      }
      
      const newTenantId = result.tenant_id;
      
      if (!newTenantId) {
        throw new Error('No tenant ID returned from the edge function');
      }
      
      // Setup trial period for the new tenant
      try {
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 7); // 7-day trial
        
        // Use the edge function to update the tenant trial status
        const trialResponse = await fetch(functionUrl, {
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
        
        const trialResponseText = await trialResponse.text();
        console.log('Trial setup response:', trialResponseText);
        
        if (!trialResponse.ok) {
          console.warn("Failed to set trial period:", trialResponseText);
        }
      } catch (e) {
        console.warn("Error setting up trial:", e);
        // Don't throw here, as the main migration was successful
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
      console.error('Migration error:', error);
      
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
