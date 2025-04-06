
import React, { ReactNode } from 'react';
import { UserRole } from '@/types/roles';
import { useRole } from '@/hooks/useRoleContext';

interface PermissionProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

const Permission: React.FC<PermissionProps> = ({
  allowedRoles,
  children,
  fallback = null,
}) => {
  const { hasPermission } = useRole();
  
  if (hasPermission(allowedRoles)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};

export default Permission;
