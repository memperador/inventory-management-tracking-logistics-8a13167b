
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

/**
 * Manages auth session storage to prevent duplicates and loops
 */
export function setProcessingFlag(userId: string | undefined): string {
  const processingFlag = `processing_${userId}_${Date.now()}`;
  logAuth('SESSION-UTILS', `Setting processing flag: ${processingFlag}`, {
    level: AUTH_LOG_LEVELS.DEBUG
  });
  
  sessionStorage.setItem(processingFlag, 'true');
  
  // Set processing flag with 10s expiry to prevent concurrent processing
  setTimeout(() => {
    logAuth('SESSION-UTILS', `Removing expired processing flag: ${processingFlag}`, {
      level: AUTH_LOG_LEVELS.DEBUG
    });
    sessionStorage.removeItem(processingFlag);
  }, 10000);
  
  return processingFlag;
}

/**
 * Sets the processed path in session storage to prevent loops
 */
export function setProcessedPath(userId: string, path: string): void {
  const sessionKey = `auth_processed_${userId}`;
  logAuth('SESSION-UTILS', `Setting processed path in session storage: ${path}`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  sessionStorage.setItem(sessionKey, path);
}

/**
 * Checks if we've already processed this session for the current path
 */
export function hasProcessedPathForSession(userId: string | undefined, currentPath: string): boolean {
  if (!userId) return false;
  
  const sessionKey = `auth_processed_${userId}`;
  const processedPath = sessionStorage.getItem(sessionKey);
  
  return processedPath === currentPath;
}

/**
 * Checks if we're already processing an auth change
 */
export function isAlreadyProcessing(userId: string | undefined): boolean {
  if (!userId) return false;
  
  // Look for any processing flags for this user
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith(`processing_${userId}_`)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Cleans up processing flags
 */
export function removeProcessingFlag(processingFlag: string): void {
  sessionStorage.removeItem(processingFlag);
}

/**
 * Clears all auth-related session storage items
 */
export function clearAuthSessionStorage(): void {
  const keysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (
      key.startsWith('auth_processed_') || 
      key.startsWith('processing_') || 
      key === 'login_toast_shown'
    )) {
      keysToRemove.push(key);
    }
  }
  
  // Remove items in a separate loop to avoid index issues
  keysToRemove.forEach(key => {
    logAuth('SESSION-UTILS', `Removing session storage key: ${key}`, {
      level: AUTH_LOG_LEVELS.DEBUG
    });
    sessionStorage.removeItem(key);
  });
}
