
import React, { ReactNode, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { UserRole } from '@/types/roles';
import { useAuth } from '@/contexts/auth/AuthContext';
import { LoadingScreen } from './LoadingScreen';
import { hasAnyRole, hasRoleLevel } from '@/contexts/auth/utils/authorizationUtils';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

interface ProtectedRouteProps {
  requiredRoles?: UserRole[];
  requireExactRole?: boolean;
  requireRoleLevel?: UserRole;
  redirectTo?: string;
  children?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRoles = [],
  requireExactRole = false,
  requireRoleLevel,
  redirectTo = '/auth',
  children
}) => {
  const location = useLocation();
  const { user, loading } = useAuth();
  
  // Debug log for route access attempts
  useEffect(() => {
    if (!loading) {
      logAuth('PROTECTED-ROUTE', `Access attempt to ${location.pathname}: ${user ? 'authenticated' : 'unauthenticated'}`, {
        level: AUTH_LOG_LEVELS.INFO,
        data: { isAuthenticated: !!user, path: location.pathname }
      });
    }
  }, [user, loading, location.pathname]);
  
  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }
  
  // If user is not authenticated, redirect to login
  if (!user) {
    const returnPath = encodeURIComponent(location.pathname + location.search);
    
    logAuth('PROTECTED-ROUTE', `Access denied for ${location.pathname}, redirecting to ${redirectTo}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    return <Navigate to={`${redirectTo}?returnTo=${returnPath}`} replace />;
  }
  
  // For role-based access control
  if (requiredRoles.length > 0) {
    const hasPermission = hasAnyRole(user, requiredRoles);
    
    if (!hasPermission) {
      logAuth('PROTECTED-ROUTE', `User lacks required role for ${location.pathname}`, {
        level: AUTH_LOG_LEVELS.WARN,
        data: { userRole: user.user_metadata?.role, requiredRoles }
      });
      
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // If role level check is required
  if (requireRoleLevel) {
    const hasLevel = hasRoleLevel(user, requireRoleLevel);
    
    if (!hasLevel) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Render children or outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
