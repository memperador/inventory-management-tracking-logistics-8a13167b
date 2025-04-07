
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { MoveVertical } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DEFAULT_CODES_BY_TYPE, 
  INDUSTRY_CODE_TYPES, 
  COMPANY_TYPE_TO_CODE_MAP,
  IndustryCode
} from '@/types/tenant';

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

type IndustryCodeFormData = z.infer<typeof industryCodeSchema>;

interface IndustryCodeCustomizationProps {
  tenantId: string;
  onNextStep?: () => void;
}

export function IndustryCodeCustomization({ tenantId, onNextStep }: IndustryCodeCustomizationProps) {
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
          .select('company_type, industry_code_preferences')
          .eq('id', tenantId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          // Set company type
          const currentCompanyType = data.company_type || 'construction';
          setCompanyType(currentCompanyType);
          form.setValue('companyType', currentCompanyType as any);
          
          // Set code type based on company type
          const codeType = COMPANY_TYPE_TO_CODE_MAP[currentCompanyType as keyof typeof COMPANY_TYPE_TO_CODE_MAP] || 'CSI';
          setSelectedCodeType(codeType);
          form.setValue('codeType', codeType);
          
          // Parse preferences
          let preferences = data.industry_code_preferences;
          if (typeof preferences === 'string') {
            preferences = JSON.parse(preferences);
          }
          
          if (preferences?.industryCodeSettings) {
            const settings = preferences.industryCodeSettings;
            
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
              const defaultCodes = DEFAULT_CODES_BY_TYPE[codeType] || [];
              setCodes(defaultCodes);
              form.setValue('customCodes', defaultCodes);
            }
          } else {
            // Use default codes for selected code type
            const defaultCodes = DEFAULT_CODES_BY_TYPE[codeType] || [];
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

  const onDragEnd = (result: any) => {
    // Dropped outside the list
    if (!result.destination) return;
    
    const items = Array.from(codes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setCodes(items);
    form.setValue('customCodes', items);
  };

  const onSubmit = async (data: IndustryCodeFormData) => {
    try {
      // Update company type if changed
      if (data.companyType && data.companyType !== companyType) {
        const { error: companyError } = await supabase
          .from('tenants')
          .update({ company_type: data.companyType })
          .eq('id', tenantId);
          
        if (companyError) throw companyError;
      }
      
      // Save industry code preferences
      const updateData = {
        industry_code_preferences: {
          industryCodeSettings: {
            selectedCodeType: data.codeType,
            companyPrefix: data.companyPrefix,
            customCodes: codes
          }
        }
      };

      const { error } = await supabase
        .from('tenants')
        .update(updateData)
        .eq('id', tenantId);

      if (error) throw error;

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
    const newCodeType = COMPANY_TYPE_TO_CODE_MAP[type as keyof typeof COMPANY_TYPE_TO_CODE_MAP] || 'CSI';
    setSelectedCodeType(newCodeType);
    form.setValue('codeType', newCodeType);
    
    // Load default codes for the selected code type
    const defaultCodes = DEFAULT_CODES_BY_TYPE[newCodeType] || [];
    setCodes(defaultCodes);
    form.setValue('customCodes', defaultCodes);
  };

  const handleCodeTypeChange = (type: string) => {
    setSelectedCodeType(type);
    form.setValue('codeType', type);
    
    // Load default codes for the selected code type
    const defaultCodes = DEFAULT_CODES_BY_TYPE[type] || [];
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">{selectedCodeType} Codes</h3>
            <Button type="button" variant="outline" onClick={addNewCode}>Add Custom Code</Button>
          </div>
          
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="industry-codes">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {codes.map((code, index) => (
                    <Draggable key={code.id} draggableId={code.id} index={index}>
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="mb-2"
                        >
                          <CardContent className="p-4 flex items-center">
                            <div
                              {...provided.dragHandleProps}
                              className="mr-3 cursor-grab"
                            >
                              <MoveVertical size={18} className="text-gray-400" />
                            </div>
                            <div className="grid grid-cols-2 gap-3 flex-grow">
                              <Input 
                                placeholder="Code" 
                                value={code.code}
                                onChange={(e) => updateCode(index, 'code', e.target.value)}
                              />
                              <Input 
                                placeholder="Description" 
                                value={code.description}
                                onChange={(e) => updateCode(index, 'description', e.target.value)}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <Button type="submit" className="w-full">
          Save and Continue
        </Button>
      </form>
    </Form>
  );
}
