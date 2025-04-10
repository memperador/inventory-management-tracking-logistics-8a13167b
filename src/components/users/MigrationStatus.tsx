
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

const MigrationStatus: React.FC<MigrationStatusProps> = ({ email }) => {
  const [userInfo, setUserInfo] = useState<any>(null);
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
          const { data: userData, error: userError } = await supabase
            .from('auth.users')
            .select('id, email')
            .eq('email', email)
            .single();
            
          if (userError) {
            setError(`User not found: ${userError.message}`);
            setLoading(false);
            return;
          }
          
          setUserInfo(userData);
          
          // Get user's tenant
          const { data: tenantUserData, error: tenantUserError } = await supabase
            .from('users')
            .select('tenant_id')
            .eq('id', userData.id)
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
            <p><strong>User:</strong> {userInfo.email} (ID: {userInfo.id.substring(0, 8)}...)</p>
            <p><strong>Tenant:</strong> {tenantInfo.name} (ID: {tenantInfo.id.substring(0, 8)}...)</p>
            <p><strong>Tenant Created:</strong> {new Date(tenantInfo.created_at).toLocaleString()}</p>
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Migration Result</AlertTitle>
              <AlertDescription>
                User <strong>{userInfo.email}</strong> is successfully associated with tenant <strong>{tenantInfo.name}</strong>
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
