
import { ProjectType } from '@/components/equipment/types';

export const getStatusColor = (status: ProjectType['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'planned':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const ELECTRICAL_CATEGORIES = [
  'Residential', 
  'Commercial', 
  'Industrial', 
  'Utility', 
  'Renewable Energy',
  'Data Center',
  'Healthcare',
  'Educational'
];

export const PROJECT_STATUSES = [
  'active',
  'planned',
  'completed',
  'on hold'
];
