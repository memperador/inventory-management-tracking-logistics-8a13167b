
import React from 'react';
import { InventoryAlerts } from '@/components/inventory/alerts/InventoryAlerts';
import { Equipment } from '@/components/equipment/types';
import { useTenant } from '@/hooks/useTenantContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AlertsTabContentProps {
  equipmentData: Equipment[];
}

export const AlertsTabContent: React.FC<AlertsTabContentProps> = ({
  equipmentData
}) => {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Alerts are available in all tiers, but advanced alerts only in standard and premium
  const hasBasicAlerts = !!currentTenant?.subscription_tier; // Any subscription
  const hasAdvancedAlerts = currentTenant?.subscription_tier === 'standard' || 
                           currentTenant?.subscription_tier === 'premium';
  
  if (!hasBasicAlerts) {
    // Should not happen normally but handle just in case
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center space-y-4 max-w-md">
          <h3 className="text-xl font-medium">Subscription Required</h3>
          <p className="text-muted-foreground">
            Please subscribe to access inventory alerts.
          </p>
          <Button 
            onClick={() => navigate('/payment')}
          >
            Subscribe Now
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <InventoryAlerts 
      equipmentData={equipmentData} 
      hasAdvancedAlerts={hasAdvancedAlerts} 
    />
  );
};
