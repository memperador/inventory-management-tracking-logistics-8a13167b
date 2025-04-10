
import React, { useState, useEffect } from 'react';
import { useUserMigration } from '@/hooks/subscription/useUserMigration';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, Users, Info, AlertCircle, Check } from 'lucide-react';

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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Migration Debug Tools</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewLogs}
            disabled={loading}
          >
            <Info className="mr-2 h-4 w-4" />
            View Auth Logs
          </Button>
          
          <Button 
            onClick={handleFetchDebugInfo} 
            size="sm"
            disabled={loading}
          >
            {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
            {loading ? 'Fetching...' : 'Get Tenant & User Info'}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
          {error}
        </div>
      )}
      
      {currentUserData && currentUserTenant && (
        <Card>
          <CardHeader className="bg-blue-50 border-b pb-3">
            <CardTitle className="text-md">Current User Context</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm mb-2">User Details</h4>
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">User ID:</span> {currentUserData.id}</div>
                  <div><span className="font-medium">Role:</span> {currentUserData.role}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Tenant Details</h4>
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">Tenant:</span> {currentUserTenant.name}</div>
                  <div><span className="font-medium">Subscription:</span> {currentUserTenant.subscription_tier} ({currentUserTenant.subscription_status})</div>
                  <div>
                    <span className="font-medium">Trial:</span>
                    {currentUserTenant.trial_ends_at ? (
                      <span> Ends {new Date(currentUserTenant.trial_ends_at).toLocaleDateString()}</span>
                    ) : (
                      <span> No active trial</span>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Onboarding completed:</span>
                    <span> {currentUserTenant.onboarding_completed ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {tenants.length > 0 && (
        <>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">All Tenants ({tenants.length})</h4>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Trial End</TableHead>
                    <TableHead>Onboarding</TableHead>
                    <TableHead className="w-[100px]">ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map(tenant => (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">{tenant.name}</TableCell>
                      <TableCell>{tenant.subscription_tier}</TableCell>
                      <TableCell>
                        <Badge variant={tenant.subscription_status === 'active' ? 'default' : 
                                tenant.subscription_status === 'trialing' ? 'outline' : 'secondary'}>
                          {tenant.subscription_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tenant.trial_ends_at ? new Date(tenant.trial_ends_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {tenant.onboarding_completed ? (
                          <Badge variant="success" className="bg-green-100 text-green-800">Completed</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{tenant.id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
      
      {users.length > 0 && (
        <>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">All Users ({users.length})</h4>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Tenant ID</TableHead>
                    <TableHead className="w-[100px]">Current User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id} className={currentUserData?.id === user.id ? 'bg-blue-50' : ''}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell className="font-mono text-xs">{user.tenant_id}</TableCell>
                      <TableCell>
                        {currentUserData?.id === user.id && (
                          <Check className="h-4 w-4 text-green-600" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MigrationStatus;
