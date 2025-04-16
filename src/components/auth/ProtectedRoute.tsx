
import React, { ReactNode, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { UserRole } from '@/types/roles';
import { useProtectedRouteGuard } from '@/hooks/auth/useProtectedRouteGuard';
import { LoadingScreen } from './LoadingScreen';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

interface ProtectedRouteProps {
  requiredRoles?: UserRole[];
  redirectTo?: string;
  children?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRoles = [],
  redirectTo = '/auth',
  children
}) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const {
    isLoading,
    isAuthenticated,
    needsSubscription,
    needsOnboarding,
    hasRequiredRole,
    user
  } = useProtectedRouteGuard(requiredRoles);

  // Prevent redirect loops with a safety check
  useEffect(() => {
    // Check if we're being repeatedly redirected (potential loop)
    const redirectCount = parseInt(sessionStorage.getItem('redirect_count') || '0') + 1;
    
    sessionStorage.setItem('redirect_count', redirectCount.toString());
    sessionStorage.setItem('last_redirect_time', Date.now().toString());
    
    // If too many redirects in a short time, break the cycle
    if (redirectCount > 5) {
      const lastTime = parseInt(sessionStorage.getItem('last_redirect_time') || '0');
      const timeDiff = Date.now() - lastTime;
      
      if (timeDiff < 3000) {
        // Likely in a loop - apply emergency break
        logAuth('PROTECTED-ROUTE', 'Potential redirect loop detected, applying emergency break', {
          level: AUTH_LOG_LEVELS.WARN,
          force: true
        });
        
        // Force clear all counters
        sessionStorage.removeItem('redirect_count');
        
        // Set bypass flags
        sessionStorage.setItem('bypass_auth_checks', 'true');
        sessionStorage.setItem('breaking_redirect_loop', 'true');
        
        // If this is a labrat user, mark routes as processed
        if (user?.email === 'labrat@iaware.com') {
          sessionStorage.setItem(`auth_processed_${user.id}_/dashboard`, 'true');
          sessionStorage.setItem(`force_dashboard_redirect`, 'true');
        }
      }
    }
    
    // Reset counter after 5 seconds of no redirects
    const resetTimer = setTimeout(() => {
      sessionStorage.setItem('redirect_count', '0');
    }, 5000);
    
    return () => clearTimeout(resetTimer);
  }, [currentPath, user]);
  
  // Show loading screen while checking authentication and permissions
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  // Emergency bypass for breaking redirect loops
  if (sessionStorage.getItem('bypass_auth_checks') === 'true' && 
      sessionStorage.getItem('breaking_redirect_loop') === 'true') {
    logAuth('PROTECTED-ROUTE', 'Emergency bypass activated, allowing access', {
      level: AUTH_LOG_LEVELS.WARN
    });
    // Clear the emergency flag after use
    setTimeout(() => {
      sessionStorage.removeItem('breaking_redirect_loop');
    }, 1000);
    return children ? <>{children}</> : <Outlet />;
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    const returnPath = encodeURIComponent(currentPath + location.search);
    logAuth('PROTECTED-ROUTE', `Redirecting unauthenticated user to ${redirectTo}?returnTo=${returnPath}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    return <Navigate to={`${redirectTo}?returnTo=${returnPath}`} replace />;
  }

  // Check onboarding status - skip if we're already on onboarding pages
  if (needsOnboarding && 
      currentPath !== '/onboarding' && 
      currentPath !== '/customer-onboarding' && 
      currentPath !== '/payment') {
    logAuth('PROTECTED-ROUTE', `Redirecting user ${user?.id} to customer onboarding page`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    return <Navigate to="/customer-onboarding" replace />;
  }

  // Check subscription status - skip if we're already on subscription or onboarding pages
  if (needsSubscription && 
      currentPath !== '/payment' && 
      currentPath !== '/customer-onboarding' && 
      currentPath !== '/onboarding') {
    logAuth('PROTECTED-ROUTE', `Redirecting user ${user?.id} to payment page`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    return <Navigate to="/payment" replace />;
  }

  // Check role permissions if required
  if (!hasRequiredRole) {
    logAuth('PROTECTED-ROUTE', `User ${user?.id} doesn't have required roles (${requiredRoles.join(', ')})`, {
      level: AUTH_LOG_LEVELS.WARN
    });
    return <Navigate to="/unauthorized" replace />;
  }

  // Render children or outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
