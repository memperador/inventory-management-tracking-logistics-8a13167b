
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Import emergency utilities
import './utils/auth/emergencyLabratLogin';
import './utils/auth/breakLoginLoop';

// Log application initialization for debugging
console.log('[MAIN] Application initializing', {
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development',
  currentPath: window.location.pathname,
  searchParams: window.location.search
});

// Make emergency recovery functions available globally
if (typeof window !== 'undefined') {
  try {
    const { emergencyLabratLogin } = require('./utils/auth/emergencyLabratLogin');
    const { breakLoginLoop } = require('./utils/auth/breakLoginLoop');
    
    (window as any).emergencyLabratLogin = emergencyLabratLogin;
    (window as any).breakLoginLoop = breakLoginLoop;
    
    console.log('[MAIN] Emergency recovery functions registered globally');
  } catch (e) {
    console.error('[MAIN] Failed to set up emergency login:', e);
  }
}

// Check for authentication loop indicators and break if needed
if (typeof window !== 'undefined') {
  const currentTime = Date.now();
  const lastRedirectAttempt = parseInt(sessionStorage.getItem('last_redirect_attempt') || '0');
  const redirectCount = parseInt(sessionStorage.getItem('redirect_count') || '0');
  
  // If redirects are happening too frequently (possible loop)
  if (lastRedirectAttempt > 0 && 
      currentTime - lastRedirectAttempt < 2000 && 
      redirectCount > 3) {
    console.warn('[MAIN] Potential redirect loop detected, activating breaker');
    sessionStorage.setItem('break_auth_loop', 'true');
    sessionStorage.setItem('redirect_count', '0');
  }
  
  // Update redirect tracking
  sessionStorage.setItem('last_redirect_attempt', currentTime.toString());
  sessionStorage.setItem('redirect_count', (redirectCount + 1).toString());
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
