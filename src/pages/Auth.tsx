
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthContext';
import AuthCard from '@/components/auth/AuthCard';
import { useAuthVerification } from '@/components/auth/verification/useAuthVerification';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
    emailProvider
  } = useAuthVerification();
  
  useEffect(() => {
    if (user) {
      if (user.email && !user.email_confirmed_at && !searchParams.get('returnTo')) {
        return;
      }
      
      const returnTo = searchParams.get('returnTo');
      if (returnTo) {
        navigate(decodeURIComponent(returnTo), { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate, searchParams]);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
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
    </div>
  );
};

export default Auth;
