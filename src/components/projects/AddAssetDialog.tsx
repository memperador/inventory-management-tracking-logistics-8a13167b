
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { useTenantContext } from '@/hooks/useTenantContext';
import EquipmentFilter from './EquipmentFilter';
import EquipmentSelectionList from './EquipmentSelectionList';
import { useEquipmentSelection } from './hooks/useEquipmentSelection';
import { useIndustryCodeOptions } from '@/hooks/industry/useIndustryCodeOptions';

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onAssetAdded: () => void;
}

const formSchema = z.object({
  assetSource: z.enum(['existing', 'new']),
  equipmentId: z.string().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  csi_code: z.string().optional(),
  nec_code: z.string().optional(),
  isTemporary: z.boolean().default(false)
}).refine(data => {
  // If assetSource is 'existing', equipmentId is required
  if (data.assetSource === 'existing') {
    return !!data.equipmentId;
  }
  
  // If assetSource is 'new', name, type, and category are required
  if (data.assetSource === 'new') {
    return !!data.name && !!data.type && !!data.category;
  }
  
  return true;
}, {
  message: "Required fields missing",
  path: ["equipmentId"]
});

type FormValues = z.infer<typeof formSchema>;

export const AddAssetDialog: React.FC<AddAssetDialogProps> = ({
  open,
  onOpenChange,
  projectId,
  onAssetAdded
}) => {
  const { toast } = useToast();
  const { currentTenant } = useTenantContext();
  const { csiOptions, necOptions, necPlaceholder, csiPlaceholder } = useIndustryCodeOptions();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetSource: 'existing',
      equipmentId: '',
      name: '',
      type: '',
      category: 'Equipment',
      isTemporary: false
    }
  });
  
  const {
    filteredEquipment,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter
  } = useEquipmentSelection(projectId, currentTenant?.id);

  const assetSource = form.watch('assetSource');
  
  const handleSubmit = async (values: FormValues) => {
    try {
      if (values.assetSource === 'existing') {
        const { error } = await supabase
          .from('project_equipment')
          .insert({
            project_id: projectId,
            equipment_id: values.equipmentId,
            is_temporary: values.isTemporary
          });
        
        if (error) throw error;
        
        toast({
          title: "Asset Added",
          description: "The existing asset has been successfully added to the project"
        });
      } else {
        // First create a new equipment item
        const { data: newEquipment, error: equipmentError } = await supabase
          .from('equipment')
          .insert({
            name: values.name,
            type: values.type,
            category: values.category,
            tenant_id: currentTenant?.id,
            csi_code: values.csi_code || null,
            nec_code: values.nec_code || null
          })
          .select('id')
          .single();
        
        if (equipmentError) throw equipmentError;
        
        // Then link it to the project
        const { error: linkError } = await supabase
          .from('project_equipment')
          .insert({
            project_id: projectId,
            equipment_id: newEquipment.id,
            is_temporary: values.isTemporary
          });
        
        if (linkError) throw linkError;
        
        toast({
          title: "New Asset Added",
          description: "The new asset has been created and added to the project"
        });
      }
      
      form.reset();
      onOpenChange(false);
      onAssetAdded();
    } catch (error) {
      console.error('Error adding asset to project:', error);
      toast({
        title: "Error",
        description: "Failed to add asset to project",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add Asset to Project</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="assetSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Source</FormLabel>
                  <Tabs 
                    value={field.value} 
                    onValueChange={field.onChange as (value: string) => void}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="existing">Select Existing Asset</TabsTrigger>
                      <TabsTrigger value="new">Create New Asset</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="existing" className="mt-4 space-y-4">
                      <EquipmentFilter
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        categoryFilter={categoryFilter}
                        onCategoryChange={setCategoryFilter}
                      />
                      
                      <Separator />
                      
                      <FormField
                        control={form.control}
                        name="equipmentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Equipment</FormLabel>
                            <EquipmentSelectionList 
                              equipmentList={filteredEquipment}
                              selectedEquipmentId={field.value || ''}
                              onSelectEquipment={(id) => form.setValue('equipmentId', id)}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    
                    <TabsContent value="new" className="mt-4 space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Asset Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter asset name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <FormControl>
                                <Input placeholder="Equipment type" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Equipment">Equipment</SelectItem>
                                  <SelectItem value="Tools">Tools</SelectItem>
                                  <SelectItem value="Machinery">Machinery</SelectItem>
                                  <SelectItem value="Electrical">Electrical</SelectItem>
                                  <SelectItem value="Plumbing">Plumbing</SelectItem>
                                  <SelectItem value="Safety">Safety</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="csi_code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CSI Code</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder={csiPlaceholder} 
                                  list="csi-codes" 
                                  {...field} 
                                />
                              </FormControl>
                              <datalist id="csi-codes">
                                {csiOptions.map((option, index) => (
                                  <option key={index} value={option.code}>
                                    {option.label}
                                  </option>
                                ))}
                              </datalist>
                              <FormDescription>
                                Construction Specifications Institute code
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="nec_code"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>NEC Code</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder={necPlaceholder} 
                                  list="nec-codes" 
                                  {...field} 
                                />
                              </FormControl>
                              <datalist id="nec-codes">
                                {necOptions.map((option, index) => (
                                  <option key={index} value={option.code}>
                                    {option.label}
                                  </option>
                                ))}
                              </datalist>
                              <FormDescription>
                                National Electrical Code reference
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isTemporary"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Temporary Assignment
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Check this if the asset will only be temporarily at this project site
                    </p>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Asset</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAssetDialog;
