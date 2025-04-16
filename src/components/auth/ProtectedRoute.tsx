
import React, { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { UserRole } from '@/types/roles';
import { useAuth } from '@/contexts/auth/AuthContext';
import { LoadingScreen } from './LoadingScreen';

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
  const { user, loading } = useAuth();
  
  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }
  
  // If user is not authenticated, redirect to login
  if (!user) {
    const returnPath = encodeURIComponent(location.pathname + location.search);
    console.log(`User not authenticated, redirecting to ${redirectTo}?returnTo=${returnPath}`);
    return <Navigate to={`${redirectTo}?returnTo=${returnPath}`} replace />;
  }

  // If user wants to access protected routes while on onboarding pages, allow them
  const isOnOnboardingPages = location.pathname === '/onboarding' || 
                             location.pathname === '/customer-onboarding' ||
                             location.pathname === '/payment';
  
  // Special case for labrat user - always allow access
  const isLabrat = user.email === 'labrat@iaware.com';
  
  // Check user roles if required (simplified - would need proper role checking in a real app)
  const userRole = user.user_metadata?.role || 'user';
  const hasRequiredRole = requiredRoles.length === 0 || requiredRoles.includes(userRole as UserRole);
  
  if (!hasRequiredRole && !isLabrat) {
    console.log(`User doesn't have required roles (${requiredRoles.join(', ')})`);
    return <Navigate to="/unauthorized" replace />;
  }

  // Render children or outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
