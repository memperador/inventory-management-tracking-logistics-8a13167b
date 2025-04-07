
import { 
  DEFAULT_CODES_BY_TYPE, 
  COMPANY_TYPE_TO_CODE_MAP,
  IndustryCode
} from '@/types/tenant';

/**
 * Get default codes for a given code type
 */
export const getDefaultCodes = (codeType: string): IndustryCode[] => {
  return DEFAULT_CODES_BY_TYPE[codeType] || [];
};

/**
 * Get the recommended code type based on company type
 */
export const getCodeTypeForCompanyType = (companyType: string): string => {
  return COMPANY_TYPE_TO_CODE_MAP[companyType as keyof typeof COMPANY_TYPE_TO_CODE_MAP] || 'CSI';
};

/**
 * Parse the industry code settings from supabase data
 */
export const parseIndustryCodeSettings = (industryCodePreferences: any) => {
  // Default to empty settings
  let settings = undefined;
  
  if (industryCodePreferences) {
    // Parse if string, or use directly if already an object
    let parsedPreferences;
    
    if (typeof industryCodePreferences === 'string') {
      try {
        parsedPreferences = JSON.parse(industryCodePreferences);
      } catch (e) {
        console.error('Failed to parse industry_code_preferences:', e);
        parsedPreferences = {};
      }
    } else {
      parsedPreferences = industryCodePreferences;
    }
    
    // Check if industryCodeSettings property exists
    if (parsedPreferences && typeof parsedPreferences === 'object' && 'industryCodeSettings' in parsedPreferences) {
      settings = parsedPreferences.industryCodeSettings;
    }
  }

  return settings;
};
