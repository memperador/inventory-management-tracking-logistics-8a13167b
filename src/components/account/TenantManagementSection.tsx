
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTenantManagement } from '@/hooks/subscription/useTenantManagement';
import { AlertCircle, CheckCircle, ArrowRight, ShieldAlert, Search, User } from 'lucide-react';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Tenant } from '@/types/tenant';

// This component is only visible to superadmin users or in development mode
const TenantManagementSection: React.FC = () => {
  const [newTenantName, setNewTenantName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [existingTenantId, setExistingTenantId] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);

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

  // Load tenants when the component mounts
  useEffect(() => {
    const fetchTenants = async () => {
      setIsLoadingTenants(true);
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('*');
          
        if (error) throw error;
        
        // Map the raw tenant data to match the Tenant interface with required settings property
        const mappedTenants: Tenant[] = (data || []).map(tenant => ({
          id: tenant.id,
          name: tenant.name,
          subscription_tier: tenant.subscription_tier,
          subscription_status: tenant.subscription_status,
          company_type: tenant.company_type as Tenant['company_type'],
          trial_ends_at: tenant.trial_ends_at,
          subscription_expires_at: tenant.subscription_expires_at,
          settings: {
            theme: 'light',
            features: [],
            // Parse industry_code_preferences if it exists
            ...(tenant.industry_code_preferences ? 
              (typeof tenant.industry_code_preferences === 'string' 
                ? JSON.parse(tenant.industry_code_preferences).settings || {}
                : tenant.industry_code_preferences.settings || {})
              : {})
          }
        }));
        
        setTenants(mappedTenants);
      } catch (error) {
        console.error('Error fetching tenants:', error);
      } finally {
        setIsLoadingTenants(false);
      }
    };
    
    fetchTenants();
  }, []);

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
        <div>
          <h3 className="text-lg font-medium">User Lookup</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Find a user by email to perform operations on their account
          </p>
          
          <form onSubmit={handleUserLookup} className="flex flex-col gap-4">
            <div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter user email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !userEmail.trim()}
                  variant="secondary"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Find User
                </Button>
              </div>
            </div>
          </form>
          
          {lookupResult && (
            <Alert className="mt-4">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                <AlertTitle>User Selected</AlertTitle>
              </div>
              <AlertDescription>
                Email: {lookupResult.email} <br />
                User ID: {lookupResult.userId.substring(0, 8)}...
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <Separator />
        
        {/* Trial Verification Section */}
        <div>
          <h3 className="text-lg font-medium">Verify Trial Period</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {lookupResult 
              ? `Check if ${lookupResult.email}'s tenant trial period is configured correctly` 
              : 'Check if the current tenant\'s trial period is configured correctly'}
          </p>
          
          <Button 
            onClick={handleVerifyTrial} 
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
        {lookupResult && (
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
                  <select
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
        )}
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
