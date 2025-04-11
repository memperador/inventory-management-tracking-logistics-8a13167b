
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

interface AdminRoleFixerProps {
  userEmail?: string;
}

const AdminRoleFixer: React.FC<AdminRoleFixerProps> = ({ userEmail = 'labrat@iaware.com' }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAlreadyAdmin, setIsAlreadyAdmin] = useState(false);
  
  // Check if the user is already an admin
  useEffect(() => {
    const checkCurrentRole = async () => {
      try {
        // Labrat's known ID - this is pre-defined
        const userId = '9e32e738-5f44-44f8-bc15-6946b27296a6'; 
        
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();
          
        if (error) throw error;
        
        setIsAlreadyAdmin(data?.role === 'admin');
        
        if (data?.role === 'admin') {
          logAuth('ADMIN', `User ${userEmail} already has admin role`, {
            level: AUTH_LOG_LEVELS.INFO
          });
        }
      } catch (error) {
        console.error('Error checking role:', error);
      }
    };
    
    checkCurrentRole();
  }, [userEmail]);
  
  const handleFixRole = async () => {
    setIsUpdating(true);
    
    try {
      // Update the user's role in the users table
      const userId = '9e32e738-5f44-44f8-bc15-6946b27296a6'; // Labrat's known ID
      
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
      
      // Also update the user metadata to include the admin role
      await supabase.auth.updateUser({
        data: { role: 'admin' }
      });
      
      logAuth('ADMIN', `Successfully updated ${userEmail} to admin role`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      setIsAlreadyAdmin(true);
      
      toast({
        title: 'Success',
        description: `User ${userEmail} is now an admin. Please refresh the page to see changes.`,
      });
      
      // Force refresh session to apply changes immediately
      await supabase.auth.refreshSession();
      
    } catch (error) {
      logAuth('ADMIN', `Manual role update failed: ${error instanceof Error ? error.message : String(error)}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  // If the user is already an admin, don't show the button
  if (isAlreadyAdmin) {
    return (
      <div className="p-2 border rounded bg-green-50 text-green-800 text-sm">
        User {userEmail} already has admin privileges.
      </div>
    );
  }
  
  return (
    <Button 
      onClick={handleFixRole} 
      disabled={isUpdating}
      variant="destructive"
      size="sm"
    >
      {isUpdating ? 'Updating...' : `Fix ${userEmail} Role to Admin`}
    </Button>
  );
};

// Add an auto-fixing component that runs automatically
const AutoAdminRoleFixer: React.FC = () => {
  const [fixed, setFixed] = useState(false);
  
  useEffect(() => {
    const fixAdminRole = async () => {
      if (fixed) return;
      
      try {
        // Labrat's known ID
        const userId = '9e32e738-5f44-44f8-bc15-6946b27296a6';
        
        // Check if the user is already an admin
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();
          
        if (error) throw error;
        
        if (data?.role === 'admin') {
          console.log('Labrat user already has admin role');
          return;
        }
        
        // Update the user's role
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', userId);
          
        if (updateError) throw updateError;
        
        console.log('Successfully auto-updated labrat@iaware.com to admin role');
        toast({
          title: 'Admin Role Applied',
          description: 'The labrat@iaware.com user now has admin privileges.',
        });
        
        setFixed(true);
      } catch (error) {
        console.error('Error auto-fixing admin role:', error);
      }
    };
    
    fixAdminRole();
  }, [fixed]);
  
  return null;
};

export { AutoAdminRoleFixer };
export default AdminRoleFixer;
