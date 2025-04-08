
import React from 'react';
import { InventoryAuditLogs } from '@/components/inventory/audit/InventoryAuditLogs';
import { Equipment } from '@/components/equipment/types';
import { FeatureGate } from '@/components/subscription/FeatureGate';

interface AuditTabContentProps {
  equipmentData: Equipment[];
}

export const AuditTabContent: React.FC<AuditTabContentProps> = ({
  equipmentData
}) => {
  return (
    <FeatureGate featureKey="audit_logs">
      <InventoryAuditLogs equipmentData={equipmentData} />
    </FeatureGate>
  );
};
