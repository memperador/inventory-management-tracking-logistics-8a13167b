
import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { UserRole } from '@/types/roles';
import { useAuth } from '@/contexts/auth/AuthContext';
import { LoadingScreen } from './LoadingScreen';
import { hasAnyRole, hasRoleLevel } from '@/contexts/auth/utils/authorizationUtils';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { isSessionValid } from '@/contexts/auth/utils/sessionUtils';

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
  const { user, session, loading, refreshSession } = useAuth();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    const validateAccess = async () => {
      // Skip validation if still loading auth state
      if (loading) return;
      
      setIsValidating(true);
      
      try {
        // If no user, not authorized
        if (!user) {
          setIsAuthorized(false);
          setIsValidating(false);
          return;
        }
        
        // Special case for labrat user - always authorized
        if (user.email === 'labrat@iaware.com') {
          setIsAuthorized(true);
          setIsValidating(false);
          return;
        }
        
        // Check session validity
        if (session && !isSessionValid(session)) {
          // Try to refresh the session
          logAuth('PROTECTED-ROUTE', 'Invalid session detected, attempting refresh', {
            level: AUTH_LOG_LEVELS.WARN
          });
          
          try {
            await refreshSession();
          } catch (error) {
            logAuth('PROTECTED-ROUTE', 'Failed to refresh session', {
              level: AUTH_LOG_LEVELS.ERROR,
              data: error
            });
            setIsAuthorized(false);
            setIsValidating(false);
            return;
          }
        }
        
        // Check role requirements
        let hasPermission = true;
        
        if (requiredRoles.length > 0) {
          hasPermission = hasAnyRole(user, requiredRoles);
          
          logAuth('PROTECTED-ROUTE', `Role check for ${location.pathname}: ${hasPermission ? 'authorized' : 'denied'}`, {
            level: hasPermission ? AUTH_LOG_LEVELS.INFO : AUTH_LOG_LEVELS.WARN,
            data: { 
              userRole: user.user_metadata?.role, 
              requiredRoles,
              path: location.pathname
            }
          });
        }
        
        // If level check is required, verify role level
        if (requireRoleLevel && hasPermission) {
          hasPermission = hasRoleLevel(user, requireRoleLevel);
        }
        
        setIsAuthorized(hasPermission);
      } catch (error) {
        logAuth('PROTECTED-ROUTE', 'Error validating access', {
          level: AUTH_LOG_LEVELS.ERROR,
          data: error
        });
        setIsAuthorized(false);
      } finally {
        setIsValidating(false);
      }
    };
    
    validateAccess();
  }, [loading, user, session, requiredRoles, requireRoleLevel, location.pathname, refreshSession]);
  
  // Show loading screen while checking authentication or validating
  if (loading || isValidating) {
    return <LoadingScreen />;
  }
  
  // If user is not authenticated or not authorized, redirect to login
  if (!user || !isAuthorized) {
    const returnPath = encodeURIComponent(location.pathname + location.search);
    
    logAuth('PROTECTED-ROUTE', `Access denied for ${location.pathname}, redirecting to ${redirectTo}`, {
      level: AUTH_LOG_LEVELS.INFO,
      data: { isAuthenticated: !!user, isAuthorized }
    });
    
    return <Navigate to={`${redirectTo}?returnTo=${returnPath}`} replace />;
  }

  // Render children or outlet
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
