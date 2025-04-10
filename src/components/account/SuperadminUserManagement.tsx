
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tenant } from '@/types/tenant';
import { Users } from 'lucide-react';
import { useTenantManagement } from '@/hooks/subscription/useTenantManagement';
import UserLookupSection from './superadmin/UserLookupSection';
import UserMigrationSection from './superadmin/UserMigrationSection';
import UserListSection from './superadmin/UserListSection';
import { TenantMigrationUser } from './superadmin/types';

// This component is only visible to superadmin users
const SuperadminUserManagement: React.FC = () => {
  const [userEmail, setUserEmail] = useState('');
  const [newTenantName, setNewTenantName] = useState('');
  const [existingTenantId, setExistingTenantId] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<TenantMigrationUser[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  const { 
    lookupResult,
    isLoading,
    migrateToNewTenant,
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
      
      setUsers(usersWithInfo as TenantMigrationUser[]);
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
        <UserLookupSection 
          userEmail={userEmail} 
          setUserEmail={setUserEmail} 
          lookupResult={lookupResult}
        />
        
        <Separator />
        
        {/* Migrate User Section */}
        {lookupResult && (
          <UserMigrationSection 
            lookupResult={lookupResult}
            newTenantName={newTenantName}
            setNewTenantName={setNewTenantName}
            existingTenantId={existingTenantId}
            setExistingTenantId={setExistingTenantId}
            tenants={tenants}
            isLoadingTenants={isLoadingTenants}
            handleMigrateUserToNewTenant={handleMigrateUserToNewTenant}
            handleMigrateUserToExistingTenant={handleMigrateUserToExistingTenant}
          />
        )}
        
        <Separator />
        
        {/* View All Users Section */}
        <UserListSection 
          users={users}
          loadAllUsers={loadAllUsers}
          isLoadingUsers={isLoadingUsers}
        />
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
