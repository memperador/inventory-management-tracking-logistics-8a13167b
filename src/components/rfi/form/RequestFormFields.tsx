
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RFIFormValues } from '../utils/formSchemas';
import { RequestType } from '../types';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  RFI_CATEGORIES, 
  RFQ_CATEGORIES, 
  RFP_CATEGORIES
} from '../types';
import FileUploadField from './FileUploadField';

interface RequestFormFieldsProps {
  form: UseFormReturn<RFIFormValues>;
  requestType: RequestType;
}

const RequestFormFields: React.FC<RequestFormFieldsProps> = ({ form, requestType }) => {
  const getCategories = () => {
    switch (requestType) {
      case 'rfi': return RFI_CATEGORIES;
      case 'rfq': return RFQ_CATEGORIES;
      case 'rfp': return RFP_CATEGORIES;
      default: return [];
    }
  };

  // Get tomorrow's date as min date for the date picker
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input 
                placeholder={`Enter ${requestType.toUpperCase()} title...`} 
                {...field} 
                className={form.formState.errors.title ? "border-destructive" : ""}
              />
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
                className={`min-h-[100px] ${form.formState.errors.description ? "border-destructive" : ""}`} 
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
                  <SelectTrigger className={form.formState.errors.category ? "border-destructive" : ""}>
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
                <Input 
                  type="date" 
                  min={getTomorrowDate()}
                  className={form.formState.errors.dueDate ? "border-destructive" : ""}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="attachments"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Attachments (optional)</FormLabel>
            <FormControl>
              <FileUploadField />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default RequestFormFields;
