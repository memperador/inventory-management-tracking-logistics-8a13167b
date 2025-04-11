
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import AuthCard from '@/components/auth/AuthCard';
import { useAuthVerification } from '@/hooks/useAuthVerification';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [navigationProcessed, setNavigationProcessed] = useState(false);
  
  const {
    verificationSent,
    setVerificationSent,
    verificationEmail,
    setVerificationEmail,
    authError,
    isResendingVerification,
    setIsResendingVerification,
    emailVerified,
    isVerifying,
    emailProvider,
    loading: verificationLoading
  } = useAuthVerification();
  
  const isLoading = authLoading || verificationLoading;
  
  // Handle signup completion
  const handleSignupComplete = (email: string) => {
    logAuth('AUTH', `Signup completed for ${email}, redirecting to onboarding`, {
      level: AUTH_LOG_LEVELS.INFO,
      force: true
    });
    setVerificationSent(true);
    setVerificationEmail(email);
  };
  
  useEffect(() => {
    // Check if user is verified and needs to go to onboarding
    if (user && emailVerified && !navigationProcessed) {
      setNavigationProcessed(true);
      
      logAuth('AUTH', `User authenticated, checking tenant and onboarding status`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true,
        data: { userId: user.id, metadata: user.user_metadata }
      });
      
      // Check if this is a new user that needs onboarding
      const checkTenantAndOnboarding = async () => {
        try {
          // First check if user has a tenant
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('tenant_id')
            .eq('id', user.id)
            .single();
          
          if (userError) {
            logAuth('AUTH', `Error fetching user tenant: ${userError.message}`, {
              level: AUTH_LOG_LEVELS.ERROR,
              force: true
            });
            return;
          }
          
          if (!userData?.tenant_id) {
            // No tenant assigned yet, new user
            logAuth('AUTH', `User has no tenant, needs subscription setup`, {
              level: AUTH_LOG_LEVELS.INFO,
              force: true
            });
            navigate('/payment');
            return;
          }
          
          // Check tenant's onboarding status
          const { data: tenantData, error: tenantError } = await supabase
            .from('tenants')
            .select('onboarding_completed, subscription_status, trial_ends_at')
            .eq('id', userData.tenant_id)
            .single();
            
          if (tenantError) {
            logAuth('AUTH', `Error fetching tenant: ${tenantError.message}`, {
              level: AUTH_LOG_LEVELS.ERROR,
              force: true
            });
            return;
          }
          
          // Check subscription status first
          const hasActiveSubscription = tenantData.subscription_status === 'active';
          const inTrialPeriod = tenantData.subscription_status === 'trialing' && 
                               tenantData.trial_ends_at && 
                               new Date(tenantData.trial_ends_at) > new Date();
                               
          if (!hasActiveSubscription && !inTrialPeriod && user.user_metadata?.needs_subscription) {
            logAuth('AUTH', `User needs subscription, redirecting to payment page`, {
              level: AUTH_LOG_LEVELS.INFO,
              force: true
            });
            navigate('/payment');
            return;
          }
          
          // Then check if onboarding is completed
          if (tenantData.onboarding_completed === false) {
            logAuth('AUTH', `User needs onboarding, redirecting to customer onboarding`, {
              level: AUTH_LOG_LEVELS.INFO,
              force: true
            });
            navigate('/customer-onboarding');
          } else {
            logAuth('AUTH', `User already onboarded, redirecting to dashboard`, {
              level: AUTH_LOG_LEVELS.INFO,
              force: true
            });
            navigate('/dashboard');
          }
        } catch (error) {
          logAuth('AUTH', `Error during tenant/onboarding check: ${error instanceof Error ? error.message : 'Unknown error'}`, {
            level: AUTH_LOG_LEVELS.ERROR,
            force: true
          });
        }
      };
      
      checkTenantAndOnboarding();
    }
    
    return () => {
      setNavigationProcessed(false);
    };
  }, [user, emailVerified, navigate]);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-inventory-blue border-t-transparent"></div>
          <p className="text-sm text-gray-500">Loading authentication status...</p>
        </div>
      ) : (
        <AuthCard 
          authError={authError}
          emailVerified={emailVerified}
          isVerifying={isVerifying}
          verificationSent={verificationSent}
          verificationEmail={verificationEmail}
          isResendingVerification={isResendingVerification}
          setIsResendingVerification={setIsResendingVerification}
          emailProvider={emailProvider}
          setVerificationSent={setVerificationSent}
          setVerificationEmail={setVerificationEmail}
          onSignupComplete={handleSignupComplete}
        />
      )}
    </div>
  );
};

export default Auth;
