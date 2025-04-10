
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * Helper function to debug migration session state
 */
export const logMigrationSessionState = async (session: Session | null, message: string) => {
  if (!session) {
    logAuth('MIGRATION_SESSION', `${message}: No active session`, {
      level: AUTH_LOG_LEVELS.WARN,
      force: true
    });
    return;
  }

  const userMeta = session.user?.user_metadata || {};
  const tenantId = userMeta.tenant_id;
  
  // Try to get tenant name if possible
  let tenantName = 'unknown';
  if (tenantId) {
    try {
      const { data } = await supabase
        .from('tenants')
        .select('name')
        .eq('id', tenantId)
        .single();
      
      if (data) {
        tenantName = data.name;
      }
    } catch (error) {
      // Ignore errors in tenant name lookup
    }
  }
  
  // Try to get user role if possible
  let userRole = 'unknown';
  if (session.user?.id) {
    try {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (data) {
        userRole = data.role;
      }
    } catch (error) {
      // Ignore errors in role lookup
    }
  }
  
  logAuth('MIGRATION_SESSION', `${message}`, {
    level: AUTH_LOG_LEVELS.INFO,
    force: true,
    data: {
      userId: session.user?.id,
      email: session.user?.email,
      tenantId: tenantId || 'none',
      tenantName: tenantName,
      userRole: userRole,
      hasRefreshToken: !!session.refresh_token,
      tokenExpiry: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'unknown',
      needsSubscription: userMeta.needs_subscription === true,
      metadata: userMeta,
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Check if a user needs to be redirected to login after migration
 * This depends on implementation requirements - in most cases
 * seamless experience with session refresh is preferred
 */
export const shouldRedirectToLogin = (migrationResult: any, forceLogin = false) => {
  // By default, we don't redirect to login unless explicitly configured
  if (forceLogin) {
    logAuth('MIGRATION_FLOW', 'Force login after migration is enabled - will redirect to login', {
      level: AUTH_LOG_LEVELS.INFO,
      force: true
    });
    return true;
  }
  
  // If migration failed, no need to redirect
  if (!migrationResult?.success) {
    return false;
  }

  return false;
};

/**
 * Check if user currently has the proper subscription access
 */
export const checkUserSubscriptionAccess = async (userId: string) => {
  if (!userId) return { hasAccess: false, message: "No user ID provided" };
  
  try {
    // Get user's tenant
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', userId)
      .single();
      
    if (userError || !userData?.tenant_id) {
      return { hasAccess: false, message: "User has no tenant associated" };
    }
    
    // Get tenant subscription info
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('subscription_status, subscription_tier, trial_ends_at')
      .eq('id', userData.tenant_id)
      .single();
      
    if (tenantError || !tenant) {
      return { hasAccess: false, message: "Could not retrieve tenant information" };
    }
    
    // Check if subscription is active or in trial
    const isActive = tenant.subscription_status === 'active';
    
    // Check if trial is valid
    let trialValid = false;
    if (tenant.subscription_status === 'trialing' && tenant.trial_ends_at) {
      const trialEnd = new Date(tenant.trial_ends_at);
      trialValid = trialEnd > new Date();
    }
    
    // Log the results
    logAuth('SUBSCRIPTION_CHECK', 'Checked user subscription access', {
      level: AUTH_LOG_LEVELS.INFO,
      data: {
        userId,
        tenantId: userData.tenant_id,
        subscriptionStatus: tenant.subscription_status,
        subscriptionTier: tenant.subscription_tier,
        trialEndsAt: tenant.trial_ends_at,
        isActive,
        trialValid,
        hasAccess: isActive || trialValid
      }
    });
    
    return { 
      hasAccess: isActive || trialValid,
      message: isActive ? "Active subscription" : 
               trialValid ? "Valid trial subscription" : 
               "No active subscription or trial"
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logAuth('SUBSCRIPTION_CHECK', `Error checking subscription: ${errorMessage}`, {
      level: AUTH_LOG_LEVELS.ERROR,
      data: { error, userId }
    });
    
    return { hasAccess: false, message: `Error checking subscription: ${errorMessage}` };
  }
};
