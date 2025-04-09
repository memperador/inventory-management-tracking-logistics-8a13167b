
import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { emailVerificationService } from '@/services/emailVerification/emailVerificationService';
import { DeliveryResult } from '@/services/emailVerification/types';

export const useVerificationResend = () => {
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [manualResendDebug, setManualResendDebug] = useState<string | null>(null);
  const [lastDeliveryResult, setLastDeliveryResult] = useLocalStorage<DeliveryResult | null>(
    'last_email_delivery_result', 
    null
  );

  const resendVerificationEmail = async (email: string) => {
    try {
      setIsResendingVerification(true);
      setManualResendDebug("Starting verification email resend process...");
      console.log(`Manually resending verification email to ${email}`);
      
      await emailVerificationService.sendVerificationEmail(email);
      
      // Update local state with the latest delivery result from localStorage
      const storedResult = localStorage.getItem('last_email_delivery_result');
      if (storedResult) {
        setLastDeliveryResult(JSON.parse(storedResult));
      }
      
      const now = new Date();
      setManualResendDebug(prev => prev + `\nEmail sent at: ${now.toLocaleTimeString()}`);
    } catch (error: any) {
      setManualResendDebug(prev => prev + `\nFinal error: ${error.message || "Unknown error"}`);
    } finally {
      setIsResendingVerification(false);
    }
  };

  return {
    isResendingVerification,
    manualResendDebug,
    lastDeliveryResult,
    resendVerificationEmail,
    setManualResendDebug
  };
};
