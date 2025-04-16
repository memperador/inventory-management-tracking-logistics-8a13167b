
import { Tenant } from '@/types/tenant';

/**
 * Verify if a tenant is in a valid trial period
 */
export const verifyTrialPeriod = (tenant?: Tenant | null): boolean => {
  if (!tenant || !tenant.trial_ends_at) {
    return false;
  }
  
  const trialEndDate = new Date(tenant.trial_ends_at);
  const now = new Date();
  
  return trialEndDate > now;
};

/**
 * Calculate the number of days left in a trial
 * @returns Days remaining as an integer. Returns 0 if trial is expired or not found.
 */
export const calculateTrialDaysLeft = (trialEndsAt: string | undefined | null): number => {
  if (!trialEndsAt) return 0;
  
  const trialEndDate = new Date(trialEndsAt);
  const now = new Date();
  
  // If trial has ended, return 0
  if (trialEndDate <= now) {
    return 0;
  }
  
  // Calculate difference in days
  const diffTime = trialEndDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Check if a trial is expired and should be deactivated
 */
export const isTrialExpired = (tenant?: Tenant | null): boolean => {
  if (!tenant || !tenant.trial_ends_at) {
    return false;
  }
  
  const trialEndDate = new Date(tenant.trial_ends_at);
  const now = new Date();
  
  return trialEndDate <= now && tenant.subscription_status === 'trialing';
};
