
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { supabase } from '@/integrations/supabase/client';

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
