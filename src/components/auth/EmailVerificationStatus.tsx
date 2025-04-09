
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MailCheck, Mail, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EmailVerificationStatus = () => {
  const { user, session } = useAuth();
  const [resendingEmail, setResendingEmail] = useState(false);
  const [lastSentTime, setLastSentTime] = useState<Date | null>(null);
  
  if (!user) return null;

  // Check if email is verified
  const isEmailVerified = user.email_confirmed_at !== null;

  const handleResendVerification = async () => {
    if (!user.email) return;
    
    setResendingEmail(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      
      if (error) throw error;
      
      // Store the time when we sent the email
      setLastSentTime(new Date());
      
      toast({
        title: "Verification Email Sent",
        description: `We've sent a new verification email to ${user.email}. Please check your inbox and spam folders.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setResendingEmail(false);
    }
  };

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

  return (
    <Alert className="bg-yellow-50 border-yellow-200 mb-4">
      <Mail className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex flex-col gap-2">
        <div className="text-yellow-800">
          Please verify your email address. Check your inbox and spam folders for the verification link.
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-yellow-300 hover:bg-yellow-100 text-yellow-800"
            onClick={handleResendVerification}
            disabled={resendingEmail || !canResendNow}
          >
            {resendingEmail 
              ? "Sending..." 
              : !canResendNow 
                ? "Wait 1 minute to resend" 
                : "Resend verification email"}
          </Button>
          
          {lastSentTime && !canResendNow && (
            <span className="text-xs text-yellow-600 italic">
              You can resend again in {Math.ceil((60000 - (new Date().getTime() - lastSentTime.getTime())) / 1000)} seconds
            </span>
          )}
        </div>
        
        <div className="flex items-start mt-2 text-xs text-yellow-700">
          <Info className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
          <span>
            If you don't see the email, please check your spam folder. Some email providers might delay delivery
            or filter verification emails.
          </span>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default EmailVerificationStatus;
