import { useState, useEffect } from 'react';
import { useNewTenantMigration } from './useNewTenantMigration';
import { useExistingTenantMigration } from './useExistingTenantMigration';
import { MigrationResult } from './useMigrationBase';
import { logAuth, AUTH_LOG_LEVELS, dumpAuthLogs } from '@/utils/debug/authLogger';
import { useToast } from '@/hooks/use-toast';

export const useUserMigration = () => {
  const newTenantMigration = useNewTenantMigration();
  const existingTenantMigration = useExistingTenantMigration();
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const { toast } = useToast();

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

  return {
    isLoading: newTenantMigration.isLoading || existingTenantMigration.isLoading,
    migrationResult,
    showDebugLogs,
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
