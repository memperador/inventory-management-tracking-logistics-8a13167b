
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthContext';
import AuthCard from '@/components/auth/AuthCard';
import { useAuthVerification } from '@/components/auth/verification/useAuthVerification';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [navigated, setNavigated] = useState(false);
  
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
    // Prevent multiple redirects
    if (navigated) return;
    
    // If user is authenticated and email is confirmed
    if (user) {
      if (user.email && !user.email_confirmed_at && !searchParams.get('returnTo')) {
        // If email not confirmed and no returnTo parameter, stay on auth page for email verification
        console.log("User authenticated but email not confirmed, staying on auth page");
        return;
      }
      
      // Mark that we've initiated a navigation to prevent multiple redirects
      setNavigated(true);
      
      const returnTo = searchParams.get('returnTo');
      if (returnTo) {
        console.log(`Redirecting to: ${returnTo}`);
        navigate(decodeURIComponent(returnTo), { replace: true });
      } else {
        console.log("Redirecting to dashboard");
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate, searchParams, navigated]);
  
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
