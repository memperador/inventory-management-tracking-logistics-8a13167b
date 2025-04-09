
import React from 'react';
import { MailCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const VerifiedEmailAlert: React.FC = () => {
  return (
    <Alert className="bg-green-50 border-green-200 mb-4">
      <MailCheck className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        Your email has been verified.
      </AlertDescription>
    </Alert>
  );
};

export default VerifiedEmailAlert;
