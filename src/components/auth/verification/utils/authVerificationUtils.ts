
import { supabase } from '@/integrations/supabase/client';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { createErrorResponse } from '@/utils/errorHandling';
import { toast } from '@/hooks/use-toast';

/**
 * Check tenant and onboarding status for navigation
 */
export const checkTenantAndOnboarding = async (userId: string): Promise<{
  needsOnboarding: boolean;
  needsSubscription: boolean;
  targetPath: string;
}> => {
  try {
    // Check if user has a tenant
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tenant_id, role')
      .eq('id', userId)
      .maybeSingle();
      
    if (userError) {
      throw userError;
    }
    
    // If no tenant association, redirect to onboarding
    if (!userData || !userData.tenant_id) {
      return {
        needsOnboarding: true,
        needsSubscription: false,
        targetPath: '/onboarding'
      };
    }
    
    // Get tenant information
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('onboarding_completed, subscription_status, subscription_tier, trial_ends_at')
      .eq('id', userData.tenant_id)
      .maybeSingle();
      
    if (tenantError) {
      throw tenantError;
    }
    
    // If tenant exists but onboarding not completed
    if (tenantData && tenantData.onboarding_completed === false) {
      return {
        needsOnboarding: true,
        needsSubscription: false,
        targetPath: '/onboarding'
      };
    }
    
    // Check subscription status
    const needsSubscription = checkIfSubscriptionNeeded(tenantData);
    
    if (needsSubscription) {
      return {
        needsOnboarding: false,
        needsSubscription: true,
        targetPath: '/payment'
      };
    }
    
    // All checks passed, go to dashboard
    return {
      needsOnboarding: false,
      needsSubscription: false,
      targetPath: '/dashboard'
    };
  } catch (error) {
    const errorResponse = createErrorResponse('SY-001', {
      message: 'Error checking user tenant status',
      technicalDetails: error instanceof Error ? error.message : String(error),
    });
    
    logAuth('AUTH-VERIFICATION', `Error checking tenant status: ${errorResponse.message}`, {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error
    });
    
    // For auth errors, default to dashboard to avoid login loops
    return {
      needsOnboarding: false,
      needsSubscription: false,
      targetPath: '/dashboard'
    };
  }
};

/**
 * Handle redirect with fallback for return URL
 */
export const handleRedirect = (targetPath: string, returnTo: string | null): string => {
  // If returnTo exists and is a valid path (starts with /), use it
  // But filter out authentication related paths to prevent loops
  if (returnTo && 
      returnTo.startsWith('/') && 
      !['/auth', '/login', '/register', '/reset-password'].includes(returnTo)) {
    return returnTo;
  }
  
  return targetPath;
};

/**
 * Check if user needs subscription setup
 */
const checkIfSubscriptionNeeded = (tenantData: any): boolean => {
  if (!tenantData) return true;
  
  // Active subscription
  if (tenantData.subscription_status === 'active') {
    return false;
  }
  
  // Check if trial is active
  if (tenantData.subscription_status === 'trialing' && tenantData.trial_ends_at) {
    const trialEndDate = new Date(tenantData.trial_ends_at);
    const now = new Date();
    
    // Trial still active
    if (trialEndDate > now) {
      return false;
    }
  }
  
  // All other cases need subscription
  return true;
};

/**
 * Clear authentication-related session storage to prevent loops
 */
export const clearAuthSessionStorage = (email?: string): void => {
  // Clear specific auth item for this user if email provided
  if (email) {
    sessionStorage.removeItem(`auth_processed_${email}`);
  }
  
  // Clear any items that might cause auth loops
  const keysToRemove = [];
  
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (
      key.startsWith('auth_processed_') || 
      key.startsWith('processing_') ||
      key === 'login_toast_shown' ||
      key === 'redirect_after_auth' ||
      key === 'auth_error' ||
      key === 'auth_redirect_attempted'
    )) {
      keysToRemove.push(key);
    }
  }
  
  // Remove items in a separate loop to avoid index issues
  keysToRemove.forEach(key => {
    sessionStorage.removeItem(key);
  });
  
  logAuth('AUTH-VERIFICATION', 'Cleared auth-related session storage items', {
    level: AUTH_LOG_LEVELS.INFO,
    data: { clearedItems: keysToRemove }
  });
};
