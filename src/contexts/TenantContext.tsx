
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Tenant } from '@/types/tenant';
import { fetchTenant, updateTenantSettings as updateSettings, updateTenantCompanyType } from '@/services/tenantService';

interface TenantContextType {
  tenantId: string | null;
  currentTenant: Tenant | null;
  setTenantId: (tenantId: string | null) => void;
  loading: boolean;
  updateTenantSettings: (settings: Partial<Tenant['settings']>) => Promise<void>;
  updateCompanyType: (companyType: Tenant['company_type']) => Promise<void>;
  createTenant: (name: string) => Promise<string | null>;
}

export const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch tenant ID when user changes
  useEffect(() => {
    const fetchTenantId = async () => {
      if (user) {
        try {
          // Query the users table instead of user_tenants
          const { data, error } = await supabase
            .from('users')
            .select('tenant_id')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error("Error fetching tenant ID:", error);
            toast({
              title: 'Error',
              description: 'Failed to fetch tenant information.',
              variant: 'destructive',
            });
          } else if (data) {
            setTenantId(data.tenant_id);
            
            // Fetch tenant details
            fetchTenantDetails(data.tenant_id);
          }
        } catch (error) {
          console.error("Unexpected error fetching tenant ID:", error);
          toast({
            title: 'Error',
            description: 'An unexpected error occurred while fetching tenant information.',
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchTenantId();
  }, [user]);
  
  // Fetch tenant details when tenant ID changes
  const fetchTenantDetails = async (id: string) => {
    if (!id) return;
    
    try {
      const tenantData = await fetchTenant(id);
      setCurrentTenant(tenantData);
    } catch (error) {
      console.error("Error fetching tenant details:", error);
    }
  };
  
  // Create a new tenant
  const createTenant = async (name: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .insert({
          name,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      if (!data || !data.id) {
        throw new Error("No tenant ID returned after creation");
      }
      
      return data.id;
    } catch (error) {
      console.error("Error creating tenant:", error);
      toast({
        title: 'Error',
        description: 'Failed to create tenant.',
        variant: 'destructive',
      });
      return null;
    }
  };
  
  // Update tenant settings
  const handleUpdateTenantSettings = async (settings: Partial<Tenant['settings']>) => {
    if (!tenantId || !currentTenant) {
      throw new Error("No tenant selected");
    }
    
    try {
      await updateSettings(tenantId, settings);
      
      // Update local state
      setCurrentTenant({
        ...currentTenant,
        settings: {
          ...currentTenant.settings,
          ...settings
        }
      });
      
    } catch (error) {
      console.error("Error updating tenant settings:", error);
      throw error;
    }
  };
  
  // Update company type
  const handleUpdateCompanyType = async (companyType: Tenant['company_type']) => {
    if (!tenantId || !currentTenant) {
      throw new Error("No tenant selected");
    }
    
    try {
      await updateTenantCompanyType(tenantId, companyType);
      
      // Update local state
      setCurrentTenant({
        ...currentTenant,
        company_type: companyType
      });
      
    } catch (error) {
      console.error("Error updating company type:", error);
      throw error;
    }
  };

  return (
    <TenantContext.Provider value={{
      tenantId,
      currentTenant,
      setTenantId,
      loading,
      updateTenantSettings: handleUpdateTenantSettings,
      updateCompanyType: handleUpdateCompanyType,
      createTenant
    }}>
      {children}
    </TenantContext.Provider>
  );
};

