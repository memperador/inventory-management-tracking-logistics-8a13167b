
import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import AccountForm from '@/components/account/AccountForm';
import TenantManagementSection from '@/components/account/TenantManagementSection';
import SuperadminUserManagement from '@/components/account/SuperadminUserManagement';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { useRole } from '@/hooks/useRoleContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AccountPage = () => {
  const { user } = useAuth();
  const { userRole } = useRole();
  
  // Check if user is a superadmin specifically or if we're in development mode
  const isDev = process.env.NODE_ENV === 'development';
  const isSuperAdmin = userRole === 'superadmin';
  const showTenantManagement = isDev || isSuperAdmin;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Account Settings" 
        description="View and update your profile information"
      />
      
      <Tabs defaultValue="profile" className="mt-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {showTenantManagement && <TabsTrigger value="tenant-management">Tenant Management</TabsTrigger>}
          {isSuperAdmin && <TabsTrigger value="user-management">User Management</TabsTrigger>}
        </TabsList>
      
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <AccountForm />
            </CardContent>
          </Card>
        </TabsContent>
      
        {/* Show tenant management tools for superadmins or in dev mode */}
        {showTenantManagement && (
          <TabsContent value="tenant-management">
            <TenantManagementSection />
          </TabsContent>
        )}
        
        {/* Show user management only for superadmins */}
        {isSuperAdmin && (
          <TabsContent value="user-management">
            <SuperadminUserManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AccountPage;
