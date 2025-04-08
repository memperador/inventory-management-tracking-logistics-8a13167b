
import React from 'react';
import { InventoryAlerts } from '@/components/inventory/alerts/InventoryAlerts';
import { Equipment } from '@/components/equipment/types';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FeatureGate } from '@/components/subscription/FeatureGate';

interface AlertsTabContentProps {
  equipmentData: Equipment[];
}

export const AlertsTabContent: React.FC<AlertsTabContentProps> = ({
  equipmentData
}) => {
  const { hasSubscriptionTier } = useFeatureAccess();
  
  // Alerts are available in all tiers, but advanced alerts only in standard and premium
  const hasAdvancedAlerts = hasSubscriptionTier('standard');
  
  return (
    <FeatureGate
      featureKey="basic_alerts"
      showUpgradePrompt={true}
    >
      <InventoryAlerts 
        equipmentData={equipmentData} 
        hasAdvancedAlerts={hasAdvancedAlerts} 
      />
    </FeatureGate>
  );
};
