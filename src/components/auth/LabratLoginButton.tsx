
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { LABRAT_EMAIL, LABRAT_USER_ID, ensureLabratAdminRole } from '@/utils/auth/labratUserUtils';
import { toast } from '@/hooks/use-toast';

const LabratLoginButton: React.FC = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLabratLogin = async () => {
    setIsLoggingIn(true);
    
    try {
      logAuth('LABRAT-LOGIN', 'Initiating direct labrat user login', {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      
      // Clear any existing session storage items
      sessionStorage.clear();
      
      // Set special flags
      sessionStorage.setItem('labrat_direct_login', 'true');
      sessionStorage.setItem('force_dashboard_redirect', 'true');
      sessionStorage.setItem('bypass_auth_checks', 'true');
      
      // Sign in with hardcoded credentials for labrat user
      // Note: This is only acceptable for the test user
      const { data, error } = await supabase.auth.signInWithPassword({
        email: LABRAT_EMAIL,
        password: 'testpassword1'  // Hardcoded password for test account
      });
      
      if (error) {
        console.error('Labrat direct login failed:', error);
        toast({
          title: 'Login Failed',
          description: `Could not log in as labrat user: ${error.message}`,
          variant: 'destructive'
        });
        return;
      }
      
      if (data?.user) {
        logAuth('LABRAT-LOGIN', 'Labrat user logged in successfully, ensuring admin role', {
          level: AUTH_LOG_LEVELS.INFO,
          force: true
        });
        
        // Set admin role in both places
        await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', LABRAT_USER_ID);
          
        // Update auth metadata
        await supabase.auth.updateUser({
          data: { role: 'admin' }
        });
        
        toast({
          title: 'Login Successful',
          description: 'Logged in as labrat user with admin role. Redirecting to dashboard...',
        });
        
        // Force a refresh of the session
        await supabase.auth.refreshSession();
        
        // Avoid RLS issues by forcing a page reload
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error during direct labrat login:', error);
      toast({
        title: 'Login Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  return (
    <Button
      variant="outline"
      onClick={handleLabratLogin}
      disabled={isLoggingIn}
      className="w-full bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 mt-2"
    >
      {isLoggingIn ? 'Logging In...' : '🧪 Use Test Account (labrat)'}
    </Button>
  );
};

export default LabratLoginButton;
