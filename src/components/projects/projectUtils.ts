
import { ProjectType } from '@/components/equipment/types';

export const getStatusColor = (status: ProjectType['status']) => {
  switch (status) {
    case 'active':
      return 'bg-inventory-green-light text-inventory-green border-inventory-green';
    case 'completed':
      return 'bg-inventory-blue-light text-inventory-blue border-inventory-blue';
    case 'planned':
      return 'bg-inventory-yellow-light text-inventory-yellow border-inventory-yellow';
    default:
      return '';
  }
};

export const ELECTRICAL_CATEGORIES = ['Residential', 'Commercial', 'Industrial', 'Maintenance', 'Emergency'];
