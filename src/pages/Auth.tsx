
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import AuthCard from '@/components/auth/AuthCard';
import { useAuthVerification } from '@/hooks/useAuthVerification';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import AuthRedirectManager from '@/components/auth/AuthRedirectManager';
import AuthLoadingState from '@/components/auth/AuthLoadingState';

const Auth = () => {
  const { user, loading: authLoading } = useAuth();
  
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
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      {isLoading ? (
        <AuthLoadingState />
      ) : (
        <>
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
          <AuthRedirectManager />
        </>
      )}
    </div>
  );
};

export default Auth;
