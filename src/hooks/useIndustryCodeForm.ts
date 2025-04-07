
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IndustryCode } from '@/types/tenant';
import { getCodeTypeForCompanyType, parseIndustryCodeSettings } from '@/utils/industryCodeUtils';
import { 
  createNewCode, 
  updateCodeField, 
  handleDragEndResult,
  loadDefaultCodesForType 
} from './industry/industryCodeFormUtils';
import { 
  saveIndustryCodeSettings, 
  fetchTenantIndustrySettings 
} from './industry/industryCodeService';
import { 
  industryCodeSchema, 
  IndustryCodeFormData,
  UseIndustryCodeFormResult 
} from './industry/types';

export { IndustryCodeFormData };

export const useIndustryCodeForm = (tenantId: string, onNextStep?: () => void): UseIndustryCodeFormResult => {
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
    const loadTenantSettings = async () => {
      try {
        const data = await fetchTenantIndustrySettings(tenantId);
        
        if (!data) return;

        // Set company type
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
            const defaultCodes = loadDefaultCodesForType(codeType);
            setCodes(defaultCodes);
            form.setValue('customCodes', defaultCodes);
          }
        } else {
          // Use default codes for selected code type
          const defaultCodes = loadDefaultCodesForType(codeType);
          setCodes(defaultCodes);
          form.setValue('customCodes', defaultCodes);
        }
      } catch (error) {
        console.error('Failed to load tenant settings:', error);
      }
    };
    
    loadTenantSettings();
  }, [tenantId, form]);

  const onSubmit = async (data: IndustryCodeFormData) => {
    try {
      await saveIndustryCodeSettings(
        tenantId,
        {
          selectedCodeType: data.codeType || selectedCodeType,
          companyPrefix: data.companyPrefix,
          customCodes: codes
        },
        data.companyType && data.companyType !== companyType ? data.companyType : undefined
      );

      // Call next step if provided
      onNextStep?.();
    } catch (error) {
      console.error('Submission failed:', error);
      // Error already handled in saveIndustryCodeSettings
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
    const defaultCodes = loadDefaultCodesForType(newCodeType);
    setCodes(defaultCodes);
    form.setValue('customCodes', defaultCodes);
  };

  const handleCodeTypeChange = (type: string) => {
    setSelectedCodeType(type);
    form.setValue('codeType', type);
    
    // Load default codes for the selected code type
    const defaultCodes = loadDefaultCodesForType(type);
    setCodes(defaultCodes);
    form.setValue('customCodes', defaultCodes);
  };

  const addNewCode = () => {
    const newCode = createNewCode();
    setCodes([...codes, newCode]);
    form.setValue('customCodes', [...codes, newCode]);
  };

  const updateCode = (index: number, field: 'code' | 'description', value: string) => {
    const updatedCodes = updateCodeField(codes, index, field, value);
    setCodes(updatedCodes);
    form.setValue('customCodes', updatedCodes);
  };

  const onDragEnd = (result: any) => {
    const reorderedCodes = handleDragEndResult(result, codes);
    setCodes(reorderedCodes);
    form.setValue('customCodes', reorderedCodes);
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
