
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AuthErrorAlertProps {
  errorMessage: string;
}

const AuthErrorAlert: React.FC<AuthErrorAlertProps> = ({ errorMessage }) => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Authentication Error</AlertTitle>
      <AlertDescription>
        {errorMessage}
        <p className="mt-2 text-sm">
          {errorMessage.includes('expired') ? 
            "Please request a new verification link below." : 
            "Please check your email address and try again."}
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default AuthErrorAlert;
