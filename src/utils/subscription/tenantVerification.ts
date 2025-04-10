
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { supabase } from '@/integrations/supabase/client';
import { checkTrialStatus, calculateTrialDaysLeft } from './trialUtils';

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
