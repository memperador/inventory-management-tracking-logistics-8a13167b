
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { MigrationResult } from '../useMigrationBase';
import { startUserTrial } from '@/contexts/auth/handlers/tenantSubscription';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook with tenant creation functionality
 */
export const useTenantCreation = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  /**
   * Create a tenant directly using RPC function call
   */
  const createTenantDirectly = async (tenantName: string, userId: string): Promise<MigrationResult> => {
    try {
      logAuth('MIGRATION', `Creating tenant directly with RPC: ${tenantName} for user ${userId}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      
      // Use the RPC function to create tenant and migrate user
      const { data, error } = await supabase.rpc(
        'create_tenant_and_migrate_user' as any,
        { p_tenant_name: tenantName, p_user_id: userId }
      );
      
      if (error) {
        throw error;
      }
      
      if (!data || !data.success) {
        throw new Error("No tenant ID returned from function");
      }
      
      // Extract tenant_id from the response
      const newTenantId = data.tenant_id as string;
      
      // Start trial for the new tenant
      await startUserTrial(newTenantId);
      
      // Ensure the user is set as admin
      const { error: roleError } = await supabase
        .from('users')
        .update({
          role: 'admin'
        })
        .eq('id', userId);
        
      if (roleError) {
        logAuth('MIGRATION', `Warning: Failed to set user as admin: ${roleError.message}`, {
          level: AUTH_LOG_LEVELS.WARN,
          force: true
        });
        // Don't throw here, just log the warning
      } else {
        logAuth('MIGRATION', `Successfully set user ${userId} as admin for tenant ${newTenantId}`, {
          level: AUTH_LOG_LEVELS.INFO,
          force: true
        });
      }
      
      const successResult = {
        success: true,
        message: `Successfully created tenant "${tenantName}" and moved user`,
        newTenantId
      };
      
      logAuth('MIGRATION', `Created tenant via RPC: ${newTenantId}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true,
        data: { tenantName, tenantId: newTenantId }
      });
      
      toast({
        title: "Tenant Created",
        description: successResult.message,
      });
      
      return successResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      logAuth('MIGRATION', `Direct tenant creation error: ${errorMessage}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        force: true,
        data: error
      });
      
      const failureResult = {
        success: false,
        message: `Failed to create tenant: ${errorMessage}`
      };
      
      toast({
        title: "Error",
        description: `Failed to create tenant: ${errorMessage}`,
        variant: "destructive"
      });
      
      return failureResult;
    }
  };

  return {
    isCreating,
    setIsCreating,
    createTenantDirectly
  };
};
