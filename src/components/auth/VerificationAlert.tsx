
import React from 'react';
import { Mail } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useVerificationResend } from '@/hooks/useVerificationResend';
import VerificationTroubleshootingLink from './verification/VerificationTroubleshootingLink';
import LastDeliveryResult from './verification/LastDeliveryResult';
import DebugPanel from './verification/DebugPanel';
import TroubleshootingOptions from './verification/TroubleshootingOptions';
import VerificationGuide from './verification/VerificationGuide';

interface VerificationAlertProps {
  verificationEmail: string;
  isResendingVerification: boolean;
  setIsResendingVerification: (value: boolean) => void;
  emailProvider: string | null;
}

const VerificationAlert: React.FC<VerificationAlertProps> = ({
  verificationEmail,
  isResendingVerification,
  setIsResendingVerification,
  emailProvider
}) => {
  const {
    manualResendDebug,
    lastDeliveryResult,
    resendVerificationEmail
  } = useVerificationResend();
  
  return (
    <Alert className="mb-4 bg-yellow-50 border-yellow-200">
      <Mail className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <p className="font-medium">We've sent a verification email to:</p>
        <p className="my-1 font-bold">{verificationEmail}</p>
        
        {isResendingVerification ? (
          <p className="text-sm italic mt-2">Sending...</p>
        ) : (
          <div className="mt-3">
            <VerificationTroubleshootingLink 
              verificationEmail={verificationEmail}
              onResend={(email) => {
                setIsResendingVerification(true);
                resendVerificationEmail(email);
              }}
              isResendingVerification={isResendingVerification}
            />
            
            <VerificationGuide emailProvider={emailProvider} />
          </div>
        )}
        
        <DebugPanel manualResendDebug={manualResendDebug} />
        
        <LastDeliveryResult 
          lastDeliveryResult={lastDeliveryResult} 
          currentEmail={verificationEmail} 
        />
        
        <TroubleshootingOptions verificationEmail={verificationEmail} />
      </AlertDescription>
    </Alert>
  );
};

export default VerificationAlert;
