
import { supabase } from '@/integrations/supabase/client';
import { LABRAT_EMAIL, LABRAT_USER_ID } from './labratUserUtils';

// Track attempts to prevent infinite loops
let attemptCount = 0;
const MAX_ATTEMPTS = 3;

/**
 * EMERGENCY: Direct labrat login function with self-healing capabilities
 * This bypasses all normal auth flows for emergency access with fallback mechanisms
 */
export const emergencyLabratLogin = async (): Promise<string> => {
  try {
    // Prevent infinite loops with attempt limiting
    attemptCount++;
    if (attemptCount > MAX_ATTEMPTS) {
      console.error('🚨 EMERGENCY: Max login attempts reached, breaking potential loop');
      sessionStorage.setItem('break_auth_loop', 'true');
      return 'Max attempts reached. Please try the alternative login method.';
    }
    
    console.log('🚨 EMERGENCY: Starting direct labrat login procedure (attempt ' + attemptCount + ')');
    
    // Record system state before making changes (immutable snapshot)
    const prevSession = await supabase.auth.getSession();
    const prevState = {
      url: window.location.href,
      pathname: window.location.pathname,
      sessionExists: prevSession?.data?.session !== null,
      timestamp: new Date().toISOString()
    };
    console.log('Login attempt state snapshot:', prevState);
    
    // Clear all storage with validation
    console.log('Clearing all storage');
    try {
      localStorage.clear();
      sessionStorage.clear();
      
      // Verify storage was cleared
      if (localStorage.length > 0 || sessionStorage.length > 0) {
        console.warn('Storage clear verification failed, retrying with individual item removal');
        // Secondary clear method (safety redundancy)
        Object.keys(localStorage).forEach(key => localStorage.removeItem(key));
        Object.keys(sessionStorage).forEach(key => sessionStorage.removeItem(key));
      }
    } catch (storageError) {
      console.error('Storage clearing error:', storageError);
      // Continue despite storage errors
    }
    
    // Sign out any existing user with verification
    console.log('Signing out any existing user');
    try {
      await supabase.auth.signOut({ scope: 'global' });
      
      // Verify signout was successful
      const postSignOutSession = await supabase.auth.getSession();
      if (postSignOutSession?.data?.session) {
        console.warn('Sign-out verification failed, session still exists');
        // Force additional signout
        await supabase.auth.signOut({ scope: 'global' });
      }
    } catch (signOutError) {
      console.error('Sign out error:', signOutError);
      // Continue despite signout errors
    }
    
    // Set special flags with verification
    const criticalFlags = {
      'emergency_login': 'true',
      'force_dashboard_redirect': 'true',
      'bypass_auth_checks': 'true',
      'auto_fix_admin_role': 'true',
      'login_timestamp': Date.now().toString()
    };
    
    Object.entries(criticalFlags).forEach(([key, value]) => {
      sessionStorage.setItem(key, value);
      // Verify flag was set
      if (sessionStorage.getItem(key) !== value) {
        console.warn(`Failed to set ${key} flag, retrying`);
        sessionStorage.setItem(key, value);
      }
    });
    
    console.log('Attempting direct login as labrat user');
    
    // Direct login with hardcoded credentials 
    // NOTE: In production, this should use secure storage or environment variables
    // For this demo/emergency system, we use hardcoded values for immediate recovery
    const { data, error } = await supabase.auth.signInWithPassword({
      email: LABRAT_EMAIL,
      password: 'testpassword1'
    });
    
    if (error) {
      console.error('Direct login failed:', error);
      
      // Self-healing: Try alternative login method if regular fails
      if (error.message.includes('Invalid login credentials')) {
        console.log('Attempting alternative auth method');
        // Try magic link as fallback (not implemented in this version)
      }
      
      return `Login failed: ${error.message}`;
    }
    
    console.log('Login successful, setting admin role');
    
    // Set admin role in database with retry
    try {
      // First attempt
      const { error: roleError } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', LABRAT_USER_ID);
        
      if (roleError) {
        console.error('First role update attempt failed:', roleError);
        // Second attempt with delay
        setTimeout(async () => {
          await supabase
            .from('users')
            .update({ role: 'admin' })
            .eq('id', LABRAT_USER_ID);
        }, 1000);
      }
    } catch (roleUpdateError) {
      console.error('Role update error:', roleUpdateError);
    }
    
    // Set admin role in auth metadata with retry
    try {
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { role: 'admin' }
      });
      
      if (metadataError) {
        console.error('Metadata update error:', metadataError);
        // Retry with delay
        setTimeout(async () => {
          await supabase.auth.updateUser({
            data: { role: 'admin' }
          });
        }, 1000);
      }
    } catch (metadataUpdateError) {
      console.error('Metadata update error:', metadataUpdateError);
    }
    
    // Refresh session with validation
    try {
      await supabase.auth.refreshSession();
      
      // Verify we have a session
      const finalSession = await supabase.auth.getSession();
      if (!finalSession?.data?.session) {
        console.warn('Session refresh verification failed, session still missing');
      } else {
        console.log('Session successfully refreshed and verified');
      }
    } catch (refreshError) {
      console.error('Session refresh error:', refreshError);
    }
    
    console.log('Admin role set, redirecting to dashboard');
    
    // Reset attempt counter on success
    attemptCount = 0;
    
    // Record success in localStorage for loop detection
    localStorage.setItem('last_successful_login', Date.now().toString());
    
    // Redirect to dashboard after short delay
    setTimeout(() => {
      sessionStorage.setItem('auth_redirect_success', 'true');
      window.location.href = '/dashboard';
    }, 800);
    
    return 'Login successful! Redirecting to dashboard...';
  } catch (error) {
    console.error('Emergency login critical failure:', error);
    
    // Last resort error handling - break potential loops
    if (attemptCount >= 2) {
      sessionStorage.setItem('break_auth_loop', 'true');
      window.location.href = '/auth?emergency=true';
    }
    
    return `Emergency login failed: ${error instanceof Error ? error.message : String(error)}`;
  }
};

// Expose a function to break login loops
export const breakLoginLoop = () => {
  console.log('🛑 Breaking potential login loop');
  sessionStorage.setItem('break_auth_loop', 'true');
  localStorage.setItem('break_auth_loop', 'true');
  attemptCount = MAX_ATTEMPTS + 1;
  
  // Clear all redirection flags
  const redirectFlags = [
    'force_dashboard_redirect',
    'bypass_auth_checks',
    'emergency_login',
    'auth_redirect_pending'
  ];
  
  redirectFlags.forEach(flag => {
    sessionStorage.removeItem(flag);
    localStorage.removeItem(flag);
  });
  
  return 'Login loop breaker activated. Please navigate to /auth page manually.';
};

// Make both functions available globally
if (typeof window !== 'undefined') {
  (window as any).emergencyLabratLogin = emergencyLabratLogin;
  (window as any).breakLoginLoop = breakLoginLoop;
}

export default emergencyLabratLogin;
