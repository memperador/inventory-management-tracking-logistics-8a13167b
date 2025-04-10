
import { useState } from 'react';
import { useNewTenantMigration } from './useNewTenantMigration';
import { useExistingTenantMigration } from './useExistingTenantMigration';
import { MigrationResult } from './useMigrationBase';

export const useUserMigration = () => {
  const newTenantMigration = useNewTenantMigration();
  const existingTenantMigration = useExistingTenantMigration();
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);

  // Sync migration results from both hooks
  if (newTenantMigration.migrationResult && newTenantMigration.migrationResult !== migrationResult) {
    setMigrationResult(newTenantMigration.migrationResult);
  }
  
  if (existingTenantMigration.migrationResult && existingTenantMigration.migrationResult !== migrationResult) {
    setMigrationResult(existingTenantMigration.migrationResult);
  }

  return {
    isLoading: newTenantMigration.isLoading || existingTenantMigration.isLoading,
    migrationResult,
    migrateToNewTenant: newTenantMigration.migrateToNewTenant,
    migrateToExistingTenant: existingTenantMigration.migrateToExistingTenant
  };
};
