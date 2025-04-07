
import { supabase } from '@/integrations/supabase/client';
import { Tenant, COMPANY_TYPE_TO_CODE_MAP, DEFAULT_CODES_BY_TYPE } from '@/types/tenant';

// Fetch tenant function using Supabase
export const fetchTenant = async (id: string): Promise<Tenant> => {
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
  let industryCodeSettings = undefined;
  
  if (data.industry_code_preferences) {
    // Parse if it's a string or use directly if it's already an object
    const preferences = typeof data.industry_code_preferences === 'string' 
      ? JSON.parse(data.industry_code_preferences) 
      : data.industry_code_preferences;
      
    // Check if settings property exists in the preferences object
    if (preferences && typeof preferences === 'object') {
      if ('settings' in preferences) {
        tenantSettings = preferences.settings;
      }
      if ('industryCodeSettings' in preferences) {
        industryCodeSettings = preferences.industryCodeSettings;
      }
    }
  }
  
  // If company type exists but no code type is selected, set default code type
  if (data.company_type && (!industryCodeSettings || !industryCodeSettings.selectedCodeType)) {
    const defaultCodeType = COMPANY_TYPE_TO_CODE_MAP[data.company_type as keyof typeof COMPANY_TYPE_TO_CODE_MAP];
    if (defaultCodeType) {
      industryCodeSettings = {
        ...industryCodeSettings,
        selectedCodeType: defaultCodeType,
        customCodes: DEFAULT_CODES_BY_TYPE[defaultCodeType]
      };
    }
  }
  
  return {
    id: data.id,
    name: data.name,
    subscription_tier: data.subscription_tier,
    subscription_status: data.subscription_status,
    company_type: data.company_type,
    settings: {
      ...tenantSettings,
      industryCodeSettings
    }
  };
};

// Update tenant settings function
export const updateTenantSettings = async (tenantId: string, settings: Partial<Tenant['settings']>) => {
  if (!tenantId) throw new Error('No tenant selected');
  
  // Get current tenant data first to preserve any existing industry_code_preferences data
  const { data: currentData, error: fetchError } = await supabase
    .from('tenants')
    .select('industry_code_preferences')
    .eq('id', tenantId)
    .single();
    
  if (fetchError) throw fetchError;
  
  // Create a new preferences object, ensuring existingPreferences is a valid object
  let existingPreferences = {};
  
  // Safely handle the existing preferences
  if (currentData?.industry_code_preferences) {
    if (typeof currentData.industry_code_preferences === 'string') {
      try {
        existingPreferences = JSON.parse(currentData.industry_code_preferences);
      } catch (e) {
        console.error('Failed to parse industry_code_preferences string:', e);
        existingPreferences = {};
      }
    } else if (typeof currentData.industry_code_preferences === 'object' && currentData.industry_code_preferences !== null) {
      existingPreferences = currentData.industry_code_preferences;
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
      industry_code_preferences: newPreferences
    })
    .eq('id', tenantId);
    
  if (error) throw error;
  return settings;
};

// Update tenant company type
export const updateTenantCompanyType = async (tenantId: string, companyType: Tenant['company_type']) => {
  if (!tenantId) throw new Error('No tenant selected');
  
  // Update the tenant record with the new company type
  const { error } = await supabase
    .from('tenants')
    .update({ 
      company_type: companyType 
    })
    .eq('id', tenantId);
    
  if (error) throw error;
  
  // After updating the company type, also update industry code preferences
  // with defaults for the selected company type
  if (companyType) {
    const defaultCodeType = COMPANY_TYPE_TO_CODE_MAP[companyType];
    const defaultCodes = DEFAULT_CODES_BY_TYPE[defaultCodeType];
    
    const industryCodeSettings = {
      selectedCodeType: defaultCodeType,
      customCodes: defaultCodes
    };
    
    await updateTenantSettings(tenantId, { 
      industryCodeSettings 
    });
  }
  
  return companyType;
};
