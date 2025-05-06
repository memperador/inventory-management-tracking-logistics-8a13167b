
/**
 * Emergency utility function that can be called from the browser console
 * to help users break out of authentication redirect loops
 */
export function breakAuthLoopManually() {
  console.log('🔄 Breaking authentication loop manually...');
  
  // Clear any auth-related session storage
  const keysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (
      key.startsWith('auth_processed_') || 
      key.startsWith('processing_') || 
      key === 'redirect_count' ||
      key === 'last_redirect_attempt'
    )) {
      keysToRemove.push(key);
    }
  }
  
  // Remove found items
  keysToRemove.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`Removed: ${key}`);
  });
  
  // Set loop breaker flags
  sessionStorage.setItem('break_auth_loop', 'true');
  sessionStorage.setItem('bypass_auth_checks', 'true');
  
  console.log('Auth loop breaker activated. Try navigating to /dashboard directly.');
  console.log('If still stuck, try clearing all site data or open in an incognito window.');
  
  return 'Auth loop breaker activated.';
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).breakAuthLoopManually = breakAuthLoopManually;
}
