
import React, { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
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
  const {
    isLoading,
    isAuthenticated,
    needsSubscription,
    needsOnboarding,
    hasRequiredRole,
    user
  } = useProtectedRouteGuard(requiredRoles);

  // Show loading screen while checking authentication and permissions
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    const returnPath = encodeURIComponent(window.location.pathname + window.location.search);
    logAuth('PROTECTED-ROUTE', `Redirecting unauthenticated user to ${redirectTo}?returnTo=${returnPath}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    return <Navigate to={`${redirectTo}?returnTo=${returnPath}`} replace />;
  }

  // Check onboarding status
  if (needsOnboarding && 
      window.location.pathname !== '/onboarding' && 
      window.location.pathname !== '/customer-onboarding' && 
      window.location.pathname !== '/payment') {
    logAuth('PROTECTED-ROUTE', `Redirecting user ${user?.id} to customer onboarding page`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    return <Navigate to="/customer-onboarding" replace />;
  }

  // Check subscription status
  if (needsSubscription && 
      window.location.pathname !== '/payment' && 
      window.location.pathname !== '/customer-onboarding' && 
      window.location.pathname !== '/onboarding') {
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
