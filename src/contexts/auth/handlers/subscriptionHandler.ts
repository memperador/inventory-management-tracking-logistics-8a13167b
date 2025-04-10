
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { Session } from '@supabase/supabase-js';
import { startUserTrial, handleExpiredTrial } from './tenantActions';

/**
 * Checks and handles subscription status for new signups
 */
export async function handleSubscriptionForNewSignup(
  session: Session | null,
  tenantId: string,
  tenantData: any
) {
  if (!session?.user) return;
  
  // Check if this is a brand new signup with needs_subscription flag
  const needsSubscription = session.user.user_metadata?.needs_subscription === true;
  const noActiveSubscription = tenantData && 
    tenantData.subscription_status !== 'active' && 
    tenantData.subscription_status !== 'trialing';
  
  logAuth('SUBSCRIPTION-HANDLER', `User needs subscription: ${needsSubscription}, noActiveSubscription: ${noActiveSubscription}`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  
  // If this is a new signup with no subscription yet, start a trial
  if (needsSubscription && (!tenantData?.subscription_status || tenantData?.subscription_status === 'inactive')) {
    await startUserTrial(tenantId);
    return true;
  }
  
  // If trial has expired, update the status
  if (tenantData && 
    tenantData.subscription_status === 'trialing' && 
    tenantData.trial_ends_at) {
    
    await handleExpiredTrial(tenantId, tenantData.trial_ends_at);
    return true;
  }
  
  return false;
}

/**
 * Checks if a user is in a valid trial period
 */
export function checkTrialStatus(tenantData: any): boolean {
  if (!tenantData) return false;
  
  // Add additional guard clause to ensure trial_ends_at is a valid date string
  if (!tenantData.trial_ends_at) return false;
  
  try {
    const trialEndDate = new Date(tenantData.trial_ends_at);
    // Verify trial end date is valid and in the future
    if (isNaN(trialEndDate.getTime())) return false;
    
    return tenantData.subscription_status === 'trialing' && trialEndDate > new Date();
  } catch (error) {
    logAuth('SUBSCRIPTION-HANDLER', `Error checking trial status: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      level: AUTH_LOG_LEVELS.ERROR
    });
    return false;
  }
}

/**
 * Calculate days left in trial period with proper validation
 */
export function calculateTrialDaysLeft(trialEndsAt: string | null | undefined): number {
  if (!trialEndsAt) return 0;
  
  try {
    const endDate = new Date(trialEndsAt);
    const now = new Date();
    
    // Validate end date is valid
    if (isNaN(endDate.getTime())) return 0;
    
    // Calculate days difference - use Math.ceil to give benefit of partial days
    const diffTime = endDate.getTime() - now.getTime();
    if (diffTime <= 0) return 0;
    
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    logAuth('SUBSCRIPTION-HANDLER', `Error calculating trial days left: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      level: AUTH_LOG_LEVELS.ERROR
    });
    return 0;
  }
}
