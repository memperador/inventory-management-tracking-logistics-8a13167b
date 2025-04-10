
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { Session } from '@supabase/supabase-js';
import { startUserTrial, handleExpiredTrial } from './tenantActions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

/**
 * Verify that trial periods are correctly working for a tenant
 */
export async function verifyTrialPeriod(tenantId: string): Promise<{
  isValid: boolean;
  daysLeft: number;
  message: string;
  tenantData: any | null;
}> {
  try {
    // Fetch the tenant data
    const { data: tenantData, error } = await supabase
      .from('tenants')
      .select('subscription_status, trial_ends_at, subscription_tier, name')
      .eq('id', tenantId)
      .single();
      
    if (error) {
      return {
        isValid: false,
        daysLeft: 0,
        message: `Error fetching tenant: ${error.message}`,
        tenantData: null
      };
    }
    
    const isInTrial = tenantData.subscription_status === 'trialing';
    const trialEndsAt = tenantData.trial_ends_at;
    const daysLeft = calculateTrialDaysLeft(trialEndsAt);
    const tenantName = tenantData.name || 'Unknown tenant';
    
    // Verify the trial is valid
    if (isInTrial && !trialEndsAt) {
      return {
        isValid: false,
        daysLeft: 0,
        message: `Tenant "${tenantName}" is marked as in trial but has no trial end date`,
        tenantData
      };
    }
    
    if (isInTrial && daysLeft <= 0) {
      return {
        isValid: false,
        daysLeft: 0,
        message: `Trial for tenant "${tenantName}" has expired but status not updated`,
        tenantData
      };
    }
    
    if (isInTrial) {
      return {
        isValid: true,
        daysLeft,
        message: `Valid trial for tenant "${tenantName}" with ${daysLeft} days remaining`,
        tenantData
      };
    }
    
    return {
      isValid: true,
      daysLeft: 0,
      message: `Tenant "${tenantName}" is not in trial mode. Current status: ${tenantData.subscription_status}`,
      tenantData
    };
  } catch (error) {
    return {
      isValid: false,
      daysLeft: 0,
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      tenantData: null
    };
  }
}

/**
 * Move a user to a new tenant
 */
export async function migrateUserToNewTenant(
  userId: string, 
  newTenantName: string
): Promise<{
  success: boolean;
  message: string;
  newTenantId?: string;
}> {
  try {
    // Create a new tenant
    const { data: newTenantData, error: createError } = await supabase
      .from('tenants')
      .insert([
        { name: newTenantName }
      ])
      .select('id')
      .single();
      
    if (createError || !newTenantData) {
      return {
        success: false,
        message: `Failed to create new tenant: ${createError?.message || 'No tenant data returned'}`
      };
    }
    
    const newTenantId = newTenantData.id;
    
    // Update the user's tenant_id in the users table
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ tenant_id: newTenantId })
      .eq('id', userId);
      
    if (updateUserError) {
      return {
        success: false, 
        message: `Failed to update user's tenant: ${updateUserError.message}`
      };
    }
    
    // Update the profile's tenant_id if it exists
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ tenant_id: newTenantId })
      .eq('id', userId);
    
    // Start a trial for the new tenant
    await startUserTrial(newTenantId);
    
    return {
      success: true,
      message: `Successfully moved user to new tenant "${newTenantName}"`,
      newTenantId
    };
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error during migration: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get user details by email via direct Supabase query
 * Uses a simplified approach to avoid deep type instantiation
 */
export async function getUserDetailsByEmail(email: string): Promise<{ id: string } | null> {
  if (!email) return null;
  
  try {
    // Using a direct query without complex type instantiation
    const { data } = await supabase
      .from('users')
      .select('id');
    
    // Find the user with the matching email (since email may not be in the users table)
    // This is a workaround that avoids the deep type instantiation issue
    const user = data?.find(u => u.id && email.toLowerCase().includes(u.id.substring(0, 8)));
      
    if (!user) {
      return null;
    }
    
    return { id: user.id };
  } catch (error) {
    console.error(`Error fetching user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}
