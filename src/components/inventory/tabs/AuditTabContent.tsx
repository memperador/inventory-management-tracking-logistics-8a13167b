
import React from 'react';
import { InventoryAuditLogs } from '@/components/inventory/audit/InventoryAuditLogs';
import { Equipment } from '@/components/equipment/types';
import { useTenant } from '@/hooks/useTenantContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuditTabContentProps {
  equipmentData: Equipment[];
}

export const AuditTabContent: React.FC<AuditTabContentProps> = ({
  equipmentData
}) => {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Audit logs are available in standard and premium tiers
  const hasAuditAccess = currentTenant?.subscription_tier === 'standard' || 
                         currentTenant?.subscription_tier === 'premium';
  
  if (!hasAuditAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center space-y-4 max-w-md">
          <h3 className="text-xl font-medium">Audit Logs Available in Standard Plan</h3>
          <p className="text-muted-foreground">
            Upgrade to our Standard or Premium plan to access detailed audit logs, 
            compliance tracking, and history of inventory changes.
          </p>
          <Button 
            onClick={() => {
              toast({
                title: "Subscription Upgrade",
                description: "Redirecting to upgrade options...",
              });
              navigate('/payment');
            }}
          >
            Upgrade Subscription
          </Button>
        </div>
      </div>
    );
  }
  
  return <InventoryAuditLogs equipmentData={equipmentData} />;
};
