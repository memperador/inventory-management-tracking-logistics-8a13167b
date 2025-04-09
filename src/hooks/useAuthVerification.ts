
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { extractAuthParams, handleAuthErrors } from '@/components/auth/verification/utils/urlParamsHandler';
import { getEmailProvider } from '@/components/auth/verification/utils/emailUtils';
import { 
  handleSpaVerification,
  handleEmailVerification,
  handleSuccessfulVerification
} from '@/components/auth/verification/utils/verificationHandlers';

export function useAuthVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State variables
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailProvider, setEmailProvider] = useState<string | null>(null);
  const [processingRedirect, setProcessingRedirect] = useState(false);
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Set email provider when email changes
  useEffect(() => {
    if (verificationEmail) {
      setEmailProvider(getEmailProvider(verificationEmail));
    }
  }, [verificationEmail]);

  // Handle auth redirects, tokens and errors
  useEffect(() => {
    const handleAuthRedirects = async () => {
      // Prevent multiple calls to this handler or multiple redirect attempts
      if (processingRedirect || redirectAttempted) {
        setLoading(false);
        return;
      }
      
      setProcessingRedirect(true);
      console.log("Handling auth redirects...");
      console.log("Current URL:", window.location.href);
      
      // Extract all auth parameters from URL
      const params = extractAuthParams();
      
      // Check if we have an error in the URL
      if (params.errorCode || params.error) {
        const errorMessage = handleAuthErrors(params.errorCode, params.errorDescription);
        setAuthError(errorMessage);
        setProcessingRedirect(false);
        setLoading(false);
        return;
      }
      
      // Check for hash error parameters
      if (params.hashError) {
        setAuthError(params.hashErrorDesc || "Authentication error occurred. Please try again.");
        setProcessingRedirect(false);
        setLoading(false);
        return;
      }
      
      // Handle SPA verification (access_token in hash fragment)
      if (params.accessToken && params.hashType === 'signup') {
        console.log("Found access_token in hash, handling SPA verification");
        setRedirectAttempted(true); // Mark that we've attempted a redirect
        await handleSpaVerification(
          params.accessToken,
          params.refreshToken,
          setIsVerifying,
          setEmailVerified,
          setAuthError,
          navigate,
          setProcessingRedirect
        );
        setLoading(false);
        return;
      }
      
      // Check for email_confirmed parameter from our verification link
      if (params.emailConfirmed === 'true') {
        setRedirectAttempted(true); // Mark that we've attempted a redirect
        await handleSuccessfulVerification(
          params.newUser === 'true', 
          setEmailVerified, 
          navigate, 
          setProcessingRedirect
        );
        setLoading(false);
        return;
      }
      
      // Handle verification token in URL (legacy or fallback flow)
      if (params.token && params.type === 'signup') {
        setRedirectAttempted(true); // Mark that we've attempted a redirect
        await handleEmailVerification(
          params.token,
          params.type,
          setIsVerifying,
          setEmailVerified,
          setAuthError,
          navigate,
          setProcessingRedirect
        );
        setLoading(false);
        return;
      }
      
      // Handle password recovery flow
      if ((params.accessToken || params.token) && 
          (params.type === 'recovery' || params.hashType === 'recovery')) {
        setRedirectAttempted(true); // Mark that we've attempted a redirect
        navigate('/auth/reset-password', { replace: true });
        setProcessingRedirect(false);
        setLoading(false);
        return;
      }
      
      // If no special parameters, just finish loading
      setProcessingRedirect(false);
      setLoading(false);
    };
    
    handleAuthRedirects();
  }, [searchParams, navigate]);
  
  return {
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
    loading
  };
}

