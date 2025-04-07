
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RequestType, RFI } from '../types';
import { rfiFormSchema, RFIFormValues } from '../utils/formSchemas';
import { useToast } from '@/hooks/use-toast';

interface UseRFIFormProps {
  onCreateRequest: (request: RFI) => void;
  requestType: RequestType;
  onClose: () => void;
}

export const useRFIForm = ({ onCreateRequest, requestType, onClose }: UseRFIFormProps) => {
  const { toast } = useToast();
  const form = useForm<RFIFormValues>({
    resolver: zodResolver(rfiFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      dueDate: '',
    },
    mode: 'onBlur', // Validate on blur for better UX
  });

  const getDefaultStatus = () => {
    switch (requestType) {
      case 'rfi': return 'draft';
      case 'rfq': return 'draft';
      case 'rfp': return 'draft';
      default: return 'draft';
    }
  };

  const onSubmit = async (values: RFIFormValues) => {
    try {
      // In a real application, you would make an API call to create the request
      const newRequest: RFI = {
        id: Math.random().toString(36).substring(2, 11), // Generate a random ID for the mock data
        title: values.title,
        description: values.description,
        projectId: '85e6bf2f-a7e0-4943-941a-07a254f1a4ed', // Using a mock project ID
        createdBy: 'Current User', // In a real app, this would come from auth context
        assignedTo: null,
        status: getDefaultStatus() as any,
        dueDate: values.dueDate || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responseText: null,
        responseDate: null,
        category: values.category,
        type: requestType
      };

      onCreateRequest(newRequest);
      toast({
        title: "Success",
        description: `${requestType.toUpperCase()} created successfully`,
        variant: "default",
      });
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error creating request:', error);
      toast({
        title: "Error",
        description: `Failed to create ${requestType.toUpperCase()}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting: form.formState.isSubmitting,
    errors: form.formState.errors
  };
};
