
import React from 'react';
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
  FormMessage
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
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

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onAssetAdded: () => void;
}

const formSchema = z.object({
  equipmentId: z.string().min(1, "Please select an equipment item"),
  isTemporary: z.boolean().default(false)
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
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipmentId: '',
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
  
  const handleSubmit = async (values: FormValues) => {
    try {
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
        description: "The asset has been successfully added to the project"
      });
      
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
        
        <div className="space-y-4">
          <EquipmentFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
          />
          
          <Separator />
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="equipmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Equipment</FormLabel>
                    <EquipmentSelectionList 
                      equipmentList={filteredEquipment}
                      selectedEquipmentId={field.value}
                      onSelectEquipment={(id) => form.setValue('equipmentId', id)}
                    />
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAssetDialog;
