
import { supabase } from '@/integrations/supabase/client';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { LABRAT_EMAIL, LABRAT_USER_ID } from '@/utils/auth/labratUserUtils';

// This is an emergency fix utility that runs automatically when imported
// It ensures the labrat user can log in properly without loops

(() => {
  try {
    logAuth('EMERGENCY-FIX', 'URGENT: Fixing labrat admin role on page load', {
      level: AUTH_LOG_LEVELS.INFO,
      force: true
    });

    // Clear any session storage items that might be causing loops
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (
        key.startsWith('auth_processed_') || 
        key.startsWith('processing_')
      )) {
        sessionStorage.removeItem(key);
      }
    }

    // Set emergency flags that will force dashboard redirect for labrat
    if (typeof window !== 'undefined') {
      // Check if this is from the /auth page
      const isAuthPage = window.location.pathname === '/auth' || 
                         window.location.pathname === '/login' ||
                         window.location.pathname === '/';
                         
      // If on auth page, set up detection for labrat login
      if (isAuthPage) {
        // Set up listener for form submissions
        document.addEventListener('submit', async (e) => {
          const form = e.target as HTMLFormElement;
          const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
          
          // If this is the labrat email, set special flags
          if (emailInput && emailInput.value === LABRAT_EMAIL) {
            console.log('EMERGENCY: Detected labrat login attempt, setting bypass flags');
            sessionStorage.setItem('labrat_login_detected', 'true');
            sessionStorage.setItem('force_dashboard_redirect', 'true');
            sessionStorage.setItem('bypass_auth_checks', 'true');
          }
        });
      }
    }
  } catch (error) {
    console.error('Error in emergency labrat fix:', error);
  }
})();

// Export a function to manually fix the labrat user (for use in components)
export const emergencyFixLabratAdmin = async () => {
  try {
    console.log('Running emergency fix for labrat admin...');
    
    // Get the current session
    const { data: sessionData } = await supabase.auth.getSession();
    
    // Skip if not logged in
    if (!sessionData?.session || sessionData.session.user.email !== LABRAT_EMAIL) {
      console.log('Not the labrat user or not logged in, skipping fix');
      return;
    }
    
    console.log('Fixing labrat admin role in database...');
    
    // Fix user role in database - multiple attempts
    await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', LABRAT_USER_ID);
    
    // Fix role in auth metadata
    await supabase.auth.updateUser({
      data: { role: 'admin' }
    });
    
    // Force session refresh
    await supabase.auth.refreshSession();
    
    // Set force flags
    sessionStorage.setItem('force_dashboard_redirect', 'true');
    sessionStorage.setItem('bypass_auth_checks', 'true');
    sessionStorage.setItem('labrat_fixed', Date.now().toString());
    
    console.log('Admin role fixed. Redirecting to dashboard...');
    
    // Force redirect to dashboard
    window.location.href = '/dashboard';
  } catch (error) {
    console.error('Error in emergency fix function:', error);
  }
};

// Add to window for emergency access from console
if (typeof window !== 'undefined') {
  (window as any).fixLabratAdmin = emergencyFixLabratAdmin;
}

