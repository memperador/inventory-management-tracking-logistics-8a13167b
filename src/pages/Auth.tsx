
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import ResetPasswordDialog from '@/components/auth/ResetPasswordDialog';
import EmailVerificationStatus from '@/components/auth/EmailVerificationStatus';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const { user } = useAuth();
  
  // Handle redirect if user is already logged in
  useEffect(() => {
    if (user) {
      // Don't redirect if we're showing email verification status
      if (user.email && !user.email_confirmed_at && !searchParams.get('returnTo')) {
        // Stay on auth page to show verification status
        return;
      }
      
      const returnTo = searchParams.get('returnTo');
      if (returnTo) {
        navigate(decodeURIComponent(returnTo), { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate, searchParams]);
  
  // Handle email confirmation or password recovery flows
  useEffect(() => {
    const handleAuthRedirects = async () => {
      // Check for error messages from email verification
      const errorMessage = searchParams.get('error_description') || searchParams.get('error');
      if (errorMessage) {
        const decodedMessage = decodeURIComponent(errorMessage);
        setAuthError(decodedMessage);
        console.error("Auth redirect error:", decodedMessage);
        
        // Show more user-friendly message for expired link
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
        
        navigate('/auth', { replace: true });
        return;
      }
      
      // Check for successful email verification
      const emailVerified = searchParams.get('email_confirmed') === 'true';
      if (emailVerified) {
        console.log("Email verification successful!");
        toast({
          title: "Email Verified",
          description: "Your email has been verified successfully!",
        });
        navigate('/dashboard', { replace: true });
        return;
      }
      
      // Check and handle recovery tokens for password reset
      const token = searchParams.get('token') || searchParams.get('access_token');
      const type = searchParams.get('type');
      
      if (token && type === 'recovery') {
        // Auto-navigate to reset password page
        navigate('/auth/reset-password', { replace: true });
      }
    };
    
    handleAuthRedirects();
  }, [searchParams, navigate]);
  
  const resendVerificationEmail = async (email: string) => {
    try {
      setIsResendingVerification(true);
      console.log(`Manually resending verification email to ${email}`);
      
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) {
        console.error("Failed to resend verification email:", error);
        throw error;
      }
      
      console.log("Verification email sent successfully", data);
      setVerificationSent(true);
      setVerificationEmail(email);
      
      // Store the time when we sent the email in localStorage
      const now = new Date();
      localStorage.setItem(`lastVerificationSent_${email}`, now.toISOString());
      
      // Increment the send count
      const storedCount = localStorage.getItem(`verificationSendCount_${email}`);
      const currentCount = storedCount ? parseInt(storedCount, 10) : 0;
      localStorage.setItem(`verificationSendCount_${email}`, (currentCount + 1).toString());
      
      toast({
        title: "Verification Email Sent",
        description: `We've sent a verification email to ${email}. Please check your inbox and spam folder.`,
      });
    } catch (error: any) {
      console.error("Error sending verification email:", error);
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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Inventory Track Pro</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>
                {authError}
                <p className="mt-2 text-sm">
                  {authError.includes('expired') ? 
                    "Please request a new verification link below." : 
                    "Please check your email address and try again."}
                </p>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Show email verification status for logged in users with unverified emails */}
          {user && !user.email_confirmed_at && <EmailVerificationStatus />}
          
          {verificationSent && (
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
                        <li>Add noreply@supabase.co to your contacts or safe senders list</li>
                        <li>
                          Email delivery can take a few minutes
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {(!user || user.email_confirmed_at) && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm onForgotPassword={() => setResetPasswordDialogOpen(true)} />
              </TabsContent>
              
              <TabsContent value="signup">
                <SignupForm onSignupComplete={(email) => {
                  console.log(`Signup complete for ${email}, showing verification notice`);
                  setVerificationEmail(email);
                  setVerificationSent(true);
                }} />
              </TabsContent>
            </Tabs>
          )}
          
          {/* Add a help section at the bottom */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              Having trouble with email verification?
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              If you're not receiving verification emails, please contact support or check your Supabase email settings.
            </p>
            <Button 
              variant="link" 
              size="sm"
              className="text-xs p-0 h-auto mt-1"
              onClick={() => window.open("https://supabase.com/dashboard/project/wscoyigjjcevriqqyxwo/auth/templates", "_blank")}
            >
              Check Supabase Email Settings <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardFooter>
      </Card>
      
      <ResetPasswordDialog 
        open={resetPasswordDialogOpen} 
        onOpenChange={setResetPasswordDialogOpen} 
      />
    </div>
  );
};

export default Auth;
