
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
  needsSubscription
}: RedirectParams): string | null {
  // Redirect logic
  if (needsSubscription && !hasActiveSubscription && !inTrialPeriod) {
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
  logAuth('REDIRECT-HANDLER', `No redirect needed, staying on current page: ${currentPath}`, {
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
  
  logAuth('SUBSCRIPTION-CHECK', 'Subscription status:', {
    level: AUTH_LOG_LEVELS.INFO,
    data: {
      hasActiveSubscription,
      inTrialPeriod,
      subscriptionStatus: tenantData?.subscription_status || 'none',
      subscriptionTier: tenantData?.subscription_tier || 'none',
      trialEndsAt: tenantData?.trial_ends_at || 'none'
    }
  });
  
  return { hasActiveSubscription, inTrialPeriod, needsSubscription };
}
