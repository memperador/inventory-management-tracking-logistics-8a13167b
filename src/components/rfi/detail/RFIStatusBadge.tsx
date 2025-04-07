
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { RFIStatus } from '../types';

interface RFIStatusBadgeProps {
  status: RFIStatus;
}

const RFIStatusBadge: React.FC<RFIStatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: RFIStatus): string => {
    switch (status) {
      case 'draft':
        return 'bg-slate-500';
      case 'submitted':
        return 'bg-blue-500';
      case 'answered':
        return 'bg-green-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default RFIStatusBadge;
