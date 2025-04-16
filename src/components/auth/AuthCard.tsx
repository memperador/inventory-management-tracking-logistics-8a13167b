
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AuthTabs from '@/components/auth/AuthTabs';
import ResetPasswordDialog from '@/components/auth/ResetPasswordDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

interface AuthCardProps {
  emailConfirmed?: boolean;
  onSignupComplete?: (email: string) => void;
}

const AuthCard: React.FC<AuthCardProps> = ({
  emailConfirmed = false,
  onSignupComplete
}) => {
  const [activeTab, setActiveTab] = useState("login");
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Inventory Track Pro</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {emailConfirmed && (
          <Alert className="mb-4 border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Email verified</AlertTitle>
            <AlertDescription className="text-green-700">
              Your email has been verified. You can now sign in.
            </AlertDescription>
          </Alert>
        )}
        
        <AuthTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onForgotPassword={() => setResetPasswordDialogOpen(true)}
          onSignupComplete={onSignupComplete}
        />
        
        <div className="mt-4 text-center text-xs text-gray-500">
          By continuing, you agree to our <a href="/terms-of-service" className="underline">Terms of Service</a> and <a href="/privacy-policy" className="underline">Privacy Policy</a>
        </div>
      </CardContent>
      
      <ResetPasswordDialog 
        open={resetPasswordDialogOpen} 
        onOpenChange={setResetPasswordDialogOpen} 
      />
    </Card>
  );
};

export default AuthCard;
