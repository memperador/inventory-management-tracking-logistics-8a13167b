
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthContext';
import AuthCard from '@/components/auth/AuthCard';
import { useAuthVerification } from '@/hooks/useAuthVerification';

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
  
  // Combine all loading states
  const isLoading = authLoading || verificationLoading;
  
  useEffect(() => {
    // Only an empty effect to handle cleanup
    return () => {
      setNavigationProcessed(false);
    };
  }, []);
  
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
        />
      )}
    </div>
  );
};

export default Auth;
