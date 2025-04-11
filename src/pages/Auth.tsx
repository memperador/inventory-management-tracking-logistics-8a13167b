
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import AuthCard from '@/components/auth/AuthCard';
import { useAuthVerification } from '@/hooks/useAuthVerification';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import AuthRedirectManager from '@/components/auth/AuthRedirectManager';
import AuthLoadingState from '@/components/auth/AuthLoadingState';
import { LABRAT_EMAIL } from '@/utils/auth/labratUserUtils';
import { emergencyFixLabratAdmin } from '@/utils/admin/fixLabratAdmin';

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
  
  // Special handling for labrat user on auth page
  useEffect(() => {
    // Check if we're coming back to auth page after a labrat login attempt
    const labratLoginDetected = sessionStorage.getItem('labrat_login_detected');
    
    if (labratLoginDetected) {
      logAuth('AUTH-PAGE', 'Labrat login detected but redirected back to auth page, applying emergency fix', {
        level: AUTH_LOG_LEVELS.WARN
      });
      
      // Remove the flag to prevent infinite loops
      sessionStorage.removeItem('labrat_login_detected');
      
      // Run emergency fix with slight delay
      setTimeout(() => {
        emergencyFixLabratAdmin();
      }, 500);
    }
    
    // Check URL for email parameter
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    
    // If email is labrat, prepare for special handling
    if (emailParam === LABRAT_EMAIL) {
      logAuth('AUTH-PAGE', 'Labrat email detected in URL params, setting up special handling', {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      sessionStorage.setItem('labrat_login_attempt', 'true');
      sessionStorage.setItem('force_dashboard_redirect', 'true');
    }
  }, []);
  
  // Handle signup completion
  const handleSignupComplete = (email: string) => {
    logAuth('AUTH', `Signup completed for ${email}, redirecting to onboarding`, {
      level: AUTH_LOG_LEVELS.INFO,
      force: true
    });
    
    // Special handling for labrat signup
    if (email === LABRAT_EMAIL) {
      sessionStorage.setItem('labrat_signup', 'true');
      sessionStorage.setItem('force_dashboard_redirect', 'true');
    }
    
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
