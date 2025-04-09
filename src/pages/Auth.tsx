
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import ResetPasswordDialog from '@/components/auth/ResetPasswordDialog';
import EmailVerificationStatus from '@/components/auth/EmailVerificationStatus';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuthContext';
import AuthErrorAlert from '@/components/auth/AuthErrorAlert';
import VerificationAlert from '@/components/auth/VerificationAlert';
import AuthFooter from '@/components/auth/AuthFooter';
import VerifiedEmailAlert from '@/components/auth/verification/VerifiedEmailAlert';

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { user } = useAuth();
  const [emailProvider, setEmailProvider] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      if (user.email && !user.email_confirmed_at && !searchParams.get('returnTo')) {
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
  
  useEffect(() => {
    const handleAuthRedirects = async () => {
      // Check for verification token in URL
      const token = searchParams.get('token');
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
            }, 3000);
          }
        } catch (error: any) {
          console.error("Error during email verification:", error);
          setAuthError(`Verification error: ${error.message}`);
        } finally {
          setIsVerifying(false);
        }
        return;
      }
      
      // Check for email_confirmed parameter - this comes from our custom verification URL
      const emailConfirmedParam = searchParams.get('email_confirmed');
      if (emailConfirmedParam === 'true') {
        console.log("Email verification detected via URL parameter");
        setEmailVerified(true);
        toast({
          title: "Email Verified",
          description: "Your email has been successfully verified!",
          variant: "default"
        });
        
        // After showing the success message, redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 3000);
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
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Inventory Track Pro</CardTitle>
          <CardDescription className="text-center">
            {isVerifying 
              ? "Verifying your email..." 
              : "Enter your credentials to access your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authError && <AuthErrorAlert errorMessage={authError} />}
          
          {emailVerified && <VerifiedEmailAlert />}
          
          {user && !user.email_confirmed_at && <EmailVerificationStatus />}
          
          {verificationSent && (
            <VerificationAlert 
              verificationEmail={verificationEmail}
              isResendingVerification={isResendingVerification}
              setIsResendingVerification={setIsResendingVerification}
              emailProvider={emailProvider}
            />
          )}
          
          {(!user || user.email_confirmed_at) && !emailVerified && !isVerifying && (
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
          
          {isVerifying && (
            <div className="flex justify-center py-6">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                <p className="text-sm text-gray-600">Verifying your email address...</p>
              </div>
            </div>
          )}
          
          <AuthFooter />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to our <a href="/terms-of-service" className="underline">Terms of Service</a> and <a href="/privacy-policy" className="underline">Privacy Policy</a>
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
