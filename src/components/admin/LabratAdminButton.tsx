
import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/useRoleContext';
import { useAuth } from '@/hooks/useAuthContext';

const LabratAdminButton: React.FC = () => {
  const [isFixing, setIsFixing] = React.useState(false);
  const { refreshRole } = useRole();
  const { refreshSession } = useAuth();
  
  const handleFix = async () => {
    setIsFixing(true);
    try {
      // Labrat's known ID
      const userId = '9e32e738-5f44-44f8-bc15-6946b27296a6';
      
      // Update user role in DB
      const { error } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Update user metadata
      await supabase.auth.updateUser({
        data: { role: 'admin' }
      });
      
      // Refresh session
      await refreshSession();
      
      // Refresh role context
      await refreshRole();
      
      toast({
        title: 'Admin Role Applied',
        description: 'The labrat@iaware.com user now has admin privileges. UI will update shortly.',
      });
      
      // Force reload the application to ensure all context is updated
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
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
      className="mt-4"
    >
      {isFixing ? 'Setting Admin Role...' : 'Emergency: Set labrat@iaware.com as Admin'}
    </Button>
  );
};

export default LabratAdminButton;
