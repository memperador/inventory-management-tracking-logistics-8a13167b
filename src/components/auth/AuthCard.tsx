
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AuthTabs from '@/components/auth/AuthTabs';
import ResetPasswordDialog from '@/components/auth/ResetPasswordDialog';
import AuthErrorAlert from '@/components/auth/AuthErrorAlert';
import VerifiedEmailAlert from '@/components/auth/verification/VerifiedEmailAlert';
import EmailVerificationStatus from '@/components/auth/EmailVerificationStatus';
import VerificationAlert from '@/components/auth/VerificationAlert';
import AuthFooter from '@/components/auth/AuthFooter';
import { useAuth } from '@/hooks/useAuthContext';

interface AuthCardProps {
  authError: string | null;
  emailVerified: boolean;
  isVerifying: boolean;
  verificationSent: boolean;
  verificationEmail: string;
  isResendingVerification: boolean;
  setIsResendingVerification: (isResending: boolean) => void;
  emailProvider: string | null;
  setVerificationSent: (sent: boolean) => void;
  setVerificationEmail: (email: string) => void;
}

const AuthCard: React.FC<AuthCardProps> = ({
  authError,
  emailVerified,
  isVerifying,
  verificationSent,
  verificationEmail,
  isResendingVerification,
  setIsResendingVerification,
  emailProvider,
  setVerificationSent,
  setVerificationEmail
}) => {
  const [activeTab, setActiveTab] = useState("login");
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const { user } = useAuth();

  return (
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
          <AuthTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onForgotPassword={() => setResetPasswordDialogOpen(true)}
            onSignupComplete={(email) => {
              console.log(`Signup complete for ${email}, showing verification notice`);
              setVerificationEmail(email);
              setVerificationSent(true);
            }}
          />
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
      
      <ResetPasswordDialog 
        open={resetPasswordDialogOpen} 
        onOpenChange={setResetPasswordDialogOpen} 
      />
    </Card>
  );
};

export default AuthCard;
