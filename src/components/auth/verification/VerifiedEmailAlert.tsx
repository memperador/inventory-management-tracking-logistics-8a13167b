
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

const VerifiedEmailAlert = () => {
  return (
    <Alert className="bg-green-50 border-green-200 mb-4">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription>
        <p className="text-green-800 font-medium">Your email has been verified successfully!</p>
        <p className="text-green-700 text-sm mt-1">
          You now have full access to all features of Inventory Track Pro.
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default VerifiedEmailAlert;
