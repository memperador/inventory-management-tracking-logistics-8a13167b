
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
  
  useEffect(() => {
    if (verificationEmail) {
      const domain = verificationEmail.split('@')[1]?.toLowerCase();
      if (domain) {
        if (domain.includes('gmail')) setEmailProvider('Gmail');
        else if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) setEmailProvider('Microsoft');
        else if (domain.includes('yahoo')) setEmailProvider('Yahoo');
        else if (domain.includes('proton')) setEmailProvider('ProtonMail');
        else if (domain.includes('aol')) setEmailProvider('AOL');
        else setEmailProvider(null);
      }
    }
  }, [verificationEmail]);

  useEffect(() => {
    const handleAuthRedirects = async () => {
      console.log("Handling auth redirects...");
      console.log("Current URL:", window.location.href);
      
      // Check if we have an error in the URL
      const errorCode = searchParams.get('error_code');
      const errorDescription = searchParams.get('error_description');
      
      if (errorCode === 'otp_expired' || errorCode === 'access_denied') {
        console.error("Token expired or invalid:", errorDescription);
        setAuthError(errorDescription || "Your verification link has expired or is invalid. Please request a new one.");
        toast({
          title: "Verification Failed",
          description: "Your verification link has expired. Please request a new verification email.",
          variant: "destructive"
        });
        return;
      }
      
      // Check if we're receiving parameters through hash fragment (SPA authentication)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      console.log("Hash parameters:", Object.fromEntries(hashParams));
      
      // Check for hash error parameters
      if (hashParams.has('error')) {
        const hashErrorCode = hashParams.get('error_code');
        const hashErrorDesc = hashParams.get('error_description');
        
        if (hashErrorCode === 'otp_expired' || hashParams.get('error') === 'access_denied') {
          console.error("Hash token expired or invalid:", hashErrorDesc);
          setAuthError(hashErrorDesc || "Your verification link has expired or is invalid. Please request a new one.");
          toast({
            title: "Verification Failed",
            description: "Your verification link has expired. Please request a new verification email.",
            variant: "destructive"
          });
          return;
        }
      }
      
      if (hashParams.has('access_token') && hashParams.get('type') === 'signup') {
        console.log("Found access_token in hash, handling SPA verification");
        try {
          setIsVerifying(true);
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          // Create a session with the access token
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
              toast({
                title: "Email Verified",
                description: "Your email has been successfully verified!",
                variant: "default"
              });
              
              // After showing the success message, redirect to dashboard
              setTimeout(() => {
                navigate('/dashboard', { replace: true });
              }, 1500);
            }
          } else {
            console.error("Missing tokens in hash parameters");
            setAuthError("Verification failed: Missing authentication tokens");
          }
        } catch (error: any) {
          console.error("Error during SPA verification:", error);
          setAuthError(`Verification error: ${error.message}`);
        } finally {
          setIsVerifying(false);
        }
        return;
      }
      
      // Check for email_confirmed parameter from our verification link
      const emailConfirmed = searchParams.get('email_confirmed');
      if (emailConfirmed === 'true') {
        console.log("Email verification success detected via URL parameter");
        setEmailVerified(true);
        toast({
          title: "Email Verified",
          description: "Your email has been successfully verified!",
          variant: "default"
        });
        
        // After showing the success message, redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
        return;
      }
      
      // Check for verification token in URL (legacy or fallback flow)
      const token = searchParams.get('token_hash') || searchParams.get('token');
      const type = searchParams.get('type');
      
      if (token && type === 'signup') {
        try {
          setIsVerifying(true);
          console.log("Verifying email with token:", token.substring(0, 10) + "...");
          
          // Call Supabase to verify the token
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
            toast({
              title: "Email Verified",
              description: "Your email has been successfully verified!",
              variant: "default"
            });
            
            // After showing the success message, redirect to dashboard
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 1500);
          }
        } catch (error: any) {
          console.error("Error during email verification:", error);
          setAuthError(`Verification error: ${error.message}`);
        } finally {
          setIsVerifying(false);
        }
        return;
      }
      
      // Check for other auth errors or redirects
      const errorMessage = searchParams.get('error_description') || searchParams.get('error');
      if (errorMessage) {
        const decodedMessage = decodeURIComponent(errorMessage);
        setAuthError(decodedMessage);
        console.error("Auth redirect error:", decodedMessage);
        
        if (decodedMessage.includes('expired')) {
          toast({
            title: "Verification Link Expired",
            description: "Your verification link has expired. Please request a new link.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Verification Error",
            description: decodedMessage,
            variant: "destructive"
          });
        }
        return;
      }
      
      // Handle password recovery flow
      const recoveryToken = searchParams.get('access_token');
      const recoveryType = searchParams.get('type');
      
      if ((recoveryToken || token) && (recoveryType === 'recovery' || type === 'recovery')) {
        navigate('/auth/reset-password', { replace: true });
      }
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
    emailProvider
  };
}
