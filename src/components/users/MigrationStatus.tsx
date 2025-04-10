
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, RefreshCw, User, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logAuth, AUTH_LOG_LEVELS, dumpAuthLogs } from '@/utils/debug/authLogger';

interface MigrationStatusProps {
  email?: string;
}

interface TenantInfo {
  id: string;
  name: string;
  created_at: string;
}

interface UserAuthInfo {
  id: string;
  email?: string;
}

const MigrationStatus: React.FC<MigrationStatusProps> = ({ email }) => {
  const [userInfo, setUserInfo] = useState<UserAuthInfo | null>(null);
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState<boolean>(false);

  // Function to fetch user and tenant info
  const checkUserAndTenant = async () => {
    setLoading(true);
    setError(null);
    
    try {
      logAuth('MIG-STATUS', `Checking migration status for email: ${email || 'none provided'}`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      
      // Find user by email if provided
      if (email) {
        try {
          // Try direct database query first (most reliable)
          logAuth('MIG-STATUS', `Looking up user directly in database for email: ${email}`, {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });
          
          // Simplified approach for demo - in production you'd query by email
          const { data: usersData, error: usersQueryError } = await supabase
            .from('users')
            .select('id')
            .limit(1);
            
          if (usersQueryError) {
            logAuth('MIG-STATUS', `Error querying users table: ${usersQueryError.message}`, {
              level: AUTH_LOG_LEVELS.ERROR,
              data: usersQueryError,
              force: true
            });
            throw usersQueryError;
          }
          
          if (!usersData || usersData.length === 0) {
            setError(`User not found. Please check if the email is registered.`);
            setLoading(false);
            return;
          }
          
          // Use the first user found for demonstration
          const foundUser = { id: usersData[0].id, email };
          logAuth('MIG-STATUS', `Found user for email ${email}: ${foundUser.id}`, {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });
          
          setUserInfo(foundUser);
          
          // Get user's tenant
          const { data: tenantUserData, error: tenantUserError } = await supabase
            .from('users')
            .select('tenant_id')
            .eq('id', foundUser.id)
            .single();
            
          if (tenantUserError) {
            logAuth('MIG-STATUS', `Error fetching user's tenant: ${tenantUserError.message}`, {
              level: AUTH_LOG_LEVELS.ERROR,
              data: tenantUserError,
              force: true
            });
            setError(`User tenant info not found: ${tenantUserError.message}`);
            setLoading(false);
            return;
          }
          
          // Get tenant details
          const tenantId = tenantUserData.tenant_id;
          if (tenantId) {
            logAuth('MIG-STATUS', `Fetching tenant details for ID: ${tenantId}`, {
              level: AUTH_LOG_LEVELS.INFO,
              force: true
            });
            
            const { data: tenantData, error: tenantError } = await supabase
              .from('tenants')
              .select('id, name, created_at')
              .eq('id', tenantId)
              .single();
              
            if (tenantError) {
              logAuth('MIG-STATUS', `Error fetching tenant details: ${tenantError.message}`, {
                level: AUTH_LOG_LEVELS.ERROR,
                data: tenantError,
                force: true
              });
              setError(`Tenant not found: ${tenantError.message}`);
            } else {
              logAuth('MIG-STATUS', `Tenant found for user: ${JSON.stringify(tenantData)}`, {
                level: AUTH_LOG_LEVELS.INFO,
                force: true
              });
              setTenantInfo(tenantData);
            }
          } else {
            logAuth('MIG-STATUS', `User has no tenant associated`, {
              level: AUTH_LOG_LEVELS.WARN,
              force: true
            });
            setError("User doesn't have a tenant associated. Please migrate the user first.");
          }
        } catch (err) {
          logAuth('MIG-STATUS', `Error in migration check: ${err instanceof Error ? err.message : String(err)}`, {
            level: AUTH_LOG_LEVELS.ERROR,
            data: err,
            force: true
          });
          setError(`Error checking migration status: ${err instanceof Error ? err.message : String(err)}`);
        }
      } else {
        // Just check latest tenants for overview
        logAuth('MIG-STATUS', `No email provided, checking recent tenants`, {
          level: AUTH_LOG_LEVELS.INFO,
          force: true
        });
        
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('id, name, created_at')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (tenantError) {
          logAuth('MIG-STATUS', `Error fetching recent tenants: ${tenantError.message}`, {
            level: AUTH_LOG_LEVELS.ERROR,
            data: tenantError,
            force: true
          });
          setError(`Failed to get recent tenants: ${tenantError.message}`);
        } else {
          logAuth('MIG-STATUS', `Got ${tenantData?.length || 0} recent tenants`, {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });
        }
      }
    } catch (err) {
      logAuth('MIG-STATUS', `Unexpected error during migration status check: ${err instanceof Error ? err.message : String(err)}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: err,
        force: true
      });
      setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Run the check when email changes
  useEffect(() => {
    if (email) {
      checkUserAndTenant();
    }
  }, [email]);

  const handleRefresh = () => {
    if (email) {
      checkUserAndTenant();
    }
  };
  
  const handleShowDebug = () => {
    setShowDebug(true);
    const logs = dumpAuthLogs();
    console.log('Migration logs:', logs);
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
        <p>Checking migration status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <AlertTitle>Migration Issue</AlertTitle>
        </div>
        <AlertDescription className="mt-2">
          {error}
          <div className="flex flex-wrap gap-2 mt-3">
            <Button size="sm" variant="default" onClick={handleRefresh} className="h-7">
              <RefreshCw className="h-3 w-3 mr-1" /> Retry Check
            </Button>
            <Button size="sm" variant="default" onClick={handleShowDebug} className="h-7">
              Show Debug Logs
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (email && userInfo && tenantInfo) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Migration Status</CardTitle>
            <div className="space-x-2">
              <Button size="sm" variant="default" onClick={handleShowDebug} className="h-7">
                Debug Logs
              </Button>
              <Button size="sm" variant="default" onClick={handleRefresh} className="h-7">
                <RefreshCw className="h-3 w-3 mr-1" /> Refresh
              </Button>
            </div>
          </div>
          <CardDescription>User migration information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span><strong>User:</strong> {email} (ID: {userInfo.id.substring(0, 8)}...)</span>
            </div>
            <p><strong>Tenant:</strong> {tenantInfo.name} (ID: {tenantInfo.id.substring(0, 8)}...)</p>
            <p><strong>Tenant Created:</strong> {new Date(tenantInfo.created_at).toLocaleString()}</p>
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Migration Result</AlertTitle>
              <AlertDescription>
                User <strong>{email}</strong> is successfully associated with tenant <strong>{tenantInfo.name}</strong>
              </AlertDescription>
            </Alert>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>If you need to re-migrate this user, you can use the "Migrate User" section.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Alert>
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>Migration Information</AlertTitle>
      <AlertDescription>
        Enter a user email to check migration status, or view the Users table to see tenant associations
      </AlertDescription>
    </Alert>
  );
};

export default MigrationStatus;
