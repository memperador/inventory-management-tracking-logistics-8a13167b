
import React from 'react';
import { InventoryAuditLogs } from '@/components/inventory/audit/InventoryAuditLogs';
import { Equipment } from '@/components/equipment/types';

interface AuditTabContentProps {
  equipmentData: Equipment[];
}

export const AuditTabContent: React.FC<AuditTabContentProps> = ({
  equipmentData
}) => {
  return <InventoryAuditLogs equipmentData={equipmentData} />;
};
