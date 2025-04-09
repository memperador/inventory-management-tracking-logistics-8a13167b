
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface DeliveryResult {
  timestamp: string;
  email: string;
  success: boolean;
  message: string;
}

export const useVerificationResend = () => {
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [manualResendDebug, setManualResendDebug] = useState<string | null>(null);
  const [lastDeliveryResult, setLastDeliveryResult] = useLocalStorage<DeliveryResult | null>(
    'last_email_delivery_result', 
    null
  );

  const resendVerificationEmail = async (email: string) => {
    try {
      setIsResendingVerification(true);
      setManualResendDebug("Starting verification email resend process...");
      console.log(`Manually resending verification email to ${email}`);
      
      const domain = window.location.origin;
      console.log(`Using redirect URL: ${domain}/auth`);
      
      try {
        setManualResendDebug(prev => prev + "\nRefreshing session...");
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn("Error getting current session:", sessionError);
        } else {
          console.log("Current session:", sessionData.session ? "Active" : "No active session");
        }
        
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          setManualResendDebug(prev => prev + `\nSession refresh failed: ${refreshError.message}`);
          console.warn("Session refresh warning:", refreshError);
        } else {
          setManualResendDebug(prev => prev + "\nSession refreshed successfully");
          console.log("Session refreshed successfully");
        }
      } catch (refreshErr: any) {
        setManualResendDebug(prev => prev + `\nSession refresh error: ${refreshErr.message || "Unknown"}`);
        console.warn("Error refreshing session:", refreshErr);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setManualResendDebug(prev => prev + `\nSending verification email to: ${email}`);
      
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${domain}/auth`
        }
      });
      
      if (error) {
        console.error("Failed to resend verification email:", error);
        setManualResendDebug(prev => prev + `\nError: ${error.message}`);
        
        setLastDeliveryResult({
          timestamp: new Date().toISOString(),
          email,
          success: false,
          message: error.message || "Unknown error"
        });
        
        throw error;
      }
      
      setManualResendDebug(prev => prev + "\nAPI response received successfully");
      console.log("Verification email resend response:", data);
      
      const now = new Date();
      localStorage.setItem(`lastVerificationSent_${email}`, now.toISOString());
      
      const storedCount = localStorage.getItem(`verificationSendCount_${email}`);
      const currentCount = storedCount ? parseInt(storedCount, 10) : 0;
      localStorage.setItem(`verificationSendCount_${email}`, (currentCount + 1).toString());
      
      setLastDeliveryResult({
        timestamp: now.toISOString(),
        email,
        success: true,
        message: "Verification email sent successfully"
      });
      
      setManualResendDebug(prev => prev + `\nEmail sent at: ${now.toLocaleTimeString()}`);
      
      toast({
        title: "Verification Email Sent",
        description: `We've sent a verification email to ${email}. Please check your inbox and spam folder.`,
      });
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      setManualResendDebug(prev => prev + `\nFinal error: ${error.message || "Unknown error"}`);
      
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setIsResendingVerification(false);
    }
  };

  return {
    isResendingVerification,
    manualResendDebug,
    lastDeliveryResult,
    resendVerificationEmail,
    setManualResendDebug
  };
};
