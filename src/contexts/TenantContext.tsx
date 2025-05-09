import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Tenant } from '@/types/tenant';
import { fetchTenant, updateTenantSettings as updateSettings, updateTenantCompanyType } from '@/services/tenantService';

interface TenantContextType {
  tenantId: string | null;
  currentTenant: Tenant | null;
  setTenantId: (tenantId: string | null) => void;
  loading: boolean;
  error: Error | null;
  updateTenantSettings: (settings: Partial<Tenant['settings']>) => Promise<void>;
  updateCompanyType: (companyType: Tenant['company_type']) => Promise<void>;
  createTenant: (name: string) => Promise<string | null>;
  hasActiveSubscription: () => boolean;
  setCurrentTenant: (tenant: Tenant) => void;
}

export const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
  userId?: string | null;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children, userId = null }) => {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTenantId = async () => {
      if (userId) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('tenant_id')
            .eq('id', userId)
            .single();

          if (error) {
            console.error("Error fetching tenant ID:", error);
            setError(new Error(error.message));
            toast({
              title: 'Error',
              description: 'Failed to fetch tenant information.',
              variant: 'destructive',
            });
          } else if (data) {
            setTenantId(data.tenant_id);
            
            fetchTenantDetails(data.tenant_id);
          }
        } catch (error: any) {
          console.error("Unexpected error fetching tenant ID:", error);
          setError(new Error(error.message));
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
  }, [userId]);
  
  const fetchTenantDetails = async (id: string) => {
    if (!id) return;
    
    try {
      const tenantData = await fetchTenant(id);
      setCurrentTenant(tenantData);
    } catch (error: any) {
      console.error("Error fetching tenant details:", error);
      setError(new Error(error.message));
    }
  };
  
  const hasActiveSubscription = (): boolean => {
    if (!currentTenant) return false;
    
    const now = new Date();
    const trialEndsAt = currentTenant.trial_ends_at ? new Date(currentTenant.trial_ends_at) : null;
    const isActive = currentTenant.subscription_status === 'active';
    const inTrial = trialEndsAt && trialEndsAt > now;
    
    return isActive || inTrial;
  };
  
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
    } catch (error: any) {
      console.error("Error creating tenant:", error);
      setError(new Error(error.message));
      toast({
        title: 'Error',
        description: 'Failed to create tenant.',
        variant: 'destructive',
      });
      return null;
    }
  };
  
  const handleUpdateTenantSettings = async (settings: Partial<Tenant['settings']>) => {
    if (!tenantId || !currentTenant) {
      throw new Error("No tenant selected");
    }
    
    try {
      await updateSettings(tenantId, settings);
      
      setCurrentTenant({
        ...currentTenant,
        settings: {
          ...currentTenant.settings,
          ...settings
        }
      });
      
    } catch (error: any) {
      console.error("Error updating tenant settings:", error);
      setError(new Error(error.message));
      throw error;
    }
  };
  
  const handleUpdateCompanyType = async (companyType: Tenant['company_type']) => {
    if (!tenantId || !currentTenant) {
      throw new Error("No tenant selected");
    }
    
    try {
      await updateTenantCompanyType(tenantId, companyType);
      
      setCurrentTenant({
        ...currentTenant,
        company_type: companyType
      });
      
    } catch (error: any) {
      console.error("Error updating company type:", error);
      setError(new Error(error.message));
      throw error;
    }
  };

  return (
    <TenantContext.Provider value={{
      tenantId,
      currentTenant,
      setTenantId,
      loading,
      error,
      updateTenantSettings: handleUpdateTenantSettings,
      updateCompanyType: handleUpdateCompanyType,
      createTenant,
      hasActiveSubscription,
      setCurrentTenant
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = React.useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
