
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useQuery } from '@tanstack/react-query';

export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

interface RoleContextType {
  userRole: UserRole | null;
  isRoleLoading: boolean;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
  refreshRole: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

// Role hierarchy for permission checks
const roleHierarchy: Record<UserRole, number> = {
  'admin': 4,
  'manager': 3,
  'operator': 2,
  'viewer': 1
};

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  const { 
    data, 
    isLoading: isRoleLoading, 
    refetch
  } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      
      return data?.role as UserRole;
    },
    enabled: !!user,
  });

  // Update role when data changes
  useEffect(() => {
    if (data) {
      setUserRole(data);
    } else {
      setUserRole(null);
    }
  }, [data]);

  // Function to check if the user has the required role
  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!userRole) return false;
    
    const userRoleValue = roleHierarchy[userRole];
    const minimumRequiredRoleValue = Math.min(
      ...requiredRoles.map(role => roleHierarchy[role])
    );
    
    return userRoleValue >= minimumRequiredRoleValue;
  };

  // Convenience functions for common role checks
  const isAdmin = (): boolean => userRole === 'admin';
  const isManager = (): boolean => hasPermission(['manager']);
  
  // Function to refresh user role
  const refreshRole = () => {
    refetch();
  };

  const value = {
    userRole,
    isRoleLoading,
    hasPermission,
    isAdmin,
    isManager,
    refreshRole
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
