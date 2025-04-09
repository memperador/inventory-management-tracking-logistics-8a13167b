
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { extractAuthParams, handleAuthErrors } from './utils/urlParamsHandler';
import { getEmailProvider } from './utils/emailUtils';
import { 
  handleSpaVerification,
  handleEmailVerification,
  handleSuccessfulVerification
} from './utils/verificationHandlers';

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
  
  // Set email provider when email changes
  useEffect(() => {
    if (verificationEmail) {
      setEmailProvider(getEmailProvider(verificationEmail));
    }
  }, [verificationEmail]);

  // Handle auth redirects, tokens and errors
  useEffect(() => {
    const handleAuthRedirects = async () => {
      // Prevent multiple calls to this handler
      if (processingRedirect) return;
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
        return;
      }
      
      // Check for hash error parameters
      if (params.hashError) {
        setAuthError(params.hashErrorDesc || "Authentication error occurred. Please try again.");
        setProcessingRedirect(false);
        return;
      }
      
      // Handle SPA verification (access_token in hash fragment)
      if (params.accessToken && params.hashType === 'signup') {
        console.log("Found access_token in hash, handling SPA verification");
        await handleSpaVerification(
          params.accessToken,
          params.refreshToken,
          setIsVerifying,
          setEmailVerified,
          setAuthError,
          navigate,
          setProcessingRedirect
        );
        return;
      }
      
      // Check for email_confirmed parameter from our verification link
      if (params.emailConfirmed) {
        await handleSuccessfulVerification(
          params.newUser, 
          setEmailVerified, 
          navigate, 
          setProcessingRedirect
        );
        return;
      }
      
      // Handle verification token in URL (legacy or fallback flow)
      if (params.token && params.type === 'signup') {
        await handleEmailVerification(
          params.token,
          params.type,
          setIsVerifying,
          setEmailVerified,
          setAuthError,
          navigate,
          setProcessingRedirect
        );
        return;
      }
      
      // Handle password recovery flow
      if ((params.accessToken || params.token) && 
          (params.type === 'recovery' || params.hashType === 'recovery')) {
        navigate('/auth/reset-password', { replace: true });
        setProcessingRedirect(false);
        return;
      }
      
      setProcessingRedirect(false);
    };
    
    handleAuthRedirects();
  }, [searchParams, navigate, processingRedirect]);
  
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
    emailProvider
  };
}
