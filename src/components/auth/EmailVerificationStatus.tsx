
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MailCheck, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EmailVerificationStatus = () => {
  const { user, session } = useAuth();
  const [resendingEmail, setResendingEmail] = useState(false);
  
  if (!user) return null;

  // Check if email is verified
  const isEmailVerified = user.email_confirmed_at || user.email_confirmed_at !== null;

  const handleResendVerification = async () => {
    if (!user.email) return;
    
    setResendingEmail(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification email sent",
        description: `We've sent a new verification email to ${user.email}`,
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

  return (
    <Alert className="bg-yellow-50 border-yellow-200 mb-4">
      <Mail className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="text-yellow-800">
          Please verify your email address to access all features.
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          className="sm:ml-2 border-yellow-300 hover:bg-yellow-100 text-yellow-800"
          onClick={handleResendVerification}
          disabled={resendingEmail}
        >
          {resendingEmail ? "Sending..." : "Resend verification email"}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default EmailVerificationStatus;
