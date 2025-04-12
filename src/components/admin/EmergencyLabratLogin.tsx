
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { LABRAT_EMAIL, LABRAT_USER_ID } from '@/utils/auth/labratUserUtils';

const EmergencyLabratLogin: React.FC = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Direct login function with aggressive cleanup
  const handleDirectLogin = async () => {
    setIsLoggingIn(true);
    
    try {
      // Force signout any current user first
      await supabase.auth.signOut();
      
      // Clear ALL storage to prevent any conflicts
      localStorage.clear();
      sessionStorage.clear();
      
      // Set emergency flags
      sessionStorage.setItem('emergency_labrat_login', 'true');
      sessionStorage.setItem('force_dashboard_redirect', 'true');
      sessionStorage.setItem('bypass_auth_checks', 'true');
      
      toast({
        title: 'Emergency Login',
        description: 'Attempting direct labrat login...',
      });
      
      // Direct login with hardcoded credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: LABRAT_EMAIL,
        password: 'testpassword1'
      });
      
      if (error) {
        console.error('Direct login failed:', error);
        toast({
          title: 'Login Failed',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }
      
      console.log('Direct login successful, setting admin role');
      
      // Immediately set admin role in both places
      await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', LABRAT_USER_ID);
        
      await supabase.auth.updateUser({
        data: { role: 'admin' }
      });
      
      // Refresh session
      await supabase.auth.refreshSession();
      
      toast({
        title: 'Login Successful',
        description: 'Redirecting to dashboard...',
      });
      
      // Force navigation to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
      
    } catch (error: any) {
      console.error('Emergency login failed:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to log in',
        variant: 'destructive'
      });
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mb-4 border-red-300 shadow-lg">
      <CardHeader className="bg-red-50">
        <CardTitle className="text-center text-red-900">Emergency Access</CardTitle>
        <CardDescription className="text-center text-red-700">
          Use this only if normal login is not working
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 bg-red-50">
        <Button 
          onClick={handleDirectLogin} 
          disabled={isLoggingIn}
          className="w-full bg-red-600 hover:bg-red-700"
          size="lg"
        >
          {isLoggingIn ? 'Emergency Login in Progress...' : '🚨 EMERGENCY LABRAT LOGIN'}
        </Button>
        <p className="text-xs text-center mt-2 text-red-700">
          This will clear all storage and force login as labrat@iaware.com
        </p>
      </CardContent>
    </Card>
  );
};

export default EmergencyLabratLogin;
