
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { checkTenantAndOnboarding } from './verification/utils/authVerificationUtils';
import { toast } from '@/hooks/use-toast';
import {
  hasProcessedPathForSession,
  setProcessedPath,
  detectAuthLoop,
  breakAuthLoop
} from '@/contexts/auth/handlers/sessionUtils';

const AuthRedirectManager: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [navigationProcessed, setNavigationProcessed] = useState(false);

  useEffect(() => {
    const handleNavigation = async () => {
      // Skip if loading, no user, or navigation already processed
      if (loading || !user || navigationProcessed) return;
      
      // Emergency bypass for loop detection
      if (sessionStorage.getItem('break_auth_loop') === 'true') {
        logAuth('AUTH-MANAGER', 'Auth loop breaker active, skipping redirects', {
          level: AUTH_LOG_LEVELS.WARN
        });
        return;
      }
      
      // Prevent processing the same path multiple times
      if (hasProcessedPathForSession(user.id, location.pathname)) {
        return;
      }
      
      // Check for auth loops
      if (detectAuthLoop()) {
        logAuth('AUTH-MANAGER', 'Auth loop detected, breaking cycle', {
          level: AUTH_LOG_LEVELS.WARN,
          force: true
        });
        
        breakAuthLoop();
        navigate('/dashboard', { replace: true });
        return;
      }
      
      try {
        // Handle direct login to auth page
        if (location.pathname === '/auth' || location.pathname === '/login') {
          const returnTo = searchParams.get('returnTo');
          const targetPath = returnTo ? decodeURIComponent(returnTo) : '/dashboard';
          
          logAuth('AUTH-MANAGER', `User authenticated on auth page, redirecting to ${targetPath}`, {
            level: AUTH_LOG_LEVELS.INFO
          });
          
          setProcessedPath(user.id, targetPath);
          navigate(targetPath, { replace: true });
          return;
        }
        
        // For all other authenticated pages, just mark as processed
        setProcessedPath(user.id, location.pathname);
        setNavigationProcessed(true);
        
      } catch (error) {
        logAuth('AUTH-MANAGER', `Error during navigation: ${error instanceof Error ? error.message : 'Unknown error'}`, {
          level: AUTH_LOG_LEVELS.ERROR
        });
      }
    };
    
    handleNavigation();
  }, [user, loading, navigate, location.pathname, navigationProcessed, searchParams]);

  return null;
};

export default AuthRedirectManager;
