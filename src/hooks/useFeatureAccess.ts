
import { useTenant } from '@/contexts/TenantContext';
import { hasFeatureAccess } from '@/utils/subscription/accessControl';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function useFeatureAccess() {
  const { currentTenant } = useTenant();
  const navigate = useNavigate();
  
  /**
   * Check if the current tenant has access to a feature
   */
  const checkFeatureAccess = (featureKey: string): boolean => {
    return hasFeatureAccess(currentTenant, featureKey);
  };
  
  /**
   * Guard function to use when a feature requires a specific tier
   * Will redirect to payment page if feature is not available
   */
  const guardFeature = (featureKey: string): boolean => {
    const hasAccess = checkFeatureAccess(featureKey);
    
    if (!hasAccess) {
      toast({
        title: "Feature Unavailable",
        description: "This feature requires a higher subscription tier.",
        variant: "warning"
      });
      
      navigate('/payment');
      return false;
    }
    
    return true;
  };
  
  /**
   * Gets the current tenant subscription tier
   */
  const getCurrentTier = () => {
    return currentTenant?.subscription_tier || 'basic';
  };
  
  return {
    checkFeatureAccess,
    guardFeature,
    getCurrentTier
  };
}
