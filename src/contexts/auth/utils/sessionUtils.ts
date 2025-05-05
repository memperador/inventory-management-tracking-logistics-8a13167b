
import { Session } from '@supabase/supabase-js';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { SecureCache } from './secureCache';

/**
 * Checks if a session token is valid and not expired
 * @param session The session to validate
 * @returns Boolean indicating if the session is valid
 */
export function isSessionValid(session: Session | null): boolean {
  if (!session) return false;
  
  // Generate a unique cache key for this session
  const cacheKey = `session_valid:${session.user.id}:${session.access_token.slice(-10)}`;
  
  // Check cache first for performance
  if (SecureCache.has(cacheKey)) {
    return SecureCache.get<boolean>(cacheKey) || false;
  }
  
  // Real validation logic
  const expiresAt = session.expires_at;
  if (!expiresAt) return false;
  
  const now = Math.floor(Date.now() / 1000);
  const isValid = expiresAt > now;
  
  // Cache result for 30 seconds
  SecureCache.set(cacheKey, isValid, 30);
  
  if (!isValid) {
    logAuth('SESSION-UTILS', 'Session token expired', {
      level: AUTH_LOG_LEVELS.WARN,
      data: { userId: session.user.id, expiresAt }
    });
  }
  
  return isValid;
}

/**
 * Checks if a session needs to be refreshed soon (within refresh window)
 * @param session The session to check
 * @param refreshWindowSeconds Time window in seconds before expiry to trigger refresh
 * @returns Boolean indicating if refresh is needed
 */
export function sessionNeedsRefresh(session: Session | null, refreshWindowSeconds = 300): boolean {
  if (!session || !session.expires_at) return false;
  
  // Generate unique cache key
  const cacheKey = `session_refresh:${session.user.id}:${session.access_token.slice(-10)}`;
  
  // Check cache first
  if (SecureCache.has(cacheKey)) {
    return SecureCache.get<boolean>(cacheKey) || false;
  }
  
  const now = Math.floor(Date.now() / 1000);
  const shouldRefresh = session.expires_at - now < refreshWindowSeconds;
  
  // Cache result for 30 seconds
  SecureCache.set(cacheKey, shouldRefresh, 30);
  
  if (shouldRefresh) {
    logAuth('SESSION-UTILS', 'Session needs refresh', {
      level: AUTH_LOG_LEVELS.INFO,
      data: { 
        userId: session.user.id,
        expiresAt: new Date(session.expires_at * 1000).toISOString(),
        timeRemaining: `${session.expires_at - now} seconds`
      }
    });
  }
  
  return shouldRefresh;
}

/**
 * Gets the time remaining for a session in seconds
 * @param session The session to check
 * @returns Number of seconds remaining or 0 if expired/invalid
 */
export function getSessionTimeRemaining(session: Session | null): number {
  if (!session || !session.expires_at) return 0;
  
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, session.expires_at - now);
}

/**
 * Cleans up the validation cache (call periodically to prevent memory leaks)
 */
export function cleanSessionCache(): void {
  // This is now handled by the SecureCache auto-expiration
}
