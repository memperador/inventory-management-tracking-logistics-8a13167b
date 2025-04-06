
import React, { createContext, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Tenant, TenantContextType } from '@/types/tenant';
import { fetchTenant, updateTenantSettings as updateTenantSettingsService } from '@/services/tenantService';

// Create context with default values
const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Provider component
export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [tenantId, setTenantId] = useState<string>('');
  const queryClient = useQueryClient();
  
  // Get the tenant ID from the user profile
  useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      if (data?.tenant_id) {
        setTenantId(data.tenant_id);
      }
      return data;
    },
    enabled: !!user,
  });
  
  // Query for tenant data with caching
  const { data: currentTenant, isLoading, error } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => fetchTenant(tenantId),
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Mutation for updating tenant settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<Tenant['settings']>) => {
      if (!tenantId) throw new Error('No tenant selected');
      return updateTenantSettingsService(tenantId, settings);
    },
    onSuccess: (newSettings) => {
      // Optimistically update the cache
      queryClient.setQueryData(['tenant', tenantId], (oldData: Tenant | undefined) => {
        if (!oldData) return null;
        return {
          ...oldData,
          settings: {
            ...oldData.settings,
            ...newSettings,
          },
        };
      });
    }
  });
  
  const setCurrentTenant = (tenant: Tenant) => {
    setTenantId(tenant.id);
  };
  
  const updateTenantSettings = (settings: Partial<Tenant['settings']>) => {
    updateSettingsMutation.mutate(settings);
  };
  
  const value = {
    currentTenant: currentTenant || null,
    isLoading,
    error: error as Error | null,
    setCurrentTenant,
    updateTenantSettings,
  };
  
  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

// Re-export the hook for convenience
export { useTenant } from '@/hooks/useTenantContext';
