
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/hooks/useTenantContext';

export const useEnterpriseInquiry = (updateSubscription: (tier: string) => Promise<void>) => {
  const { toast } = useToast();
  const { currentTenant } = useTenant();

  // Enterprise inquiry handler
  const handleEnterpriseInquiry = () => {
    toast({
      title: "Enterprise Inquiry Sent",
      description: "Our team will contact you shortly to discuss your enterprise needs.",
    });
    
    // For testing purposes, also set the subscription to enterprise
    if (currentTenant?.id) {
      updateSubscription('enterprise');
    }
  };

  return {
    handleEnterpriseInquiry
  };
};
