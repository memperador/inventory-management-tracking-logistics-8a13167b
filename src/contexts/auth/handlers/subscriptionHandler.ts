
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
  
  return tenantData.subscription_status === 'trialing' && 
    tenantData.trial_ends_at && 
    new Date(tenantData.trial_ends_at) > new Date();
}
