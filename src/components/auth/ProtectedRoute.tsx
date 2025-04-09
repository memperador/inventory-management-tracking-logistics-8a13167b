
import React, { ReactNode, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthContext';
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
    if (loading || tenantLoading) {
      console.log("Auth or tenant data loading, waiting...");
    } else if (!user) {
      console.log("Unauthorized access attempt to:", location.pathname, "- Redirecting to auth");
    } else {
      console.log("User authenticated, allowing access to:", location.pathname);
      
      // Check if user needs to select a subscription plan
      const needsSubscription = user.user_metadata?.needs_subscription === true;
      if (needsSubscription && location.pathname !== '/payment') {
        console.log("User needs subscription, redirecting to payment page");
      }
    }
  }, [user, loading, location.pathname, tenantLoading]);
  
  if (loading || isRoleLoading || tenantLoading) {
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
    console.log(`Redirecting unauthenticated user to ${redirectTo}?returnTo=${currentPath}`);
    return <Navigate to={`${redirectTo}?returnTo=${currentPath}`} replace />;
  }
  
  // Check if the user needs to subscribe first
  const needsSubscription = user.user_metadata?.needs_subscription === true;
  const noActiveSubscription = currentTenant && 
                              currentTenant.subscription_status !== 'active' && 
                              (!currentTenant.trial_ends_at || new Date(currentTenant.trial_ends_at) < new Date());
                              
  if ((needsSubscription || noActiveSubscription) && location.pathname !== '/payment') {
    console.log("Redirecting user to payment page to select a plan");
    return <Navigate to="/payment" replace />;
  }
  
  // If no specific roles are required, just being authenticated is enough
  if (requiredRoles.length === 0) {
    return children ? <>{children}</> : <Outlet />;
  }
  
  // If user doesn't have the required role, show unauthorized message or redirect
  if (!hasPermission(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // User has the required role, render the child routes
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
