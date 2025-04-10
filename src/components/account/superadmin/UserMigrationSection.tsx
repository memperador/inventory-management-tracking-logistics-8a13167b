import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useTenantManagement } from '@/hooks/subscription/useTenantManagement';
import { Tenant } from '@/types/tenant';
import { UserLookupResult } from './types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface UserMigrationSectionProps {
  lookupResult: UserLookupResult | null;
  newTenantName: string;
  setNewTenantName: (name: string) => void;
  existingTenantId: string;
  setExistingTenantId: (id: string) => void;
  tenants: Tenant[];
  isLoadingTenants: boolean;
  handleMigrateUserToNewTenant: (e: React.FormEvent) => Promise<void>;
  handleMigrateUserToExistingTenant: () => Promise<void>;
}

const UserMigrationSection: React.FC<UserMigrationSectionProps> = ({
  lookupResult,
  newTenantName,
  setNewTenantName,
  existingTenantId,
  setExistingTenantId,
  tenants,
  isLoadingTenants,
  handleMigrateUserToNewTenant,
  handleMigrateUserToExistingTenant
}) => {
  const { isLoading, migrationResult } = useTenantManagement();
  const [localResult, setLocalResult] = useState<any>(null);
  
  useEffect(() => {
    if (migrationResult) {
      setLocalResult(migrationResult);
    }
  }, [migrationResult]);

  if (!lookupResult) return null;

  return (
    <>
      <div>
        <h3 className="text-lg font-medium">Migrate User to New Tenant</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Move {lookupResult.email} to a newly created tenant
        </p>
        
        <form onSubmit={handleMigrateUserToNewTenant} className="flex flex-col gap-4">
          <div>
            <label htmlFor="tenantName" className="block text-sm font-medium mb-1">
              New Tenant Name
            </label>
            <div className="flex gap-2">
              <Input
                id="tenantName"
                placeholder="Enter new tenant name"
                value={newTenantName}
                onChange={(e) => setNewTenantName(e.target.value)}
                disabled={isLoading}
                required
              />
              <Button 
                type="submit" 
                disabled={isLoading || !newTenantName.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  <>
                    Create & Migrate <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
        
        {localResult && (
          <Alert 
            className="mt-4" 
            variant={localResult.success ? "default" : "destructive"}
          >
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>{localResult.success ? "Migration Successful" : "Migration Failed"}</AlertTitle>
            <AlertDescription>
              {localResult.message}
              {localResult.success && localResult.newTenantId && (
                <div className="mt-1">New tenant ID: {localResult.newTenantId}</div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <Separator className="my-6" />
      
      <div>
        <h3 className="text-lg font-medium">Migrate User to Existing Tenant</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Move {lookupResult.email} to an existing tenant
        </p>
        
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="existingTenant" className="block text-sm font-medium mb-1">
              Select Tenant
            </label>
            <div className="flex gap-2">
              <select
                id="existingTenant"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={existingTenantId}
                onChange={(e) => setExistingTenantId(e.target.value)}
                disabled={isLoadingTenants || isLoading}
              >
                <option value="">Select a tenant...</option>
                {tenants.map(tenant => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name} - {tenant.subscription_tier || 'No tier'} ({tenant.subscription_status || 'Unknown status'})
                  </option>
                ))}
              </select>
              <Button 
                onClick={handleMigrateUserToExistingTenant}
                disabled={isLoading || !existingTenantId}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  <>
                    Migrate <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserMigrationSection;
