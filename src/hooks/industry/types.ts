
import { z } from 'zod';
import { IndustryCode } from '@/types/tenant';

// Zod schema for industry code customization
export const industryCodeSchema = z.object({
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

export interface UseIndustryCodeFormResult {
  form: any; // React Hook Form's UseFormReturn type
  codes: IndustryCode[];
  selectedCodeType: string;
  handleCompanyTypeChange: (type: string) => void;
  handleCodeTypeChange: (type: string) => void;
  addNewCode: () => void;
  updateCode: (index: number, field: 'code' | 'description', value: string) => void;
  onDragEnd: (result: any) => void;
  onSubmit: (data: IndustryCodeFormData) => Promise<void>;
}
