
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * Handles post-login checks and redirects based on auth state changes
 */
export const handleAuthStateChange = (event: string, currentSession: Session | null) => {
  console.log('User signed in, checking tenant and subscription status');
  
  // Prevent redirect loops by checking if we've already processed this session
  const sessionKey = `auth_processed_${currentSession?.user?.id}`;
  const currentPath = window.location.pathname;
  
  // If we've processed this session and we're already on the target page, don't redirect again
  if (currentSession?.user?.id && sessionStorage.getItem(sessionKey) === currentPath) {
    console.log('Already processed this session for the current path, preventing redirect loop');
    return;
  }
  
  // Use setTimeout to ensure state updates complete before navigation
  setTimeout(async () => {
    if (!currentSession?.user) return;
    
    try {
      // Check if user has an associated tenant
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', currentSession.user.id)
        .single();
        
      if (userError && userError.code !== 'PGRST116') {
        console.error('Error checking user tenant:', userError);
        return;
      }
      
      // If no tenant is associated, redirect to onboarding
      if (!userData?.tenant_id) {
        console.log('No tenant associated, redirecting to onboarding');
        window.location.href = '/onboarding';
        sessionStorage.setItem(sessionKey, '/onboarding');
        return;
      }
      
      // Check tenant subscription status
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('subscription_status, subscription_tier, trial_ends_at')
        .eq('id', userData.tenant_id)
        .single();
        
      if (tenantError) {
        console.error('Error checking tenant subscription:', tenantError);
        return;
      }
      
      const needsSubscription = currentSession.user.user_metadata?.needs_subscription === true;
      const returnTo = new URLSearchParams(window.location.search).get('returnTo');
      
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
      
      let targetPath = '';
      
      // Redirect logic
      if (needsSubscription || (!hasActiveSubscription && !inTrialPeriod)) {
        console.log('User needs subscription, redirecting to payment page');
        targetPath = '/payment';
      } else if (returnTo) {
        console.log(`Redirecting to returnTo URL: ${returnTo}`);
        targetPath = decodeURIComponent(returnTo);
      } else if (window.location.pathname === '/auth') {
        console.log('Redirecting to dashboard');
        targetPath = '/dashboard';
      } else {
        // No redirect needed, stay on current page
        console.log('No redirect needed, staying on current page');
        return;
      }
      
      // If we're already on the target page, don't redirect
      if (window.location.pathname === targetPath) {
        console.log(`Already on ${targetPath}, preventing redirect`);
        return;
      }
      
      // Store where we redirected to prevent loops
      sessionStorage.setItem(sessionKey, targetPath);
      window.location.href = targetPath;
      
    } catch (error) {
      console.error('Error during post-login checks:', error);
    }
  }, 0);
};
