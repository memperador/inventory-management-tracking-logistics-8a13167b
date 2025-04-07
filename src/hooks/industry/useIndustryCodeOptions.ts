
import { useMemo } from 'react';
import { IndustryCode } from '@/types/tenant';
import { getDefaultCodes } from '@/utils/industryCodeUtils';

export const useIndustryCodeOptions = () => {
  // Get CSI and NEC code options
  const csiOptions = useMemo(() => {
    const csiCodes = getDefaultCodes('CSI');
    return csiCodes.map(code => ({
      code: code.code,
      label: `${code.code} - ${code.description}`
    }));
  }, []);

  const necOptions = useMemo(() => {
    const necCodes = getDefaultCodes('NEC');
    return necCodes.map(code => ({
      code: code.code,
      label: `${code.code} - ${code.description}`
    }));
  }, []);

  const csiPlaceholder = "Enter CSI code (e.g., 01-10)";
  const necPlaceholder = "Enter NEC code (e.g., 110)";

  // Helper functions for type-specific fields
  const showTypeSpecificFields = (type: string) => {
    switch (type) {
      case 'Electrical':
        return true;
      case 'HVAC':
        return true;
      default:
        return false;
    }
  };

  return {
    csiOptions,
    necOptions,
    csiPlaceholder,
    necPlaceholder,
    showTypeSpecificFields
  };
};
