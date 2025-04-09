
import { toast } from '@/hooks/use-toast';

/**
 * Extract and process auth-related parameters from URL
 */
export function extractAuthParams() {
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  
  return {
    // Search params
    errorCode: searchParams.get('error_code'),
    errorDescription: searchParams.get('error_description'),
    error: searchParams.get('error'),
    emailConfirmed: searchParams.get('email_confirmed') === 'true',
    newUser: searchParams.get('new_user') === 'true',
    token: searchParams.get('token_hash') || searchParams.get('token'),
    type: searchParams.get('type'),
    
    // Hash params
    hashError: hashParams.get('error'),
    hashErrorCode: hashParams.get('error_code'),
    hashErrorDesc: hashParams.get('error_description'),
    accessToken: hashParams.get('access_token'),
    refreshToken: hashParams.get('refresh_token'),
    hashType: hashParams.get('type')
  };
}

/**
 * Handle auth errors from URL parameters
 */
export function handleAuthErrors(errorCode: string | null, errorDescription: string | null) {
  if (!errorCode && !errorDescription) return null;
  
  console.error("Auth error:", errorDescription);
  
  if (errorCode === 'otp_expired' || errorCode === 'access_denied') {
    toast({
      title: "Verification Failed",
      description: "Your verification link has expired or is invalid. Please request a new one.",
      variant: "destructive"
    });
  }
  
  return errorDescription || "Authentication error occurred. Please try again.";
}
