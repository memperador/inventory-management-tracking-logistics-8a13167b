
import React, { createContext, useState, ReactNode, useEffect, useCallback } from 'react';
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
  const [forceRefreshCounter, setForceRefreshCounter] = useState(0);

  // Function to refresh user role
  const refreshRole = useCallback(async (showToast = true) => {
    try {
      console.log('RoleContext: Refreshing user role');
      // First refresh the session to get latest metadata
      await refreshSession();
      
      // Update timestamp to trigger query refetch
      setLastRefreshed(Date.now());
      
      // Increase force refresh counter
      setForceRefreshCounter(prev => prev + 1);
      
      if (showToast) {
        toast({
          title: 'Role Refreshed',
          description: 'Your current role has been refreshed.',
        });
      }
    } catch (error) {
      console.error('Failed to refresh role:', error);
    }
  }, [refreshSession]);

  const { 
    data, 
    isLoading: isRoleLoading, 
    refetch
  } = useQuery({
    queryKey: ['userRole', user?.id, lastRefreshed, forceRefreshCounter],
    queryFn: async () => {
      if (!user) return null;
      
      console.log('RoleContext: Fetching user role from database');
      
      // First check user metadata for role
      const metadataRole = user.user_metadata?.role as UserRole | undefined;
      console.log('RoleContext: Role from metadata:', metadataRole);
      
      // Then check database
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role from database:', error);
        // If there's an error but we have metadata, use that
        return metadataRole || null;
      }
      
      console.log('RoleContext: Role from database:', data?.role);
      
      // If roles don't match, update metadata
      if (metadataRole !== data?.role && data?.role) {
        console.log('RoleContext: Roles don\'t match, updating metadata');
        await supabase.auth.updateUser({
          data: { role: data.role }
        });
      }
      
      return data?.role as UserRole;
    },
    enabled: !!user,
  });

  // Update role when data changes
  useEffect(() => {
    if (data) {
      console.log('RoleContext: Setting user role to:', data);
      setUserRole(data);
    } else {
      setUserRole(null);
    }
  }, [data]);

  // Listen for auth events to refresh role
  useEffect(() => {
    const handleAuthChange = async (event: string) => {
      if (user) {
        console.log(`RoleContext: Auth event ${event} detected, refreshing role`);
        await refetch();
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        handleAuthChange(event);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user, refetch]);

  // Auto refresh on mount or when user changes
  useEffect(() => {
    if (user) {
      console.log('RoleContext: User changed or component mounted, refreshing role');
      refreshRole(false);
    }
  }, [user, refreshRole]);

  // Special case for labrat user - auto refresh role
  useEffect(() => {
    if (user?.email === 'labrat@iaware.com' && userRole !== 'admin') {
      console.log('RoleContext: Detected labrat user without admin role, auto-refreshing');
      const timer = setTimeout(() => {
        refreshRole(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user, userRole, refreshRole]);

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
