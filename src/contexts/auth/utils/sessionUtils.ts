
import { Session } from '@supabase/supabase-js';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

// Cache to optimize repeated session validity checks
const validationCache = new Map<string, { isValid: boolean; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds

/**
 * Checks if a session token is valid and not expired
 * @param session The session to validate
 * @returns Boolean indicating if the session is valid
 */
export function isSessionValid(session: Session | null): boolean {
  if (!session) return false;
  
  // Check cache first
  const cacheKey = `${session.user.id}:${session.access_token.slice(-10)}`;
  const cachedResult = validationCache.get(cacheKey);
  
  if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_TTL) {
    return cachedResult.isValid;
  }
  
  // Real validation logic
  const expiresAt = session.expires_at;
  if (!expiresAt) return false;
  
  const now = Math.floor(Date.now() / 1000);
  const isValid = expiresAt > now;
  
  // Cache result
  validationCache.set(cacheKey, { isValid, timestamp: Date.now() });
  
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
  
  const now = Math.floor(Date.now() / 1000);
  const shouldRefresh = session.expires_at - now < refreshWindowSeconds;
  
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
  const now = Date.now();
  
  for (const [key, value] of validationCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      validationCache.delete(key);
    }
  }
}
