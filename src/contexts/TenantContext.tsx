
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Define tenant types
export interface Tenant {
  id: string;
  name: string;
  settings: {
    theme: string;
    features: string[];
  };
}

interface TenantContextType {
  currentTenant: Tenant | null;
  isLoading: boolean;
  error: Error | null;
  setCurrentTenant: (tenant: Tenant) => void;
  updateTenantSettings: (settings: Partial<Tenant['settings']>) => void;
}

// Create context with default values
const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Create mock tenant fetch function
const fetchTenant = async (id: string): Promise<Tenant> => {
  // In a real app, this would be an API call
  console.log(`Fetching tenant with ID: ${id}`);
  return {
    id,
    name: "Default Tenant",
    settings: {
      theme: "light",
      features: ["equipment", "projects", "gps"],
    }
  };
};

// Create a hook to use the tenant context
export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

// Provider component
export const TenantProvider = ({ children, defaultTenantId = "default" }: { children: ReactNode, defaultTenantId?: string }) => {
  const [tenantId, setTenantId] = useState<string>(defaultTenantId);
  const queryClient = useQueryClient();
  
  // Query for tenant data with caching
  const { data: currentTenant, isLoading, error } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => fetchTenant(tenantId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Mutation for updating tenant settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<Tenant['settings']>) => {
      // In a real app, this would be an API call
      console.log('Updating tenant settings:', settings);
      return settings;
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
