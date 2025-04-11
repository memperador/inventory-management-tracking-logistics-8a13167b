
import { supabase } from '@/integrations/supabase/client';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { LABRAT_EMAIL, LABRAT_USER_ID } from './labratUserUtils';

/**
 * This utility is meant to be used from the browser console to break login loops
 */
export const breakLoginLoop = async () => {
  try {
    logAuth('EMERGENCY', 'Manual login loop breaker triggered', {
      level: AUTH_LOG_LEVELS.WARN
    });
    
    // AGGRESSIVE SESSION STORAGE CLEARING - Remove ALL items
    sessionStorage.clear();
    
    // Set force flags
    sessionStorage.setItem('force_dashboard_redirect', 'true');
    sessionStorage.setItem('bypass_auth_checks', 'true');
    sessionStorage.setItem('emergency_loop_break', Date.now().toString());
    
    // Try to get current session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData?.session?.user) {
      logAuth('EMERGENCY', `User authenticated, id: ${sessionData.session.user.id}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      // If it's labrat, ensure admin role
      if (sessionData.session.user.email === LABRAT_EMAIL) {
        logAuth('EMERGENCY', 'Labrat user detected, fixing admin role', {
          level: AUTH_LOG_LEVELS.INFO
        });
        
        // Update user role in database
        await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', LABRAT_USER_ID);
          
        // Update metadata
        await supabase.auth.updateUser({
          data: { role: 'admin' }
        });
        
        // Refresh session
        await supabase.auth.refreshSession();
      }
      
      // Force reload to dashboard
      window.location.href = '/dashboard';
    } else {
      // Get the current URL path
      const currentPath = window.location.pathname;
      
      // Check if we're on auth page but might be in a loop
      if (currentPath === '/auth' || currentPath === '/login') {
        logAuth('EMERGENCY', 'On auth page without session, attempting full reload', {
          level: AUTH_LOG_LEVELS.INFO
        });
        
        // Force complete page reload to clean state
        window.location.reload();
      } else {
        // Not logged in, go to auth page with clear state
        window.location.href = '/auth';
      }
    }
    
    return 'Login loop breaker executed';
  } catch (error) {
    console.error('Error in breakLoginLoop:', error);
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }
};

// Make function available globally for console access
if (typeof window !== 'undefined') {
  (window as any).breakLoginLoop = breakLoginLoop;
  
  // Add special labrat emergency login function
  (window as any).labratLogin = async () => {
    try {
      // Clear any previous session
      await supabase.auth.signOut();
      
      // Clear storage
      sessionStorage.clear();
      
      // Set special flags
      sessionStorage.setItem('force_dashboard_redirect', 'true');
      sessionStorage.setItem('bypass_auth_checks', 'true');
      sessionStorage.setItem('labrat_emergency_login', 'true');
      
      // Sign in as labrat with hardcoded credentials (for emergency use only)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: LABRAT_EMAIL,
        password: 'testpassword1'
      });
      
      if (error) {
        console.error('Labrat login failed:', error);
        return `Error: ${error.message}`;
      }
      
      if (data?.user) {
        // Set admin role
        await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', LABRAT_USER_ID);
          
        // Update metadata
        await supabase.auth.updateUser({
          data: { role: 'admin' }
        });
        
        // Go to dashboard
        window.location.href = '/dashboard';
        return 'Labrat emergency login successful';
      }
      
      return 'Labrat login attempted but no user returned';
    } catch (error) {
      console.error('Error in labrat emergency login:', error);
      return `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  };
}

export default breakLoginLoop;
