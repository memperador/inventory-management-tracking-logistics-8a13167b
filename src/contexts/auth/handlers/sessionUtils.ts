
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
  
  // Set processing flag with 5s expiry to prevent concurrent processing
  // Reduced from 10s to 5s to avoid long blocking periods
  setTimeout(() => {
    logAuth('SESSION-UTILS', `Removing expired processing flag: ${processingFlag}`, {
      level: AUTH_LOG_LEVELS.DEBUG
    });
    sessionStorage.removeItem(processingFlag);
  }, 5000);
  
  return processingFlag;
}

/**
 * Sets the processed path in session storage to prevent loops
 */
export function setProcessedPath(userId: string, path: string): void {
  // Force flag takes precedence over all other logic
  if (sessionStorage.getItem('force_dashboard_redirect') === 'true' && path !== '/dashboard') {
    logAuth('SESSION-UTILS', `Force dashboard redirect flag is set, overriding to /dashboard`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    path = '/dashboard';
  }
  
  // Special case for the labrat user - allow multiple dashboard redirects
  if (userId === '9e32e738-5f44-44f8-bc15-6946b27296a6' && path === '/dashboard') {
    logAuth('SESSION-UTILS', `Skipping processed path for labrat user to dashboard`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    return;
  }
  
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
  
  // Force flag overrides everything
  if (sessionStorage.getItem('force_dashboard_redirect') === 'true') {
    return false;
  }
  
  // Special case for labrat user - never consider dashboard as processed
  if (userId === '9e32e738-5f44-44f8-bc15-6946b27296a6' && 
     (currentPath === '/dashboard' || currentPath === '/auth' || currentPath === '/login')) {
    return false;
  }
  
  // Special case - never consider auth page as processed
  if (currentPath === '/auth' || currentPath === '/login') {
    return false;
  }
  
  // Get the processed path from session storage
  const sessionKey = `auth_processed_${userId}`;
  const processedPath = sessionStorage.getItem(sessionKey);
  
  // If this path is already processed, log it
  if (processedPath === currentPath) {
    logAuth('SESSION-UTILS', `Path ${currentPath} already processed for user ${userId}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
  }
  
  return processedPath === currentPath;
}

/**
 * Checks if we're already processing an auth change
 */
export function isAlreadyProcessing(userId: string | undefined): boolean {
  if (!userId) return false;
  
  // Force flag overrides everything
  if (sessionStorage.getItem('force_dashboard_redirect') === 'true') {
    return false;
  }
  
  // Special exception for labrat user to allow multiple processing attempts
  if (userId === '9e32e738-5f44-44f8-bc15-6946b27296a6') {
    // Check if we've just processed a request in the last second
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(`processing_${userId}_`)) {
        const timestamp = parseInt(key.split('_')[2], 10);
        const now = Date.now();
        // If we're processing something within the last 1 second, don't allow another process
        if (now - timestamp < 1000) {
          return true;
        }
      }
    }
    return false;
  }
  
  // For normal users, check for any processing flags
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

/**
 * Emergency clear all session storage to fix redirect loops
 */
export function emergencyClearAllAuthStorage(): void {
  logAuth('SESSION-UTILS', 'EMERGENCY: Clearing all auth session storage', {
    level: AUTH_LOG_LEVELS.WARN
  });
  
  // Set force flag
  sessionStorage.setItem('force_dashboard_redirect', 'true');
  
  // Clear all processed flags
  clearAuthSessionStorage();
}
