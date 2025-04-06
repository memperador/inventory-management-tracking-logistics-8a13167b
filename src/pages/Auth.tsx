
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import ResetPasswordDialog from '@/components/auth/ResetPasswordDialog';
import EmailVerificationStatus from '@/components/auth/EmailVerificationStatus';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  
  // Handle email confirmation or password recovery flows
  useEffect(() => {
    const handleAuthRedirects = async () => {
      // Check for error messages from email verification
      const errorMessage = searchParams.get('error_description') || searchParams.get('error');
      if (errorMessage) {
        toast({
          title: "Verification Error",
          description: decodeURIComponent(errorMessage),
          variant: "destructive"
        });
        navigate('/auth', { replace: true });
        return;
      }
      
      // Check for successful email verification
      const emailVerified = searchParams.get('email_confirmed') === 'true';
      if (emailVerified) {
        toast({
          title: "Email Verified",
          description: "Your email has been verified successfully!",
        });
        navigate('/', { replace: true });
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
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) throw error;
      
      setVerificationSent(true);
      setVerificationEmail(email);
      
      toast({
        title: "Verification Email Sent",
        description: `We've sent a verification email to ${email}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">FleetTrack</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verificationSent && (
            <Alert className="mb-4 bg-yellow-50 border-yellow-200">
              <Mail className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <p>We've sent a verification email to <strong>{verificationEmail}</strong>.</p>
                <p className="mt-2 text-sm">
                  If you don't see it, please check your spam folder or 
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-yellow-800 underline ml-1"
                    onClick={() => resendVerificationEmail(verificationEmail)}
                  >
                    click here to resend
                  </Button>.
                </p>
              </AlertDescription>
            </Alert>
          )}
          
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
                setVerificationEmail(email);
                setVerificationSent(true);
              }} />
            </TabsContent>
          </Tabs>
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
