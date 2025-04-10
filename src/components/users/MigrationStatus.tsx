
import React, { useState } from 'react';
import { useUserMigration } from '@/hooks/subscription/useUserMigration';
import { Separator } from '@/components/ui/separator';

// Import refactored components
import DebugActions from './migration/DebugActions';
import ErrorDisplay from './migration/ErrorDisplay';
import CurrentUserContext from './migration/CurrentUserContext';
import TenantsTable from './migration/TenantsTable';
import UsersTable from './migration/UsersTable';

interface MigrationStatusProps {
  email?: string;
}

const MigrationStatus: React.FC<MigrationStatusProps> = ({ email }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [currentUserTenant, setCurrentUserTenant] = useState<any>(null);
  
  const { showDebugLogs, debugTenantInfo } = useUserMigration();

  // Function to fetch debug information
  const handleFetchDebugInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const debugInfo = await debugTenantInfo();
      if (debugInfo) {
        setTenants(debugInfo.tenants || []);
        setUsers(debugInfo.users || []);
        setCurrentUserData(debugInfo.currentUserData);
        setCurrentUserTenant(debugInfo.currentUserTenant);
      }
    } catch (err) {
      setError('Failed to fetch debug information');
      console.error('Debug fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // View all logs
  const handleViewLogs = () => {
    showDebugLogs();
  };

  return (
    <div className="space-y-6">
      <DebugActions 
        onViewLogs={handleViewLogs}
        onFetchDebugInfo={handleFetchDebugInfo}
        loading={loading}
      />
      
      <ErrorDisplay error={error} />
      
      <CurrentUserContext 
        currentUserData={currentUserData}
        currentUserTenant={currentUserTenant}
      />
      
      {tenants.length > 0 && (
        <>
          <Separator />
          <TenantsTable tenants={tenants} />
        </>
      )}
      
      {users.length > 0 && (
        <>
          <Separator />
          <UsersTable 
            users={users} 
            currentUserId={currentUserData?.id}
          />
        </>
      )}
    </div>
  );
};

export default MigrationStatus;
