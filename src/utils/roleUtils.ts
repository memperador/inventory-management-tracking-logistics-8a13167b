
import { UserRole } from '@/types/roles';
import { NavItem } from '@/components/layout/sidebar/SidebarNavGroup';

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

// Filter navigation items based on user role and required roles
export const filterNavItemsByRole = (items: NavItem[], userRole: UserRole | null): NavItem[] => {
  if (!userRole) return [];
  
  return items.filter(item => {
    // If roles is defined, check if user has one of those roles
    if (item.roles) {
      return item.roles.includes(userRole);
    }
    // If requiredRoles is defined, check if user has one of those roles
    else if (item.requiredRoles) {
      return item.requiredRoles.includes(userRole);
    }
    // If neither is defined, show the item to everyone
    return true;
  });
};
