
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AIStatusAlertProps {
  isEnabled: boolean;
}

const AIStatusAlert: React.FC<AIStatusAlertProps> = ({ isEnabled }) => {
  if (isEnabled) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        AI features are currently disabled for your organization. Please contact your administrator.
      </AlertDescription>
    </Alert>
  );
};

export default AIStatusAlert;
