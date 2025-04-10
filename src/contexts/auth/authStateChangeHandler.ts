
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * Handles post-login checks and redirects based on auth state changes
 */
export const handleAuthStateChange = (event: string, currentSession: Session | null) => {
  console.log(`[AUTH-HANDLER] Starting handle auth state change for event: ${event}`, {
    hasSession: !!currentSession,
    userId: currentSession?.user?.id || 'none',
    currentPath: window.location.pathname,
    timestamp: new Date().toISOString()
  });
  
  // Skip processing if no user is logged in (for non-sign-in events)
  if (event !== 'SIGNED_IN' && !currentSession?.user) {
    console.log(`[AUTH-HANDLER] No user session for event: ${event} - skipping`);
    return;
  }
  
  // For SIGNED_IN event, log additional info
  if (event === 'SIGNED_IN') {
    console.log('[AUTH-HANDLER] User signed in, checking tenant and subscription status');
  }
  
  // Prevent redirect loops by checking if we've already processed this session
  const sessionKey = `auth_processed_${currentSession?.user?.id}`;
  const currentPath = window.location.pathname;
  
  // If we've processed this session and we're already on the target path, don't redirect again
  if (currentSession?.user?.id && sessionStorage.getItem(sessionKey) === currentPath) {
    console.log(`[AUTH-HANDLER] Already processed this session for the current path: ${currentPath} - preventing redirect loop`);
    return;
  }
  
  // Create a unique processing flag to ensure we're not handling the same process twice
  const processingFlag = `processing_${currentSession?.user?.id}_${Date.now()}`;
  if (sessionStorage.getItem(processingFlag)) {
    console.log('[AUTH-HANDLER] Already processing an auth change, preventing duplicate processing');
    return;
  }
  
  // Set processing flag with 10s expiry to prevent concurrent processing
  console.log(`[AUTH-HANDLER] Setting processing flag: ${processingFlag}`);
  sessionStorage.setItem(processingFlag, 'true');
  setTimeout(() => {
    console.log(`[AUTH-HANDLER] Removing expired processing flag: ${processingFlag}`);
    sessionStorage.removeItem(processingFlag);
  }, 10000);
  
  // Use setTimeout to ensure state updates complete before navigation
  setTimeout(async () => {
    console.log('[AUTH-HANDLER] Executing deferred auth state handler logic');
    if (!currentSession?.user) {
      console.log('[AUTH-HANDLER] No user in session, cleaning up and exiting');
      sessionStorage.removeItem(processingFlag);
      return;
    }
    
    try {
      console.log('[AUTH-HANDLER] Checking user tenant for user:', currentSession.user.id);
      // Check if user has an associated tenant
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', currentSession.user.id)
        .single();
        
      if (userError && userError.code !== 'PGRST116') {
        console.error('[AUTH-HANDLER] Error checking user tenant:', userError);
        sessionStorage.removeItem(processingFlag);
        return;
      }
      
      // If no tenant is associated, redirect to onboarding
      if (!userData?.tenant_id) {
        console.log('[AUTH-HANDLER] No tenant associated, redirecting to onboarding');
        sessionStorage.setItem(sessionKey, '/onboarding');
        window.location.href = '/onboarding';
        return;
      }
      
      console.log('[AUTH-HANDLER] Checking tenant subscription status for tenant:', userData.tenant_id);
      // Check tenant subscription status
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('subscription_status, subscription_tier, trial_ends_at')
        .eq('id', userData.tenant_id)
        .single();
        
      if (tenantError) {
        console.error('[AUTH-HANDLER] Error checking tenant subscription:', tenantError);
        sessionStorage.removeItem(processingFlag);
        return;
      }
      
      const needsSubscription = currentSession.user.user_metadata?.needs_subscription === true;
      console.log('[AUTH-HANDLER] User needs subscription:', needsSubscription);
      
      const returnTo = new URLSearchParams(window.location.search).get('returnTo');
      console.log('[AUTH-HANDLER] Return URL from query params:', returnTo || 'none');
      
      // Determine if subscription is active or in trial period
      const now = new Date();
      
      // Safe access to tenantData properties with null checks
      const trialEndsAtStr = tenantData ? 
        (tenantData && 'trial_ends_at' in tenantData ? 
          String(tenantData.trial_ends_at) : 
          null) : 
        null;
      
      const trialEndsAt = trialEndsAtStr ? new Date(trialEndsAtStr) : null;
      
      const hasActiveSubscription = tenantData ? 
        (tenantData && 'subscription_status' in tenantData ? 
          String(tenantData.subscription_status) === 'active' : 
          false) : 
        false;
      
      const inTrialPeriod = trialEndsAt && trialEndsAt > now;
      
      console.log('[AUTH-HANDLER] Subscription status:', {
        hasActiveSubscription,
        inTrialPeriod,
        trialEndsAt: trialEndsAt?.toISOString() || 'none',
        subscriptionStatus: tenantData?.subscription_status || 'none',
        subscriptionTier: tenantData?.subscription_tier || 'none'
      });
      
      let targetPath = '';
      
      // Redirect logic
      if (needsSubscription || (!hasActiveSubscription && !inTrialPeriod)) {
        console.log('[AUTH-HANDLER] User needs subscription, redirecting to payment page');
        targetPath = '/payment';
      } else if (returnTo) {
        console.log(`[AUTH-HANDLER] Redirecting to returnTo URL: ${returnTo}`);
        targetPath = decodeURIComponent(returnTo);
      } else if (window.location.pathname === '/auth') {
        console.log('[AUTH-HANDLER] Redirecting to dashboard');
        targetPath = '/dashboard';
      } else {
        // No redirect needed, stay on current page
        console.log('[AUTH-HANDLER] No redirect needed, staying on current page:', window.location.pathname);
        sessionStorage.removeItem(processingFlag);
        return;
      }
      
      // If we're already on the target page, don't redirect
      if (window.location.pathname === targetPath) {
        console.log(`[AUTH-HANDLER] Already on ${targetPath}, preventing redirect`);
        sessionStorage.removeItem(processingFlag);
        return;
      }
      
      // Store where we redirected to prevent loops
      console.log(`[AUTH-HANDLER] Setting processed path in session storage: ${targetPath}`);
      sessionStorage.setItem(sessionKey, targetPath);
      console.log(`[AUTH-HANDLER] Redirecting to: ${targetPath}`);
      window.location.href = targetPath;
      
    } catch (error) {
      console.error('[AUTH-HANDLER] Error during post-login checks:', error);
      sessionStorage.removeItem(processingFlag);
    }
  }, 0);
};
