
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  RFI, 
  RFI_CATEGORIES, 
  RFQ_CATEGORIES, 
  RFP_CATEGORIES,
  RequestType
} from './types';

interface FormValues {
  title: string;
  description: string;
  category: string;
  dueDate: string;
}

interface CreateRFIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRequest: (request: RFI) => void;
  requestType: RequestType;
}

const CreateRFIDialog: React.FC<CreateRFIDialogProps> = ({
  open,
  onOpenChange,
  onCreateRequest,
  requestType
}) => {
  const formSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category: z.string().min(1, 'Please select a category'),
    dueDate: z.string().optional(),
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      dueDate: '',
    }
  });
  
  const getDialogTitle = () => {
    switch (requestType) {
      case 'rfi': return 'Create New RFI';
      case 'rfq': return 'Create New RFQ';
      case 'rfp': return 'Create New RFP';
      default: return 'Create New Request';
    }
  };

  const getCategories = () => {
    switch (requestType) {
      case 'rfi': return RFI_CATEGORIES;
      case 'rfq': return RFQ_CATEGORIES;
      case 'rfp': return RFP_CATEGORIES;
      default: return [];
    }
  };

  const getDefaultStatus = () => {
    switch (requestType) {
      case 'rfi': return 'draft';
      case 'rfq': return 'draft';
      case 'rfp': return 'draft';
      default: return 'draft';
    }
  };

  const onSubmit = (values: FormValues) => {
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
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder={`Enter ${requestType.toUpperCase()} title...`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter a detailed description of your request..." 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
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
                        {getCategories().map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date (optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create {requestType.toUpperCase()}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRFIDialog;
