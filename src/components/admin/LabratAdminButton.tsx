
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { LABRAT_EMAIL, LABRAT_USER_ID } from '@/utils/auth/labratUserUtils';
import { toast } from '@/hooks/use-toast';
import { Shield } from 'lucide-react';

const LabratAdminButton: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);

  const handleFixRole = async () => {
    setIsFixing(true);
    try {
      // Update in database
      const { error: dbError } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', LABRAT_USER_ID);
        
      if (dbError) throw dbError;
      
      // Update in auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { role: 'admin' }
      });
      
      if (authError) throw authError;
      
      // Refresh session
      await supabase.auth.refreshSession();
      
      toast({
        title: 'Admin Role Fixed',
        description: 'The admin role has been applied successfully.',
      });
      
      // Refresh page after short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      console.error('Error fixing admin role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fix admin role',
        variant: 'destructive'
      });
    } finally {
      setIsFixing(false);
    }
  };

  const handleResetSession = async () => {
    try {
      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out
      await supabase.auth.signOut();
      
      toast({
        title: 'Session Reset',
        description: 'Your session has been reset. Redirecting to login...',
      });
      
      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/auth';
      }, 1000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset session',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={handleFixRole}
        disabled={isFixing}
        className="bg-red-600 hover:bg-red-700"
        size="sm"
      >
        <Shield className="mr-1 h-4 w-4" />
        {isFixing ? 'Fixing...' : 'Fix Admin Access'}
      </Button>
      <Button
        onClick={handleResetSession}
        variant="outline"
        className="border-red-300"
        size="sm"
      >
        Reset Session
      </Button>
    </div>
  );
};

export default LabratAdminButton;
