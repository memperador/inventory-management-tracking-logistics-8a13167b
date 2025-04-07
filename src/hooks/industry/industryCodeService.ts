
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { IndustryCode } from '@/types/tenant';

interface IndustryCodeSettings {
  selectedCodeType: string;
  companyPrefix?: string;
  customCodes: IndustryCode[];
}

export const saveIndustryCodeSettings = async (
  tenantId: string,
  settings: IndustryCodeSettings,
  companyType?: string
): Promise<void> => {
  try {
    // Update company type if provided
    if (companyType) {
      try {
        const { error: companyError } = await supabase
          .from('tenants')
          .update({ company_type: companyType })
          .eq('id', tenantId);
          
        if (companyError) throw companyError;
      } catch (error) {
        console.error('Failed to update company_type:', error);
        // Continue execution even if this fails
      }
    }
    
    // Prepare the settings object
    const industryCodeSettings = {
      selectedCodeType: settings.selectedCodeType,
      companyPrefix: settings.companyPrefix,
      customCodes: settings.customCodes
    };
    
    // Stringify the entire object for storage
    const updateData = {
      industry_code_preferences: JSON.stringify({
        industryCodeSettings: industryCodeSettings
      })
    };

    // Update with industry_code_preferences
    const { error } = await supabase
      .from('tenants')
      .update(updateData)
      .eq('id', tenantId);

    if (error) throw error;
    
    toast({
      title: 'Industry Codes Saved',
      description: 'Your industry code customizations have been saved successfully.'
    });
    
    return;
  } catch (error) {
    console.error('Error updating industry codes:', error);
    toast({
      title: 'Error',
      description: 'Failed to save industry code customizations.',
      variant: 'destructive'
    });
    throw error;
  }
};

export const fetchTenantIndustrySettings = async (tenantId: string) => {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching tenant settings:', error);
    toast({
      title: 'Error',
      description: 'Failed to load tenant settings.',
      variant: 'destructive'
    });
    throw error;
  }
};
