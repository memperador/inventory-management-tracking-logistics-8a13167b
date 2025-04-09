
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { NavigateFunction } from 'react-router-dom';

/**
 * Handle SPA verification with tokens from hash
 */
export async function handleSpaVerification(
  accessToken: string | null,
  refreshToken: string | null,
  setIsVerifying: (value: boolean) => void,
  setEmailVerified: (value: boolean) => void,
  setAuthError: (value: string | null) => void,
  navigate: NavigateFunction,
  setProcessingRedirect: (value: boolean) => void
) {
  if (!accessToken || !refreshToken) {
    setAuthError("Verification failed: Missing authentication tokens");
    setProcessingRedirect(false);
    return;
  }
  
  try {
    setIsVerifying(true);
    
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
      setProcessingRedirect(false);
      setIsVerifying(false);
      return;
    }
    
    console.log("Session created successfully:", data);
    setEmailVerified(true);
    
    // Check if this is a new user needing subscription
    const needsSubscription = data.user?.user_metadata?.needs_subscription === true;
    
    // Store this information in localStorage to handle page reloads
    if (needsSubscription) {
      localStorage.setItem('redirect_to_subscription', 'true');
      
      // Use replace to avoid adding to history stack
      setTimeout(() => {
        navigate('/payment', { replace: true });
        setProcessingRedirect(false);
      }, 1000);
    } else {
      // Regular flow - navigate to dashboard with replace
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
        setProcessingRedirect(false);
      }, 1000);
    }
  } catch (error: any) {
    console.error("Error during SPA verification:", error);
    setAuthError(`Verification error: ${error.message}`);
    setProcessingRedirect(false);
    setIsVerifying(false);
  }
}

/**
 * Handle email verification with tokens from URL
 */
export async function handleEmailVerification(
  token: string | null,
  type: string | null,
  setIsVerifying: (value: boolean) => void,
  setEmailVerified: (value: boolean) => void,
  setAuthError: (value: string | null) => void,
  navigate: NavigateFunction,
  setProcessingRedirect: (value: boolean) => void
) {
  if (!token || type !== 'signup') {
    setProcessingRedirect(false);
    return;
  }
  
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
      setProcessingRedirect(false);
    } else {
      console.log("Email verified successfully");
      setEmailVerified(true);
      
      // Add a slight delay before navigation with replace
      setTimeout(() => {
        navigate('/payment', { replace: true });
        setProcessingRedirect(false);
      }, 1000);
    }
  } catch (error: any) {
    console.error("Error during email verification:", error);
    setAuthError(`Verification error: ${error.message}`);
    setProcessingRedirect(false);
  } finally {
    setIsVerifying(false);
  }
}

/**
 * Process successful email verification
 */
export async function handleSuccessfulVerification(
  newUser: boolean,
  setEmailVerified: (value: boolean) => void,
  navigate: NavigateFunction,
  setProcessingRedirect: (value: boolean) => void
) {
  console.log("Email verification success detected via URL parameter");
  setEmailVerified(true);
  
  // Fetch the current auth status to ensure we have the latest session
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    console.log("Session found after verification");
    
    // Check if this is a new user that needs subscription
    if (newUser) {
      console.log("New user detected, redirecting to payment page");
      localStorage.setItem('redirect_to_subscription', 'true');
      
      // Add a slight delay to prevent multiple redirects, use replace
      setTimeout(() => {
        navigate('/payment', { replace: true });
        setProcessingRedirect(false);
      }, 1000);
    } else {
      // After showing the success message, redirect to dashboard with replace
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
        setProcessingRedirect(false);
      }, 1000);
    }
  } else {
    console.log("No session found after verification, staying on auth page");
    setProcessingRedirect(false);
  }
}
