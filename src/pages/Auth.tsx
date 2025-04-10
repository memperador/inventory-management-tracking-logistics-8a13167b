
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import AuthCard from '@/components/auth/AuthCard';
import { useAuthVerification } from '@/hooks/useAuthVerification';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

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
      
      logAuth('AUTH', `User authenticated, checking if new signup`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true,
        data: { userId: user.id, metadata: user.user_metadata }
      });
      
      // Check if this is a new user that needs onboarding
      if (user.user_metadata?.needs_subscription === true) {
        logAuth('AUTH', `New user needs subscription, redirecting to subscription page`, {
          level: AUTH_LOG_LEVELS.INFO,
          force: true
        });
        navigate('/subscription');
      } else if (!user.user_metadata?.onboarding_completed) {
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
