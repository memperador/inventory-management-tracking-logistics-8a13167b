
import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import AccountForm from '@/components/account/AccountForm';
import TenantManagementSection from '@/components/account/TenantManagementSection';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { useRole } from '@/hooks/useRoleContext';

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
      
      <div className="mt-6">
        <Card>
          <CardContent className="pt-6">
            <AccountForm />
          </CardContent>
        </Card>
      </div>
      
      {/* Show tenant management tools for superadmins only or in dev mode */}
      {showTenantManagement && <TenantManagementSection />}
    </div>
  );
};

export default AccountPage;
