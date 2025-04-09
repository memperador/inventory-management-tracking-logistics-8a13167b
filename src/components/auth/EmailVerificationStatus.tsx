
import React from 'react';
import { useAuth } from '@/hooks/useAuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail } from 'lucide-react';
import EmailClientLink from './verification/EmailClientLink';
import ResendVerificationButton from './verification/ResendVerificationButton';
import TroubleshootingTips from './verification/TroubleshootingTips';
import DebugInfoDisplay from './verification/DebugInfoDisplay';
import VerifiedEmailAlert from './verification/VerifiedEmailAlert';
import { useEmailVerification } from './verification/useEmailVerification';

const EmailVerificationStatus = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  // Check if email is verified
  const isEmailVerified = user.email_confirmed_at !== null;

  if (isEmailVerified) {
    return <VerifiedEmailAlert />;
  }

  const {
    resendingEmail,
    lastSentTime,
    resendCount,
    debugInfo,
    resendError,
    canResendNow,
    secondsRemaining,
    handleResendVerification
  } = useEmailVerification(user);

  return (
    <Alert className="bg-yellow-50 border-yellow-200 mb-4">
      <Mail className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex flex-col gap-2">
        <div className="text-yellow-800">
          <p className="font-medium">Please verify your email address: {user.email}</p>
          <p className="mt-1 text-sm">Check your inbox and spam folders for the verification link.</p>
          
          <EmailClientLink email={user.email} />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
          <ResendVerificationButton
            resendingEmail={resendingEmail}
            canResendNow={canResendNow}
            secondsRemaining={secondsRemaining}
            resendCount={resendCount}
            onClick={handleResendVerification}
          />
          
          {lastSentTime && (
            <span className="text-xs text-yellow-600 italic">
              {resendCount > 0 && `Email sent ${resendCount} ${resendCount === 1 ? 'time' : 'times'}. `}
              {!canResendNow ? 
                `You can resend again in ${secondsRemaining} seconds` : 
                `Last sent at ${lastSentTime.toLocaleTimeString()}`
              }
            </span>
          )}
        </div>
        
        <DebugInfoDisplay 
          debugInfo={debugInfo} 
          resendError={resendError} 
        />
        
        <TroubleshootingTips />
      </AlertDescription>
    </Alert>
  );
};

export default EmailVerificationStatus;
