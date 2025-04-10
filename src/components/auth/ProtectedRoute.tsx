
import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthContext';
import { useTenant } from '@/hooks/useTenantContext';
import { UserRole } from '@/types/roles';
import { useRole } from '@/hooks/useRoleContext';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { checkUserSubscriptionAccess } from '@/utils/subscription/userMigrationUtils';

interface ProtectedRouteProps {
  requiredRoles?: UserRole[];
  redirectTo?: string;
  children?: ReactNode;
  allowFreeTrialUsers?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRoles = [],
  redirectTo = '/auth',
  allowFreeTrialUsers = true,
  children
}) => {
  const { user, loading } = useAuth();
  const { currentTenant, loading: tenantLoading } = useTenant();
  const { hasPermission, isRoleLoading } = useRole();
  const location = useLocation();
  const [checkedSubscription, setCheckedSubscription] = useState(false);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  
  // Track if we've already processed this route to prevent redirect loops
  const [routeProcessed, setRouteProcessed] = useState(false);
  
  // Log the authentication status and current path for debugging
  useEffect(() => {
    if (loading || tenantLoading || isRoleLoading) return;
    
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
    
    // Check subscription status once when data is loaded
    const checkSubscription = async () => {
      if (!user?.id || checkedSubscription || routeProcessed) return;
      
      // Skip subscription check for these routes
      if (
        location.pathname === '/payment' ||
        location.pathname === '/auth' ||
        location.pathname === '/unauthorized' ||
        location.pathname === '/logout'
      ) {
        setCheckedSubscription(true);
        return;
      }
      
      // Check if user needs subscription from user metadata
      const needsSubscriptionFromMetadata = user.user_metadata?.needs_subscription === true;
      
      // Check if we have an active subscription
      const subscriptionCheck = await checkUserSubscriptionAccess(user.id);
      
      // Log subscription check results
      logAuth('SUBSCRIPTION-CHECK', 'Subscription status check in protected route', {
        level: AUTH_LOG_LEVELS.INFO,
        data: {
          path: location.pathname,
          userId: user.id,
          fromMetadata: needsSubscriptionFromMetadata,
          hasAccess: subscriptionCheck.hasAccess,
          message: subscriptionCheck.message
        }
      });
      
      // Set local state
      setNeedsSubscription(needsSubscriptionFromMetadata || !subscriptionCheck.hasAccess);
      setCheckedSubscription(true);
    };
    
    checkSubscription();
  }, [user, loading, location.pathname, tenantLoading, currentTenant, isRoleLoading, requiredRoles, checkedSubscription, routeProcessed]);
  
  // Don't render or redirect until all loading states are resolved
  if (loading || isRoleLoading || tenantLoading || !checkedSubscription) {
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
  
  // Check if user needs to subscribe or has an active subscription
  if (needsSubscription && location.pathname !== '/payment' && location.pathname !== '/customer-onboarding') {
    logAuth('PROTECTED-ROUTE', `Redirecting user ${user.id} to payment page to select a plan`, {
      level: AUTH_LOG_LEVELS.INFO,
      data: {
        needsSubscription,
        hasActiveTenant: !!currentTenant,
        currentPath: location.pathname,
        subscriptionStatus: currentTenant?.subscription_status || 'none',
      }
    });
    
    setRouteProcessed(true);
    return <Navigate to="/payment" replace />;
  }
  
  // If no specific roles are required, just being authenticated is enough
  if (requiredRoles.length === 0) {
    logAuth('PROTECTED-ROUTE', 'No specific roles required, rendering content', {
      level: AUTH_LOG_LEVELS.INFO
    });
    setRouteProcessed(true);
    return children ? <>{children}</> : <Outlet />;
  }
  
  // If user doesn't have the required role, show unauthorized message or redirect
  if (!hasPermission(requiredRoles)) {
    logAuth('PROTECTED-ROUTE', `User ${user.id} doesn't have required roles (${requiredRoles.join(', ')}), redirecting to unauthorized`, {
      level: AUTH_LOG_LEVELS.WARN
    });
    setRouteProcessed(true);
    return <Navigate to="/unauthorized" replace />;
  }
  
  // User has the required role, render the child routes
  logAuth('PROTECTED-ROUTE', `User ${user.id} has required permissions, rendering content`, {
    level: AUTH_LOG_LEVELS.INFO
  });
  setRouteProcessed(true);
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
