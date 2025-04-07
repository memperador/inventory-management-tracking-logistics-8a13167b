
import { IndustryCode } from '@/types/tenant';
import { getDefaultCodes } from '@/utils/industryCodeUtils';

export const createNewCode = (): IndustryCode => ({
  id: `new-${Date.now()}`,
  code: '',
  description: ''
});

export const updateCodeField = (
  codes: IndustryCode[],
  index: number,
  field: 'code' | 'description',
  value: string
): IndustryCode[] => {
  const updatedCodes = [...codes];
  updatedCodes[index] = {
    ...updatedCodes[index],
    [field]: value
  };
  return updatedCodes;
};

export const handleDragEndResult = (
  result: any,
  codes: IndustryCode[]
): IndustryCode[] => {
  // Dropped outside the list
  if (!result.destination) return codes;
  
  const items = Array.from(codes);
  const [reorderedItem] = items.splice(result.source.index, 1);
  items.splice(result.destination.index, 0, reorderedItem);
  
  return items;
};

export const loadDefaultCodesForType = (codeType: string): IndustryCode[] => {
  return getDefaultCodes(codeType);
};
