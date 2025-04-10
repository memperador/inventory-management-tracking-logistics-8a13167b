
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShieldAlert } from 'lucide-react';
import { useTenantManagement } from '@/hooks/subscription/useTenantManagement';
import { useTenantData } from './useTenantData';
import UserLookupSection from './UserLookupSection';
import TrialVerificationSection from './TrialVerificationSection';
import MigrationSection from './MigrationSection';

// This component is only visible to superadmin users or in development mode
const TenantManagementSection: React.FC = () => {
  const [userEmail, setUserEmail] = useState('');
  const [newTenantName, setNewTenantName] = useState('');
  const [existingTenantId, setExistingTenantId] = useState('');
  
  const { tenants, isLoadingTenants } = useTenantData();
  
  const { 
    isLoading, 
    lookupResult,
    trialVerificationResult, 
    migrationResult,
    lookupUserByEmail,
    verifyTrialStatus, 
    migrateToNewTenant,
    migrateToExistingTenant,
    getTenantIdForUser
  } = useTenantManagement();

  const handleUserLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userEmail.trim()) {
      await lookupUserByEmail(userEmail.trim());
    }
  };

  const handleVerifyTrial = async () => {
    if (lookupResult) {
      // First get the tenant ID for this user
      const tenantId = await getTenantIdForUser(lookupResult.userId);
      if (tenantId) {
        await verifyTrialStatus(tenantId);
      }
    } else {
      // If no user is selected, verify the current tenant
      await verifyTrialStatus();
    }
  };

  const handleMigrateUserToNewTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTenantName.trim()) {
      if (lookupResult) {
        await migrateToNewTenant(newTenantName.trim(), lookupResult.userId);
      } else {
        // If no user is selected, migrate the current user
        await migrateToNewTenant(newTenantName.trim());
      }
    }
  };

  const handleMigrateUserToExistingTenant = async () => {
    if (existingTenantId && lookupResult) {
      await migrateToExistingTenant(existingTenantId, lookupResult.userId);
    }
  };

  return (
    <Card className="mt-6 border-purple-200">
      <CardHeader className="bg-purple-50">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-purple-800">SuperAdmin Tenant Management</CardTitle>
        </div>
        <CardDescription>Advanced tenant administration tools for SuperAdmins only</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {/* User Lookup Section */}
        <UserLookupSection 
          userEmail={userEmail}
          setUserEmail={setUserEmail}
          lookupResult={lookupResult}
          isLoading={isLoading}
          onLookup={handleUserLookup}
        />
        
        <Separator />
        
        {/* Trial Verification Section */}
        <TrialVerificationSection 
          lookupResult={lookupResult}
          trialVerificationResult={trialVerificationResult}
          isLoading={isLoading}
          onVerify={handleVerifyTrial}
        />
        
        <Separator />
        
        {/* User Migration Section */}
        <MigrationSection 
          lookupResult={lookupResult}
          migrationResult={migrationResult}
          newTenantName={newTenantName}
          setNewTenantName={setNewTenantName}
          existingTenantId={existingTenantId}
          setExistingTenantId={setExistingTenantId}
          tenants={tenants}
          isLoading={isLoading}
          isLoadingTenants={isLoadingTenants}
          onMigrateToNew={handleMigrateUserToNewTenant}
          onMigrateToExisting={handleMigrateUserToExistingTenant}
        />
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <p className="text-xs text-muted-foreground">
          These tools are intended for SuperAdmins only. Changes made here directly affect tenant data and user access.
        </p>
      </CardFooter>
    </Card>
  );
};

export default TenantManagementSection;
