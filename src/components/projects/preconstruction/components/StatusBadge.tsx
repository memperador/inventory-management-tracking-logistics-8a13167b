
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckSquare, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { ChecklistItemStatus } from '../../types/preConstructionTypes';

interface StatusBadgeProps {
  status: ChecklistItemStatus;
}

export const statusIcons = {
  'pending': <Clock className="h-4 w-4 text-yellow-500" />,
  'in-progress': <AlertCircle className="h-4 w-4 text-blue-500" />,
  'completed': <CheckSquare className="h-4 w-4 text-green-500" />,
  'not-required': <FileText className="h-4 w-4 text-gray-500" />
};

export const statusLabels: Record<ChecklistItemStatus, string> = {
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'not-required': 'Not Required'
};

export const statusColors: Record<ChecklistItemStatus, string> = {
  'pending': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  'in-progress': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'completed': 'bg-green-100 text-green-800 hover:bg-green-200',
  'not-required': 'bg-gray-100 text-gray-800 hover:bg-gray-200'
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <Badge variant="outline" className="flex items-center gap-1">
      {statusIcons[status]}
      {statusLabels[status]}
    </Badge>
  );
};

export default StatusBadge;
