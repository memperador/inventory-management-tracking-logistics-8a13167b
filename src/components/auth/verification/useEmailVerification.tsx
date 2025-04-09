
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

export const useEmailVerification = (user: User | null) => {
  const [resendingEmail, setResendingEmail] = useState(false);
  const [lastSentTime, setLastSentTime] = useState<Date | null>(null);
  const [resendCount, setResendCount] = useState(0);
  const [emailResponse, setEmailResponse] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  
  // Load last sent time from localStorage on component mount
  useEffect(() => {
    if (user?.email) {
      const storedTime = localStorage.getItem(`lastVerificationSent_${user.email}`);
      const storedCount = localStorage.getItem(`verificationSendCount_${user.email}`);
      
      if (storedTime) {
        setLastSentTime(new Date(storedTime));
      }
      
      if (storedCount) {
        setResendCount(parseInt(storedCount, 10));
      }
    }
  }, [user?.email]);
  
  // Calculate time since last resend attempt
  const canResendNow = !lastSentTime || (new Date().getTime() - lastSentTime.getTime()) > 60000;
  const secondsRemaining = lastSentTime ? Math.ceil((60000 - (new Date().getTime() - lastSentTime.getTime())) / 1000) : 0;
  
  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    setResendingEmail(true);
    setDebugInfo(null);
    setResendError(null);
    
    try {
      console.log(`Attempting to resend verification email to ${user.email}`);
      
      // Capture the site URL dynamically
      const domain = window.location.origin;
      console.log(`Using redirect URL: ${domain}/auth`);
      
      // Include timestamp in debug data to track this specific request
      const requestTimestamp = new Date().toISOString();
      console.log(`Request timestamp: ${requestTimestamp}`);
      
      // Force refresh the user session before sending
      try {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.warn("Session refresh warning:", refreshError);
        } else {
          console.log("Session refreshed successfully");
        }
      } catch (refreshErr) {
        console.warn("Error refreshing session:", refreshErr);
      }
      
      // Try with explicit email parameter
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${domain}/auth`,
        }
      });
      
      if (error) {
        console.error("Supabase resend error:", error);
        setDebugInfo(`Error: ${error.message} (Code: ${error.status || 'unknown'})`);
        setResendError(error.message);
        throw error;
      }
      
      // Store response data for debugging
      setEmailResponse(data);
      console.log(`Verification email request response:`, data);
      
      // Store the time when we sent the email in both state and localStorage
      const now = new Date();
      setLastSentTime(now);
      const newCount = resendCount + 1;
      setResendCount(newCount);
      
      // Store in localStorage to persist between refreshes
      localStorage.setItem(`lastVerificationSent_${user.email}`, now.toISOString());
      localStorage.setItem(`verificationSendCount_${user.email}`, newCount.toString());
      
      console.log(`Verification email resent successfully to ${user.email} at ${now.toLocaleString()}`);
      
      // Store detailed debug info
      setDebugInfo(`Request successful. Email sent at ${now.toLocaleTimeString()}`);
      
      toast({
        title: "Verification Email Sent",
        description: `We've sent a new verification email to ${user.email}. Please check your inbox and spam folders.`,
      });
    } catch (error: any) {
      console.error("Failed to resend verification email:", error);
      setResendError(error.message || "Unknown error");
      
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResendingEmail(false);
    }
  };
  
  return {
    resendingEmail,
    lastSentTime,
    resendCount,
    debugInfo,
    resendError,
    canResendNow,
    secondsRemaining,
    handleResendVerification
  };
};
