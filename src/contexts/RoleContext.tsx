
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { useQuery } from '@tanstack/react-query';
import { UserRole, RoleContextType, roleHierarchy } from '@/types/roles';
import { toast } from '@/hooks/use-toast';

// Create the context with undefined as default value
export const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const { user, session, refreshSession } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());

  const { 
    data, 
    isLoading: isRoleLoading, 
    refetch
  } = useQuery({
    queryKey: ['userRole', user?.id, lastRefreshed],
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

  // Listen for auth events to refresh role
  useEffect(() => {
    const handleAuthChange = async () => {
      if (user) {
        refetch();
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
        handleAuthChange();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user, refetch]);

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
  const isAdmin = (): boolean => userRole === 'admin' || userRole === 'superadmin';
  const isManager = (): boolean => hasPermission(['manager']);
  
  // Function to refresh user role
  const refreshRole = async () => {
    try {
      await refreshSession();
      setLastRefreshed(Date.now());
      await refetch();
      
      toast({
        title: 'Role Refreshed',
        description: 'Your current role has been refreshed.',
      });
    } catch (error) {
      console.error('Failed to refresh role:', error);
    }
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

// Export the hook from this file for backward compatibility
export { useRole } from '@/hooks/useRoleContext';
