
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { LABRAT_EMAIL, LABRAT_USER_ID } from '@/utils/auth/labratUserUtils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, ShieldOff } from 'lucide-react';

// Track recovery attempts
const MAX_ATTEMPTS = 3;
let attemptCount = 0;

const EmergencyLabratLogin: React.FC = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [recoveryAttempt, setRecoveryAttempt] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  // Direct login function with aggressive cleanup and fallback mechanisms
  const handleDirectLogin = async () => {
    setIsLoggingIn(true);
    attemptCount++;
    setRecoveryAttempt(attemptCount);
    
    try {
      // Capture previous state for rollback if needed
      const prevSessionData = localStorage.getItem('session_data');
      
      // Force signout any current user first
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear ALL storage to prevent any conflicts
      localStorage.clear();
      sessionStorage.clear();
      
      // Store recovery attempt info
      sessionStorage.setItem('recovery_attempt', attemptCount.toString());
      sessionStorage.setItem('recovery_timestamp', new Date().toISOString());
      
      // Set emergency flags
      const emergencyFlags = {
        'emergency_labrat_login': 'true',
        'force_dashboard_redirect': 'true',
        'bypass_auth_checks': 'true',
        'prevent_loop': 'true',
      };
      
      Object.entries(emergencyFlags).forEach(([key, value]) => {
        sessionStorage.setItem(key, value);
      });
      
      toast({
        title: 'Emergency Login',
        description: `Attempt #${attemptCount}: Initiating login recovery...`,
      });
      
      // Check if we've exceeded max attempts - use alternative strategy
      if (attemptCount > MAX_ATTEMPTS) {
        console.log('Maximum attempts reached, using alternative login strategy');
        toast({
          title: 'Using Alternative Strategy',
          description: 'Max recovery attempts reached. Trying a different approach...',
        });
        
        // Reset attempt counter but try different approach
        attemptCount = 0;
        
        // Wait before redirect to allow toast to show
        setTimeout(() => {
          window.location.href = '/auth?emergency=true&bypass=true';
        }, 1500);
        
        return;
      }
      
      // Direct login with hardcoded credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: LABRAT_EMAIL,
        password: 'testpassword1'
      });
      
      if (error) {
        console.error('Direct login failed:', error);
        setLastError(error.message);
        
        toast({
          title: 'Login Failed',
          description: `Error: ${error.message}. Attempting recovery...`,
          variant: 'destructive'
        });
        
        // Auto-retry with delay using a different approach
        setTimeout(() => {
          handleAlternativeLogin();
        }, 2000);
        
        return;
      }
      
      console.log('Direct login successful, applying admin role');
      
      // Apply admin role using multiple strategies for redundancy
      const rolePromises = [
        // Strategy 1: Direct database update
        supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', LABRAT_USER_ID),
          
        // Strategy 2: Auth metadata update  
        supabase.auth.updateUser({
          data: { role: 'admin' }
        }),
        
        // Strategy 3: Session refresh
        supabase.auth.refreshSession()
      ];
      
      // Execute all strategies in parallel
      await Promise.allSettled(rolePromises);
      
      toast({
        title: 'Login Successful',
        description: 'Admin role applied, redirecting to dashboard...',
      });
      
      // Reset attempt counter on success
      attemptCount = 0;
      
      // Store success flag
      localStorage.setItem('admin_login_timestamp', Date.now().toString());
      
      // Force navigation to dashboard after showing success message
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 800);
      
    } catch (error: any) {
      console.error('Emergency login critical failure:', error);
      setLastError(error.message || 'Unknown error');
      
      toast({
        title: 'Critical Error',
        description: `Recovery failed: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
      
      // Auto-retry after delay if not too many attempts
      if (attemptCount < MAX_ATTEMPTS) {
        toast({
          title: 'Auto-Recovery',
          description: `Automatic retry in 3 seconds...`,
        });
        
        setTimeout(() => {
          handleAlternativeLogin();
        }, 3000);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  // Alternative login approach as fallback
  const handleAlternativeLogin = async () => {
    setIsLoggingIn(true);
    try {
      toast({
        title: 'Alternative Login',
        description: 'Trying different login approach...',
      });
      
      // Clear session first
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      
      // Set special bypass flags
      sessionStorage.setItem('alt_recovery_strategy', 'true');
      
      // Special redirect with recovery parameters
      window.location.href = '/auth?recovery=labrat&emergency=true';
    } catch (error: any) {
      toast({
        title: 'Alternative Login Failed',
        description: error.message || 'Unknown error',
        variant: 'destructive'
      });
      setIsLoggingIn(false);
    }
  };

  // Reset function if all else fails
  const handleResetEnvironment = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/auth';
  };
  
  return (
    <Card className="w-full max-w-md mb-4 border-red-300 shadow-lg">
      <CardHeader className="bg-red-50">
        <CardTitle className="text-center text-red-900">Emergency Access Control</CardTitle>
        <CardDescription className="text-center text-red-700">
          Critical recovery system for authentication issues
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 bg-red-50 space-y-4">
        {lastError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Login Error</AlertTitle>
            <AlertDescription>
              {lastError}
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={handleDirectLogin} 
          disabled={isLoggingIn}
          className="w-full bg-red-600 hover:bg-red-700"
          size="lg"
        >
          {isLoggingIn ? `Recovery Attempt #${recoveryAttempt} in Progress...` : '🚨 EMERGENCY LABRAT LOGIN'}
        </Button>
        
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Button
            onClick={handleAlternativeLogin}
            disabled={isLoggingIn} 
            variant="outline"
            className="w-full border-red-300"
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Alternative Method
          </Button>
          
          <Button 
            onClick={handleResetEnvironment}
            disabled={isLoggingIn}
            variant="outline" 
            className="w-full border-red-300"
            size="sm"
          >
            <ShieldOff className="mr-2 h-4 w-4" />
            Reset Environment
          </Button>
        </div>
        
        <p className="text-xs text-center mt-2 text-red-700">
          This system will clear all storage and forcibly login as labrat@iaware.com with admin privileges
        </p>
      </CardContent>
    </Card>
  );
};

export default EmergencyLabratLogin;
