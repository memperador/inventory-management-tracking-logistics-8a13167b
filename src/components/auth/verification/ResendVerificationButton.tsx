
import React from 'react';
import { Button } from '@/components/ui/button';

interface ResendVerificationButtonProps {
  resendingEmail: boolean;
  canResendNow: boolean;
  secondsRemaining: number;
  resendCount: number;
  onClick: () => void;
}

const ResendVerificationButton: React.FC<ResendVerificationButtonProps> = ({ 
  resendingEmail, 
  canResendNow, 
  secondsRemaining,
  resendCount,
  onClick 
}) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="border-yellow-300 hover:bg-yellow-100 text-yellow-800 relative"
      onClick={onClick}
      disabled={resendingEmail || !canResendNow}
    >
      {resendingEmail 
        ? "Sending..." 
        : !canResendNow 
          ? `Wait ${secondsRemaining}s to resend` 
          : "Resend verification email"}
        
      {resendCount > 0 && canResendNow && (
        <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {resendCount}
        </span>
      )}
    </Button>
  );
};

export default ResendVerificationButton;
