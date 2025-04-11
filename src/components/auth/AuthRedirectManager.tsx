
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { checkTenantAndOnboarding, handleRedirect } from './verification/utils/authVerificationUtils';
import { toast } from '@/hooks/use-toast';
import { LABRAT_EMAIL, redirectLabratToDashboard, ensureLabratAdminRole } from '@/utils/auth/labratUserUtils';
import { emergencyFixLabratAdmin } from '@/utils/admin/fixLabratAdmin';

const AuthRedirectManager: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [navigationProcessed, setNavigationProcessed] = useState(false);
  
  // Add a check for redirect loop
  const [redirectAttempts, setRedirectAttempts] = useState(0);
  
  // Special effect for labrat user to force dashboard redirect on auth page
  useEffect(() => {
    if (!loading && user && user.email === LABRAT_EMAIL) {
      if (location.pathname === '/auth' || location.pathname === '/login' || location.pathname === '/') {
        logAuth('AUTH', 'Labrat user on auth page detected, force redirect to dashboard', {
          level: AUTH_LOG_LEVELS.WARN,
          force: true
        });
        
        // Give a small delay for other processes to complete
        setTimeout(() => {
          // Clear any session storage that might cause loops
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && (key.startsWith('auth_processed_') || key.startsWith('processing_'))) {
              sessionStorage.removeItem(key);
            }
          }
          
          sessionStorage.setItem('force_dashboard_redirect', 'true');
          sessionStorage.setItem('bypass_auth_checks', 'true');
          
          ensureLabratAdminRole(false).then(() => {
            navigate('/dashboard', { replace: true });
          });
        }, 100);
      }
    }
  }, [user, loading, location.pathname, navigate]);
  
  useEffect(() => {
    // Check if user is verified and needs to go to onboarding
    if (user && !navigationProcessed && !loading) {
      setNavigationProcessed(true);
      
      logAuth('AUTH', `User authenticated, checking tenant and onboarding status`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true,
        data: { userId: user.id, metadata: user.user_metadata }
      });

      // Special handling for labrat user - HIGHEST PRIORITY
      if (user.email === LABRAT_EMAIL) {
        logAuth('AUTH', 'Labrat user detected, forcing dashboard redirect', {
          level: AUTH_LOG_LEVELS.INFO,
          force: true
        });
        
        // Clear session storage items that might cause loops
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key.startsWith('auth_processed_') || key.startsWith('processing_'))) {
            sessionStorage.removeItem(key);
          }
        }
        
        // Add special flags for labrat
        sessionStorage.setItem('force_dashboard_redirect', 'true');
        sessionStorage.setItem('bypass_auth_checks', 'true');
        
        // If we're already on dashboard, don't redirect
        if (location.pathname === '/dashboard') {
          logAuth('AUTH', 'Labrat user already on dashboard, skipping redirect', {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });
          return;
        }
        
        // Always ensure labrat has admin role
        ensureLabratAdminRole(false);
        
        // Use setTimeout to ensure all state updates have completed
        setTimeout(() => {
          redirectLabratToDashboard();
        }, 100);
        
        return;
      }
      
      // Check tenant and onboarding status and redirect accordingly
      const processNavigation = async () => {
        try {
          const { needsOnboarding, needsSubscription, targetPath } = await checkTenantAndOnboarding(user.id);
          
          // Get return URL from query params
          const returnTo = searchParams.get('returnTo');
          const finalPath = handleRedirect(targetPath, returnTo);
          
          // Set a flag to prevent redirect loop
          if (redirectAttempts > 2) {
            logAuth('AUTH', 'Too many redirect attempts, possible loop detected', {
              level: AUTH_LOG_LEVELS.WARN,
              force: true
            });
            return;
          }
          
          setRedirectAttempts(prev => prev + 1);

          if (finalPath !== location.pathname) {
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
            level: AUTH_LOG_LEVELS.ERROR,
            force: true
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
