
import React, { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
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
  redirectTo = '/login',
  children
}) => {
  const { user, loading } = useAuth();
  const { hasPermission, isRoleLoading } = useRole();
  
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

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to={redirectTo} replace />;
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
