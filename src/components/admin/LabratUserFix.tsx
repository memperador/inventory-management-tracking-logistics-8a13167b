
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { UserRole } from '@/types/roles';

// This component will automatically fix the labrat user role if it exists
const LabratUserFix = () => {
  const [fixed, setFixed] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Check if the labrat user exists and their current role
  useEffect(() => {
    const checkLabratUser = async () => {
      try {
        // Use the known ID for Labrat user instead of querying auth.users
        const labratUserId = '9e32e738-5f44-44f8-bc15-6946b27296a6';
        
        // This query will work if run by superadmin or admin
        const { data, error } = await supabase
          .from('users')
          .select('id, role')
          .eq('id', labratUserId)
          .single();
          
        if (error) {
          console.error('Error checking user:', error);
          return;
        }
        
        if (data) {
          setCurrentRole(data.role as UserRole);
          setUserId(data.id);
        }
      } catch (error) {
        console.error('Error checking labrat user:', error);
      }
    };
    
    checkLabratUser();
  }, []);
  
  const fixLabratRole = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Update the user role to admin
      const { error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', userId);
        
      if (error) {
        toast({
          title: 'Error',
          description: `Failed to update user role: ${error.message}`,
          variant: 'destructive'
        });
        throw error;
      }
      
      setCurrentRole('admin');
      setFixed(true);
      
      logAuth('ADMIN', `Successfully set labrat@iaware.com to admin role`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      toast({
        title: 'Success',
        description: 'User labrat@iaware.com is now an admin',
      });
    } catch (error) {
      console.error('Error fixing role:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!userId) return null;
  
  return (
    <div className="mb-4 p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">User Role Fixer</h3>
      
      {currentRole === 'admin' ? (
        <Alert className="bg-green-50 border-green-200 mb-2">
          <AlertDescription className="text-green-800">
            User labrat@iaware.com already has admin role.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-amber-50 border-amber-200 mb-2">
          <AlertDescription className="text-amber-800">
            User labrat@iaware.com has {currentRole || 'unknown'} role.
          </AlertDescription>
        </Alert>
      )}
      
      {currentRole !== 'admin' && (
        <Button 
          onClick={fixLabratRole} 
          disabled={loading || fixed}
          variant={fixed ? "outline" : "destructive"}
          size="sm"
        >
          {loading ? 'Updating...' : fixed ? 'Fixed!' : 'Fix User Role to Admin'}
        </Button>
      )}
    </div>
  );
};

export default LabratUserFix;
