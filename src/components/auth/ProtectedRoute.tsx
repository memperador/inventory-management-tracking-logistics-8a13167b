
import React, { ReactNode, useEffect, useState, useRef } from 'react';
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
  
  // Use refs to prevent redundant checks and potential infinite loops
  const processedRef = useRef(false);
  const checkingSubscriptionRef = useRef(false);
  
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
  }, [user, loading, location.pathname, tenantLoading, currentTenant, isRoleLoading, requiredRoles]);
  
  // Separate effect for subscription checking to prevent infinite loops
  useEffect(() => {
    // Skip if already checking, already checked, or data is still loading
    if (
      checkingSubscriptionRef.current || 
      checkedSubscription || 
      loading || 
      tenantLoading || 
      isRoleLoading || 
      !user?.id ||
      processedRef.current
    ) {
      return;
    }
    
    const checkSubscription = async () => {
      try {
        // Set checking flag to prevent concurrent checks
        checkingSubscriptionRef.current = true;
        
        // Skip subscription check for these routes
        if (
          location.pathname === '/payment' ||
          location.pathname === '/auth' ||
          location.pathname === '/unauthorized' ||
          location.pathname === '/logout'
        ) {
          setCheckedSubscription(true);
          checkingSubscriptionRef.current = false;
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
        
      } catch (error) {
        logAuth('SUBSCRIPTION-CHECK', 'Error checking subscription', {
          level: AUTH_LOG_LEVELS.ERROR,
          data: error
        });
        // In case of error, still mark as checked to prevent repeated failures
        setCheckedSubscription(true);
      } finally {
        checkingSubscriptionRef.current = false;
      }
    };
    
    checkSubscription();
  }, [user, loading, location.pathname, tenantLoading, isRoleLoading]);
  
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

  // Mark as processed once we've done all checks
  processedRef.current = true;
  
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
