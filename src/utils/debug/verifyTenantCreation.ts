
import { supabase } from '@/integrations/supabase/client';
import { logAuth, AUTH_LOG_LEVELS } from './authLogger';

export interface TenantVerificationResult {
  success: boolean;
  userId: string | null;
  tenantId: string | null;
  tenantName: string | null;
  subscriptionStatus: string | null;
  subscriptionTier: string | null;
  trialEndsAt: string | null;
  userRole: string | null;
  error?: string;
  details?: Record<string, any>;
}

/**
 * Comprehensive verification of tenant creation and user association
 * Useful for debugging subscription and tenant migration issues
 */
export const verifyTenantCreation = async (userId?: string): Promise<TenantVerificationResult> => {
  try {
    // Start with the current user if no userId is provided
    if (!userId) {
      const { data: userData } = await supabase.auth.getUser();
      userId = userData?.user?.id;
    }
    
    if (!userId) {
      return {
        success: false,
        userId: null,
        tenantId: null,
        tenantName: null,
        subscriptionStatus: null,
        subscriptionTier: null,
        trialEndsAt: null,
        userRole: null,
        error: 'No user ID provided or available'
      };
    }
    
    logAuth('TENANT_VERIFY', `Verifying tenant creation for user ${userId}`, {
      level: AUTH_LOG_LEVELS.INFO,
      force: true
    });
    
    // Get user-tenant relationship
    const { data: userTenantData, error: userError } = await supabase
      .from('users')
      .select('tenant_id, role')
      .eq('id', userId)
      .single();
    
    if (userError || !userTenantData?.tenant_id) {
      logAuth('TENANT_VERIFY', `User has no tenant association: ${userError?.message || 'No tenant ID found'}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        force: true,
        data: { userError }
      });
      
      return {
        success: false,
        userId,
        tenantId: null,
        tenantName: null,
        subscriptionStatus: null,
        subscriptionTier: null,
        trialEndsAt: null,
        userRole: userTenantData?.role || null,
        error: userError?.message || 'No tenant ID found for user',
        details: { userError }
      };
    }
    
    const tenantId = userTenantData.tenant_id;
    
    // Get tenant details
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();
    
    if (tenantError || !tenantData) {
      logAuth('TENANT_VERIFY', `Tenant not found: ${tenantError?.message || 'No tenant data'}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        force: true,
        data: { tenantError }
      });
      
      return {
        success: false,
        userId,
        tenantId,
        tenantName: null,
        subscriptionStatus: null,
        subscriptionTier: null,
        trialEndsAt: null,
        userRole: userTenantData.role,
        error: tenantError?.message || 'Tenant not found',
        details: { tenantError }
      };
    }
    
    // Check for other associated users (for debugging purposes)
    const { data: tenantUsers, error: usersError } = await supabase
      .from('users')
      .select('id, role')
      .eq('tenant_id', tenantId);
    
    if (usersError) {
      logAuth('TENANT_VERIFY', `Error fetching tenant users: ${usersError.message}`, {
        level: AUTH_LOG_LEVELS.WARN,
        force: true,
        data: { usersError }
      });
    }
    
    const result: TenantVerificationResult = {
      success: true,
      userId,
      tenantId,
      tenantName: tenantData.name,
      subscriptionStatus: tenantData.subscription_status,
      subscriptionTier: tenantData.subscription_tier,
      trialEndsAt: tenantData.trial_ends_at,
      userRole: userTenantData.role,
      details: {
        tenantData,
        associatedUsers: tenantUsers || [],
        userCount: tenantUsers?.length || 0
      }
    };
    
    logAuth('TENANT_VERIFY', 'Tenant verification successful', {
      level: AUTH_LOG_LEVELS.INFO,
      force: true,
      data: result
    });
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logAuth('TENANT_VERIFY', `Verification failed: ${errorMessage}`, {
      level: AUTH_LOG_LEVELS.ERROR,
      force: true,
      data: { error }
    });
    
    return {
      success: false,
      userId: null,
      tenantId: null,
      tenantName: null,
      subscriptionStatus: null,
      subscriptionTier: null,
      trialEndsAt: null,
      userRole: null,
      error: errorMessage,
      details: { error }
    };
  }
};

// Additional function to check if someone is a tenant admin
export const isTenantAdmin = async (userId?: string): Promise<boolean> => {
  try {
    const verificationResult = await verifyTenantCreation(userId);
    return verificationResult.success && verificationResult.userRole === 'admin';
  } catch (error) {
    return false;
  }
};
