import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TenantContextType {
  tenantId: string | null;
  setTenantId: (tenantId: string | null) => void;
  loading: boolean;
}

export const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenantId = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_tenants')
            .select('tenant_id')
            .eq('user_id', user.id)
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

  return (
    <TenantContext.Provider value={{
      tenantId,
      setTenantId,
      loading,
    }}>
      {children}
    </TenantContext.Provider>
  );
};
