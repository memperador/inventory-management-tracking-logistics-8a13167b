
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useAuthVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailProvider, setEmailProvider] = useState<string | null>(null);
  const [processingRedirect, setProcessingRedirect] = useState(false);
  
  useEffect(() => {
    if (verificationEmail) {
      const domain = verificationEmail.split('@')[1]?.toLowerCase();
      if (domain) {
        if (domain.includes('gmail')) setEmailProvider('Gmail');
        else if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) setEmailProvider('Microsoft');
        else if (domain.includes('yahoo')) setEmailProvider('Yahoo');
        else if (domain.includes('proton')) setEmailProvider('ProtonMail');
        else if (domain.includes('aol')) setEmailProvider('AOL');
        else if (domain.includes('munetworks.io')) setEmailProvider('MUNetworks');
        else setEmailProvider(null);
      }
    }
  }, [verificationEmail]);

  useEffect(() => {
    const handleAuthRedirects = async () => {
      // Prevent multiple calls to this handler
      if (processingRedirect) return;
      setProcessingRedirect(true);
      
      console.log("Handling auth redirects...");
      console.log("Current URL:", window.location.href);
      
      // Check if we have an error in the URL
      const errorCode = searchParams.get('error_code');
      const errorDescription = searchParams.get('error_description');
      
      if (errorCode || searchParams.get('error')) {
        console.error("Auth error:", errorDescription);
        setAuthError(errorDescription || "Authentication error occurred. Please try again.");
        
        if (errorCode === 'otp_expired' || errorCode === 'access_denied') {
          toast({
            title: "Verification Failed",
            description: "Your verification link has expired or is invalid. Please request a new one.",
            variant: "destructive"
          });
        }
        setProcessingRedirect(false);
        return;
      }
      
      // Handle hash fragment for SPA authentication
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      console.log("Hash parameters:", Object.fromEntries(hashParams));
      
      // Check for hash error parameters
      if (hashParams.has('error')) {
        const hashErrorCode = hashParams.get('error_code');
        const hashErrorDesc = hashParams.get('error_description');
        
        console.error("Hash auth error:", hashErrorDesc);
        setAuthError(hashErrorDesc || "Authentication error occurred. Please try again.");
        setProcessingRedirect(false);
        return;
      }
      
      // Handle SPA verification (access_token in hash fragment)
      if (hashParams.has('access_token') && hashParams.get('type') === 'signup') {
        console.log("Found access_token in hash, handling SPA verification");
        try {
          setIsVerifying(true);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (error) {
              console.error("Error setting session:", error);
              setAuthError(`Verification failed: ${error.message}`);
              toast({
                title: "Verification Failed",
                description: error.message,
                variant: "destructive"
              });
            } else {
              console.log("Session created successfully:", data);
              setEmailVerified(true);
              
              // Check if this is a new user needing subscription
              const needsSubscription = data.user?.user_metadata?.needs_subscription === true;
              
              // Store this information in localStorage to handle page reloads
              if (needsSubscription) {
                localStorage.setItem('redirect_to_subscription', 'true');
              }
              
              // Add a slight delay before navigation to prevent multiple redirects
              setTimeout(() => {
                if (needsSubscription) {
                  // Use replace to avoid adding to history stack
                  navigate('/payment', { replace: true });
                } else {
                  // Regular flow
                  navigate('/dashboard', { replace: true });
                }
              }, 800);
            }
          } else {
            setAuthError("Verification failed: Missing authentication tokens");
          }
        } catch (error: any) {
          console.error("Error during SPA verification:", error);
          setAuthError(`Verification error: ${error.message}`);
        } finally {
          setIsVerifying(false);
          setProcessingRedirect(false);
        }
        return;
      }
      
      // Check for email_confirmed parameter from our verification link
      const emailConfirmed = searchParams.get('email_confirmed');
      const newUser = searchParams.get('new_user');
      
      if (emailConfirmed === 'true') {
        console.log("Email verification success detected via URL parameter");
        setEmailVerified(true);
        
        // Fetch the current auth status to ensure we have the latest session
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log("Session found after verification");
          
          // Check if this is a new user that needs subscription
          if (newUser === 'true') {
            console.log("New user detected, redirecting to payment page");
            localStorage.setItem('redirect_to_subscription', 'true');
            
            // Add a slight delay to prevent multiple redirects
            setTimeout(() => {
              // Use replace to avoid adding to history stack
              navigate('/payment', { replace: true });
            }, 800);
          } else {
            // After showing the success message, redirect to dashboard
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 800);
          }
        } else {
          console.log("No session found after verification, staying on auth page");
        }
        setProcessingRedirect(false);
        return;
      }
      
      // Check for verification token in URL (legacy or fallback flow)
      const token = searchParams.get('token_hash') || searchParams.get('token');
      const type = searchParams.get('type');
      
      if (token && type === 'signup') {
        try {
          setIsVerifying(true);
          console.log("Verifying email with token:", token.substring(0, 10) + "...");
          
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup',
          });
          
          if (error) {
            console.error("Email verification failed:", error);
            setAuthError(`Verification failed: ${error.message}`);
            toast({
              title: "Verification Failed",
              description: error.message,
              variant: "destructive"
            });
          } else {
            console.log("Email verified successfully");
            setEmailVerified(true);
            
            // Add a slight delay before navigation
            setTimeout(() => {
              navigate('/payment', { replace: true });
            }, 800);
          }
        } catch (error: any) {
          console.error("Error during email verification:", error);
          setAuthError(`Verification error: ${error.message}`);
        } finally {
          setIsVerifying(false);
          setProcessingRedirect(false);
        }
        return;
      }
      
      // Handle password recovery flow
      const recoveryToken = searchParams.get('access_token');
      const recoveryType = searchParams.get('type');
      
      if ((recoveryToken || token) && (recoveryType === 'recovery' || type === 'recovery')) {
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
