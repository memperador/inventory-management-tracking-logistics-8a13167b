
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
  
  // Add a check for redirect loop
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  
  // Special effect for retry prevention
  useEffect(() => {
    // If we've tried to navigate too many times, stop trying to prevent loops
    if (redirectAttempts > 3) {
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
      setNavigationProcessed(true);
      
      // Add loop prevention
      setRedirectAttempts(prev => prev + 1);
      
      // Emergency bailout if we detect we're in a loop
      if (sessionStorage.getItem('bypass_auth_checks')) {
        logAuth('AUTH', 'Using bypass_auth_checks flag to skip redirect checks', {
          level: AUTH_LOG_LEVELS.WARN,
          force: true
        });
        return;
      }
      
      logAuth('AUTH', `User authenticated, checking tenant and onboarding status`, {
        level: AUTH_LOG_LEVELS.INFO,
        data: { userId: user.id, metadata: user.user_metadata }
      });

      // Special handling for test users
      if (user.email === LABRAT_EMAIL) {
        logAuth('AUTH', 'Test user detected, forcing dashboard redirect', {
          level: AUTH_LOG_LEVELS.INFO
        });
        
        // If we're already on dashboard, don't redirect
        if (location.pathname === '/dashboard') {
          return;
        }
        
        // Add special flags
        sessionStorage.setItem('bypass_auth_checks', 'true');
        
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
            // Show toast only for certain redirects
            if (!needsSubscription && !needsOnboarding) {
              toast({
                title: "Welcome back!",
                description: "You've been signed in successfully.",
              });
            }
            
            navigate(finalPath, { replace: true });
          }
        } catch (error) {
          logAuth('AUTH', `Error during navigation processing: ${error instanceof Error ? error.message : 'Unknown error'}`, {
            level: AUTH_LOG_LEVELS.ERROR
          });
        }
      };
      
      processNavigation();
    }
    
    return () => {
      setNavigationProcessed(false);
    };
  }, [user, loading, navigate, searchParams, location.pathname, redirectAttempts]);
  
  // This component doesn't render anything, it just handles the navigation logic
  return null;
};

export default AuthRedirectManager;
