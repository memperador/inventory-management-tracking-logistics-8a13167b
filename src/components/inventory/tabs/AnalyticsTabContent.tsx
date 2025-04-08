
import React from 'react';
import { EnhancedDashboard } from '@/components/inventory/analytics/EnhancedDashboard';
import { Equipment } from '@/components/equipment/types';

interface AnalyticsTabContentProps {
  equipmentData: Equipment[];
}

export const AnalyticsTabContent: React.FC<AnalyticsTabContentProps> = ({
  equipmentData
}) => {
  return <EnhancedDashboard equipmentData={equipmentData} />;
};
