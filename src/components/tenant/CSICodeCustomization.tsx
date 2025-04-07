
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { IndustryCodeList } from './IndustryCodeList';
import { DEFAULT_CODES_BY_TYPE, IndustryCode } from '@/types/tenant';
import { parseIndustryCodeSettings } from '@/utils/industryCodeUtils';

// Zod schema for CSI code customization
const csiCodeSchema = z.object({
  companyPrefix: z.string().optional(),
  customCodes: z.array(
    z.object({
      id: z.string(),
      code: z.string(),
      description: z.string()
    })
  )
});

type CSICodeFormData = z.infer<typeof csiCodeSchema>;

// Sample CSI codes from DEFAULT_CODES_BY_TYPE
const defaultCSICodes = DEFAULT_CODES_BY_TYPE['CSI'];

interface CSICodeCustomizationProps {
  tenantId: string;
  onNextStep?: () => void;
}

export function CSICodeCustomization({ tenantId, onNextStep }: CSICodeCustomizationProps) {
  const [codes, setCodes] = useState(defaultCSICodes);
  const [selectedCodeType] = useState<string>('CSI');
  
  const form = useForm<CSICodeFormData>({
    resolver: zodResolver(csiCodeSchema),
    defaultValues: {
      companyPrefix: '',
      customCodes: defaultCSICodes
    }
  });

  React.useEffect(() => {
    const fetchTenantSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('industry_code_preferences')
          .eq('id', tenantId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Parse preferences from industry_code_preferences
          const settings = parseIndustryCodeSettings(data.industry_code_preferences);
          
          if (settings) {
            // Set company prefix
            if (settings.companyPrefix) {
              form.setValue('companyPrefix', settings.companyPrefix);
            }
            
            // Set custom codes
            if (settings.customCodes && Array.isArray(settings.customCodes)) {
              setCodes(settings.customCodes);
              form.setValue('customCodes', settings.customCodes);
            }
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

  const onDragEnd = (result: any) => {
    // Dropped outside the list
    if (!result.destination) return;
    
    const items = Array.from(codes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setCodes(items);
    form.setValue('customCodes', items);
  };

  const onSubmit = async (data: CSICodeFormData) => {
    try {
      // Save CSI code preferences to tenant using stringified JSON
      const updateData = {
        industry_code_preferences: JSON.stringify({
          industryCodeSettings: {
            selectedCodeType: 'CSI',
            companyPrefix: data.companyPrefix,
            customCodes: codes
          }
        })
      };

      const { error } = await supabase
        .from('tenants')
        .update(updateData)
        .eq('id', tenantId)
        .single();

      if (error) throw error;

      toast({
        title: 'CSI Codes Saved',
        description: 'Your CSI code customizations have been saved successfully.'
      });

      // Call next step if provided
      onNextStep?.();
    } catch (error) {
      console.error('Error updating CSI codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save CSI code customizations.',
        variant: 'destructive'
      });
    }
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

        <IndustryCodeList
          codes={codes}
          selectedCodeType={selectedCodeType}
          updateCode={updateCode}
          onDragEnd={onDragEnd}
          addNewCode={addNewCode}
        />

        <Button type="submit" className="w-full">
          Save and Continue
        </Button>
      </form>
    </Form>
  );
}
