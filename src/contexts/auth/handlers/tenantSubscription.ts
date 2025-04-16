
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { createErrorResponse } from '@/utils/errorHandling';

/**
 * Start a trial for a user's tenant
 */
export async function startUserTrial(tenantId: string): Promise<boolean> {
  logAuth('TENANT-HANDLER', `Starting trial for tenant: ${tenantId}`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  
  try {
    // Calculate trial end date - 7 days from now
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);
    
    const { error } = await supabase
      .from('tenants')
      .update({
        subscription_tier: 'premium',
        subscription_status: 'trialing',
        trial_ends_at: trialEndsAt.toISOString()
      })
      .eq('id', tenantId);
      
    if (error) {
      logAuth('TENANT-HANDLER', `Error starting trial: ${error.message}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
      
      toast({
        title: 'Trial Activation Error',
        description: 'There was a problem activating your trial. Please try again.',
        variant: 'destructive'
      });
      
      return false;
    }
    
    logAuth('TENANT-HANDLER', `Trial started successfully for tenant: ${tenantId}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    toast({
      title: 'Trial Activated',
      description: 'Your 7-day premium trial has been activated successfully!',
    });
    
    return true;
  } catch (error) {
    logAuth('TENANT-HANDLER', `Unexpected error starting trial:`, {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error
    });
    
    // Use error handling system
    const errorResponse = createErrorResponse('SY-001', {
      message: 'Failed to start trial subscription',
      technicalDetails: error instanceof Error ? error.message : String(error),
      userGuidance: 'Please try again or contact support if the issue persists.'
    });
    
    toast({
      title: 'Trial Activation Failed',
      description: 'An unexpected error occurred while activating your trial.',
      variant: 'destructive'
    });
    
    return false;
  }
}

/**
 * Handle expired trial by updating subscription status
 */
export async function handleExpiredTrial(tenantId: string, trialEndsAt: string): Promise<boolean> {
  logAuth('TENANT-HANDLER', `Checking expired trial for tenant: ${tenantId}`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  
  try {
    const trialEndDate = new Date(trialEndsAt);
    const now = new Date();
    
    // Only update if the trial has actually expired
    if (trialEndDate <= now) {
      const { error } = await supabase
        .from('tenants')
        .update({
          subscription_status: 'inactive',
          subscription_tier: 'basic'
        })
        .eq('id', tenantId);
        
      if (error) {
        logAuth('TENANT-HANDLER', `Error updating expired trial: ${error.message}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          data: error
        });
        return false;
      }
      
      logAuth('TENANT-HANDLER', `Updated expired trial for tenant: ${tenantId}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      toast({
        title: 'Trial Expired',
        description: 'Your premium trial has expired. You have been downgraded to the basic plan.',
        variant: 'destructive', // Changed from 'warning' to valid 'destructive'
        duration: 10000 // Show for longer
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    logAuth('TENANT-HANDLER', `Unexpected error handling expired trial:`, {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error
    });
    return false;
  }
}

/**
 * Check if a user's trial is currently active
 */
export async function checkTrialStatus(tenantId: string): Promise<{
  isActive: boolean;
  daysRemaining: number;
  endDate: Date | null;
}> {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('subscription_status, trial_ends_at, subscription_tier')
      .eq('id', tenantId)
      .single();
      
    if (error || !data) {
      return { isActive: false, daysRemaining: 0, endDate: null };
    }
    
    // If not trialing, return inactive
    if (data.subscription_status !== 'trialing') {
      return { isActive: false, daysRemaining: 0, endDate: null };
    }
    
    // Check trial end date
    if (!data.trial_ends_at) {
      return { isActive: false, daysRemaining: 0, endDate: null };
    }
    
    const trialEndDate = new Date(data.trial_ends_at);
    const now = new Date();
    
    // Trial expired
    if (trialEndDate <= now) {
      // Auto-update the status if expired
      await handleExpiredTrial(tenantId, data.trial_ends_at);
      return { isActive: false, daysRemaining: 0, endDate: trialEndDate };
    }
    
    // Calculate days remaining
    const diffTime = trialEndDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return { 
      isActive: true, 
      daysRemaining: diffDays,
      endDate: trialEndDate
    };
    
  } catch (error) {
    logAuth('TENANT-HANDLER', `Error checking trial status:`, {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error
    });
    return { isActive: false, daysRemaining: 0, endDate: null };
  }
}
