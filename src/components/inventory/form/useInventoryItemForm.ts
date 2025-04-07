
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { inventoryItemFormSchema, InventoryItemFormValues } from './types';

export const useInventoryItemForm = (onSuccess: () => void) => {
  const { toast } = useToast();
  
  const form = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemFormSchema),
    defaultValues: {
      name: '',
      type: '',
      category: '',
      location: '',
      model: '',
      manufacturer: '',
      serialNumber: '',
      status: 'Operational',
    }
  });

  const onSubmit = (values: InventoryItemFormValues) => {
    console.log("New inventory item:", values);
    
    // Here you would typically send this data to your backend
    // or update your local state with the new item
    
    toast({
      title: "Item Added",
      description: `${values.name} has been added to inventory`,
    });
    
    form.reset();
    onSuccess();
  };

  return { form, onSubmit };
};
