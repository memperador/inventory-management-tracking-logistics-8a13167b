
import { Session } from '@supabase/supabase-js';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

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
