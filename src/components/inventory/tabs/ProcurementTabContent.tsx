
import React from 'react';
import { ProcurementIntegration } from '@/components/inventory/procurement/ProcurementIntegration';
import { Equipment } from '@/components/equipment/types';

interface ProcurementTabContentProps {
  equipmentData: Equipment[];
}

export const ProcurementTabContent: React.FC<ProcurementTabContentProps> = ({
  equipmentData
}) => {
  return <ProcurementIntegration equipmentData={equipmentData} />;
};
