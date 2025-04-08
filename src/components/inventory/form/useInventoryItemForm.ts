
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { inventoryItemFormSchema, InventoryItemFormValues } from '@/components/rfi/utils/formSchemas';

export interface UseInventoryItemFormProps {
  onSuccess: () => void;
  initialData?: Partial<InventoryItemFormValues>;
}

export const useInventoryItemForm = ({ onSuccess, initialData = {} }: UseInventoryItemFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || '',
      category: initialData?.category || '',
      location: initialData?.location || '',
      model: initialData?.model || '',
      manufacturer: initialData?.manufacturer || '',
      serialNumber: initialData?.serialNumber || '',
      status: initialData?.status || 'Operational',
      csi_code: initialData?.csi_code || '',
      nec_code: initialData?.nec_code || '',
      assetTag: initialData?.assetTag || '',
      rfidType: initialData?.rfidType || 'none',
      rfidTag: initialData?.rfidTag || '',
      certificationRequired: initialData?.certificationRequired || false,
      certificationExpiry: initialData?.certificationExpiry || '',
      complianceNotes: initialData?.complianceNotes || '',
      lastInspection: initialData?.lastInspection || '',
      nextInspection: initialData?.nextInspection || '',
      complianceStatus: initialData?.complianceStatus || 'Compliant'
    },
    mode: 'onBlur', // Validate on blur for better UX
  });

  const onSubmit = async (values: InventoryItemFormValues) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting inventory item:", values);
      
      // Validate certification expiry date if certification is required
      if (values.certificationRequired && !values.certificationExpiry) {
        toast({
          title: "Validation Error",
          description: "Certification expiry date is required when certification is required",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Simulate a network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: `${values.name} has been added to inventory`,
        variant: "default",
      });
      
      // Check for compliance certification expiry and show warning if it's expiring soon
      if (values.certificationRequired && values.certificationExpiry) {
        const expiryDate = new Date(values.certificationExpiry);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 30) {
          toast({
            title: "Compliance Alert",
            description: `Certification for ${values.name} expires in ${daysUntilExpiry} days.`,
            variant: "destructive",
          });
        }
      }
      
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Error adding item to inventory:', error);
      toast({
        title: "Error",
        description: "Failed to add item to inventory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    form, 
    onSubmit, 
    isSubmitting,
    errors: form.formState.errors,
    resetForm: () => form.reset()
  };
};
