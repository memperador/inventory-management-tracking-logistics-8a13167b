
import { useState } from 'react';
import { UserLookupResult } from '@/components/account/superadmin/types';
import { useUserLookup } from './useUserLookup';
import { useTrialVerification } from './useTrialVerification';
import { useTenantUtils } from './useTenantUtils';
import { useUserMigration } from './useUserMigration';

export const useTenantManagement = () => {
  // Combine the smaller hooks
  const userLookup = useUserLookup();
  const trialVerification = useTrialVerification();
  const tenantUtils = useTenantUtils();
  const userMigration = useUserMigration();

  // Calculate overall loading state
  const isLoading = userLookup.isLoading || 
                    trialVerification.isLoading || 
                    userMigration.isLoading;

  return {
    // User lookup
    lookupResult: userLookup.lookupResult,
    lookupUserByEmail: userLookup.lookupUserByEmail,
    
    // Trial verification
    trialVerificationResult: trialVerification.trialVerificationResult,
    verifyTrialStatus: trialVerification.verifyTrialStatus,
    
    // Tenant utilities
    getTenantIdForUser: tenantUtils.getTenantIdForUser,
    
    // User migration
    migrationResult: userMigration.migrationResult,
    migrateToNewTenant: userMigration.migrateToNewTenant,
    migrateToExistingTenant: userMigration.migrateToExistingTenant,
    
    // Overall loading state
    isLoading
  };
};
