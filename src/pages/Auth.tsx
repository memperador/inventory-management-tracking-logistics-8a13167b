
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
        
        navigate('/auth', { replace: true });
        return;
      }
      
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
      
      const token = searchParams.get('token') || searchParams.get('access_token');
      const type = searchParams.get('type');
      
      if (token && type === 'recovery') {
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
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authError && <AuthErrorAlert errorMessage={authError} />}
          
          {user && !user.email_confirmed_at && <EmailVerificationStatus />}
          
          {verificationSent && (
            <VerificationAlert 
              verificationEmail={verificationEmail}
              isResendingVerification={isResendingVerification}
              setIsResendingVerification={setIsResendingVerification}
              emailProvider={emailProvider}
            />
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
