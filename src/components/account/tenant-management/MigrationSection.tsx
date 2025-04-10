
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { UserLookupResult } from '@/components/account/superadmin/types';
import { Tenant } from '@/types/tenant';
import TenantList from './TenantList';

interface MigrationSectionProps {
  lookupResult: UserLookupResult | null;
  migrationResult: any | null;
  newTenantName: string;
  setNewTenantName: (name: string) => void;
  existingTenantId: string;
  setExistingTenantId: (id: string) => void;
  tenants: Tenant[];
  isLoading: boolean;
  isLoadingTenants: boolean;
  onMigrateToNew: (e: React.FormEvent) => Promise<void>;
  onMigrateToExisting: () => Promise<void>;
}

const MigrationSection: React.FC<MigrationSectionProps> = ({
  lookupResult,
  migrationResult,
  newTenantName,
  setNewTenantName,
  existingTenantId,
  setExistingTenantId,
  tenants,
  isLoading,
  isLoadingTenants,
  onMigrateToNew,
  onMigrateToExisting
}) => {
  if (!lookupResult) return null;

  return (
    <>
      <div>
        <h3 className="text-lg font-medium">Migrate User to New Tenant</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Move {lookupResult.email} to a newly created tenant
        </p>
        
        <form onSubmit={onMigrateToNew} className="flex flex-col gap-4">
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
                Migrate <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium">Migrate User to Existing Tenant</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Move {lookupResult.email} to an existing tenant
          </p>
          
          <div className="flex gap-2">
            <TenantList
              tenants={tenants}
              isLoading={isLoadingTenants || isLoading}
              selectedTenantId={existingTenantId}
              onTenantSelect={setExistingTenantId}
            />
            <Button 
              onClick={onMigrateToExisting}
              disabled={isLoading || !existingTenantId}
            >
              Migrate <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {migrationResult && (
          <Alert className="mt-4" variant={migrationResult.success ? "default" : "destructive"}>
            <div className="flex items-center">
              {migrationResult.success ? (
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              <AlertTitle>Migration {migrationResult.success ? 'Succeeded' : 'Failed'}</AlertTitle>
            </div>
            <AlertDescription className="mt-2">
              {migrationResult.message}
              {migrationResult.success && migrationResult.newTenantId && (
                <div className="mt-1">New tenant ID: {migrationResult.newTenantId}</div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </>
  );
};

export default MigrationSection;
