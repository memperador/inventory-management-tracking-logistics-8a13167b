
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
  
  // Default settings if none exist
  const defaultSettings = {
    theme: 'light',
    features: ['equipment', 'projects', 'gps'],
  };
  
  // Safely extract settings from csi_code_preferences
  let tenantSettings = defaultSettings;
  
  if (data.csi_code_preferences) {
    // Parse if it's a string or use directly if it's already an object
    const preferences = typeof data.csi_code_preferences === 'string' 
      ? JSON.parse(data.csi_code_preferences) 
      : data.csi_code_preferences;
      
    // Check if settings property exists in the preferences object
    if (preferences && typeof preferences === 'object' && 'settings' in preferences) {
      tenantSettings = preferences.settings;
    }
  }
  
  return {
    id: data.id,
    name: data.name,
    settings: tenantSettings
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
      
      // Get current tenant data first to preserve any existing csi_code_preferences data
      const { data: currentData, error: fetchError } = await supabase
        .from('tenants')
        .select('csi_code_preferences')
        .eq('id', tenantId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Create a new preferences object, ensuring existingPreferences is a valid object
      let existingPreferences = {};
      
      // Safely handle the existing preferences
      if (currentData?.csi_code_preferences) {
        if (typeof currentData.csi_code_preferences === 'string') {
          try {
            existingPreferences = JSON.parse(currentData.csi_code_preferences);
          } catch (e) {
            console.error('Failed to parse csi_code_preferences string:', e);
            existingPreferences = {};
          }
        } else if (typeof currentData.csi_code_preferences === 'object' && currentData.csi_code_preferences !== null) {
          existingPreferences = currentData.csi_code_preferences;
        }
      }
      
      // Create the new preferences object with settings
      const newPreferences = {
        ...existingPreferences,
        settings
      };
      
      // Update the tenant record
      const { error } = await supabase
        .from('tenants')
        .update({ 
          csi_code_preferences: newPreferences
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
