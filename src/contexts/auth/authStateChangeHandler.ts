import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { toast } from '@/hooks/use-toast';
import { isSessionValid, sessionNeedsRefresh } from './utils/sessionUtils';

// Import from the modular handlers
import { 
  createTenantForNewUser
} from './handlers/createTenant';
import { 
  checkUserTenant, 
  getTenantDetails 
} from './handlers/checkTenant';
import { 
  hasProcessedPathForSession, 
  isAlreadyProcessing, 
  setProcessingFlag, 
  removeProcessingFlag,
  clearAuthSessionStorage
} from './handlers/sessionUtils';
import {
  determineRedirectPath,
  executeRedirect,
  checkSubscriptionStatus
} from './handlers/redirectHandler';
import { handleSubscriptionForNewSignup } from './handlers/subscriptionHandler';
import { LABRAT_EMAIL, LABRAT_USER_ID, ensureLabratAdminRole } from '@/utils/auth/labratUserUtils';

// Rate limiting for auth state handler to prevent excessive processing
const DEBOUNCE_TIME = 300; // ms
let lastProcessedTime = 0;
let processingQueue: Array<() => void> = [];
let isProcessingQueue = false;

/**
 * Process the queued auth state change handlers
 */
const processQueue = async () => {
  if (isProcessingQueue || processingQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  try {
    const handler = processingQueue.shift();
    if (handler) {
      await handler();
    }
  } finally {
    isProcessingQueue = false;
    
    // Process next item if queue is not empty
    if (processingQueue.length > 0) {
      setTimeout(processQueue, DEBOUNCE_TIME);
    }
  }
};

/**
 * Handles post-login checks and redirects based on auth state changes
 */
export const handleAuthStateChange = (event: string, currentSession: Session | null) => {
  // Skip processing if rate limit is hit
  const now = Date.now();
  if (now - lastProcessedTime < DEBOUNCE_TIME) {
    // Queue handler for later execution
    processingQueue.push(() => handleAuthStateChangeImpl(event, currentSession));
    
    // Start processing queue if not already processing
    if (!isProcessingQueue) {
      setTimeout(processQueue, DEBOUNCE_TIME);
    }
    return;
  }
  
  // Update last processed time
  lastProcessedTime = now;
  
  // Process immediately
  handleAuthStateChangeImpl(event, currentSession);
};

/**
 * Implementation of auth state change handler logic
 */
const handleAuthStateChangeImpl = async (event: string, currentSession: Session | null) => {
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
  
  // Validate session for security
  if (currentSession && !isSessionValid(currentSession)) {
    logAuth('AUTH-HANDLER', 'Invalid session detected, forcing refresh', {
      level: AUTH_LOG_LEVELS.WARN
    });
    
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        logAuth('AUTH-HANDLER', 'Failed to refresh session, forcing sign out', {
          level: AUTH_LOG_LEVELS.ERROR,
          data: error
        });
        
        await supabase.auth.signOut();
        toast({
          title: 'Session expired',
          description: 'Your session has expired. Please sign in again.',
          variant: 'destructive'
        });
        
        return;
      }
      
      // Continue with refreshed session
      currentSession = data.session;
    } catch (error) {
      logAuth('AUTH-HANDLER', 'Error refreshing session', {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
      return;
    }
  }
  
  // If session needs refresh soon, refresh it
  if (currentSession && sessionNeedsRefresh(currentSession)) {
    try {
      await supabase.auth.refreshSession();
      logAuth('AUTH-HANDLER', 'Session refreshed proactively', {
        level: AUTH_LOG_LEVELS.INFO
      });
    } catch (error) {
      logAuth('AUTH-HANDLER', 'Failed to refresh session proactively', {
        level: AUTH_LOG_LEVELS.WARN,
        data: error
      });
    }
  }
  
  // For SIGNED_IN event, log additional info
  if (event === 'SIGNED_IN') {
    logAuth('AUTH-HANDLER', 'User signed in, checking tenant and subscription status', {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    // Clear any session storage items that might cause loops
    clearAuthSessionStorage();
  }
  
  // Get current path
  const currentPath = window.location.pathname;
  
  // Special case for /auth path - always redirect to dashboard on successful login
  if (event === 'SIGNED_IN' && (currentPath === '/auth' || currentPath === '/login')) {
    logAuth('AUTH-HANDLER', `User signed in on auth page, redirecting to dashboard`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    // Short circuit to dashboard
    executeRedirect('/dashboard', currentSession?.user?.id);
    return;
  }
  
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
      
      // Check subscription status including onboarding status
      const { hasActiveSubscription, inTrialPeriod, needsSubscription: needsSub, onboardingCompleted } = 
        checkSubscriptionStatus(tenantData, currentSession);
      
      // Log the onboarding status from tenant data
      logAuth('AUTH-HANDLER', `Tenant onboarding status: ${onboardingCompleted === false ? 'Not completed' : onboardingCompleted === true ? 'Completed' : 'Unknown'}`, {
        level: AUTH_LOG_LEVELS.INFO,
        data: { tenantId, onboardingCompleted }
      });
      
      // Determine redirect path with onboarding status
      const targetPath = determineRedirectPath({
        userId: currentSession.user.id,
        currentPath,
        returnTo,
        hasActiveSubscription,
        inTrialPeriod,
        needsSubscription: needsSub,
        onboardingCompleted
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
