
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MailCheck, Mail, Info, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EmailVerificationStatus = () => {
  const { user, session } = useAuth();
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
  
  if (!user) return null;

  // Check if email is verified
  const isEmailVerified = user.email_confirmed_at !== null;

  const handleResendVerification = async () => {
    if (!user.email) return;
    
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
  
  // Direct user to Email client for convenience
  const getEmailClientUrl = () => {
    if (!user.email) return '#';
    const domain = user.email.split('@')[1]?.toLowerCase();
    
    if (!domain) return '#';
    
    if (domain.includes('gmail')) return 'https://mail.google.com';
    if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) return 'https://outlook.live.com';
    if (domain.includes('yahoo')) return 'https://mail.yahoo.com';
    if (domain.includes('proton')) return 'https://mail.proton.me';
    if (domain.includes('aol')) return 'https://mail.aol.com';
    
    return '#'; // No specific URL
  };
  
  const emailClientUrl = getEmailClientUrl();

  if (isEmailVerified) {
    return (
      <Alert className="bg-green-50 border-green-200 mb-4">
        <MailCheck className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Your email has been verified.
        </AlertDescription>
      </Alert>
    );
  }

  // Calculate time since last resend attempt
  const canResendNow = !lastSentTime || (new Date().getTime() - lastSentTime.getTime()) > 60000;
  const secondsRemaining = lastSentTime ? Math.ceil((60000 - (new Date().getTime() - lastSentTime.getTime())) / 1000) : 0;

  return (
    <Alert className="bg-yellow-50 border-yellow-200 mb-4">
      <Mail className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex flex-col gap-2">
        <div className="text-yellow-800">
          <p className="font-medium">Please verify your email address: {user.email}</p>
          <p className="mt-1 text-sm">Check your inbox and spam folders for the verification link.</p>
          
          {emailClientUrl !== '#' && (
            <div className="mt-2">
              <a 
                href={emailClientUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm flex items-center text-blue-600 hover:text-blue-800"
              >
                Open your email client <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-yellow-300 hover:bg-yellow-100 text-yellow-800 relative"
            onClick={handleResendVerification}
            disabled={resendingEmail || !canResendNow}
          >
            {resendingEmail 
              ? "Sending..." 
              : !canResendNow 
                ? `Wait ${secondsRemaining}s to resend` 
                : "Resend verification email"}
              
            {resendCount > 0 && canResendNow && (
              <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {resendCount}
              </span>
            )}
          </Button>
          
          {lastSentTime && (
            <span className="text-xs text-yellow-600 italic">
              {resendCount > 0 && `Email sent ${resendCount} ${resendCount === 1 ? 'time' : 'times'}. `}
              {!canResendNow ? 
                `You can resend again in ${secondsRemaining} seconds` : 
                `Last sent at ${lastSentTime.toLocaleTimeString()}`
              }
            </span>
          )}
        </div>
        
        {debugInfo && (
          <div className="mt-2 text-xs bg-yellow-100 p-2 rounded border border-yellow-300">
            <p className="font-medium">Email status: {debugInfo}</p>
          </div>
        )}
        
        {resendError && (
          <div className="mt-2 text-xs bg-red-50 p-2 rounded border border-red-200">
            <p className="font-medium text-red-700">Error: {resendError}</p>
          </div>
        )}
        
        <div className="flex items-start mt-3 bg-yellow-100 p-3 rounded-md text-sm text-yellow-700">
          <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Troubleshooting Email Delivery Issues:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Check your spam/junk folder (some providers move verification emails there)</li>
              <li>Make sure the email address <strong>{user.email}</strong> is spelled correctly</li>
              <li>Add <strong>noreply@mail.app.supabase.io</strong> to your contacts</li>
              <li>Try using a Gmail, Outlook or Yahoo email address for better delivery rates</li>
              <li>Some corporate email systems block verification emails entirely</li>
              <li>Try accessing your email through a web browser instead of an email app</li>
              <li>Clear your browser cache and cookies, then try again</li>
            </ul>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default EmailVerificationStatus;
