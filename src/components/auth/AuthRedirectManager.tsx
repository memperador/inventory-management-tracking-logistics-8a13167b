
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { checkTenantAndOnboarding, handleRedirect } from './verification/utils/authVerificationUtils';
import { toast } from '@/hooks/use-toast';
import { LABRAT_EMAIL } from '@/utils/auth/labratUserUtils';
import {
  hasProcessedPathForSession,
  isAlreadyProcessing,
  setProcessingFlag,
  removeProcessingFlag,
  clearAuthSessionStorage,
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
      // Skip if loading or no user
      if (loading || !user || navigationProcessed) return;
      
      // Prevent processing the same path multiple times
      if (hasProcessedPathForSession(user.id, location.pathname)) {
        return;
      }
      
      // Check for auth loops
      if (detectAuthLoop()) {
        logAuth('AUTH', 'Auth loop detected, breaking cycle', {
          level: AUTH_LOG_LEVELS.WARN,
          force: true
        });
        
        breakAuthLoop();
        navigate('/dashboard', { replace: true });
        return;
      }
      
      // Set processing flag
      const processingKey = setProcessingFlag(user.id);
      
      try {
        // Special handling for test users
        if (user.email === LABRAT_EMAIL) {
          if (location.pathname !== '/dashboard') {
            navigate('/dashboard', { replace: true });
          }
          return;
        }
        
        // Check tenant and onboarding status
        const { needsOnboarding, needsSubscription } = await checkTenantAndOnboarding(user.id);
        
        // Get return URL from query params
        const returnTo = searchParams.get('returnTo');
        
        // Handle initial auth redirects
        if (location.pathname === '/auth' || location.pathname === '/login') {
          navigate(returnTo || '/dashboard', { replace: true });
          return;
        }
        
        // Handle onboarding redirects
        if (needsOnboarding && location.pathname !== '/onboarding') {
          navigate('/onboarding', { replace: true });
          return;
        }
        
        // Handle subscription redirects
        if (needsSubscription && location.pathname !== '/subscription') {
          navigate('/subscription', { replace: true });
          return;
        }
        
        setNavigationProcessed(true);
        
      } catch (error) {
        logAuth('AUTH', `Error during navigation: ${error instanceof Error ? error.message : 'Unknown error'}`, {
          level: AUTH_LOG_LEVELS.ERROR,
          force: true
        });
        
        // On error, try to redirect to dashboard as fallback
        navigate('/dashboard', { replace: true });
        
      } finally {
        removeProcessingFlag(processingKey);
      }
    };
    
    handleNavigation();
  }, [user, loading, navigate, location.pathname, navigationProcessed, searchParams]);

  return null;
};

export default AuthRedirectManager;
