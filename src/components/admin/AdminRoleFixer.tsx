
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
  
  // Immediately check and fix the role on component mount
  useEffect(() => {
    const checkAndFixRole = async () => {
      try {
        // Labrat's known ID
        const userId = '9e32e738-5f44-44f8-bc15-6946b27296a6'; 
        
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.error('Error checking role:', error);
          // If there's an error, try to fix it anyway
          handleFixRole();
          return;
        }
        
        if (data?.role === 'admin') {
          setIsAlreadyAdmin(true);
          logAuth('ADMIN', `User ${userEmail} already has admin role`, {
            level: AUTH_LOG_LEVELS.INFO
          });
        } else {
          // If not admin, immediately fix the role
          handleFixRole();
        }
      } catch (error) {
        console.error('Error checking/fixing role:', error);
        // If there's any error, try to fix the role anyway
        handleFixRole();
      }
    };
    
    checkAndFixRole();
  }, [userEmail]);
  
  const handleFixRole = async () => {
    if (isUpdating) return;
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
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { role: 'admin' }
      });
      
      if (metadataError) {
        console.warn('Warning: Unable to update auth metadata:', metadataError);
        // Continue anyway since the database update succeeded
      }
      
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
      
      // Redirect to dashboard to see the changes
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
      
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
        
        // First check if the user already has admin role
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();
        
        if (data?.role === 'admin') {
          console.log('User already has admin role');
          setFixed(true);
          return;
        }
        
        // Update the user's role in the database
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', userId);
          
        if (updateError) {
          console.error('Error updating user role:', updateError);
          throw updateError;
        }
        
        // Update user metadata
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { role: 'admin' }
        });
        
        if (metadataError) {
          console.warn('Warning: Unable to update auth metadata:', metadataError);
        }
        
        console.log('Successfully auto-updated labrat@iaware.com to admin role');
        toast({
          title: 'Admin Role Applied',
          description: 'The labrat@iaware.com user now has admin privileges.',
        });
        
        // Force refresh session
        await supabase.auth.refreshSession();
        
        setFixed(true);
        
        // Add a redirect to dashboard after a short delay
        setTimeout(() => {
          if (window.location.pathname === '/payment') {
            window.location.href = '/dashboard';
          }
        }, 2000);
        
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
