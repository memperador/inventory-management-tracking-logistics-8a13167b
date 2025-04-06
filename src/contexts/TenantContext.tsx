
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

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

// Fetch tenant function using Supabase
const fetchTenant = async (id: string): Promise<Tenant> => {
  if (!id) {
    throw new Error('No tenant ID provided');
  }
  
  console.log(`Fetching tenant with ID: ${id}`);
  
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching tenant:', error);
    throw error;
  }
  
  if (!data) {
    throw new Error('Tenant not found');
  }
  
  // Extract settings from csi_code_preferences or provide defaults
  const settings = data.csi_code_preferences?.settings || {
    theme: 'light',
    features: ['equipment', 'projects', 'gps'],
  };
  
  return {
    id: data.id,
    name: data.name,
    settings: settings
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
      
      // Store settings inside csi_code_preferences as a nested object
      const { error } = await supabase
        .from('tenants')
        .update({ 
          csi_code_preferences: { 
            settings: settings 
          } 
        })
        .eq('id', tenantId);
        
      if (error) throw error;
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
