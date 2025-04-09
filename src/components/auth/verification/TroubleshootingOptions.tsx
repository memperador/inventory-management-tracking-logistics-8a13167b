
import React from 'react';
import { Button } from '@/components/ui/button';

interface TroubleshootingOptionsProps {
  verificationEmail: string;
}

const TroubleshootingOptions: React.FC<TroubleshootingOptionsProps> = ({ verificationEmail }) => {
  return (
    <div className="mt-4 flex flex-col">
      <p className="text-xs text-yellow-700 font-medium">Having trouble? Try these options:</p>
      <div className="flex flex-wrap gap-2 mt-1">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-7"
          onClick={() => window.location.reload()}
        >
          Refresh page
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-7"
          onClick={() => {
            localStorage.removeItem(`lastVerificationSent_${verificationEmail}`);
            localStorage.removeItem(`verificationSendCount_${verificationEmail}`);
            window.location.reload();
          }}
        >
          Reset resend counter
        </Button>
      </div>
    </div>
  );
};

export default TroubleshootingOptions;
