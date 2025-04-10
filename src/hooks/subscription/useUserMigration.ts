
import { useState } from 'react';
import { useNewTenantMigration } from './useNewTenantMigration';
import { useExistingTenantMigration } from './useExistingTenantMigration';
import { MigrationResult } from './useMigrationBase';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

export const useUserMigration = () => {
  const newTenantMigration = useNewTenantMigration();
  const existingTenantMigration = useExistingTenantMigration();
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);

  // Sync migration results from both hooks
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

  return {
    isLoading: newTenantMigration.isLoading || existingTenantMigration.isLoading,
    migrationResult,
    migrateToNewTenant: async (newTenantName: string, userId?: string) => {
      logAuth('USER-MIGRATION', `Attempting to migrate to new tenant: ${newTenantName}, User ID: ${userId}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      const result = await newTenantMigration.migrateToNewTenant(newTenantName, userId);
      logAuth('USER-MIGRATION', `New tenant migration completed: ${JSON.stringify(result)}`, {
        level: result.success ? AUTH_LOG_LEVELS.INFO : AUTH_LOG_LEVELS.ERROR,
        force: true
      });
      return result;
    },
    migrateToExistingTenant: async (tenantId: string, userId?: string) => {
      logAuth('USER-MIGRATION', `Attempting to migrate to existing tenant: ${tenantId}, User ID: ${userId}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      const result = await existingTenantMigration.migrateToExistingTenant(tenantId, userId);
      logAuth('USER-MIGRATION', `Existing tenant migration completed: ${JSON.stringify(result)}`, {
        level: result.success ? AUTH_LOG_LEVELS.INFO : AUTH_LOG_LEVELS.ERROR,
        force: true
      });
      return result;
    }
  };
};
