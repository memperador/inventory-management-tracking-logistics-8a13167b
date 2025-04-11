
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
    
    // Clear session storage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        sessionStorage.removeItem(key);
      }
    }
    
    // Set force flags
    sessionStorage.setItem('force_dashboard_redirect', 'true');
    sessionStorage.setItem('bypass_auth_checks', 'true');
    
    // Try to get current session
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (sessionData?.session?.user) {
      // If it's labrat, ensure admin role
      if (sessionData.session.user.email === LABRAT_EMAIL) {
        // Update user role in database
        await supabase
          .from('users')
          .update({ role: 'admin' })
          .eq('id', LABRAT_USER_ID);
          
        // Update metadata
        await supabase.auth.updateUser({
          data: { role: 'admin' }
        });
      }
      
      // Force reload to dashboard
      window.location.href = '/dashboard';
    } else {
      // Not logged in or session is invalid, go to login page
      window.location.href = '/auth';
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
}

export default breakLoginLoop;
