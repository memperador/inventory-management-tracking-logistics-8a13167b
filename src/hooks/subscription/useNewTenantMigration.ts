
import { useMigrationBase, MigrationResult } from './useMigrationBase';
import { supabase } from '@/integrations/supabase/client';
import { startUserTrial } from '@/contexts/auth/handlers/tenantSubscription';

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
      console.log(`Starting migration to new tenant: ${newTenantName} for user: ${targetUserId}`);
      
      // In webview or local dev, always try direct migration first
      if (window.location.hostname.includes('webview') || process.env.NODE_ENV === 'development') {
        console.log('Detected webview or development environment, using direct migration');
        return await performDirectMigration(newTenantName, targetUserId);
      }
      
      // Get current session access token for production environment
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }
      
      // Call the create-tenant edge function - fixed for webview compatibility
      const functionUrl = `/functions/v1/create-tenant`;
      console.log(`Calling edge function at: ${functionUrl}`);
      
      try {
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
        
        // Log the response status for debugging
        console.log(`Edge function returned status: ${response.status}`);
        
        // If we get any error response, fall back to direct migration
        if (!response.ok) {
          console.log(`Edge function returned ${response.status}, falling back to direct migration`);
          return await performDirectMigration(newTenantName, targetUserId);
        }
        
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
      } catch (fetchError) {
        console.error('Error calling edge function:', fetchError);
        // Try direct migration as fallback
        return await performDirectMigration(newTenantName, targetUserId);
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
   * Perform migration directly using Supabase client when edge function is not available
   */
  const performDirectMigration = async (newTenantName: string, userId: string): Promise<MigrationResult> => {
    try {
      console.log('Performing direct migration for user:', userId, 'to tenant:', newTenantName);
      
      // Create a new tenant
      const { data: newTenantData, error: createError } = await supabase
        .from('tenants')
        .insert([
          { name: newTenantName }
        ])
        .select('id')
        .single();
        
      if (createError) {
        console.error('Failed to create new tenant:', createError);
        
        // If this is an RLS policy violation, use the create-tenant edge function
        if (createError.code === '42501') {
          console.log('RLS policy violation detected, attempting to use service role via edge function');
          
          // Alternative approach: Call the edge function directly
          const response = await fetch('/functions/v1/create-tenant', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tenantName: newTenantName,
              userId: userId,
              isMigration: true
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Edge function error: ${response.status} - ${errorText}`);
          }
          
          const responseText = await response.text();
          console.log('Edge function response:', responseText);
          
          let result;
          try {
            result = JSON.parse(responseText);
          } catch (e) {
            throw new Error(`Failed to parse response: ${responseText}`);
          }
          
          if (!result.success) {
            throw new Error(result.error || 'Unknown error from edge function');
          }
          
          const newTenantId = result.tenant_id;
          
          // Tenant was created by edge function, but we still need to ensure the user is associated
          await associateUserWithTenant(userId, newTenantId);
          
          return {
            success: true,
            message: `Successfully created tenant via edge function and moved user`,
            newTenantId
          };
        }
        
        return {
          success: false,
          message: `Failed to create new tenant: ${createError.message || 'No tenant data returned'}`
        };
      }
      
      const newTenantId = newTenantData.id;
      console.log('Created new tenant with ID:', newTenantId);
      
      await associateUserWithTenant(userId, newTenantId);
      
      // Start a trial for the new tenant
      try {
        await startUserTrial(newTenantId);
        console.log('Started trial for new tenant:', newTenantId);
      } catch (trialError) {
        console.warn('Failed to start trial, but continuing:', trialError);
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

  /**
   * Helper function to associate a user with a tenant
   */
  const associateUserWithTenant = async (userId: string, tenantId: string): Promise<void> => {
    // Update the user's tenant_id in the users table
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ tenant_id: tenantId })
      .eq('id', userId);
      
    if (updateUserError) {
      console.error('Failed to update user tenant:', updateUserError);
      throw updateUserError;
    }
    
    // Update the profile's tenant_id if it exists
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ tenant_id: tenantId })
      .eq('id', userId);
    
    if (updateProfileError) {
      console.warn('Failed to update profile tenant, but continuing:', updateProfileError.message);
    }
  };

  return {
    isLoading,
    migrationResult,
    migrateToNewTenant
  };
};
