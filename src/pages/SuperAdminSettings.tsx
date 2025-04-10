
import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import { useRole } from '@/hooks/useRoleContext';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import AIConfigurationPanel from '@/components/ai/admin/AIConfigurationPanel';
import SuperadminUserManagement from '@/components/account/SuperadminUserManagement';
import { Shield, Users } from 'lucide-react';

const SuperAdminSettings: React.FC = () => {
  const { userRole } = useRole();
  const navigate = useNavigate();
  const isSuperAdmin = userRole === 'superadmin';
  
  // Redirect non-superadmins away from this page
  React.useEffect(() => {
    if (userRole && !isSuperAdmin) {
      navigate('/unauthorized');
    }
  }, [userRole, isSuperAdmin, navigate]);
  
  if (!isSuperAdmin) {
    return (
      <div className="container py-6">
        <PageHeader 
          title="Unauthorized" 
          description="You do not have permission to access this page" 
        />
        
        <Card className="p-8 mt-6 text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold mt-4">Superadmin Access Required</h2>
          <p className="text-muted-foreground mt-2">
            This page requires superadmin permissions.
          </p>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-6">
      <PageHeader 
        title="Superadmin Settings" 
        description="Configure global system settings" 
      />
      
      <div className="mt-6 grid gap-8">
        <AIConfigurationPanel />
        <SuperadminUserManagement />
      </div>
    </div>
  );
};

export default SuperAdminSettings;
