
import React, { ReactNode, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useTenant } from '@/hooks/useTenantContext';
import { UserRole } from '@/types/roles';
import { useRole } from '@/hooks/useRoleContext';

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
    console.log('[PROTECTED-ROUTE] ProtectedRoute status check', {
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
    });
    
    if (loading || tenantLoading) {
      console.log("[PROTECTED-ROUTE] Auth or tenant data loading, waiting...");
    } else if (!user) {
      console.log("[PROTECTED-ROUTE] Unauthorized access attempt to:", location.pathname, "- Redirecting to auth");
    } else {
      console.log("[PROTECTED-ROUTE] User authenticated, allowing access to:", location.pathname);
      
      // Check if user needs to select a subscription plan
      const needsSubscription = user.user_metadata?.needs_subscription === true;
      if (needsSubscription && location.pathname !== '/payment') {
        console.log("[PROTECTED-ROUTE] User needs subscription, redirecting to payment page");
      }
    }
  }, [user, loading, location.pathname, tenantLoading, currentTenant, isRoleLoading, requiredRoles]);
  
  if (loading || isRoleLoading || tenantLoading) {
    console.log('[PROTECTED-ROUTE] Still loading, showing loading indicator');
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
    console.log(`[PROTECTED-ROUTE] Redirecting unauthenticated user to ${redirectTo}?returnTo=${currentPath}`);
    return <Navigate to={`${redirectTo}?returnTo=${currentPath}`} replace />;
  }
  
  // Check if the user needs to subscribe first
  const needsSubscription = user.user_metadata?.needs_subscription === true;
  const noActiveSubscription = currentTenant && 
                              currentTenant.subscription_status !== 'active' && 
                              (!currentTenant.trial_ends_at || new Date(currentTenant.trial_ends_at) < new Date());
                              
  if ((needsSubscription || noActiveSubscription) && location.pathname !== '/payment') {
    console.log(`[PROTECTED-ROUTE] Redirecting user ${user.id} to payment page to select a plan`, {
      needsSubscription,
      hasActiveTenant: !!currentTenant,
      currentPath: location.pathname,
      subscriptionStatus: currentTenant?.subscription_status || 'none',
      trialEndsAt: currentTenant?.trial_ends_at || 'none',
      hasExpiredTrial: currentTenant?.trial_ends_at ? new Date(currentTenant.trial_ends_at) < new Date() : false
    });
    return <Navigate to="/payment" replace />;
  }
  
  // If no specific roles are required, just being authenticated is enough
  if (requiredRoles.length === 0) {
    console.log('[PROTECTED-ROUTE] No specific roles required, rendering content');
    return children ? <>{children}</> : <Outlet />;
  }
  
  // If user doesn't have the required role, show unauthorized message or redirect
  if (!hasPermission(requiredRoles)) {
    console.log(`[PROTECTED-ROUTE] User ${user.id} doesn't have required roles (${requiredRoles.join(', ')}), redirecting to unauthorized`);
    return <Navigate to="/unauthorized" replace />;
  }
  
  // User has the required role, render the child routes
  console.log(`[PROTECTED-ROUTE] User ${user.id} has required permissions, rendering content`);
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
