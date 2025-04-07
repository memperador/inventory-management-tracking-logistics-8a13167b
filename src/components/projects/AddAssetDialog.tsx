
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
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
import { Equipment, INVENTORY_CATEGORIES } from '@/components/equipment/types';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Search } from 'lucide-react';
import { useTenantContext } from '@/hooks/useTenantContext';

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
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentTenant } = useTenantContext();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipmentId: '',
      isTemporary: false
    }
  });
  
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        let query = supabase
          .from('equipment')
          .select('*')
          .eq('tenant_id', currentTenant?.id);
        
        // Exclude equipment already assigned to this project and not removed
        const { data: assignedEquipment } = await supabase
          .from('project_equipment')
          .select('equipment_id')
          .eq('project_id', projectId)
          .is('removed_date', null);
        
        if (assignedEquipment && assignedEquipment.length > 0) {
          const assignedIds = assignedEquipment.map(item => item.equipment_id);
          query = query.not('id', 'in', assignedIds);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Transform the data to match the Equipment type
        const transformedData: Equipment[] = data?.map(item => ({
          ...item,
          // Set default values for required Equipment properties
          status: item.status as Equipment['status'] || 'Operational',
          category: item.category as Equipment['category'] || undefined,
          type: item.type || '',
          name: item.name,
          id: item.id,
          tenant_id: item.tenant_id
        })) || [];
        
        setEquipment(transformedData);
      } catch (error) {
        console.error('Error fetching equipment:', error);
        toast({
          title: "Error",
          description: "Failed to load equipment",
          variant: "destructive"
        });
      }
    };
    
    if (open) {
      fetchEquipment();
    }
  }, [open, projectId, currentTenant?.id]);
  
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
  
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = searchQuery ? 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.type && item.type.toLowerCase().includes(searchQuery.toLowerCase())) : 
      true;
    
    const matchesCategory = categoryFilter ? 
      item.category === categoryFilter : 
      true;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add Asset to Project</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={categoryFilter || ""}
                onValueChange={(value) => setCategoryFilter(value || null)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {INVENTORY_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="equipmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Equipment</FormLabel>
                    <div className="border rounded-md overflow-auto max-h-[200px]">
                      {filteredEquipment.length > 0 ? (
                        <div className="divide-y">
                          {filteredEquipment.map(item => (
                            <div 
                              key={item.id} 
                              className={`p-2 cursor-pointer hover:bg-slate-100 flex justify-between items-center ${
                                field.value === item.id ? 'bg-slate-100' : ''
                              }`}
                              onClick={() => form.setValue('equipmentId', item.id)}
                            >
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-gray-500">
                                  {item.type} | {item.category || 'Uncategorized'}
                                </div>
                              </div>
                              <div>
                                <input 
                                  type="radio" 
                                  checked={field.value === item.id}
                                  onChange={() => {}}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          No available equipment found matching your criteria
                        </div>
                      )}
                    </div>
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
