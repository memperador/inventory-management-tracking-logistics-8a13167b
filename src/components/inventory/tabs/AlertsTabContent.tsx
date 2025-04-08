
import React from 'react';
import { InventoryAlerts } from '@/components/inventory/alerts/InventoryAlerts';
import { Equipment } from '@/components/equipment/types';

interface AlertsTabContentProps {
  equipmentData: Equipment[];
}

export const AlertsTabContent: React.FC<AlertsTabContentProps> = ({
  equipmentData
}) => {
  return <InventoryAlerts equipmentData={equipmentData} />;
};
