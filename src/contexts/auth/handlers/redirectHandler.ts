
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { setProcessedPath } from './sessionUtils';
import { Session } from '@supabase/supabase-js';

interface RedirectParams {
  userId?: string;
  currentPath: string;
  returnTo: string | null;
  hasActiveSubscription: boolean;
  inTrialPeriod: boolean;
  needsSubscription: boolean;
  onboardingCompleted?: boolean;
}

/**
 * Determines where to redirect the user after authentication
 */
export function determineRedirectPath({
  userId,
  currentPath,
  returnTo,
  hasActiveSubscription,
  inTrialPeriod,
  needsSubscription,
  onboardingCompleted
}: RedirectParams): string | null {
  // Don't redirect if we're already on the customer onboarding page
  // This prevents redirect loops with /customer-onboarding
  if (currentPath === '/customer-onboarding') {
    logAuth('REDIRECT-HANDLER', 'Already on customer onboarding page, no redirect needed', {
      level: AUTH_LOG_LEVELS.INFO
    });
    return null;
  }
  
  // First check if onboarding is required (unless we're already on the onboarding page)
  // Force onboarding if onboardingCompleted is explicitly false (not just falsy)
  if (onboardingCompleted === false && currentPath !== '/customer-onboarding') {
    logAuth('REDIRECT-HANDLER', 'User needs onboarding, redirecting to onboarding page', {
      level: AUTH_LOG_LEVELS.INFO,
      data: {
        currentPath,
        onboardingCompleted,
        explicitFalse: onboardingCompleted === false
      }
    });
    return '/customer-onboarding';
  }
  
  // Then check subscription status
  if (needsSubscription && !hasActiveSubscription && !inTrialPeriod && currentPath !== '/payment') {
    logAuth('REDIRECT-HANDLER', 'User needs subscription, redirecting to payment page', {
      level: AUTH_LOG_LEVELS.INFO
    });
    return '/payment';
  } else if (returnTo) {
    logAuth('REDIRECT-HANDLER', `Redirecting to returnTo URL: ${returnTo}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    return decodeURIComponent(returnTo);
  } else if (currentPath === '/auth') {
    logAuth('REDIRECT-HANDLER', 'Redirecting to dashboard', {
      level: AUTH_LOG_LEVELS.INFO
    });
    return '/dashboard';
  }
  
  // No redirect needed
  logAuth('REDIRECT-HANDLER', `No redirect needed, staying on current path: ${currentPath}`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  return null;
}

/**
 * Performs the actual redirect
 */
export function executeRedirect(targetPath: string, userId?: string): void {
  logAuth('REDIRECT-HANDLER', `Redirecting to: ${targetPath}`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  
  if (userId) {
    setProcessedPath(userId, targetPath);
  }
  
  window.location.href = targetPath;
}

/**
 * Checks subscription status and determines if a redirect is needed
 */
export function checkSubscriptionStatus(tenantData: any, session: Session | null): {
  hasActiveSubscription: boolean;
  inTrialPeriod: boolean;
  needsSubscription: boolean;
  onboardingCompleted?: boolean;
} {
  // Determine if subscription is active
  const hasActiveSubscription = tenantData && tenantData.subscription_status === 'active';
  
  // Check if trial is still valid (trial_ends_at is in the future)
  const inTrialPeriod = tenantData && 
    tenantData.subscription_status === 'trialing' && 
    tenantData.trial_ends_at && 
    new Date(tenantData.trial_ends_at) > new Date();
  
  // Check if this is a brand new signup with needs_subscription flag
  const needsSubscription = session?.user?.user_metadata?.needs_subscription === true;
  
  // Check if onboarding is completed - explicitly compare with true/false
  // IMPORTANT: This logic needs to be very explicit to handle the onboarding_completed field properly
  let onboardingCompleted;
  if (tenantData && tenantData.onboarding_completed === true) {
    onboardingCompleted = true;
  } else if (tenantData && tenantData.onboarding_completed === false) {
    onboardingCompleted = false;
  } else {
    // If the value is undefined or null, default to false
    onboardingCompleted = false;
  }
  
  logAuth('SUBSCRIPTION-CHECK', 'Subscription status:', {
    level: AUTH_LOG_LEVELS.INFO,
    data: {
      hasActiveSubscription,
      inTrialPeriod,
      needsSubscription,
      onboardingCompleted,
      onboardingCompletedRawValue: tenantData?.onboarding_completed,
      subscriptionStatus: tenantData?.subscription_status || 'none',
      subscriptionTier: tenantData?.subscription_tier || 'none',
      trialEndsAt: tenantData?.trial_ends_at || 'none'
    }
  });
  
  return { hasActiveSubscription, inTrialPeriod, needsSubscription, onboardingCompleted };
}
