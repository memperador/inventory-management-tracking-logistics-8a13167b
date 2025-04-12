
import { supabase } from '@/integrations/supabase/client';
import { LABRAT_EMAIL, LABRAT_USER_ID } from './labratUserUtils';

/**
 * EMERGENCY: Direct labrat login function
 * This bypasses all normal auth flows for emergency access
 */
export const emergencyLabratLogin = async (): Promise<string> => {
  try {
    console.log('🚨 EMERGENCY: Starting direct labrat login procedure');
    
    // Clear all storage
    console.log('Clearing all storage');
    localStorage.clear();
    sessionStorage.clear();
    
    // Sign out any existing user
    console.log('Signing out any existing user');
    await supabase.auth.signOut();
    
    // Set special flags
    sessionStorage.setItem('emergency_login', 'true');
    sessionStorage.setItem('force_dashboard_redirect', 'true');
    sessionStorage.setItem('bypass_auth_checks', 'true');
    
    console.log('Attempting direct login as labrat user');
    
    // Direct login with hardcoded credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: LABRAT_EMAIL,
      password: 'testpassword1'
    });
    
    if (error) {
      console.error('Direct login failed:', error);
      return `Login failed: ${error.message}`;
    }
    
    console.log('Login successful, setting admin role');
    
    // Set admin role in database
    await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', LABRAT_USER_ID);
    
    // Set admin role in auth metadata
    await supabase.auth.updateUser({
      data: { role: 'admin' }
    });
    
    // Refresh session
    await supabase.auth.refreshSession();
    
    console.log('Admin role set, redirecting to dashboard');
    
    // Redirect to dashboard after short delay
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 500);
    
    return 'Login successful! Redirecting to dashboard...';
  } catch (error) {
    console.error('Emergency login failed:', error);
    return `Emergency login failed: ${error instanceof Error ? error.message : String(error)}`;
  }
};

// Make this function available globally
if (typeof window !== 'undefined') {
  (window as any).emergencyLabratLogin = emergencyLabratLogin;
}

export default emergencyLabratLogin;
