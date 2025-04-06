
// Define role types
export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

export interface RoleContextType {
  userRole: UserRole | null;
  isRoleLoading: boolean;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  refreshRole: () => void;
}

// Role hierarchy for permission checks
export const roleHierarchy: Record<UserRole, number> = {
  'admin': 4,
  'manager': 3,
  'operator': 2,
  'viewer': 1
};
