import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { findTenantByEmail } from '@/contexts/auth/handlers/checkTenant';
import { LABRAT_EMAIL, LABRAT_USER_ID, ensureLabratAdminRole } from '@/utils/auth/labratUserUtils';
import { createErrorResponse, handleError } from '@/utils/errorHandling/errorService';
import { clearAuthSessionStorage } from '@/contexts/auth/handlers/sessionUtils';

export const signIn = async (email: string, password: string) => {
  logAuth('AUTH-SIGNIN', `Sign in initiated for email: ${email}`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  
  try {
    // Clear any previous auth state
    clearAuthSessionStorage();
    
    // Special case for labrat user
    if (email === LABRAT_EMAIL) {
      logAuth('AUTH-SIGNIN', 'Labrat user login detected', {
        level: AUTH_LOG_LEVELS.INFO
      });
      sessionStorage.setItem('labrat_login', 'true');
    }
    
    // Perform login
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) throw error;
    
    // Success toast
    if (!sessionStorage.getItem('login_toast_shown')) {
      toast({
        title: 'Welcome back!',
        description: 'You have been signed in successfully',
      });
      sessionStorage.setItem('login_toast_shown', Date.now().toString());
    }
    
    return { session: data.session, user: data.user };
    
  } catch (error) {
    logAuth('AUTH-SIGNIN', 'Sign in error:', {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error
    });
    
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to sign in',
      variant: 'destructive'
    });
    
    throw error;
  }
};
