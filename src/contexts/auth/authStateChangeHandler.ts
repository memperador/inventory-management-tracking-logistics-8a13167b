
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { toast } from '@/hooks/use-toast';

// Import the modular handlers
import { 
  createTenantForNewUser, 
  checkUserTenant, 
  getTenantDetails 
} from './handlers/tenantActions';
import { 
  hasProcessedPathForSession, 
  isAlreadyProcessing, 
  setProcessingFlag, 
  removeProcessingFlag 
} from './handlers/sessionUtils';
import {
  determineRedirectPath,
  executeRedirect,
  checkSubscriptionStatus
} from './handlers/redirectHandler';
import { handleSubscriptionForNewSignup } from './handlers/subscriptionHandler';

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
  
  // Get current path
  const currentPath = window.location.pathname;
  
  // Prevent redirect loops by checking if we've already processed this session
  if (hasProcessedPathForSession(currentSession?.user?.id, currentPath)) {
    logAuth('AUTH-HANDLER', `Already processed this session for the current path: ${currentPath} - preventing redirect loop`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    return;
  }
  
  // Create a unique processing flag to ensure we're not handling the same process twice
  if (isAlreadyProcessing(currentSession?.user?.id)) {
    logAuth('AUTH-HANDLER', 'Already processing an auth change, preventing duplicate processing', {
      level: AUTH_LOG_LEVELS.INFO
    });
    return;
  }
  
  // Set processing flag
  const processingFlag = setProcessingFlag(currentSession?.user?.id);
  
  // Use setTimeout to ensure state updates complete before navigation
  setTimeout(async () => {
    logAuth('AUTH-HANDLER', 'Executing deferred auth state handler logic', {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    if (!currentSession?.user) {
      logAuth('AUTH-HANDLER', 'No user in session, cleaning up and exiting', {
        level: AUTH_LOG_LEVELS.INFO
      });
      removeProcessingFlag(processingFlag);
      return;
    }
    
    try {
      // Check if this is a brand new signup with needs_subscription flag
      const needsSubscription = currentSession.user.user_metadata?.needs_subscription === true;
      const isNewSignup = currentSession.user.app_metadata?.provider === 'email' && 
                          currentSession.user.app_metadata?.providers?.includes('email') && 
                          !currentSession.user.app_metadata?.last_sign_in_at;
      
      logAuth('AUTH-HANDLER', `User needs subscription: ${needsSubscription}, isNewSignup: ${isNewSignup}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      // For new signups, create a new tenant
      if (isNewSignup || needsSubscription) {
        const success = await createTenantForNewUser(
          currentSession.user.id,
          currentSession.access_token,
          currentSession.user.email,
          isNewSignup,
          needsSubscription
        );
        
        // If tenant creation failed with conflict, the function will handle signout and redirect
        if (!success) {
          removeProcessingFlag(processingFlag);
          return;
        }
      }
      
      // Check if user has an associated tenant
      const tenantId = await checkUserTenant(currentSession.user.id);
      
      // If no tenant is associated, redirect to onboarding
      if (!tenantId) {
        logAuth('AUTH-HANDLER', 'No tenant associated, redirecting to onboarding', {
          level: AUTH_LOG_LEVELS.INFO
        });
        executeRedirect('/onboarding', currentSession.user.id);
        removeProcessingFlag(processingFlag);
        return;
      }
      
      // Get tenant subscription details
      const tenantData = await getTenantDetails(tenantId);
      if (!tenantData) {
        logAuth('AUTH-HANDLER', 'Failed to get tenant details, exiting', {
          level: AUTH_LOG_LEVELS.ERROR
        });
        removeProcessingFlag(processingFlag);
        return;
      }
      
      // Handle subscription for new signup
      await handleSubscriptionForNewSignup(currentSession, tenantId, tenantData);
      
      // Get return URL from query params
      const returnTo = new URLSearchParams(window.location.search).get('returnTo');
      logAuth('AUTH-HANDLER', `Return URL from query params: ${returnTo || 'none'}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      // Check subscription status
      const { hasActiveSubscription, inTrialPeriod, needsSubscription: needsSub } = 
        checkSubscriptionStatus(tenantData, currentSession);
      
      // Determine redirect path
      const targetPath = determineRedirectPath({
        userId: currentSession.user.id,
        currentPath,
        returnTo,
        hasActiveSubscription,
        inTrialPeriod,
        needsSubscription: needsSub
      });
      
      // If targetPath is null, no redirect is needed
      if (!targetPath) {
        logAuth('AUTH-HANDLER', 'No redirect needed', {
          level: AUTH_LOG_LEVELS.INFO
        });
        removeProcessingFlag(processingFlag);
        return;
      }
      
      // If we're already on the target page, don't redirect
      if (currentPath === targetPath) {
        logAuth('AUTH-HANDLER', `Already on ${targetPath}, preventing redirect`, {
          level: AUTH_LOG_LEVELS.INFO
        });
        removeProcessingFlag(processingFlag);
        return;
      }
      
      // Execute redirect
      executeRedirect(targetPath, currentSession.user.id);
      
    } catch (error) {
      logAuth('AUTH-HANDLER', 'Error during post-login checks:', {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
      removeProcessingFlag(processingFlag);
    }
  }, 0);
};
