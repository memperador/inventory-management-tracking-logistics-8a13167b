
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { LABRAT_EMAIL, ensureLabratAdminRole } from '@/utils/auth/labratUserUtils';
import { clearAuthSessionStorage } from '@/contexts/auth/handlers/sessionUtils';

export const signIn = async (email: string, password: string) => {
  logAuth('AUTH-SIGNIN', `Sign in initiated for email: ${email}`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  
  try {
    // Clear any previous auth state
    clearAuthSessionStorage();
    
    // Sign out any existing session first to prevent conflicts
    await supabase.auth.signOut({ scope: 'local' });
    
    // Special case for labrat user
    if (email === LABRAT_EMAIL) {
      logAuth('AUTH-SIGNIN', 'Labrat user login detected', {
        level: AUTH_LOG_LEVELS.INFO
      });
      sessionStorage.setItem('labrat_login', 'true');
      sessionStorage.setItem('force_dashboard_redirect', 'true');
    }
    
    // Perform login
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) throw error;
    
    // Success toast - only show once per session
    if (!sessionStorage.getItem('login_toast_shown')) {
      toast({
        title: 'Welcome back!',
        description: 'You have been signed in successfully',
      });
      sessionStorage.setItem('login_toast_shown', Date.now().toString());
    }
    
    // Set a flag to prevent redirect loops
    if (data.session?.user.id) {
      sessionStorage.setItem(`auth_processed_${data.session.user.id}_/dashboard`, 'true');
    }
    
    // Ensure labrat user has admin role
    if (email === LABRAT_EMAIL && data.session) {
      try {
        await ensureLabratAdminRole(false);
      } catch (roleError) {
        // Non-blocking - log but continue
        logAuth('AUTH-SIGNIN', 'Error ensuring labrat admin role', {
          level: AUTH_LOG_LEVELS.ERROR,
          data: roleError
        });
      }
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
