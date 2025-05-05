
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/types/roles';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  'admin': 100,
  'manager': 75,
  'operator': 50,
  'viewer': 25,
  'editor': 30,
  'superadmin': 150
};

/**
 * Checks if a user has a specific role
 * @param user The user object to check
 * @param requiredRole The required role
 * @returns Boolean indicating if the user has the required role
 */
export function hasRole(user: User | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  
  const userRole = user.user_metadata?.role as UserRole || 'viewer';
  return userRole === requiredRole;
}

/**
 * Checks if a user has one of the required roles
 * @param user The user object to check
 * @param requiredRoles Array of required roles (any match is sufficient)
 * @returns Boolean indicating if the user has any of the required roles
 */
export function hasAnyRole(user: User | null, requiredRoles: UserRole[]): boolean {
  if (!user) return false;
  if (!requiredRoles.length) return true; // No roles required
  
  const userRole = user.user_metadata?.role as UserRole || 'viewer';
  return requiredRoles.includes(userRole);
}

/**
 * Checks if a user's role has sufficient privilege level compared to required role
 * @param user The user object to check
 * @param requiredRole The minimum required role level
 * @returns Boolean indicating if the user has sufficient privileges
 */
export function hasRoleLevel(user: User | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  
  const userRole = user.user_metadata?.role as UserRole || 'viewer';
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}

/**
 * Gets user's display name
 * @param user The user object
 * @returns String with user's full name or email as fallback
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest';
  
  const firstName = user.user_metadata?.first_name;
  const lastName = user.user_metadata?.last_name;
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else {
    return user.email || 'User';
  }
}

/**
 * Safely sanitize user input to prevent XSS attacks
 * @param input String input to sanitize
 * @returns Sanitized string
 */
export function sanitizeUserInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
