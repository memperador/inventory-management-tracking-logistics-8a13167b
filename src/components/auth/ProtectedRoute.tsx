
import React, { ReactNode, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useTenant } from '@/hooks/useTenantContext';
import { UserRole } from '@/types/roles';
import { useRole } from '@/hooks/useRoleContext';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

interface ProtectedRouteProps {
  requiredRoles?: UserRole[];
  redirectTo?: string;
  children?: ReactNode;
  allowFreeTrialUsers?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRoles = [],
  redirectTo = '/auth',
  allowFreeTrialUsers = false,
  children
}) => {
  const { user, loading } = useAuth();
  const { currentTenant, loading: tenantLoading } = useTenant();
  const { hasPermission, isRoleLoading } = useRole();
  const location = useLocation();
  
  // Log the authentication status and current path for debugging
  useEffect(() => {
    logAuth('PROTECTED-ROUTE', 'ProtectedRoute status check', {
      level: AUTH_LOG_LEVELS.INFO,
      data: {
        path: location.pathname,
        authLoading: loading,
        tenantLoading,
        roleLoading: isRoleLoading,
        isAuthenticated: !!user,
        userId: user?.id || 'none',
        hasActiveTenant: !!currentTenant,
        tenantId: currentTenant?.id || 'none',
        requiredRoles: requiredRoles.length > 0 ? requiredRoles : ['none'],
        timestamp: new Date().toISOString()
      }
    });
    
    if (loading || tenantLoading) {
      logAuth('PROTECTED-ROUTE', "Auth or tenant data loading, waiting...", {
        level: AUTH_LOG_LEVELS.INFO
      });
    } else if (!user) {
      logAuth('PROTECTED-ROUTE', `Unauthorized access attempt to: ${location.pathname} - Redirecting to auth`, {
        level: AUTH_LOG_LEVELS.INFO
      });
    } else {
      logAuth('PROTECTED-ROUTE', `User authenticated, allowing access to: ${location.pathname}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      // Check if user needs to select a subscription plan
      const needsSubscription = user.user_metadata?.needs_subscription === true;
      if (needsSubscription && location.pathname !== '/payment') {
        logAuth('PROTECTED-ROUTE', "User needs subscription, redirecting to payment page", {
          level: AUTH_LOG_LEVELS.INFO
        });
      }
    }
  }, [user, loading, location.pathname, tenantLoading, currentTenant, isRoleLoading, requiredRoles]);
  
  if (loading || isRoleLoading || tenantLoading) {
    logAuth('PROTECTED-ROUTE', 'Still loading, showing loading indicator', {
      level: AUTH_LOG_LEVELS.INFO
    });
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-inventory-blue border-t-transparent"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login with the return URL
  if (!user) {
    // Store the full URL including the pathname and search params for redirect after login
    const currentPath = encodeURIComponent(location.pathname + location.search);
    logAuth('PROTECTED-ROUTE', `Redirecting unauthenticated user to ${redirectTo}?returnTo=${currentPath}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    return <Navigate to={`${redirectTo}?returnTo=${currentPath}`} replace />;
  }
  
  // Check if the user needs to subscribe first
  const needsSubscription = user.user_metadata?.needs_subscription === true;
  const noActiveSubscription = currentTenant && 
                              currentTenant.subscription_status !== 'active';
                              
  if ((needsSubscription || noActiveSubscription) && location.pathname !== '/payment') {
    logAuth('PROTECTED-ROUTE', `Redirecting user ${user.id} to payment page to select a plan`, {
      level: AUTH_LOG_LEVELS.INFO,
      data: {
        needsSubscription,
        hasActiveTenant: !!currentTenant,
        currentPath: location.pathname,
        subscriptionStatus: currentTenant?.subscription_status || 'none'
      }
    });
    return <Navigate to="/payment" replace />;
  }
  
  // If no specific roles are required, just being authenticated is enough
  if (requiredRoles.length === 0) {
    logAuth('PROTECTED-ROUTE', 'No specific roles required, rendering content', {
      level: AUTH_LOG_LEVELS.INFO
    });
    return children ? <>{children}</> : <Outlet />;
  }
  
  // If user doesn't have the required role, show unauthorized message or redirect
  if (!hasPermission(requiredRoles)) {
    logAuth('PROTECTED-ROUTE', `User ${user.id} doesn't have required roles (${requiredRoles.join(', ')}), redirecting to unauthorized`, {
      level: AUTH_LOG_LEVELS.WARN
    });
    return <Navigate to="/unauthorized" replace />;
  }
  
  // User has the required role, render the child routes
  logAuth('PROTECTED-ROUTE', `User ${user.id} has required permissions, rendering content`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
