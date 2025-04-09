
import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface VerificationAlertProps {
  verificationEmail: string;
  isResendingVerification: boolean;
  setIsResendingVerification: (value: boolean) => void;
  emailProvider: string | null;
}

const VerificationAlert: React.FC<VerificationAlertProps> = ({
  verificationEmail,
  isResendingVerification,
  setIsResendingVerification,
  emailProvider
}) => {
  const [manualResendDebug, setManualResendDebug] = useState<string | null>(null);
  
  const [lastDeliveryResult, setLastDeliveryResult] = useLocalStorage<{
    timestamp: string;
    email: string;
    success: boolean;
    message: string;
  } | null>('last_email_delivery_result', null);
  
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
  
  return (
    <Alert className="mb-4 bg-yellow-50 border-yellow-200">
      <Mail className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <p className="font-medium">We've sent a verification email to:</p>
        <p className="my-1 font-bold">{verificationEmail}</p>
        {isResendingVerification ? (
          <p className="text-sm italic mt-2">Sending...</p>
        ) : (
          <div className="mt-3">
            <p className="text-sm">
              If you don't see it, please check your spam folder or 
              <Button 
                variant="link" 
                className="p-0 h-auto text-yellow-800 underline ml-1"
                onClick={() => resendVerificationEmail(verificationEmail)}
                disabled={isResendingVerification}
              >
                click here to resend
              </Button>.
            </p>
            
            <div className="mt-3 text-xs space-y-2">
              <p className="font-medium">Troubleshooting tips:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Check both inbox and spam/junk folders</li>
                <li>Add <strong>noreply@mail.app.supabase.io</strong> to your contacts</li>
                <li>Email delivery can take up to 5-10 minutes with some providers</li>
                <li>Try refreshing your email inbox</li>
                <li>Check for full inbox (some providers block incoming emails when inbox is full)</li>
                {emailProvider && (
                  <li>
                    {emailProvider === 'Gmail' && "Gmail users: Check the 'Promotions' or 'Updates' tabs"}
                    {emailProvider === 'Microsoft' && "Outlook/Hotmail users: Check the 'Other' or 'Junk' folders"}
                    {emailProvider === 'Yahoo' && "Yahoo users: Check the 'Spam' folder and mark as 'Not Spam'"}
                    {emailProvider === 'ProtonMail' && "ProtonMail users: Check spam folder and whitelist the sender"}
                  </li>
                )}
                <li>Try using a personal email address if you're using a work email</li>
              </ul>
            </div>
          </div>
        )}
        
        {manualResendDebug && (
          <div className="mt-3 p-2 bg-yellow-100 rounded text-xs border border-yellow-300 whitespace-pre-line">
            <p className="font-medium">Debug log:</p>
            <p className="overflow-auto max-h-24">{manualResendDebug}</p>
          </div>
        )}
        
        {lastDeliveryResult && lastDeliveryResult.email === verificationEmail && (
          <div className="mt-3 p-2 bg-yellow-100 rounded text-xs border border-yellow-300">
            <p className="font-medium">Last email delivery attempt:</p>
            <p>Time: {new Date(lastDeliveryResult.timestamp).toLocaleString()}</p>
            <p>Status: {lastDeliveryResult.success ? '✅ Success' : '❌ Failed'}</p>
            {!lastDeliveryResult.success && (
              <p>Error: {lastDeliveryResult.message}</p>
            )}
          </div>
        )}
        
        <div className="mt-4 flex flex-col">
          <p className="text-xs text-yellow-700 font-medium">Having trouble? Try these options:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-7"
              onClick={() => window.location.reload()}
            >
              Refresh page
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-7"
              onClick={() => {
                localStorage.removeItem(`lastVerificationSent_${verificationEmail}`);
                localStorage.removeItem(`verificationSendCount_${verificationEmail}`);
                window.location.reload();
              }}
            >
              Reset resend counter
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default VerificationAlert;
