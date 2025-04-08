
import React from 'react';
import { QRCodeGenerator } from '@/components/inventory/qrcode/QRCodeGenerator';
import { Equipment } from '@/components/equipment/types';
import { useTenant } from '@/hooks/useTenantContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface QRCodeTabContentProps {
  filteredEquipment: Equipment[];
}

export const QRCodeTabContent: React.FC<QRCodeTabContentProps> = ({
  filteredEquipment
}) => {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // QR codes are available in all subscription tiers
  // But bulk QR generation only in standard and premium
  const hasBasicAccess = !!currentTenant?.subscription_tier; // Any subscription
  const hasBulkAccess = currentTenant?.subscription_tier === 'standard' || 
                        currentTenant?.subscription_tier === 'premium';
  
  if (!hasBasicAccess) {
    // Should not happen normally but handle just in case
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center space-y-4 max-w-md">
          <h3 className="text-xl font-medium">Subscription Required</h3>
          <p className="text-muted-foreground">
            Please subscribe to access QR code features.
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
  
  return <QRCodeGenerator equipmentData={filteredEquipment} hasBulkAccess={hasBulkAccess} />;
};
