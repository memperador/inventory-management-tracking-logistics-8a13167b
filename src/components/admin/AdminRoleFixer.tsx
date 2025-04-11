import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { useAuth } from '@/hooks/useAuthContext';
import { useRole } from '@/hooks/useRoleContext';

interface AdminRoleFixerProps {
  userEmail?: string;
}

const AdminRoleFixer: React.FC<AdminRoleFixerProps> = ({ userEmail = 'labrat@iaware.com' }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAlreadyAdmin, setIsAlreadyAdmin] = useState(false);
  const { user } = useAuth();
  const { userRole, refreshRole } = useRole();
  
  const isLabratUser = () => {
    return user?.email === 'labrat@iaware.com';
  };
  
  useEffect(() => {
    if (isLabratUser()) {
      if (userRole === 'admin') {
        setIsAlreadyAdmin(true);
        return;
      }
      
      checkAndFixRole();
    }
  }, [user, userRole]);
  
  const checkAndFixRole = async () => {
    if (!isLabratUser()) return;
    
    try {
      const userId = '9e32e738-5f44-44f8-bc15-6946b27296a6'; 
      
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error checking role:', error);
        handleFixRole();
        return;
      }
      
      if (data?.role === 'admin') {
        setIsAlreadyAdmin(true);
        logAuth('ADMIN', `User ${userEmail} already has admin role in the database`, {
          level: AUTH_LOG_LEVELS.INFO
        });
        
        if (userRole !== 'admin') {
          console.log('Database role is admin but context role is not, refreshing role');
          refreshRole(false);
          handleFixRole();
        }
      } else {
        handleFixRole();
      }
    } catch (error) {
      console.error('Error checking/fixing role:', error);
      handleFixRole();
    }
  };
  
  const handleFixRole = async () => {
    if (isUpdating || !isLabratUser()) return;
    setIsUpdating(true);
    
    try {
      const userId = '9e32e738-5f44-44f8-bc15-6946b27296a6'; // Labrat's known ID
      
      console.log('AdminRoleFixer: Updating labrat role to admin');
      
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
      
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { role: 'admin' }
      });
      
      if (metadataError) {
        console.warn('Warning: Unable to update auth metadata:', metadataError);
      }
      
      logAuth('ADMIN', `Successfully updated ${userEmail} to admin role`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      setIsAlreadyAdmin(true);
      
      await refreshRole(false);
      
      await supabase.auth.refreshSession();
      
      toast({
        title: 'Admin Role Updated',
        description: 'Your admin role has been applied. The page will refresh to apply changes.',
      });
      
      setTimeout(() => {
        window.location.reload();
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
  
  if (!isLabratUser()) {
    return null;
  }
  
  if (isAlreadyAdmin) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        onClick={handleFixRole} 
        disabled={isUpdating}
        variant="destructive"
        size="sm"
        className="animate-pulse shadow-lg"
      >
        {isUpdating ? 'Fixing Admin Role...' : 'Fix Admin Role'}
      </Button>
    </div>
  );
};

const AutoAdminRoleFixer: React.FC = () => {
  const { user } = useAuth();
  const { userRole, refreshRole } = useRole();
  const [fixed, setFixed] = useState(false);
  
  useEffect(() => {
    const fixAdminRole = async () => {
      if (fixed || !user) return;
      
      if (user.email !== 'labrat@iaware.com') {
        return;
      }
      
      if (userRole === 'admin') {
        setFixed(true);
        return;
      }
      
      console.log('AutoAdminRoleFixer: Attempting to fix admin role');
      
      try {
        const userId = '9e32e738-5f44-44f8-bc15-6946b27296a6';
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', userId);
          
        if (updateError) {
          console.error('Error updating user role:', updateError);
          throw updateError;
        }
        
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { role: 'admin' }
        });
        
        if (metadataError) {
          console.warn('Warning: Unable to update auth metadata:', metadataError);
        }
        
        console.log('Successfully auto-updated labrat@iaware.com to admin role');
        
        await refreshRole(false);
        
        await supabase.auth.refreshSession();
        
        toast({
          title: 'Admin Role Applied',
          description: 'Your admin privileges have been restored.',
        });
        
        setFixed(true);
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        
      } catch (error) {
        console.error('Error auto-fixing admin role:', error);
      }
    };
    
    const timer = setTimeout(() => {
      fixAdminRole();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user, userRole, fixed, refreshRole]);
  
  return null;
};

export { AutoAdminRoleFixer };
export default AdminRoleFixer;
