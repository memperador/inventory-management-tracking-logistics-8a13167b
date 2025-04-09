
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthContext';
import AuthCard from '@/components/auth/AuthCard';
import { useAuthVerification } from '@/components/auth/verification/useAuthVerification';

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
    // Don't attempt navigation while still loading or if we've already processed a navigation
    if (isLoading || navigationProcessed) {
      return;
    }
    
    // If user is authenticated and email is confirmed or we need to show verification UI
    if (user) {
      // If email not confirmed and no returnTo parameter, stay on auth page for email verification
      if (user.email && !user.email_confirmed_at && !searchParams.get('returnTo')) {
        console.log("User authenticated but email not confirmed, staying on auth page");
        return;
      }
      
      // Set flag to prevent multiple navigation attempts
      setNavigationProcessed(true);
      
      // Check if this user needs subscription
      const needsSubscription = user.user_metadata?.needs_subscription === true;
      const returnTo = searchParams.get('returnTo');
      
      // Priority order: 
      // 1. If needs subscription -> payment page
      // 2. If returnTo parameter exists -> go to that URL
      // 3. Otherwise -> dashboard
      if (needsSubscription) {
        console.log("User needs subscription, navigating to payment page");
        navigate('/payment', { replace: true });
      } else if (returnTo) {
        console.log(`Navigating to returnTo URL: ${returnTo}`);
        navigate(decodeURIComponent(returnTo), { replace: true });
      } else {
        console.log("Navigating to dashboard");
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate, searchParams, navigationProcessed, isLoading]);
  
  // Reset navigation flag if user changes
  useEffect(() => {
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
