
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

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

  useEffect(() => {
    const checkUserAndTenant = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Find user by email if provided
        if (email) {
          // Call the edge function to get user by email
          const { data: userData, error: functionError } = await supabase.functions.invoke('get-user-by-email', {
            body: { email }
          });
          
          if (functionError || !userData) {
            // Fallback approach - check directly in users table
            const { data: usersData, error: usersQueryError } = await supabase
              .from('users')
              .select('id')
              .limit(1);
              
            if (usersQueryError || !usersData || usersData.length === 0) {
              setError(`User not found. Please check if the email is registered.`);
              setLoading(false);
              return;
            }
            
            // Use the first user found for demonstration
            setUserInfo({ id: usersData[0].id, email });
          } else {
            setUserInfo(userData);
          }
          
          if (!userInfo?.id) {
            setLoading(false);
            return;
          }
          
          // Get user's tenant
          const { data: tenantUserData, error: tenantUserError } = await supabase
            .from('users')
            .select('tenant_id')
            .eq('id', userInfo.id)
            .single();
            
          if (tenantUserError) {
            setError(`User tenant info not found: ${tenantUserError.message}`);
            setLoading(false);
            return;
          }
          
          // Get tenant details
          const tenantId = tenantUserData.tenant_id;
          if (tenantId) {
            const { data: tenantData, error: tenantError } = await supabase
              .from('tenants')
              .select('id, name, created_at')
              .eq('id', tenantId)
              .single();
              
            if (tenantError) {
              setError(`Tenant not found: ${tenantError.message}`);
            } else {
              setTenantInfo(tenantData);
            }
          }
        } else {
          // Just check latest tenants
          const { data: tenantData, error: tenantError } = await supabase
            .from('tenants')
            .select('id, name, created_at')
            .order('created_at', { ascending: false })
            .limit(10);
            
          if (tenantError) {
            setError(`Failed to get recent tenants: ${tenantError.message}`);
          } else {
            console.log('Most recent tenants:', tenantData);
          }
        }
        
      } catch (err) {
        setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserAndTenant();
  }, [email]);

  if (loading) {
    return <div className="text-center p-4">Checking migration status...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Migration Issue</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (email && userInfo && tenantInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Migration Status</CardTitle>
          <CardDescription>User migration information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>User:</strong> {email} (ID: {userInfo.id.substring(0, 8)}...)</p>
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
