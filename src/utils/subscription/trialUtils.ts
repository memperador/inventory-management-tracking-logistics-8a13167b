
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { Tenant } from '@/types/tenant';

/**
 * Calculate days left in a trial
 * @param trialEndsAt ISO string date of when the trial ends
 * @returns number of days left, or 0 if trial has ended or date is invalid
 */
export const calculateTrialDaysLeft = (trialEndsAt?: string | null): number => {
  if (!trialEndsAt) return 0;
  
  try {
    const trialEndDate = new Date(trialEndsAt);
    const now = new Date();
    
    // If trial has already ended, return 0
    if (trialEndDate <= now) return 0;
    
    // Calculate days left
    const diffTime = trialEndDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (e) {
    logAuth('TRIAL-UTILS', `Error calculating trial days: ${e instanceof Error ? e.message : String(e)}`, {
      level: AUTH_LOG_LEVELS.ERROR
    });
    return 0;
  }
};

/**
 * Check if a tenant is in a valid trial period
 * @param tenant The tenant object to check
 * @returns boolean indicating whether tenant is in a valid trial period
 */
export const checkTrialStatus = (tenant?: Tenant | null): boolean => {
  if (!tenant) return false;
  
  try {
    // If not in trial status, return false
    if (tenant.subscription_status !== 'trialing') return false;
    
    // If no trial end date, return false
    if (!tenant.trial_ends_at) return false;
    
    const trialEndDate = new Date(tenant.trial_ends_at);
    const now = new Date();
    
    // Trial is valid if end date is in the future
    return trialEndDate > now;
  } catch (e) {
    logAuth('TRIAL-UTILS', `Error checking trial status: ${e instanceof Error ? e.message : String(e)}`, {
      level: AUTH_LOG_LEVELS.ERROR
    });
    return false;
  }
};

/**
 * Verify that a trial period is valid and active
 */
export const verifyTrialPeriod = (
  subscriptionStatus?: string | null,
  trialEndsAt?: string | null
): {
  isValid: boolean;
  daysLeft: number;
  message: string;
} => {
  // If there's no subscription status, the trial is invalid
  if (!subscriptionStatus) {
    return {
      isValid: false,
      daysLeft: 0,
      message: "No subscription information available"
    };
  }

  // If the subscription status isn't trialing, the trial is invalid
  if (subscriptionStatus !== 'trialing') {
    return {
      isValid: false,
      daysLeft: 0,
      message: `Subscription status is '${subscriptionStatus}', not in trial mode`
    };
  }

  // If there's no trial end date, the trial is invalid
  if (!trialEndsAt) {
    return {
      isValid: false,
      daysLeft: 0,
      message: "No trial end date specified"
    };
  }

  try {
    const trialEndDate = new Date(trialEndsAt);
    const now = new Date();
    
    // Calculate days left
    const diffTime = trialEndDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // If the trial end date is in the past, the trial has expired
    if (diffDays <= 0) {
      return {
        isValid: false,
        daysLeft: 0,
        message: "Trial has expired"
      };
    }
    
    // Trial is valid and has days remaining
    return {
      isValid: true,
      daysLeft: diffDays,
      message: `Trial is active with ${diffDays} days remaining`
    };
  } catch (e) {
    // If there was an error parsing the date, the trial is invalid
    return {
      isValid: false,
      daysLeft: 0,
      message: `Invalid trial end date: ${e instanceof Error ? e.message : String(e)}`
    };
  }
};
