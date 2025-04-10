
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

/**
 * Handles post-login checks and redirects based on auth state changes
 */
export const handleAuthStateChange = (event: string, currentSession: Session | null) => {
  logAuth('AUTH-HANDLER', `Starting handle auth state change for event: ${event}`, {
    level: AUTH_LOG_LEVELS.INFO,
    data: {
      hasSession: !!currentSession,
      userId: currentSession?.user?.id || 'none',
      currentPath: window.location.pathname,
      timestamp: new Date().toISOString()
    }
  });
  
  // Skip processing if no user is logged in (for non-sign-in events)
  if (event !== 'SIGNED_IN' && !currentSession?.user) {
    logAuth('AUTH-HANDLER', `No user session for event: ${event} - skipping`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    return;
  }
  
  // For SIGNED_IN event, log additional info
  if (event === 'SIGNED_IN') {
    logAuth('AUTH-HANDLER', 'User signed in, checking tenant and subscription status', {
      level: AUTH_LOG_LEVELS.INFO
    });
  }
  
  // Prevent redirect loops by checking if we've already processed this session
  const sessionKey = `auth_processed_${currentSession?.user?.id}`;
  const currentPath = window.location.pathname;
  
  // If we've processed this session and we're already on the target path, don't redirect again
  if (currentSession?.user?.id && sessionStorage.getItem(sessionKey) === currentPath) {
    logAuth('AUTH-HANDLER', `Already processed this session for the current path: ${currentPath} - preventing redirect loop`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    return;
  }
  
  // Create a unique processing flag to ensure we're not handling the same process twice
  const processingFlag = `processing_${currentSession?.user?.id}_${Date.now()}`;
  if (sessionStorage.getItem(processingFlag)) {
    logAuth('AUTH-HANDLER', 'Already processing an auth change, preventing duplicate processing', {
      level: AUTH_LOG_LEVELS.INFO
    });
    return;
  }
  
  // Set processing flag with 10s expiry to prevent concurrent processing
  logAuth('AUTH-HANDLER', `Setting processing flag: ${processingFlag}`, {
    level: AUTH_LOG_LEVELS.DEBUG
  });
  sessionStorage.setItem(processingFlag, 'true');
  setTimeout(() => {
    logAuth('AUTH-HANDLER', `Removing expired processing flag: ${processingFlag}`, {
      level: AUTH_LOG_LEVELS.DEBUG
    });
    sessionStorage.removeItem(processingFlag);
  }, 10000);
  
  // Use setTimeout to ensure state updates complete before navigation
  setTimeout(async () => {
    logAuth('AUTH-HANDLER', 'Executing deferred auth state handler logic', {
      level: AUTH_LOG_LEVELS.INFO
    });
    if (!currentSession?.user) {
      logAuth('AUTH-HANDLER', 'No user in session, cleaning up and exiting', {
        level: AUTH_LOG_LEVELS.INFO
      });
      sessionStorage.removeItem(processingFlag);
      return;
    }
    
    try {
      logAuth('AUTH-HANDLER', `Checking user tenant for user: ${currentSession.user.id}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      // Check if user has an associated tenant
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', currentSession.user.id)
        .single();
        
      if (userError && userError.code !== 'PGRST116') {
        logAuth('AUTH-HANDLER', `Error checking user tenant: ${userError.message}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          data: userError
        });
        sessionStorage.removeItem(processingFlag);
        return;
      }
      
      // If no tenant is associated, redirect to onboarding
      if (!userData?.tenant_id) {
        logAuth('AUTH-HANDLER', 'No tenant associated, redirecting to onboarding', {
          level: AUTH_LOG_LEVELS.INFO
        });
        sessionStorage.setItem(sessionKey, '/onboarding');
        window.location.href = '/onboarding';
        return;
      }
      
      logAuth('AUTH-HANDLER', `Checking tenant subscription status for tenant: ${userData.tenant_id}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      // Check tenant subscription status - just get the fields we know exist
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('subscription_status, subscription_tier')
        .eq('id', userData.tenant_id)
        .single();
        
      if (tenantError) {
        logAuth('AUTH-HANDLER', `Error checking tenant subscription: ${tenantError.message}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          data: tenantError
        });
        sessionStorage.removeItem(processingFlag);
        return;
      }

      const needsSubscription = currentSession.user.user_metadata?.needs_subscription === true;
      logAuth('AUTH-HANDLER', `User needs subscription: ${needsSubscription}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      const returnTo = new URLSearchParams(window.location.search).get('returnTo');
      logAuth('AUTH-HANDLER', `Return URL from query params: ${returnTo || 'none'}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      // Determine if subscription is active
      const hasActiveSubscription = tenantData && 
        (tenantData.subscription_status === 'active');

      // We don't have the trial_ends_at field yet, so we'll assume no trial
      const inTrialPeriod = false;
      
      logAuth('AUTH-HANDLER', 'Subscription status:', {
        level: AUTH_LOG_LEVELS.INFO,
        data: {
          hasActiveSubscription,
          inTrialPeriod,
          subscriptionStatus: tenantData?.subscription_status || 'none',
          subscriptionTier: tenantData?.subscription_tier || 'none'
        }
      });
      
      let targetPath = '';
      
      // Redirect logic
      if (needsSubscription || (!hasActiveSubscription && !inTrialPeriod)) {
        logAuth('AUTH-HANDLER', 'User needs subscription, redirecting to payment page', {
          level: AUTH_LOG_LEVELS.INFO
        });
        targetPath = '/payment';
      } else if (returnTo) {
        logAuth('AUTH-HANDLER', `Redirecting to returnTo URL: ${returnTo}`, {
          level: AUTH_LOG_LEVELS.INFO
        });
        targetPath = decodeURIComponent(returnTo);
      } else if (window.location.pathname === '/auth') {
        logAuth('AUTH-HANDLER', 'Redirecting to dashboard', {
          level: AUTH_LOG_LEVELS.INFO
        });
        targetPath = '/dashboard';
      } else {
        // No redirect needed, stay on current page
        logAuth('AUTH-HANDLER', `No redirect needed, staying on current page: ${window.location.pathname}`, {
          level: AUTH_LOG_LEVELS.INFO
        });
        sessionStorage.removeItem(processingFlag);
        return;
      }
      
      // If we're already on the target page, don't redirect
      if (window.location.pathname === targetPath) {
        logAuth('AUTH-HANDLER', `Already on ${targetPath}, preventing redirect`, {
          level: AUTH_LOG_LEVELS.INFO
        });
        sessionStorage.removeItem(processingFlag);
        return;
      }
      
      // Store where we redirected to prevent loops
      logAuth('AUTH-HANDLER', `Setting processed path in session storage: ${targetPath}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      sessionStorage.setItem(sessionKey, targetPath);
      logAuth('AUTH-HANDLER', `Redirecting to: ${targetPath}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      window.location.href = targetPath;
      
    } catch (error) {
      logAuth('AUTH-HANDLER', 'Error during post-login checks:', {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
      sessionStorage.removeItem(processingFlag);
    }
  }, 0);
};
