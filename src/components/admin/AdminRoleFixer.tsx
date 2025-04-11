
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

interface AdminRoleFixerProps {
  userEmail?: string;
}

const AdminRoleFixer: React.FC<AdminRoleFixerProps> = ({ userEmail = 'labrat@iaware.com' }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleFixRole = async () => {
    setIsUpdating(true);
    
    try {
      // We cannot query auth.users directly, so we'll use an edge function or direct user ID
      // For this specific case with labrat, we'll use the known ID directly
      const userId = '9e32e738-5f44-44f8-bc15-6946b27296a6'; // Labrat's known ID
      
      // Update the user's role directly
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
      
      logAuth('ADMIN', `Successfully updated ${userEmail} to admin role manually`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      toast({
        title: 'Success',
        description: `User ${userEmail} is now an admin`,
      });
    } catch (error) {
      logAuth('ADMIN', `Manual role update failed: ${error instanceof Error ? error.message : String(error)}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
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

export default AdminRoleFixer;
