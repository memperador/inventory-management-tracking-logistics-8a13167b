
import React, { ReactNode, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/roles';
import { useRole } from '@/hooks/useRoleContext';

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
  const { user, loading } = useAuth();
  const { hasPermission, isRoleLoading } = useRole();
  const location = useLocation();
  
  // Log the authentication status and current path for debugging
  useEffect(() => {
    if (loading) {
      console.log("Auth loading, waiting...");
    } else if (!user) {
      console.log("Unauthorized access attempt to:", location.pathname, "- Redirecting to auth");
    } else {
      console.log("User authenticated, allowing access to:", location.pathname);
    }
  }, [user, loading, location.pathname]);
  
  if (loading || isRoleLoading) {
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
