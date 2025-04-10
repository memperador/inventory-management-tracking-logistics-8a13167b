
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/hooks/useTenantContext';
import { verifyTrialPeriod } from '@/utils/subscription/tenantVerification';

export const useTrialVerification = () => {
  const { toast } = useToast();
  const { currentTenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [trialVerificationResult, setTrialVerificationResult] = useState<any>(null);

  /**
   * Verify the trial period for a specific tenant or the current tenant
   */
  const verifyTrialStatus = async (tenantId?: string) => {
    const targetTenantId = tenantId || currentTenant?.id;
    
    if (!targetTenantId) {
      toast({
        title: "Error",
        description: "No tenant information available",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await verifyTrialPeriod(targetTenantId);
      setTrialVerificationResult(result);
      
      toast({
        title: result.isValid ? "Trial Verification" : "Trial Verification Failed",
        description: result.message,
        variant: result.isValid ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to verify trial: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    trialVerificationResult,
    verifyTrialStatus
  };
};
