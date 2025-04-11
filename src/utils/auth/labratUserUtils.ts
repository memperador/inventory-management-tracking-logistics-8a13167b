
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

// Labrat user constants
export const LABRAT_EMAIL = 'labrat@iaware.com';
export const LABRAT_USER_ID = '9e32e738-5f44-44f8-bc15-6946b27296a6';

/**
 * Force the labrat user to have admin role by updating both the database and auth metadata
 * This is a critical function to ensure the labrat test user always has admin access
 */
export async function ensureLabratAdminRole(showToasts = false): Promise<boolean> {
  try {
    // Get the current user session
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData.session?.user;
    
    // Only proceed if this is actually the labrat user
    if (!currentUser || currentUser.email !== LABRAT_EMAIL) {
      logAuth('LABRAT-UTILS', 'Not the labrat user, skipping admin role enforcement', {
        level: AUTH_LOG_LEVELS.DEBUG
      });
      return false;
    }
    
    logAuth('LABRAT-UTILS', 'Ensuring labrat user has admin role', {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    // 1. Update user role in database
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', LABRAT_USER_ID);
      
    if (updateError) {
      logAuth('LABRAT-UTILS', 'Error updating role in database', {
        level: AUTH_LOG_LEVELS.ERROR,
        data: updateError
      });
    }
    
    // 2. Update user metadata with admin role
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { role: 'admin' }
    });
    
    if (metadataError) {
      logAuth('LABRAT-UTILS', 'Error updating auth metadata', {
        level: AUTH_LOG_LEVELS.ERROR,
        data: metadataError
      });
    }
    
    // 3. Force refresh session to apply changes
    const { error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      logAuth('LABRAT-UTILS', 'Error refreshing session', {
        level: AUTH_LOG_LEVELS.ERROR,
        data: refreshError
      });
    }
    
    // Get the updated session to verify the change
    const { data: updatedSession } = await supabase.auth.getSession();
    
    if (showToasts) {
      toast({
        title: 'Admin Role Updated',
        description: 'Your user role has been updated to Admin and the session has been refreshed.',
      });
    }
    
    logAuth('LABRAT-UTILS', 'Admin role successfully applied to labrat user', {
      level: AUTH_LOG_LEVELS.INFO,
      data: {
        role: updatedSession.session?.user.user_metadata.role
      }
    });
    
    return true;
  } catch (error) {
    logAuth('LABRAT-UTILS', 'Failed to apply admin role to labrat user', {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error
    });
    
    return false;
  }
}

/**
 * Special function to force dashboard redirect for labrat user
 */
export function redirectLabratToDashboard(): void {
  logAuth('LABRAT-UTILS', 'Forcing labrat user redirect to dashboard', {
    level: AUTH_LOG_LEVELS.INFO
  });
  
  // Clear any potential redirect loop blockers
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.startsWith(`auth_processed_${LABRAT_USER_ID}`) || 
                key.startsWith(`processing_${LABRAT_USER_ID}`))) {
      sessionStorage.removeItem(key);
    }
  }
  
  // Set flag to prevent redirect loop detection
  sessionStorage.setItem('labrat_force_redirect', 'true');
  
  // Use direct location change for more reliable redirect
  window.location.href = '/dashboard';
}

/**
 * Check if current user is the labrat test user
 */
export async function isLabratUser(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.email === LABRAT_EMAIL;
}
