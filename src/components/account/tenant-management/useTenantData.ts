
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tenant } from '@/types/tenant';

export const useTenantData = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);

  useEffect(() => {
    const fetchTenants = async () => {
      setIsLoadingTenants(true);
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('*');
          
        if (error) throw error;
        
        // Map the raw tenant data to match the Tenant interface with required settings property
        const mappedTenants: Tenant[] = (data || []).map(tenant => {
          // Create default settings object
          let settingsObject = {
            theme: 'light',
            features: [],
          };
          
          // Safely parse industry_code_preferences if it exists
          if (tenant.industry_code_preferences) {
            try {
              // Handle string type
              if (typeof tenant.industry_code_preferences === 'string') {
                const parsed = JSON.parse(tenant.industry_code_preferences);
                if (parsed && typeof parsed === 'object' && parsed.settings) {
                  settingsObject = { ...settingsObject, ...parsed.settings };
                }
              } 
              // Handle object type
              else if (typeof tenant.industry_code_preferences === 'object' && tenant.industry_code_preferences !== null) {
                const preferences = tenant.industry_code_preferences as Record<string, unknown>;
                if (preferences.settings && typeof preferences.settings === 'object') {
                  settingsObject = { 
                    ...settingsObject, 
                    ...preferences.settings as Record<string, unknown> 
                  };
                }
              }
            } catch (e) {
              console.error('Error parsing industry_code_preferences:', e);
            }
          }
          
          return {
            id: tenant.id,
            name: tenant.name,
            subscription_tier: tenant.subscription_tier,
            subscription_status: tenant.subscription_status,
            company_type: tenant.company_type as Tenant['company_type'],
            trial_ends_at: tenant.trial_ends_at,
            subscription_expires_at: tenant.subscription_expires_at,
            settings: settingsObject
          };
        });
        
        setTenants(mappedTenants);
      } catch (error) {
        console.error('Error fetching tenants:', error);
      } finally {
        setIsLoadingTenants(false);
      }
    };
    
    fetchTenants();
  }, []);

  return { tenants, isLoadingTenants };
};
