
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

    // Set an emergency flag that will force dashboard redirect
    sessionStorage.setItem('force_dashboard_redirect', 'true');
  } catch (error) {
    console.error('Error in emergency labrat fix:', error);
  }
})();

// Export a function to manually fix the labrat user (for use in components)
export const emergencyFixLabratAdmin = async () => {
  try {
    // Get the current session
    const { data: sessionData } = await supabase.auth.getSession();
    
    // Skip if not logged in
    if (!sessionData?.session || sessionData.session.user.email !== LABRAT_EMAIL) {
      return;
    }
    
    // Fix user role in database
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
    
    // Set force flag
    sessionStorage.setItem('force_dashboard_redirect', 'true');
    
    // Force redirect to dashboard
    window.location.href = '/dashboard';
  } catch (error) {
    console.error('Error in emergency fix function:', error);
  }
};
