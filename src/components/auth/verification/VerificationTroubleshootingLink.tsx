
import React from 'react';
import { Button } from '@/components/ui/button';

interface VerificationTroubleshootingLinkProps {
  verificationEmail: string;
  onResend: (email: string) => void;
  isResendingVerification: boolean;
}

const VerificationTroubleshootingLink: React.FC<VerificationTroubleshootingLinkProps> = ({
  verificationEmail,
  onResend,
  isResendingVerification
}) => {
  return (
    <p className="text-sm">
      If you don't see it, please check your spam folder or 
      <Button 
        variant="link" 
        className="p-0 h-auto text-yellow-800 underline ml-1"
        onClick={() => onResend(verificationEmail)}
        disabled={isResendingVerification}
      >
        click here to resend
      </Button>.
    </p>
  );
};

export default VerificationTroubleshootingLink;
