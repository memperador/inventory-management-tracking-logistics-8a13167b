
import React from 'react';
import { QRCodeGenerator } from '@/components/inventory/qrcode/QRCodeGenerator';
import { Equipment } from '@/components/equipment/types';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FeatureGate } from '@/components/subscription/FeatureGate';

interface QRCodeTabContentProps {
  filteredEquipment: Equipment[];
}

export const QRCodeTabContent: React.FC<QRCodeTabContentProps> = ({
  filteredEquipment
}) => {
  const { hasSubscriptionTier } = useFeatureAccess();
  
  // Basic QR codes are available in all subscription tiers
  // But bulk QR generation only in standard and premium
  const hasBulkAccess = hasSubscriptionTier('standard');
  
  return (
    <FeatureGate
      featureKey="qr_codes"
      showUpgradePrompt={false}
      fallback={
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center space-y-4 max-w-md">
            <h3 className="text-xl font-medium">Subscription Required</h3>
            <p className="text-muted-foreground">
              Please subscribe to access QR code features.
            </p>
          </div>
        </div>
      }
    >
      <QRCodeGenerator 
        equipmentData={filteredEquipment} 
        hasBulkAccess={hasBulkAccess} 
      />
    </FeatureGate>
  );
};
