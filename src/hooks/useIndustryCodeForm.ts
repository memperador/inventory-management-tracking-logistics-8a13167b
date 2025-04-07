
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { IndustryCode } from '@/types/tenant';
import { getDefaultCodes, getCodeTypeForCompanyType, parseIndustryCodeSettings } from '@/utils/industryCodeUtils';

// Zod schema for industry code customization
const industryCodeSchema = z.object({
  companyType: z.enum(['construction', 'electrical', 'plumbing', 'hvac', 'mechanical', 'general']).optional(),
  codeType: z.string().optional(),
  companyPrefix: z.string().optional(),
  customCodes: z.array(
    z.object({
      id: z.string(),
      code: z.string(),
      description: z.string()
    })
  )
});

export type IndustryCodeFormData = z.infer<typeof industryCodeSchema>;

export const useIndustryCodeForm = (tenantId: string, onNextStep?: () => void) => {
  const [codes, setCodes] = useState<IndustryCode[]>([]);
  const [selectedCodeType, setSelectedCodeType] = useState<string>('CSI');
  const [companyType, setCompanyType] = useState<string>('construction');
  
  const form = useForm<IndustryCodeFormData>({
    resolver: zodResolver(industryCodeSchema),
    defaultValues: {
      companyType: 'construction',
      codeType: 'CSI',
      companyPrefix: '',
      customCodes: []
    }
  });

  // Load tenant settings
  useEffect(() => {
    const fetchTenantSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', tenantId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Set company type, checking if the column exists
          const currentCompanyType = data.company_type || 'construction';
          setCompanyType(currentCompanyType);
          form.setValue('companyType', currentCompanyType as any);
          
          // Set code type based on company type
          const codeType = getCodeTypeForCompanyType(currentCompanyType);
          setSelectedCodeType(codeType);
          form.setValue('codeType', codeType);
          
          // Parse preferences from industry_code_preferences
          const settings = parseIndustryCodeSettings(data.industry_code_preferences);
          
          if (settings) {
            // Set company prefix
            if (settings.companyPrefix) {
              form.setValue('companyPrefix', settings.companyPrefix);
            }
            
            // Set selected code type
            if (settings.selectedCodeType) {
              setSelectedCodeType(settings.selectedCodeType);
              form.setValue('codeType', settings.selectedCodeType);
            }
            
            // Set custom codes
            if (settings.customCodes && Array.isArray(settings.customCodes)) {
              setCodes(settings.customCodes);
              form.setValue('customCodes', settings.customCodes);
            } else {
              // Use default codes for selected code type
              const defaultCodes = getDefaultCodes(codeType);
              setCodes(defaultCodes);
              form.setValue('customCodes', defaultCodes);
            }
          } else {
            // Use default codes for selected code type
            const defaultCodes = getDefaultCodes(codeType);
            setCodes(defaultCodes);
            form.setValue('customCodes', defaultCodes);
          }
        }
      } catch (error) {
        console.error('Error fetching tenant settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tenant settings.',
          variant: 'destructive'
        });
      }
    };
    
    fetchTenantSettings();
  }, [tenantId, form]);

  const onSubmit = async (data: IndustryCodeFormData) => {
    try {
      // Update company type if changed
      if (data.companyType && data.companyType !== companyType) {
        try {
          const { error: companyError } = await supabase
            .from('tenants')
            .update({ company_type: data.companyType })
            .eq('id', tenantId);
            
          if (companyError) throw companyError;
        } catch (error) {
          console.error('Failed to update company_type:', error);
          // Continue execution even if this fails
        }
      }
      
      // Prepare the settings object
      const industryCodeSettings = {
        selectedCodeType: data.codeType,
        companyPrefix: data.companyPrefix,
        customCodes: codes
      };
      
      // Stringify the entire object for storage
      const updateData = {
        industry_code_preferences: JSON.stringify({
          industryCodeSettings: industryCodeSettings
        })
      };

      try {
        // Update with industry_code_preferences
        const { error } = await supabase
          .from('tenants')
          .update(updateData)
          .eq('id', tenantId);

        if (error) throw error;
      } catch (error) {
        console.error('Failed to update preferences:', error);
        throw error;
      }

      toast({
        title: 'Industry Codes Saved',
        description: 'Your industry code customizations have been saved successfully.'
      });

      // Call next step if provided
      onNextStep?.();
    } catch (error) {
      console.error('Error updating industry codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save industry code customizations.',
        variant: 'destructive'
      });
    }
  };

  const handleCompanyTypeChange = (type: string) => {
    setCompanyType(type);
    form.setValue('companyType', type as any);
    
    // Update code type based on company type
    const newCodeType = getCodeTypeForCompanyType(type);
    setSelectedCodeType(newCodeType);
    form.setValue('codeType', newCodeType);
    
    // Load default codes for the selected code type
    const defaultCodes = getDefaultCodes(newCodeType);
    setCodes(defaultCodes);
    form.setValue('customCodes', defaultCodes);
  };

  const handleCodeTypeChange = (type: string) => {
    setSelectedCodeType(type);
    form.setValue('codeType', type);
    
    // Load default codes for the selected code type
    const defaultCodes = getDefaultCodes(type);
    setCodes(defaultCodes);
    form.setValue('customCodes', defaultCodes);
  };

  const addNewCode = () => {
    const newCode = {
      id: `new-${Date.now()}`,
      code: '',
      description: ''
    };
    setCodes([...codes, newCode]);
    form.setValue('customCodes', [...codes, newCode]);
  };

  const updateCode = (index: number, field: 'code' | 'description', value: string) => {
    const updatedCodes = [...codes];
    updatedCodes[index] = {
      ...updatedCodes[index],
      [field]: value
    };
    setCodes(updatedCodes);
    form.setValue('customCodes', updatedCodes);
  };

  const onDragEnd = (result: any) => {
    // Dropped outside the list
    if (!result.destination) return;
    
    const items = Array.from(codes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setCodes(items);
    form.setValue('customCodes', items);
  };

  return {
    form,
    codes,
    selectedCodeType,
    handleCompanyTypeChange,
    handleCodeTypeChange,
    addNewCode,
    updateCode,
    onDragEnd,
    onSubmit
  };
};
