
import { Session } from '@supabase/supabase-js';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { supabase } from '@/integrations/supabase/client';

/**
 * Log information about the current session state to help with debugging
 */
export function logMigrationSessionState(session: Session | null, context: string) {
  if (!session) {
    logAuth('MIGRATION_DEBUG', `${context}: No active session`, {
      level: AUTH_LOG_LEVELS.WARN,
      force: true
    });
    return;
  }
  
  logAuth('MIGRATION_DEBUG', `${context}:`, {
    level: AUTH_LOG_LEVELS.INFO,
    force: true,
    data: {
      userId: session.user?.id,
      email: session.user?.email,
      metadata: session.user?.user_metadata,
      hasNeedsSubscription: session.user?.user_metadata?.needs_subscription === true,
      hasTenantId: !!session.user?.user_metadata?.tenant_id,
      hasCompanyName: !!session.user?.user_metadata?.company_name,
      providerToken: !!session.provider_token,
      accessToken: session.access_token ? 'Present (not shown)' : 'Missing',
      refreshToken: session.refresh_token ? 'Present (not shown)' : 'Missing',
    }
  });
}

/**
 * Enhance user metadata with tenant information for sign-up flow
 */
export async function enhanceUserMetadata(tenantName: string, userId: string, tenantId: string) {
  try {
    logAuth('MIGRATION_DEBUG', `Enhancing user metadata with tenant info: ${tenantId}`, {
      level: AUTH_LOG_LEVELS.INFO,
      force: true,
      data: { tenantName, userId, tenantId }
    });
    
    // Update supabase auth user metadata
    const { error } = await supabase.auth.updateUser({
      data: { 
        tenant_id: tenantId,
        tenant_name: tenantName,
        role: 'admin' // Set initial user as admin
      }
    });
    
    if (error) {
      logAuth('MIGRATION_DEBUG', `Failed to enhance user metadata: ${error.message}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        force: true
      });
      return false;
    }
    
    return true;
  } catch (error) {
    logAuth('MIGRATION_DEBUG', `Error enhancing user metadata:`, {
      level: AUTH_LOG_LEVELS.ERROR,
      data: error,
      force: true
    });
    return false;
  }
}

/**
 * Check if a user has access based on their subscription status
 * Used by protected routes to determine if the user needs to be redirected to payment page
 */
export async function checkUserSubscriptionAccess(userId: string): Promise<{
  hasAccess: boolean;
  message: string;
}> {
  try {
    // Check if user exists in the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tenant_id, role')
      .eq('id', userId)
      .single();

    if (userError || !userData?.tenant_id) {
      logAuth('SUBSCRIPTION-CHECK', `User ${userId} not found or has no tenant`, {
        level: AUTH_LOG_LEVELS.WARN,
        force: true,
        data: { error: userError }
      });
      return {
        hasAccess: false,
        message: 'User not found or not associated with a tenant'
      };
    }

    // Get tenant subscription information
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('subscription_status, subscription_tier, trial_ends_at')
      .eq('id', userData.tenant_id)
      .single();

    if (tenantError || !tenantData) {
      logAuth('SUBSCRIPTION-CHECK', `Tenant data not found for tenant ${userData.tenant_id}`, {
        level: AUTH_LOG_LEVELS.WARN,
        force: true,
        data: { error: tenantError }
      });
      return {
        hasAccess: false,
        message: 'Tenant data not found'
      };
    }

    // Check subscription status
    if (tenantData.subscription_status === 'active') {
      return {
        hasAccess: true,
        message: 'User has active subscription'
      };
    }

    // Check trial status
    if (tenantData.subscription_status === 'trialing') {
      const trialEndsAt = tenantData.trial_ends_at 
        ? new Date(tenantData.trial_ends_at) 
        : null;

      if (trialEndsAt && trialEndsAt > new Date()) {
        return {
          hasAccess: true,
          message: 'User has active trial'
        };
      } else {
        return {
          hasAccess: false,
          message: 'Trial has expired'
        };
      }
    }

    // For all other statuses, deny access
    return {
      hasAccess: false,
      message: `Subscription status is ${tenantData.subscription_status}`
    };
  } catch (error) {
    logAuth('SUBSCRIPTION-CHECK', `Error checking subscription access:`, {
      level: AUTH_LOG_LEVELS.ERROR,
      force: true,
      data: error
    });
    
    return {
      hasAccess: false,
      message: `Error checking subscription status: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
