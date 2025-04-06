
import { supabase } from '@/integrations/supabase/client';
import { Tenant } from '@/types/tenant';

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

// Update tenant settings function
export const updateTenantSettings = async (tenantId: string, settings: Partial<Tenant['settings']>) => {
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
};
