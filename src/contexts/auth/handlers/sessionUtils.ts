
// Create this file to centralize session management utilities

/**
 * Check if we've already processed the current path for this user session
 */
export const hasProcessedPathForSession = (userId: string | undefined, currentPath: string): boolean => {
  if (!userId) return false;
  
  // Create a unique key for this user+path combination
  const processedKey = `auth_processed_${userId}_${currentPath}`;
  
  // Check if we already processed this path
  return sessionStorage.getItem(processedKey) === 'true';
};

/**
 * Mark a path as processed for this user session
 */
export const markPathAsProcessed = (userId: string | undefined, currentPath: string): void => {
  if (!userId) return;
  
  // Create a unique key for this user+path combination
  const processedKey = `auth_processed_${userId}_${currentPath}`;
  
  // Mark as processed
  sessionStorage.setItem(processedKey, 'true');
};

/**
 * Check if an auth change is already being processed
 */
export const isAlreadyProcessing = (userId: string | undefined): boolean => {
  if (!userId) return false;
  
  const processingKey = `processing_${userId}`;
  
  return sessionStorage.getItem(processingKey) === 'true';
};

/**
 * Set a processing flag to prevent duplicate processing
 */
export const setProcessingFlag = (userId: string | undefined): string => {
  if (!userId) return '';
  
  const processingKey = `processing_${userId}`;
  const timestamp = Date.now().toString();
  
  // Set processing flag with timestamp
  sessionStorage.setItem(processingKey, 'true');
  sessionStorage.setItem(`${processingKey}_timestamp`, timestamp);
  
  return processingKey;
};

/**
 * Remove a processing flag
 */
export const removeProcessingFlag = (processingKey: string): void => {
  if (!processingKey) return;
  
  // Remove processing flags
  sessionStorage.removeItem(processingKey);
  sessionStorage.removeItem(`${processingKey}_timestamp`);
};

/**
 * Clear all auth-related session storage
 */
export const clearAuthSessionStorage = (): void => {
  // Find all auth-related items
  const keysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (
      key.startsWith('auth_processed_') || 
      key.startsWith('processing_') ||
      key === 'login_toast_shown' ||
      key === 'redirect_count' ||
      key === 'last_redirect_attempt'
    )) {
      keysToRemove.push(key);
    }
  }
  
  // Remove items
  keysToRemove.forEach(key => {
    sessionStorage.removeItem(key);
  });
};

/**
 * Add a circuit breaker for authentication loops
 */
export const detectAuthLoop = (): boolean => {
  const currentTime = Date.now();
  const lastRedirectAttempt = parseInt(sessionStorage.getItem('last_redirect_attempt') || '0');
  const redirectCount = parseInt(sessionStorage.getItem('redirect_count') || '0');
  
  // Update redirect tracking
  sessionStorage.setItem('last_redirect_attempt', currentTime.toString());
  sessionStorage.setItem('redirect_count', (redirectCount + 1).toString());
  
  // If redirects are happening too frequently (possible loop)
  return (lastRedirectAttempt > 0 && 
          currentTime - lastRedirectAttempt < 2000 && 
          redirectCount > 3);
};

/**
 * Break an authentication loop
 */
export const breakAuthLoop = (): void => {
  // Set emergency flags to break the loop
  sessionStorage.setItem('break_auth_loop', 'true');
  sessionStorage.setItem('bypass_auth_checks', 'true');
  sessionStorage.setItem('force_dashboard_redirect', 'true');
  sessionStorage.setItem('redirect_count', '0');
  
  // Clear all auth related flags
  clearAuthSessionStorage();
};
