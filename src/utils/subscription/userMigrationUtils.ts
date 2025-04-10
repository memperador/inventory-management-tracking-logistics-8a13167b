
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { Session } from '@supabase/supabase-js';

/**
 * Helper function to debug migration session state
 */
export const logMigrationSessionState = (session: Session | null, message: string) => {
  if (!session) {
    logAuth('MIGRATION_SESSION', `${message}: No active session`, {
      level: AUTH_LOG_LEVELS.WARN,
      force: true
    });
    return;
  }

  const userMeta = session?.user?.user_metadata || {};
  const tenantId = userMeta.tenant_id;
  
  logAuth('MIGRATION_SESSION', `${message}`, {
    level: AUTH_LOG_LEVELS.INFO,
    force: true,
    data: {
      userId: session.user?.id,
      email: session.user?.email,
      tenantId: tenantId || 'none',
      hasRefreshToken: !!session.refresh_token,
      tokenExpiry: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'unknown',
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
