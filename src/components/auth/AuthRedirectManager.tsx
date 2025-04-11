
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { checkTenantAndOnboarding, handleRedirect } from './verification/utils/authVerificationUtils';
import { toast } from '@/hooks/use-toast';
import { LABRAT_EMAIL, redirectLabratToDashboard } from '@/utils/auth/labratUserUtils';

const AuthRedirectManager: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [navigationProcessed, setNavigationProcessed] = useState(false);
  
  useEffect(() => {
    // Check if user is verified and needs to go to onboarding
    if (user && !navigationProcessed && !loading) {
      setNavigationProcessed(true);
      
      logAuth('AUTH', `User authenticated, checking tenant and onboarding status`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true,
        data: { userId: user.id, metadata: user.user_metadata }
      });

      // Special handling for labrat user
      if (user.email === LABRAT_EMAIL) {
        logAuth('AUTH', 'Labrat user detected, forcing dashboard redirect', {
          level: AUTH_LOG_LEVELS.INFO,
          force: true
        });
        
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

          if (finalPath !== window.location.pathname) {
            if (!needsSubscription && !needsOnboarding) {
              toast({
                title: "Welcome back!",
                description: "You've been signed in successfully.",
              });
            }
            
            navigate(finalPath);
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
  }, [user, loading, navigate, searchParams]);
  
  // This component doesn't render anything, it just handles the navigation logic
  return null;
};

export default AuthRedirectManager;
