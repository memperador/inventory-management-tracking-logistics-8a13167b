
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTenantManagement } from '@/hooks/subscription/useTenantManagement';
import { AlertCircle, CheckCircle, ArrowRight, ShieldAlert, Search, User, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tenant } from '@/types/tenant';

// This component is only visible to superadmin users
const SuperadminUserManagement: React.FC = () => {
  const [userEmail, setUserEmail] = useState('');
  const [newTenantName, setNewTenantName] = useState('');
  const [existingTenantId, setExistingTenantId] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  const { 
    lookupUserByEmail,
    lookupResult,
    isLoading,
    migrationResult,
    migrateToNewTenant,
    getTenantIdForUser
  } = useTenantManagement();
  
  const { toast } = useToast();

  // Load all tenants for superadmin
  useEffect(() => {
    const loadTenants = async () => {
      setIsLoadingTenants(true);
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('id, name, subscription_status, subscription_tier');
        
        if (error) throw error;
        
        // Add the required 'settings' property to make the data match the Tenant type
        const tenantsWithSettings = (data || []).map(tenant => ({
          ...tenant,
          settings: {
            theme: 'light',
            features: []
          }
        }));
        
        setTenants(tenantsWithSettings);
      } catch (error) {
        console.error('Error loading tenants:', error);
        toast({
          title: 'Error',
          description: `Failed to load tenants: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: 'destructive'
        });
      } finally {
        setIsLoadingTenants(false);
      }
    };
    
    loadTenants();
  }, [toast]);

  // Load all users for superadmin
  const loadAllUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // First fetch users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, role, tenant_id, created_at');
      
      if (userError) throw userError;
      
      // Then fetch profiles separately
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name');
        
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }
      
      // Also fetch the tenant names for each user
      const usersWithInfo = await Promise.all((userData || []).map(async (user) => {
        // Find the matching profile for this user
        const userProfile = profilesData?.find(profile => profile.id === user.id);
        
        try {
          const { data: tenantData } = await supabase
            .from('tenants')
            .select('name')
            .eq('id', user.tenant_id)
            .single();
            
          return {
            ...user,
            tenantName: tenantData?.name || 'Unknown',
            name: userProfile ? 
              `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Unknown User' : 
              'Unknown User'
          };
        } catch (e) {
          return {
            ...user,
            tenantName: 'Unknown',
            name: userProfile ? 
              `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Unknown User' : 
              'Unknown User'
          };
        }
      }));
      
      setUsers(usersWithInfo);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: `Failed to load users: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleUserLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userEmail.trim()) {
      await lookupUserByEmail(userEmail.trim());
    }
  };

  const handleMigrateUserToNewTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lookupResult && newTenantName.trim()) {
      await migrateToNewTenant(newTenantName.trim(), lookupResult.userId);
    }
  };

  const handleMigrateUserToExistingTenant = async () => {
    if (!lookupResult || !existingTenantId) return;
    
    try {
      // Update the user's tenant_id in the users table
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ tenant_id: existingTenantId })
        .eq('id', lookupResult.userId);
        
      if (updateUserError) throw updateUserError;
      
      // Update the profile's tenant_id if it exists
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ tenant_id: existingTenantId })
        .eq('id', lookupResult.userId);
      
      // Find the tenant name for display purposes
      const selectedTenant = tenants.find(tenant => tenant.id === existingTenantId);
      
      toast({
        title: 'User Migrated',
        description: `Successfully moved user to tenant "${selectedTenant?.name || 'Unknown'}"`,
      });
      
      // Refresh user list
      loadAllUsers();
      
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to migrate user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    }
  };

  return (
    <Card className="mt-6 border-blue-200">
      <CardHeader className="bg-blue-50">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-blue-800">Cross-Tenant User Management</CardTitle>
        </div>
        <CardDescription>Advanced user management tools for SuperAdmins</CardDescription>
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
        
        {/* Migrate User Section */}
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
                      Create & Migrate <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>
            
            <Separator />
            
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
                      Migrate <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        <Separator />
        
        {/* View All Users Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">All Users Across Tenants</h3>
            <Button onClick={loadAllUsers} variant="outline" disabled={isLoadingUsers}>
              <Users className="mr-2 h-4 w-4" />
              {isLoadingUsers ? 'Loading...' : 'Load All Users'}
            </Button>
          </div>
          
          {users.length > 0 ? (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.id.substring(0, 8)}...</div>
                      </TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <div className="font-medium">{user.tenantName}</div>
                        <div className="text-sm text-muted-foreground">{user.tenant_id.substring(0, 8)}...</div>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/10">
              <Users className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Click "Load All Users" to view users across all tenants</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <p className="text-xs text-muted-foreground">
          These tools are intended for SuperAdmins only. Changes made here directly affect user tenant access.
        </p>
      </CardFooter>
    </Card>
  );
};

export default SuperadminUserManagement;
