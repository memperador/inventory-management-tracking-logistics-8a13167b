
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Import emergency utilities
import './utils/auth/emergencyLabratLogin';
import './utils/auth/breakLoginLoop';
import { createCustomErrorResponse, handleError } from './utils/errorHandling/errorService';
import { ERROR_CATEGORIES, ERROR_SEVERITY, RECOVERY_STRATEGY } from './utils/errorHandling/errorTypes';

// Log application initialization for debugging
console.log('[MAIN] Application initializing', {
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development',
  currentPath: window.location.pathname,
  searchParams: window.location.search
});

// Global error handler for uncaught exceptions
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    // Create structured error
    const errorResponse = createCustomErrorResponse({
      message: event.message || 'Uncaught error',
      category: ERROR_CATEGORIES.SYSTEM,
      severity: ERROR_SEVERITY.HIGH,
      technicalDetails: `${event.filename}:${event.lineno}:${event.colno}\n${event.error?.stack || ''}`,
      recoveryStrategy: RECOVERY_STRATEGY.NOTIFY,
      shouldLog: true,
      shouldAlert: true
    });
    
    // Handle the error
    handleError(errorResponse, { throwError: false });
    
    // Don't prevent default to allow browser's default error handling
  });
  
  // Global handler for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    // Create structured error
    const errorResponse = createCustomErrorResponse({
      message: event.reason?.message || 'Unhandled promise rejection',
      category: ERROR_CATEGORIES.SYSTEM,
      severity: ERROR_SEVERITY.HIGH,
      technicalDetails: event.reason?.stack || String(event.reason),
      recoveryStrategy: RECOVERY_STRATEGY.NOTIFY,
      shouldLog: true,
      shouldAlert: true
    });
    
    // Handle the error
    handleError(errorResponse, { throwError: false });
    
    // Don't prevent default to allow browser's default rejection handling
  });
}

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
    
    // Create a structured error
    const errorResponse = createCustomErrorResponse({
      message: 'Authentication redirect loop detected',
      category: ERROR_CATEGORIES.AUTH,
      severity: ERROR_SEVERITY.HIGH,
      recoveryStrategy: RECOVERY_STRATEGY.FALLBACK,
      userGuidance: 'The system detected a potential authentication loop and is attempting to break it.',
      shouldLog: true,
      shouldAlert: true,
      code: 'AU-002'
    });
    
    // Log the error but don't show toast yet as the app is still initializing
    handleError(errorResponse, { showToast: false });
    
    // Set emergency flags to break the loop
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
