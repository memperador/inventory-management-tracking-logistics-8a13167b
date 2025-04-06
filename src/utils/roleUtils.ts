
import { UserRole } from '@/types/roles';

export const getRoleBadgeColor = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'bg-inventory-blue-light text-inventory-blue border-inventory-blue';
    case 'manager':
      return 'bg-inventory-green-light text-inventory-green border-inventory-green';
    case 'operator':
      return 'bg-inventory-yellow-light text-inventory-yellow border-inventory-yellow';
    case 'viewer':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return '';
  }
};

export const getAllRoles = (): UserRole[] => {
  return ['admin', 'manager', 'operator', 'viewer'];
};
