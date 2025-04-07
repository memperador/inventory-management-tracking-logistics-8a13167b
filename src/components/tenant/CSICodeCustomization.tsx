
import React, { useState } from 'react';
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

// Sample CSI codes
const defaultCSICodes = [
  { id: '1', code: '01-10', description: 'Operation and Maintenance' },
  { id: '2', code: '01-20', description: 'Allowances' },
  { id: '3', code: '01-30', description: 'Administrative Requirements' },
  { id: '4', code: '01-40', description: 'Quality Requirements' },
  { id: '5', code: '01-50', description: 'Temporary Facilities and Controls' },
];

interface CSICodeCustomizationProps {
  tenantId: string;
  onNextStep?: () => void;
}

export function CSICodeCustomization({ tenantId, onNextStep }: CSICodeCustomizationProps) {
  const [codes, setCodes] = useState(defaultCSICodes);
  
  const form = useForm<CSICodeFormData>({
    resolver: zodResolver(csiCodeSchema),
    defaultValues: {
      companyPrefix: '',
      customCodes: defaultCSICodes
    }
  });

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
          companyPrefix: data.companyPrefix,
          customCodes: codes
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

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">CSI Codes</h3>
            <Button type="button" variant="outline" onClick={addNewCode}>Add Custom Code</Button>
          </div>
          
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="csi-codes">
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
