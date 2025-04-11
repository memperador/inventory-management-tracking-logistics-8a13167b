
import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/useRoleContext';
import { useAuth } from '@/hooks/useAuthContext';

const LabratAdminButton: React.FC = () => {
  const [isFixing, setIsFixing] = React.useState(false);
  const { refreshRole } = useRole();
  const { refreshSession, user } = useAuth();
  
  const handleFix = async () => {
    setIsFixing(true);
    try {
      // Only proceed for the labrat user
      if (user?.email !== 'labrat@iaware.com') {
        toast({
          title: 'Error',
          description: 'This button is only for the labrat@iaware.com user.',
          variant: 'destructive'
        });
        return;
      }
      
      console.log('LabratAdminButton: Setting labrat as admin');
      
      // Labrat's known ID
      const userId = '9e32e738-5f44-44f8-bc15-6946b27296a6';
      
      // Update user role in DB
      const { error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', userId);
        
      if (error) {
        console.error('Error updating database role:', error);
        throw error;
      }
      
      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { role: 'admin' }
      });
      
      if (metadataError) {
        console.error('Error updating auth metadata:', metadataError);
      }
      
      // Multiple session refresh attempts to ensure it takes
      await refreshSession();
      
      // Refresh role context
      await refreshRole();
      
      // Try another refresh after a delay
      setTimeout(async () => {
        await refreshSession();
        await refreshRole();
      }, 500);
      
      toast({
        title: 'Admin Role Applied',
        description: 'The labrat@iaware.com user now has admin privileges. The page will refresh shortly.',
      });
      
      // Force reload the application to ensure all context is updated
      setTimeout(() => {
        sessionStorage.setItem('admin_role_applied', 'true');
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Failed to fix admin role:', error);
      toast({
        title: 'Error',
        description: 'Failed to set admin role. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsFixing(false);
    }
  };
  
  return (
    <Button 
      onClick={handleFix}
      disabled={isFixing}
      variant="destructive"
      className="mt-4 w-full"
    >
      {isFixing ? 'Setting Admin Role...' : 'Emergency: Force Admin Role'}
    </Button>
  );
};

export default LabratAdminButton;
