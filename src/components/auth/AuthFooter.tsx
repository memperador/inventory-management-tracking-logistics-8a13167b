
import React from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthFooter: React.FC = () => {
  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 flex items-center">
        <Shield className="h-3 w-3 mr-1" />
        Having trouble with email verification?
      </h4>
      <p className="text-xs text-gray-500 mt-1">
        If you're not receiving verification emails despite multiple attempts, there may be an issue with your email provider's filters or system email settings.
      </p>
      <div className="flex space-x-2 mt-2">
        <Button 
          variant="link" 
          size="sm"
          className="text-xs p-0 h-auto"
          onClick={() => window.location.href = "/terms-of-service"}
        >
          Terms of Service
        </Button>
        <Button 
          variant="link" 
          size="sm"
          className="text-xs p-0 h-auto"
          onClick={() => window.location.href = "/privacy-policy"}
        >
          Privacy Policy
        </Button>
      </div>
    </div>
  );
};

export default AuthFooter;
