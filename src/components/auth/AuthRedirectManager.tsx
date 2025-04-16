
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { checkTenantAndOnboarding, handleRedirect } from './verification/utils/authVerificationUtils';
import { toast } from '@/hooks/use-toast';
import { LABRAT_EMAIL } from '@/utils/auth/labratUserUtils';

const AuthRedirectManager: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [navigationProcessed, setNavigationProcessed] = useState(false);
  
  // Add a check for redirect loop with an increased threshold
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  
  // Add a timestamp check to detect rapid redirects
  const [lastRedirectTime, setLastRedirectTime] = useState(0);
  
  useEffect(() => {
    // If we've tried to navigate too many times, stop trying to prevent loops
    if (redirectAttempts > 5) {
      logAuth('AUTH', 'Too many redirect attempts, possible loop detected. Staying on current page.', {
        level: AUTH_LOG_LEVELS.WARN,
        force: true
      });
      
      // Clear any session storage that might be causing loops
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (
          key.startsWith('auth_processed_') || 
          key.startsWith('processing_') || 
          key.startsWith('redirect_') ||
          key === 'login_toast_shown'
        )) {
          sessionStorage.removeItem(key);
        }
      }
      
      // Force reset of auth status to break loops
      if (location.pathname === '/auth' && user) {
        toast({
          title: "Authentication Loop Detected",
          description: "We've detected a possible login loop. Redirecting you to the dashboard.",
          variant: "destructive"
        });
        
        // Set a forced flag to bypass normal auth flow
        sessionStorage.setItem('bypass_auth_checks', 'true');
        sessionStorage.setItem('force_dashboard_redirect', 'true');
        
        // Force redirect to dashboard as emergency measure
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      }
    }
  }, [redirectAttempts, location.pathname, user, navigate]);
  
  useEffect(() => {
    // Check if user is verified and needs to go to onboarding
    if (user && !navigationProcessed && !loading) {
      const now = Date.now();
      
      // Check if we're getting redirected too fast (possible loop)
      if (lastRedirectTime > 0 && now - lastRedirectTime < 1000) {
        setRedirectAttempts(prev => prev + 1);
      } else {
        // Reset redirect attempts if it's been a while since last redirect
        if (now - lastRedirectTime > 5000) {
          setRedirectAttempts(0);
        }
      }
      
      setLastRedirectTime(now);
      setNavigationProcessed(true);
      
      // Emergency bailout if we detect we're in a loop
      if (sessionStorage.getItem('bypass_auth_checks') || sessionStorage.getItem('force_dashboard_redirect')) {
        logAuth('AUTH', 'Using bypass flags to skip redirect checks', {
          level: AUTH_LOG_LEVELS.WARN,
          force: true
        });
        
        // If we're on auth page, force dashboard redirect
        if (location.pathname === '/auth') {
          navigate('/dashboard', { replace: true });
        }
        return;
      }

      // Special handling for test users
      if (user.email === LABRAT_EMAIL) {
        logAuth('AUTH', 'Test user detected, forcing dashboard redirect', {
          level: AUTH_LOG_LEVELS.INFO
        });
        
        // If we're already on dashboard, don't redirect
        if (location.pathname === '/dashboard') {
          return;
        }
        
        // Force dashboard redirect for test users
        navigate('/dashboard', { replace: true });
        return;
      }
      
      // Check tenant and onboarding status and redirect accordingly
      const processNavigation = async () => {
        try {
          const { needsOnboarding, needsSubscription, targetPath } = await checkTenantAndOnboarding(user.id);
          
          // Get return URL from query params
          const returnTo = searchParams.get('returnTo');
          const finalPath = handleRedirect(targetPath, returnTo);

          // Check if we would redirect to the same page we're already on
          if (finalPath === location.pathname) {
            logAuth('AUTH', `Already on ${finalPath}, not redirecting`, {
              level: AUTH_LOG_LEVELS.INFO
            });
            return;
          }
          
          if (finalPath !== location.pathname) {
            navigate(finalPath, { replace: true });
          }
        } catch (error) {
          logAuth('AUTH', `Error during navigation processing: ${error instanceof Error ? error.message : 'Unknown error'}`, {
            level: AUTH_LOG_LEVELS.ERROR
          });
          
          // Force dashboard redirect on error to prevent loops
          if (location.pathname === '/auth') {
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 200);
          }
        }
      };
      
      processNavigation();
    }
    
    return () => {
      setNavigationProcessed(false);
    };
  }, [user, loading, navigate, searchParams, location.pathname]);
  
  // This component doesn't render anything, it just handles the navigation logic
  return null;
};

export default AuthRedirectManager;
