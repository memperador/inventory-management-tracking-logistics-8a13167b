
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTenantManagement } from '@/hooks/subscription/useTenantManagement';
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

// This component is only visible to admin users or in development mode
const TenantManagementSection: React.FC = () => {
  const [newTenantName, setNewTenantName] = useState('');
  const { 
    isLoading, 
    trialVerificationResult, 
    migrationResult,
    verifyTrialStatus, 
    migrateToNewTenant 
  } = useTenantManagement();

  const handleMigrateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTenantName.trim()) {
      await migrateToNewTenant(newTenantName.trim());
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Advanced Tenant Management</CardTitle>
        <CardDescription>Tools for administrators to manage tenants and subscriptions</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Trial Verification Section */}
        <div>
          <h3 className="text-lg font-medium">Verify Trial Period</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Check if the current tenant's trial period is configured correctly.
          </p>
          
          <Button 
            onClick={verifyTrialStatus} 
            disabled={isLoading}
            variant="outline"
          >
            Verify Trial Status
          </Button>
          
          {trialVerificationResult && (
            <Alert className="mt-4" variant={trialVerificationResult.isValid ? "default" : "destructive"}>
              <div className="flex items-center">
                {trialVerificationResult.isValid ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                <AlertTitle>Trial Verification {trialVerificationResult.isValid ? 'Succeeded' : 'Failed'}</AlertTitle>
              </div>
              <AlertDescription className="mt-2">
                {trialVerificationResult.message}
                {trialVerificationResult.daysLeft > 0 && (
                  <div className="mt-1">Days left in trial: {trialVerificationResult.daysLeft}</div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <Separator />
        
        {/* User Migration Section */}
        <div>
          <h3 className="text-lg font-medium">Migrate User to New Tenant</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Move the current user to a newly created tenant.
          </p>
          
          <form onSubmit={handleMigrateUser} className="flex flex-col gap-4">
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
                {migrationResult.success && (
                  <div className="mt-1">New tenant ID: {migrationResult.newTenantId}</div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <p className="text-xs text-muted-foreground">
          These tools are intended for administrators only. Changes made here may affect user access and data.
        </p>
      </CardFooter>
    </Card>
  );
};

export default TenantManagementSection;
