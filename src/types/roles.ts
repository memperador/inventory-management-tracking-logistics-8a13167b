export type UserRole = 'admin' | 'manager' | 'editor' | 'viewer' | 'superadmin';

// Hierarchy of roles, with higher numbers having more permissions
export const roleHierarchy: Record<UserRole, number> = {
  'superadmin': 100, // Highest level - can configure AI settings
  'admin': 75,       // Can manage most system settings
  'manager': 50,     // Can manage projects and users
  'editor': 25,      // Can edit content
  'viewer': 10       // Can only view content
};

export interface RoleContextType {
  userRole: UserRole | null;
  isRoleLoading: boolean;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  refreshRole: () => void;
}
