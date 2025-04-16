
import { supabase } from '@/integrations/supabase/client';
import { createErrorResponse, handleError } from '@/utils/errorHandling/errorService';

/**
 * Emergency utility to break authentication redirect loops
 * This can be called from the browser console when stuck in a loop
 */
export const breakLoginLoop = async (): Promise<string> => {
  console.log('🔄 EMERGENCY: Breaking authentication loop');
  
  try {
    // Create a structured error response
    const errorResponse = createErrorResponse('AU-002', {
      location: 'breakLoginLoop',
      userGuidance: 'Authentication loop detected and broken. Emergency authentication has been initiated.'
    });
    
    // Handle the error without throwing
    handleError(errorResponse, { throwError: false });
    
    // 1. Clear all storage
    console.log('Clearing local and session storage');
    localStorage.clear();
    sessionStorage.clear();
    
    // 2. Set special flags
    sessionStorage.setItem('break_auth_loop', 'true');
    sessionStorage.setItem('auth_loop_detected', Date.now().toString());
    
    // 3. Force signout
    console.log('Force signing out any current user');
    await supabase.auth.signOut({ scope: 'global' });
    
    // 4. Redirect to auth page with special parameter
    console.log('Redirecting to auth page with loop breaker parameter');
    window.location.href = '/auth?loop_breaker=true';
    
    return 'Auth loop breaker activated. Redirecting to login page...';
  } catch (error) {
    console.error('Failed to break auth loop:', error);
    
    // Ultimate fallback - force reload to auth
    alert('Emergency auth reset activated. Click OK to continue to login page.');
    window.location.href = '/auth?emergency=true';
    
    return 'Emergency redirect initiated.';
  }
};

// Make this function available globally
if (typeof window !== 'undefined') {
  (window as any).breakLoginLoop = breakLoginLoop;
}

export default breakLoginLoop;
