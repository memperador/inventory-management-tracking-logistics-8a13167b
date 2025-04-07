
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { INDUSTRY_CODE_TYPES } from '@/types/tenant';
import { IndustryCodeFormData } from '@/hooks/industry/types';

interface IndustryCodeFormFieldsProps {
  form: UseFormReturn<IndustryCodeFormData>;
  handleCompanyTypeChange: (type: string) => void;
  handleCodeTypeChange: (type: string) => void;
}

export function IndustryCodeFormFields({
  form,
  handleCompanyTypeChange,
  handleCodeTypeChange
}: IndustryCodeFormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="companyType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Type</FormLabel>
            <Select 
              onValueChange={(value) => handleCompanyTypeChange(value)} 
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select company type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="hvac">HVAC</SelectItem>
                <SelectItem value="mechanical">Mechanical</SelectItem>
                <SelectItem value="general">General Contractor</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="codeType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Industry Code Type</FormLabel>
            <Select 
              onValueChange={(value) => handleCodeTypeChange(value)} 
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select code type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.entries(INDUSTRY_CODE_TYPES).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="companyPrefix"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company Prefix (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="e.g., ACME-" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
