
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
  
  // Safely extract settings from industry_code_preferences or csi_code_preferences
  let tenantSettings = defaultSettings;
  let industryCodeSettings = undefined;
  
  // Check if industry_code_preferences exists, if not fallback to csi_code_preferences (for backward compatibility)
  const preferences = 'industry_code_preferences' in data ? data.industry_code_preferences : data.csi_code_preferences;
  
  if (preferences) {
    // Parse if it's a string or use directly if it's already an object
    const parsedPreferences = typeof preferences === 'string' 
      ? JSON.parse(preferences) 
      : preferences;
      
    // Check if settings property exists in the preferences object
    if (parsedPreferences && typeof parsedPreferences === 'object') {
      if ('settings' in parsedPreferences) {
        tenantSettings = parsedPreferences.settings;
      }
      if ('industryCodeSettings' in parsedPreferences) {
        industryCodeSettings = parsedPreferences.industryCodeSettings;
      }
    }
  }
  
  // If company type exists but no code type is selected, set default code type
  const companyType = 'company_type' in data ? data.company_type : null;
  if (companyType && (!industryCodeSettings || !industryCodeSettings.selectedCodeType)) {
    const defaultCodeType = COMPANY_TYPE_TO_CODE_MAP[companyType as keyof typeof COMPANY_TYPE_TO_CODE_MAP];
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
    company_type: companyType,
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
    .select('industry_code_preferences, csi_code_preferences')
    .eq('id', tenantId)
    .single();
    
  if (fetchError) throw fetchError;
  
  // Create a new preferences object, ensuring existingPreferences is a valid object
  let existingPreferences = {};
  
  // Safely handle the existing preferences, checking for both column names
  const preferences = currentData?.industry_code_preferences || currentData?.csi_code_preferences;
  
  if (preferences) {
    if (typeof preferences === 'string') {
      try {
        existingPreferences = JSON.parse(preferences);
      } catch (e) {
        console.error('Failed to parse preferences string:', e);
        existingPreferences = {};
      }
    } else if (typeof preferences === 'object' && preferences !== null) {
      existingPreferences = preferences;
    }
  }
  
  // Create the new preferences object with settings
  const newPreferences = {
    ...existingPreferences,
    settings
  };
  
  // Try to update using industry_code_preferences first, falling back to csi_code_preferences if needed
  try {
    // Update the tenant record using industry_code_preferences
    const { error } = await supabase
      .from('tenants')
      .update({ 
        industry_code_preferences: newPreferences
      })
      .eq('id', tenantId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Failed to update industry_code_preferences, trying csi_code_preferences:', error);
    
    // Fallback to using csi_code_preferences
    const { error: fallbackError } = await supabase
      .from('tenants')
      .update({ 
        csi_code_preferences: newPreferences
      })
      .eq('id', tenantId);
      
    if (fallbackError) throw fallbackError;
  }
  
  return settings;
};

// Update tenant company type
export const updateTenantCompanyType = async (tenantId: string, companyType: Tenant['company_type']) => {
  if (!tenantId) throw new Error('No tenant selected');
  
  try {
    // Try to update using company_type column
    const { error } = await supabase
      .from('tenants')
      .update({ company_type: companyType })
      .eq('id', tenantId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error updating company_type:', error);
    throw error;
  }
  
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
