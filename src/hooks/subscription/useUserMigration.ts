
import { useState, useEffect } from 'react';
import { useNewTenantMigration } from './useNewTenantMigration';
import { useExistingTenantMigration } from './useExistingTenantMigration';
import { MigrationResult } from './useMigrationBase';
import { logAuth, AUTH_LOG_LEVELS, dumpAuthLogs } from '@/utils/debug/authLogger';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';

export const useUserMigration = () => {
  const newTenantMigration = useNewTenantMigration();
  const existingTenantMigration = useExistingTenantMigration();
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const { toast } = useToast();
  // Add access to the user from the auth context
  const { user } = useAuth();

  // Sync migration results from both hooks
  useEffect(() => {
    if (newTenantMigration.migrationResult && newTenantMigration.migrationResult !== migrationResult) {
      logAuth('USER-MIGRATION', `New tenant migration result: ${JSON.stringify(newTenantMigration.migrationResult)}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      setMigrationResult(newTenantMigration.migrationResult);
    }
    
    if (existingTenantMigration.migrationResult && existingTenantMigration.migrationResult !== migrationResult) {
      logAuth('USER-MIGRATION', `Existing tenant migration result: ${JSON.stringify(existingTenantMigration.migrationResult)}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      setMigrationResult(existingTenantMigration.migrationResult);
    }
  }, [newTenantMigration.migrationResult, existingTenantMigration.migrationResult, migrationResult]);

  const showDebugLogs = () => {
    console.log('Migration debug logs:', dumpAuthLogs());
    toast({
      title: "Debug Logs Available",
      description: "Migration logs have been output to the console",
    });
  };
  
  // New function to debug tenant information
  const debugTenantInfo = async () => {
    try {
      // Get all tenants for debugging
      const { data: tenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('id, name, subscription_status, subscription_tier, trial_ends_at');
      
      if (tenantsError) {
        console.error('Error fetching tenants:', tenantsError);
        return;
      }
      
      // Get all users for debugging
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, tenant_id, role');
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
      }
      
      // Get current user details
      const { user: currentUser } = useAuth();
      const currentUserId = currentUser?.id;
      let currentUserData = null;
      let currentUserTenant = null;
      
      if (currentUserId) {
        const { data: userData } = await supabase
          .from('users')
          .select('id, tenant_id, role')
          .eq('id', currentUserId)
          .single();
          
        currentUserData = userData;
        
        if (userData?.tenant_id) {
          const { data: tenantData } = await supabase
            .from('tenants')
            .select('id, name, subscription_status, subscription_tier, trial_ends_at')
            .eq('id', userData.tenant_id)
            .single();
            
          currentUserTenant = tenantData;
        }
      }
      
      // Log all collected data
      console.group('Tenant and User Debug Info');
      console.log('All Tenants:', tenants);
      console.log('All Users:', users);
      console.log('Current User:', currentUserData);
      console.log('Current User Tenant:', currentUserTenant);
      console.groupEnd();
      
      // Format and display in toast
      toast({
        title: "Debug Info Available",
        description: `Found ${tenants?.length || 0} tenants and ${users?.length || 0} users. Details in console.`,
      });
      
      return {
        tenants,
        users,
        currentUserData,
        currentUserTenant
      };
    } catch (error) {
      console.error('Error in debug tenant info:', error);
      toast({
        title: "Debug Error",
        description: "Failed to gather debug information. Check console.",
        variant: "destructive"
      });
    }
  };

  // Helper function to ensure user has admin role
  const ensureAdminRole = async (userId: string, tenantId: string) => {
    try {
      logAuth('USER-MIGRATION', `Ensuring admin role for user ${userId} in tenant ${tenantId}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      
      const { error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', userId)
        .eq('tenant_id', tenantId);
      
      if (error) {
        logAuth('USER-MIGRATION', `Failed to set admin role: ${error.message}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          force: true
        });
        return false;
      }
      
      logAuth('USER-MIGRATION', `Successfully set admin role for user ${userId}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logAuth('USER-MIGRATION', `Error setting admin role: ${errorMsg}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        force: true,
        data: { error }
      });
      return false;
    }
  };

  // Helper function to clear subscription prompt flag
  const clearSubscriptionFlag = async (userId: string) => {
    try {
      const { data: userData, error } = await supabase.auth.updateUser({
        data: { needs_subscription: false }
      });
      
      if (error) {
        logAuth('USER-MIGRATION', `Failed to clear subscription flag: ${error.message}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          force: true
        });
        return false;
      }
      
      logAuth('USER-MIGRATION', `Successfully cleared subscription flag for user ${userId}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      return true;
    } catch (error) {
      logAuth('USER-MIGRATION', `Error clearing subscription flag: ${error instanceof Error ? error.message : String(error)}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        force: true,
        data: { error }
      });
      return false;
    }
  };

  return {
    isLoading: newTenantMigration.isLoading || existingTenantMigration.isLoading,
    migrationResult,
    showDebugLogs,
    debugTenantInfo, // Expose the new debug function
    migrateToNewTenant: async (newTenantName: string, userId?: string) => {
      logAuth('USER-MIGRATION', `Attempting to migrate to new tenant: ${newTenantName}, User ID: ${userId}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      
      try {
        logAuth('USER-MIGRATION', 'Starting database migration with RLS bypass function', {
          level: AUTH_LOG_LEVELS.INFO,
          force: true
        });
        
        const result = await newTenantMigration.migrateToNewTenant(newTenantName, userId);
        
        logAuth('USER-MIGRATION', `New tenant migration completed: ${JSON.stringify(result)}`, {
          level: result.success ? AUTH_LOG_LEVELS.INFO : AUTH_LOG_LEVELS.ERROR,
          force: true
        });
        
        if (result.success && result.newTenantId) {
          // Ensure user has admin role in the new tenant
          const targetUserId = userId || user?.id;
          if (targetUserId) {
            await ensureAdminRole(targetUserId, result.newTenantId);
            // Clear the subscription prompt flag
            await clearSubscriptionFlag(targetUserId);
          }
        }
        
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logAuth('USER-MIGRATION', `Migration error caught: ${errorMessage}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          data: error,
          force: true
        });
        
        return {
          success: false,
          message: `Failed to migrate user: ${errorMessage}`
        };
      }
    },
    migrateToExistingTenant: async (tenantId: string, userId?: string) => {
      logAuth('USER-MIGRATION', `Attempting to migrate to existing tenant: ${tenantId}, User ID: ${userId}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      
      try {
        logAuth('USER-MIGRATION', 'Using direct database migration for existing tenant', {
          level: AUTH_LOG_LEVELS.INFO,
          force: true
        });
        
        const result = await existingTenantMigration.migrateToExistingTenant(tenantId, userId);
        
        logAuth('USER-MIGRATION', `Existing tenant migration completed: ${JSON.stringify(result)}`, {
          level: result.success ? AUTH_LOG_LEVELS.INFO : AUTH_LOG_LEVELS.ERROR,
          force: true
        });
        
        if (result.success && tenantId) {
          // Ensure user has admin role in the existing tenant
          const targetUserId = userId || user?.id;
          if (targetUserId) {
            await ensureAdminRole(targetUserId, tenantId);
            // Clear the subscription prompt flag
            await clearSubscriptionFlag(targetUserId);
          }
        }
        
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logAuth('USER-MIGRATION', `Migration error caught: ${errorMessage}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          data: error,
          force: true
        });
        
        return {
          success: false,
          message: `Failed to migrate user: ${errorMessage}`
        };
      }
    }
  };
};
