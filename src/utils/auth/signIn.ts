
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { LABRAT_EMAIL, ensureLabratAdminRole } from '@/utils/auth/labratUserUtils';

export const signIn = async (email: string, password: string) => {
  try {
    // Clean up any existing auth state
    logAuth('AUTH-SIGNIN', `Clearing auth state for new sign in attempt`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    // Sign out any existing session first
    await supabase.auth.signOut({ scope: 'local' });
    sessionStorage.clear();
    
    // Perform login
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) {
      logAuth('AUTH-SIGNIN', `Sign in error: ${error.message}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
      
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive'
      });
      
      throw error;
    }
    
    if (!data.session) {
      throw new Error('No session returned from sign in');
    }
    
    // Special case for labrat user
    if (email === LABRAT_EMAIL) {
      logAuth('AUTH-SIGNIN', 'Labrat user detected, ensuring admin role', {
        level: AUTH_LOG_LEVELS.INFO
      });
      sessionStorage.setItem('force_dashboard_redirect', 'true');
      await ensureLabratAdminRole(false);
    }
    
    // Set marker to prevent redirect loops
    if (data.session.user.id) {
      sessionStorage.setItem(`auth_processed_${data.session.user.id}_/dashboard`, 'true');
    }
    
    // Success toast - only show once per session
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
    
    if (!sessionStorage.getItem('error_toast_shown')) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign in',
        variant: 'destructive'
      });
      sessionStorage.setItem('error_toast_shown', Date.now().toString());
    }
    
    throw error;
  }
};
